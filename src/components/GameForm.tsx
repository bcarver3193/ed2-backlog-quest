import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import Progress, { Spinner } from './Progress'
import { errorMessage } from '../supabase'
import { statuses } from '../games'
import type { Game, Status } from '../games'

export default function GameForm({ game, onSave, onCancel, onBusyChange }: { game: Game | null; onSave: (game: Game) => Promise<void>; onCancel: () => void; onBusyChange?: (busy: boolean) => void }) {
  const [title, setTitle] = useState(game?.title ?? '')
  const [platform, setPlatform] = useState(game?.platform ?? '')
  const [status, setStatus] = useState<Status>(game?.status ?? 'Backlog')
  const [rating, setRating] = useState(game?.rating?.toString() ?? '')
  const [notes, setNotes] = useState(game?.notes ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    if (!title.trim()) { setError('Give your game a title.'); return }
    if (rating && (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 10)) {
      setError('Choose a whole-number rating from 1 to 10.'); return
    }
    submitting.current = true
    setBusy(true); onBusyChange?.(true); setError('')
    try { await onSave({ id: game?.id ?? crypto.randomUUID(), title: title.trim(), platform: platform.trim(), status, rating: rating ? Number(rating) : null, notes: notes.trim() }) }
    catch (error) { setError(`Could not save this game. ${errorMessage(error)} Your entries are still here. Try saving again.`) }
    finally { submitting.current = false; setBusy(false); onBusyChange?.(false) }
  }
  return <>{busy && <Progress>Saving your game…</Progress>}<form onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>
    <p className="form-intro">Every adventure starts with a spot in your library.</p>
    <label>Game title <span className="required">*</span><input autoFocus required maxLength={200} value={title} onChange={e => setTitle(e.target.value)} placeholder="What are we playing?" /></label>
    <label>Platform<input maxLength={100} value={platform} onChange={e => setPlatform(e.target.value)} placeholder="e.g. PC, Nintendo Switch, PlayStation 5" list="platforms" /></label>
    <datalist id="platforms"><option>PC</option><option>Nintendo Switch</option><option>PlayStation 5</option><option>Xbox Series X/S</option></datalist>
    <div className="form-row"><label>Status<select value={status} onChange={e => setStatus(e.target.value as Status)}>{statuses.map(s => <option key={s}>{s}</option>)}</select></label>
      <label>Rating <span className="muted">/ 10</span><input type="number" min="1" max="10" step="1" value={rating} onChange={e => setRating(e.target.value)} placeholder="Not rated" /></label></div>
    <label>Notes<textarea rows={3} maxLength={5000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Thoughts, reminders, or your next objective…" /></label>
    {error && <p role="alert" className="error">{error}</p>}
    <div className="dialog-actions"><button type="button" className="secondary" onClick={onCancel}>Cancel</button><button className="primary" type="submit">{busy && <Spinner />}{busy ? 'Saving…' : game ? 'Save changes' : 'Add to library'}</button></div>
  </fieldset></form></>
}
