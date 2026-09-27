import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { authRedirect, errorMessage, supabase } from '../supabase'
import Progress, { Spinner } from './Progress'

type Mode = 'signin' | 'signup' | 'forgot' | 'resend' | 'password'
const pending: Record<Mode, string> = { signin: 'Signing in…', signup: 'Creating account…', forgot: 'Sending reset link…', resend: 'Sending confirmation…', password: 'Saving password…' }
const titles: Record<Mode, string> = { signin: 'Welcome back.', signup: 'Your adventure starts here.', forgot: 'Get back to your games.', resend: 'Confirm your email.', password: 'Choose a new password.' }

export default function AuthForm({ passwordOnly = false, onDone, initialError = '', onBusyChange, disabled = false }: { disabled?: boolean; passwordOnly?: boolean; onDone?: () => void; initialError?: string; onBusyChange?: (busy: boolean) => void }) {
  const [mode, setMode] = useState<Mode>(passwordOnly ? 'password' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState(initialError)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)
  const locked = busy || disabled
  const hasPassword = ['signin', 'signup', 'password'].includes(mode)
  const newPassword = mode === 'signup' || mode === 'password'

  function changeMode(next: Mode) {
    setMode(next); setError(''); setNotice(''); setPassword(''); setConfirmation('')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current || disabled || !supabase) return
    setError(''); setNotice('')
    if (newPassword && password !== confirmation) { setError('Your passwords do not match.'); return }
    submitting.current = true
    setBusy(true); onBusyChange?.(true)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: authRedirect() } })
        if (error) throw error
        if (!data.session) {
          setMode('resend'); setPassword(''); setConfirmation('')
          setNotice('Check your inbox for a confirmation link. If you already have an account, sign in or reset your password.')
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: authRedirect(true) })
        if (error) throw error
        setNotice('If an account exists for this email, you’ll receive a password reset link. Check your inbox and spam folder.')
      } else if (mode === 'resend') {
        const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: authRedirect() } })
        if (error) throw error
        setNotice('If your account needs confirmation, a new link is on its way. Check your inbox and spam folder.')
      } else {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setPassword(''); setConfirmation(''); onDone?.()
      }
    } catch (error) { setError(`${errorMessage(error)} Your entries are still here. Check the details and try again.`) }
    finally { submitting.current = false; setBusy(false); onBusyChange?.(false) }
  }

  return <section className="auth-form" aria-labelledby="auth-title">
    <div className="eyebrow">YOUR SPACE TO PLAY</div>
    <h1 id="auth-title">{titles[mode]}</h1>
    <p className="form-intro">{mode === 'signin' ? 'Sign in to pick up where you left off.' : mode === 'signup' ? 'Keep your game collection private and saved across devices.' : mode === 'password' ? 'Use at least 8 characters for your new password.' : 'We’ll send a secure link to your email address.'}</p>
    {busy && <Progress>{pending[mode]}</Progress>}
    <form onSubmit={submit} aria-busy={busy}>
      <fieldset disabled={locked || !supabase}>
        {mode !== 'password' && <label>Email address<input autoFocus name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>}
        {hasPassword && <label>{newPassword ? 'New password' : 'Password'}<input autoFocus={passwordOnly} name="password" type="password" autoComplete={newPassword ? 'new-password' : 'current-password'} required minLength={newPassword ? 8 : undefined} value={password} onChange={e => setPassword(e.target.value)} /></label>}
        {newPassword && <label>Confirm password<input name="confirmation" type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>}
        {error && <p role="alert" className="error">{error}</p>}
        {notice && <p role="status" className="notice">{notice}</p>}
        <button className="primary auth-submit" type="submit">{busy && <Spinner />}{busy ? pending[mode] : { signin: 'Sign in', signup: 'Create account', forgot: 'Send reset link', resend: 'Resend confirmation', password: 'Save new password' }[mode]}</button>
      </fieldset>
    </form>
    {!passwordOnly && <div className="auth-links">
      {mode === 'signin' ? <><button disabled={locked} onClick={() => changeMode('forgot')}>Forgot password?</button><button disabled={locked} onClick={() => changeMode('signup')}>New here? Create an account</button><button disabled={locked} onClick={() => changeMode('resend')}>Resend confirmation email</button></> : <button disabled={locked} onClick={() => changeMode('signin')}>Back to sign in</button>}
    </div>}
  </section>
}
