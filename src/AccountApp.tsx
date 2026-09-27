import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Swords } from 'lucide-react'
import App from './App'
import AuthForm from './components/AuthForm'
import { supabase, errorMessage } from './supabase'

// Capture callback state before the client removes tokens from the address bar.
const callback = new URLSearchParams(window.location.hash.slice(1))
const query = new URLSearchParams(window.location.search)
const recoveryLink = query.get('flow') === 'recovery' || callback.get('type') === 'recovery'
const callbackError = callback.has('error') || query.has('error')
  ? 'This email link is invalid or has expired. Request a new confirmation or password reset link.' : ''

export default function AccountApp() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(!supabase)
  const [error, setError] = useState(callbackError)
  const [recovery, setRecovery] = useState(recoveryLink)
  const [demo, setDemo] = useState(false)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!supabase) return
    let active = true
    let receivedEvent = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      if (!active) return
      receivedEvent = true
      setSession(next); setReady(true)
      if (next) setDemo(false)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      if (event === 'SIGNED_OUT') { setRecovery(false); setDemo(false); setNotice('') }
    })
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setError(errorMessage(error))
      if (!receivedEvent) setSession(data.session)
      setReady(true)
    }).catch(error => { if (active) { setError(errorMessage(error)); setReady(true) } })
    if (callbackError) window.history.replaceState({}, '', window.location.pathname)
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  async function signOut() {
    const { error } = await supabase!.auth.signOut({ scope: 'local' })
    if (error) throw error
    setSession(null); setRecovery(false)
    window.history.replaceState({}, '', window.location.pathname)
  }

  if (!ready) return <main className="auth-shell"><p role="status">Opening your account…</p></main>
  if (session && !recovery) return <App key={session.user.id} user={session.user} onSignOut={signOut} notice={notice} />
  if (demo && !session) return <App key="demo" onExitDemo={() => setDemo(false)} />
  return <main className="auth-shell">
    <div className="auth-story"><a className="brand" href="/"><span className="brand-icon"><Swords size={24} /></span><span>backlog<span className="brand-light">quest</span><small>ONE ADVENTURE AT A TIME</small></span></a><div><span className="eyebrow">LESS SCROLLING. MORE PLAYING.</span><h2>Good games.<br />Your pace.</h2><p>A home for your collection, a place for your next adventure. Save your progress and come back whenever you’re ready.</p></div><span className="auth-caption">Your library. Your next quest.</span></div>
    <div className="auth-panel">
      {!supabase && <p className="error" role="alert">Account access is not configured. Add the Supabase URL and publishable key to enable it. You can still explore the demo.</p>}
      <AuthForm onBusyChange={setBusy} key={session && recovery ? 'recovery' : 'signin'} passwordOnly={!!session && recovery} initialError={error || (recovery && !session ? 'Open a valid password reset link from your email, or request a new one.' : '')} onDone={() => { setRecovery(false); setNotice('Your password has been updated.'); window.history.replaceState({}, '', window.location.pathname) }} />
      {session ? <button disabled={busy} className="text-button" onClick={() => { void signOut().catch(error => setError(errorMessage(error))) }}>Cancel and sign out</button> : <button className="text-button demo-link" onClick={() => setDemo(true)}>Explore the local demo <span>Try it without an account</span></button>}
      {session && error && <p role="alert" className="error">{error}</p>}
    </div>
  </main>
}
