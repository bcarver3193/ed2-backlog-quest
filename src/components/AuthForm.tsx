import { useState } from 'react'
import type { FormEvent } from 'react'
import { authRedirect, errorMessage, supabase } from '../supabase'

type Mode = 'signin' | 'signup'
const titles: Record<Mode, string> = { signin: 'Welcome back.', signup: 'Your adventure starts here.', }

export default function AuthForm({ initialError = '', onBusyChange }: { initialError?: string; onBusyChange?: (busy: boolean) => void }) {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState(initialError)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const hasPassword = ['signin', 'signup'].includes(mode)
  const newPassword = mode === 'signup'

  function changeMode(next: Mode) {
    setMode(next); setError(''); setNotice(''); setPassword(''); setConfirmation('')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy || !supabase) return
    setError(''); setNotice('')
    if (newPassword && password !== confirmation) { setError('Your passwords do not match.'); return }
    setBusy(true); onBusyChange?.(true)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: authRedirect() } })
        if (error) throw error
        if (!data.session) {
          setPassword(''); setConfirmation('')
          setNotice('Check your inbox for a confirmation link. If you already have an account, sign in.')
        }

      }
    } catch (error) { setError(errorMessage(error)) }
    finally { setBusy(false); onBusyChange?.(false) }
  }

  return <section className="auth-form" aria-labelledby="auth-title">
    <div className="eyebrow">YOUR SPACE TO PLAY</div>
    <h1 id="auth-title">{titles[mode]}</h1>
    <p className="form-intro">{mode === 'signin' ? 'Sign in to pick up where you left off.' : mode === 'signup' ? 'Keep your game collection private and saved across devices.' : 'We’ll send a secure link to your email address.'}</p>
    <form onSubmit={submit}>
      <fieldset disabled={busy || !supabase}>
        <label>Email address<input autoFocus name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>
        {hasPassword && <label>{newPassword ? 'New password' : 'Password'}<input name="password" type="password" autoComplete={newPassword ? 'new-password' : 'current-password'} required minLength={newPassword ? 8 : undefined} value={password} onChange={e => setPassword(e.target.value)} /></label>}
        {newPassword && <label>Confirm password<input name="confirmation" type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>}
        {error && <p role="alert" className="error">{error}</p>}
        {notice && <p role="status" className="notice">{notice}</p>}
        <button className="primary auth-submit" type="submit">{busy ? 'Please wait…' : { signin: 'Sign in', signup: 'Create account' }[mode]}</button>
      </fieldset>
    </form>
    <div className="auth-links">
      {mode === 'signin' ? <><button disabled={busy} onClick={() => changeMode('signup')}>New here? Create an account</button></> : <button disabled={busy} onClick={() => changeMode('signin')}>Back to sign in</button>}
    </div>
  </section>
}
