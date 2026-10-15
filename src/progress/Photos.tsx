import { useCallback, useEffect, useState } from 'react'
import { POSES, checkPhotoFile, shrinkImage, type Photo, type PhotoStore, type Pose } from './photoStore'

const shortDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const poseLabel = (pose: Pose) => POSES.find((p) => p.pose === pose)!.label

/** Progress photos (T-022b): add today's front, side or back photo, see them by date, remove one. */
export function Photos({ store, today, shrink = shrinkImage }: { store: PhotoStore; today: string; shrink?: (file: Blob) => Promise<Blob> }) {
  const [photos, setPhotos] = useState<Photo[] | null>(null)
  const [more, setMore] = useState(false)
  const [pose, setPose] = useState<Pose>('front')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <section aria-label="Progress photos" className="photos">
      <h3>Progress photos</h3>
      <p className="muted">Only you and your coach, if you have one, can see these. Use the same place, light and pose each time.</p>
      <div className="photo-add">
        <div className="range" role="group" aria-label="Pose">
          {POSES.map((p) => (
            <button key={p.pose} type="button" className={`chip${pose === p.pose ? ' on' : ''}`} aria-pressed={pose === p.pose} onClick={() => setPose(p.pose)}>
              {p.label}
            </button>
          ))}
        </div>
        <label className={`primary photo-pick${busy ? ' busy' : ''}`}>
          {busy ? 'Saving…' : `Add today’s ${pose} photo`}
          <input type="file" accept="image/*" disabled={busy} aria-label={`Add today’s ${pose} photo`} onChange={(e) => void add(e.currentTarget)} />
        </label>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {photos === null ? (
        <p className="muted">Loading photos…</p>
      ) : !photos.length ? (
        <p className="muted">Take a photo every two to four weeks. Changes are easier to see in photos than in the mirror.</p>
      ) : (
        dates.map((d) => (
          <figure key={d} className="photo-day">
            <figcaption>{shortDate(d)}</figcaption>
            <ul>
              {photos.filter((p) => p.date === d).map((p) => (
                <li key={p.id}>
                  <img src={p.url} alt={`${poseLabel(p.pose)}, ${shortDate(d)}`} loading="lazy" />
                  <button className="link" aria-label={`Remove ${p.pose} photo from ${shortDate(d)}`} onClick={() => void remove(p)}>
                    Remove
                  </button>
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
