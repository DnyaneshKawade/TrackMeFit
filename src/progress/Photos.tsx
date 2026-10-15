import { useCallback, useEffect, useState } from 'react'
import { POSES, checkPhotoFile, shrinkImage, type Photo, type PhotoStore, type Pose } from './photoStore'

const shortDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const poseLabel = (pose: Pose) => POSES.find((p) => p.pose === pose)!.label

/** Progress photos (T-022b): add today's front, side or back photo, see them by date, remove one.
 * A coach sees a client's photos read-only (T-026c). */
export function Photos({
  store,
  today,
  shrink = shrinkImage,
  readOnly = false,
}: {
  store: PhotoStore
  today: string
  shrink?: (file: Blob) => Promise<Blob>
  readOnly?: boolean
}) {
  const [photos, setPhotos] = useState<Photo[] | null>(null)
  const [more, setMore] = useState(false)
  const [pose, setPose] = useState<Pose>('front')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [comparing, setComparing] = useState(false)
  const [pair, setPair] = useState<[string, string] | null>(null)

  const load = useCallback(async () => {
    try {
      const page = await store.photos()
      setPhotos(page.photos)
      setMore(page.more)
    } catch {
      setPhotos([])
      setError('Couldn’t load your photos. Check your connection.')
    }
  }, [store])

  useEffect(() => {
    void load()
  }, [load])

  const showOlder = async () => {
    if (!photos?.length) return
    try {
      const page = await store.photos({ before: photos[photos.length - 1].date })
      setPhotos([...photos, ...page.photos])
      setMore(page.more)
    } catch {
      setError('Couldn’t load older photos. Check your connection.')
    }
  }

  const add = async (input: HTMLInputElement) => {
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    const problem = checkPhotoFile(file)
    if (problem) return setError(problem)
    if (photos?.some((p) => p.date === today && p.pose === pose))
      return setError(`You already have a ${pose} photo for today. Remove it first.`)
    setBusy(true)
    setError(null)
    try {
      await store.addPhoto(today, pose, await shrink(file))
      await load()
    } catch {
      setError('Couldn’t save the photo. Check your connection.')
    }
    setBusy(false)
  }

  const remove = async (p: Photo) => {
    setError(null)
    try {
      await store.removePhoto(p.id)
      setPhotos((list) => list?.filter((x) => x.id !== p.id) ?? null)
    } catch {
      setError('Couldn’t remove the photo. Check your connection.')
    }
  }

  const dates = [...new Set((photos ?? []).map((p) => p.date))]
  // Side by side (T-026e): two dates of one pose, oldest and newest loaded at first.
  const poseDates = dates.filter((d) => photos!.some((p) => p.date === d && p.pose === pose))
  const shown: [string, string] | null =
    pair && poseDates.includes(pair[0]) && poseDates.includes(pair[1]) ? pair : poseDates.length > 1 ? [poseDates[poseDates.length - 1], poseDates[0]] : null
  const photoOn = (d: string) => photos!.find((p) => p.date === d && p.pose === pose)!
  const poseChips = (
    <div className="range" role="group" aria-label="Pose">
      {POSES.map((p) => (
        <button key={p.pose} type="button" className={`chip${pose === p.pose ? ' on' : ''}`} aria-pressed={pose === p.pose} onClick={() => setPose(p.pose)}>
          {p.label}
        </button>
      ))}
    </div>
  )

  return (
    <section aria-label="Progress photos" className="photos">
      <h3>Progress photos</h3>
      {!readOnly && <p className="muted">Only you and your coach, if you have one, can see these. Use the same place, light and pose each time.</p>}
      {!readOnly && (
        <div className="photo-add">
          {!comparing && poseChips}
          <label className={`primary photo-pick${busy ? ' busy' : ''}`}>
            {busy ? 'Saving…' : `Add today’s ${pose} photo`}
            <input type="file" accept="image/*" disabled={busy} aria-label={`Add today’s ${pose} photo`} onChange={(e) => void add(e.currentTarget)} />
          </label>
        </div>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      {dates.length > 1 && (
        <button className="link" aria-pressed={comparing} onClick={() => setComparing(!comparing)}>
          {comparing ? 'Show all photos' : 'Compare two dates'}
        </button>
      )}
      {comparing && photos ? (
        <div className="photo-compare" aria-label="Compare photos" role="group">
          {poseChips}
          {shown ? (
            <div className="photo-pair">
              {([0, 1] as const).map((i) => (
                <figure key={i}>
                  <select
                    aria-label={i === 0 ? 'Earlier date' : 'Later date'}
                    value={shown[i]}
                    onChange={(e) => setPair(i === 0 ? [e.target.value, shown[1]] : [shown[0], e.target.value])}
                  >
                    {poseDates.map((d) => <option key={d} value={d}>{shortDate(d)}</option>)}
                  </select>
                  <img src={photoOn(shown[i]).url} alt={`${poseLabel(pose)}, ${shortDate(shown[i])}`} />
                </figure>
              ))}
            </div>
          ) : (
            <p className="muted">Two {pose} photos on different days are needed to compare.</p>
          )}
        </div>
      ) : photos === null ? (
        <p className="muted">Loading photos…</p>
      ) : !photos.length ? (
        <p className="muted">{readOnly ? 'No photos yet.' : 'Take a photo every two to four weeks. Changes are easier to see in photos than in the mirror.'}</p>
      ) : (
        dates.map((d) => (
          <figure key={d} className="photo-day">
            <figcaption>{shortDate(d)}</figcaption>
            <ul>
              {photos.filter((p) => p.date === d).map((p) => (
                <li key={p.id}>
                  <img src={p.url} alt={`${poseLabel(p.pose)}, ${shortDate(d)}`} loading="lazy" />
                  {!readOnly && (
                    <button className="link" aria-label={`Remove ${p.pose} photo from ${shortDate(d)}`} onClick={() => void remove(p)}>
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </figure>
        ))
      )}
      {more && (
        <button className="link" onClick={() => void showOlder()}>
          Show older
        </button>
      )}
    </section>
  )
}
