// Coach approval (spec T-042a3): the coach's status, the details an owner
// checks, and certificate photos in a private bucket. The database decides
// the status; the coach can only send details and answers.

import type { SupabaseClient } from '@supabase/supabase-js'

export type CoachStatus = 'approved' | 'waiting' | 'needs more' | 'not approved' | 'paused'

export interface CoachStanding {
  status: CoachStatus
  /** The owner's note: what is missing, or why. */
  note: string
  /** When the status last changed. */
  at: string
  /** False until the coach has seen the latest decision. */
  seen: boolean
}

export interface CoachDetails {
  /** The name clients see (T-093). */
  name: string
  phone: string
  city: string
  years: number | null
  link: string
  /** The coach's answer to "Needs more". */
  answer: string
}

export interface Certificate {
  id: string
  name: string
  /** A link to show the photo; from the server it lasts an hour. */
  url: string
}

export interface CoachApprovalStore {
  standing(): Promise<CoachStanding>
  details(): Promise<CoachDetails>
  saveDetails(d: Omit<CoachDetails, 'answer'>): Promise<void>
  certificates(): Promise<Certificate[]>
  addCertificate(name: string, photo: Blob): Promise<void>
  removeCertificate(id: string): Promise<void>
  /** Sends the details back for checking, with an answer for "Needs more". */
  send(answer: string): Promise<void>
  /** The coach has seen the latest decision. */
  sawStatus(): Promise<void>
}

export const CERT_BUCKET = 'coach-certificates'
/** Days before a coach who was not approved may apply again. */
export const APPLY_AGAIN_DAYS = 30

/** The day a coach who was not approved may apply again. */
export const applyAgainOn = (at: string) => new Date(new Date(at).getTime() + APPLY_AGAIN_DAYS * 86_400_000)

const emptyDetails = (): CoachDetails => ({ name: '', phone: '', city: '', years: null, link: '', answer: '' })

/** For tests and offline previews. */
export function memoryApprovalStore(start: Partial<CoachStanding> & { details?: Partial<CoachDetails>; certificates?: Certificate[] } = {}): CoachApprovalStore {
  const standing: CoachStanding = { status: 'approved', note: '', at: '2026-10-18T10:00:00Z', seen: true, ...start }
  let details: CoachDetails = { ...emptyDetails(), ...start.details }
  let certs = [...(start.certificates ?? [])]
  let n = 0
  return {
    standing: async () => ({ ...standing }),
    details: async () => ({ ...details }),
    async saveDetails(d) {
      details = { ...details, ...d }
    },
    certificates: async () => [...certs],
    async addCertificate(name) {
      certs.push({ id: `cert-${++n}`, name, url: `blob:cert-${n}` })
    },
    async removeCertificate(id) {
      certs = certs.filter((c) => c.id !== id)
    },
    async send(answer) {
      if (standing.status === 'needs more' && !answer.trim()) throw new Error('answer is empty')
      if (standing.status === 'not approved' && applyAgainOn(standing.at).getTime() > Date.now()) throw new Error('too soon')
      details.answer = answer.trim()
      Object.assign(standing, { status: 'waiting', note: '', at: new Date().toISOString(), seen: true })
    },
    async sawStatus() {
      standing.seen = true
    },
  }
}

interface ProfileRow {
  coach_status: CoachStatus
  coach_status_note: string
  coach_status_at: string
  coach_status_seen: boolean
}

export function supabaseApprovalStore(sb: SupabaseClient, userId: string, newId: () => string = () => crypto.randomUUID()): CoachApprovalStore {
  const files = () => sb.storage.from(CERT_BUCKET)
  return {
    async standing() {
      const { data, error } = await sb.from('profiles').select('coach_status, coach_status_note, coach_status_at, coach_status_seen').eq('id', userId).single()
      if (error) throw error
      const r = data as ProfileRow
      return { status: r.coach_status, note: r.coach_status_note, at: r.coach_status_at, seen: r.coach_status_seen }
    },
    async details() {
      const [d, p] = await Promise.all([
        sb.from('coach_details').select('phone, city, years, link, answer').eq('coach_id', userId).maybeSingle(),
        sb.from('profiles').select('full_name').eq('id', userId).single(),
      ])
      if (d.error) throw d.error
      if (p.error) throw p.error
      return { ...emptyDetails(), ...(d.data as Omit<CoachDetails, 'name'> | null), name: (p.data as { full_name: string | null }).full_name ?? '' }
    },
    async saveDetails(d) {
      const { error } = await sb
        .from('coach_details')
        .upsert({ coach_id: userId, phone: d.phone.trim(), city: d.city.trim(), years: d.years, link: d.link.trim(), updated_at: new Date().toISOString() })
      if (error) throw error
      if (d.name.trim()) {
        const p = await sb.from('profiles').update({ full_name: d.name.trim() }).eq('id', userId)
        if (p.error) throw p.error
      }
    },
    async certificates() {
      const { data, error } = await sb.from('coach_certificates').select('id, name, path').eq('coach_id', userId).order('created_at')
      if (error) throw error
      const rows = data as { id: string; name: string; path: string }[]
      if (!rows.length) return []
      // One request signs every link.
      const signed = await files().createSignedUrls(rows.map((r) => r.path), 3600)
      if (signed.error) throw signed.error
      const urls = new Map(signed.data.map((s) => [s.path, s.signedUrl]))
      return rows.map((r) => ({ id: r.id, name: r.name, url: urls.get(r.path) ?? '' }))
    },
    async addCertificate(name, photo) {
      const path = `${userId}/${newId()}.jpg`
      const up = await files().upload(path, photo, { contentType: 'image/jpeg', upsert: false })
      if (up.error) throw up.error
      const { error } = await sb.from('coach_certificates').insert({ coach_id: userId, name: name.trim(), path })
      if (error) {
        // Leave nothing half-saved.
        await files().remove([path])
        throw error
      }
    },
    async removeCertificate(id) {
      const { data, error } = await sb.from('coach_certificates').delete().eq('id', id).eq('coach_id', userId).select('path')
      if (error) throw error
      const paths = (data as { path: string }[]).map((r) => r.path)
      if (paths.length) {
        const removed = await files().remove(paths)
        if (removed.error) throw removed.error
      }
    },
    async send(answer) {
      const { error } = await sb.rpc('coach_send_details', { answer })
      if (error) throw error
    },
    async sawStatus() {
      const { error } = await sb.rpc('coach_saw_status')
      if (error) throw error
    },
  }
}
