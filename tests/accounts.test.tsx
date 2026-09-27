// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Session, User } from '@supabase/supabase-js'
import AuthForm from '../src/components/AuthForm'
import AccountApp from '../src/AccountApp'
import App from '../src/App'

const mocks = vi.hoisted(() => ({
  auth: { signInWithPassword: vi.fn(), signUp: vi.fn(), resetPasswordForEmail: vi.fn(), resend: vi.fn(), updateUser: vi.fn(), signOut: vi.fn(), getSession: vi.fn(), onAuthStateChange: vi.fn() },
  fetchGames: vi.fn(), persistGame: vi.fn(), removeGame: vi.fn(), startPlaying: vi.fn(), listener: null as null | ((event: string, session: unknown) => void),
}))
vi.mock('../src/supabase', () => ({ supabase: { auth: mocks.auth }, authRedirect: (recovery = false) => `http://localhost/${recovery ? '?flow=recovery' : ''}`, errorMessage: (e: Error) => e.message }))
vi.mock('../src/cloudGames', () => ({ fetchGames: mocks.fetchGames, persistGame: mocks.persistGame, removeGame: mocks.removeGame, startPlaying: mocks.startPlaying }))
const user = { id: 'account-a', email: 'player@example.com' } as User
const game = { id: 'game-a', title: 'Private game', platform: 'PC', status: 'Backlog', rating: null, notes: '' }
const session = { user } as Session
beforeEach(() => {
  vi.resetAllMocks(); localStorage.clear()
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
  mocks.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
  mocks.auth.onAuthStateChange.mockImplementation(fn => { mocks.listener = fn; return { data: { subscription: { unsubscribe: vi.fn() } } } })
  for (const fn of ['signInWithPassword', 'signUp', 'resetPasswordForEmail', 'resend', 'updateUser', 'signOut'] as const) mocks.auth[fn].mockResolvedValue({ data: { session: null }, error: null })
  mocks.fetchGames.mockResolvedValue([game])
})
afterEach(cleanup)
const click = (name: string) => userEvent.click(screen.getByRole('button', { name, exact: true }))
async function fillCredentials() {
  await userEvent.type(screen.getByLabelText('Email address'), 'player@example.com')
  await userEvent.type(screen.getByLabelText('Password'), 'a secure password')
}

describe('account forms', () => {
  it('signs in and surfaces rejected credentials', async () => {
    mocks.auth.signInWithPassword.mockResolvedValue({ error: new Error('Invalid login credentials') })
    render(<AuthForm />); await fillCredentials(); await click('Sign in')
    expect(mocks.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'player@example.com', password: 'a secure password' })
    expect((await screen.findByRole('alert')).textContent).toContain('Invalid login credentials')
  })
  it('validates matching passwords and offers confirmation resend after signup', async () => {
    render(<AuthForm />); await click('New here? Create an account')
    await userEvent.type(screen.getByLabelText('Email address'), 'player@example.com')
    await userEvent.type(screen.getByLabelText('New password'), 'password-one')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'password-two')
    await click('Create account'); expect(mocks.auth.signUp).not.toHaveBeenCalled()
    expect(screen.getByRole('alert').textContent).toContain('do not match')
    await userEvent.clear(screen.getByLabelText('Confirm password'))
    await userEvent.type(screen.getByLabelText('Confirm password'), 'password-one')
    await click('Create account')
    expect(screen.getByRole('status').textContent).toContain('Check your inbox')
    await click('Resend confirmation')
    expect(mocks.auth.resend).toHaveBeenCalledWith({ type: 'signup', email: 'player@example.com', options: { emailRedirectTo: 'http://localhost/' } })
  })
  it('requests a recovery link with the recovery return URL', async () => {
    render(<AuthForm />); await click('Forgot password?')
    await userEvent.type(screen.getByLabelText('Email address'), 'player@example.com')
    await click('Send reset link')
    expect(mocks.auth.resetPasswordForEmail).toHaveBeenCalledWith('player@example.com', { redirectTo: 'http://localhost/?flow=recovery' })
    expect(screen.getByRole('status').textContent).toContain('If an account exists')
  })
  it('prevents repeated submission while a request is pending', async () => {
    mocks.auth.signInWithPassword.mockReturnValue(new Promise(() => {}))
    render(<AuthForm />); await fillCredentials(); await click('Sign in')
    fireEvent.submit(screen.getByLabelText('Email address').closest('form')!)
    expect(mocks.auth.signInWithPassword).toHaveBeenCalledTimes(1)
  })
})

describe('sessions and private collections', () => {
  it('handles recovery events before exposing the library and updates the password', async () => {
    render(<AccountApp />); await screen.findByText('Welcome back.')
    act(() => mocks.listener!('PASSWORD_RECOVERY', session))
    expect(screen.queryByText('Private game')).toBeNull()
    await userEvent.type(screen.getByLabelText('New password'), 'a new password')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'a new password')
    await click('Save new password')
    expect(mocks.auth.updateUser).toHaveBeenCalledWith({ password: 'a new password' })
    await screen.findByText('Private game')
  })
  it('clears the previous collection when accounts change and on sign-out', async () => {
    mocks.auth.getSession.mockResolvedValue({ data: { session }, error: null })
    render(<AccountApp />); await screen.findByText('Private game')
    mocks.fetchGames.mockResolvedValue([])
    act(() => mocks.listener!('SIGNED_IN', { user: { id: 'account-b', email: 'other@example.com' } }))
    expect(screen.queryByText('Private game')).toBeNull()
    await screen.findByText('Your story starts here')
    await click('Manage account'); await click('Sign out')
    await screen.findByText('Welcome back.')
    expect(mocks.auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
    expect(screen.queryByText('other@example.com')).toBeNull()
  })
  it('ignores a library response that arrives after logout', async () => {
    let resolve!: (games: unknown[]) => void
    mocks.fetchGames.mockReturnValue(new Promise(r => { resolve = r }))
    mocks.auth.getSession.mockResolvedValue({ data: { session }, error: null })
    render(<AccountApp />); await screen.findByText('Loading your library…')
    act(() => mocks.listener!('SIGNED_OUT', null))
    await act(async () => resolve([game]))
    expect(screen.queryByText('Private game')).toBeNull()
    expect(screen.getByText('Welcome back.')).toBeTruthy()
  })
  it('keeps demo data separate from authenticated libraries', async () => {
    render(<AccountApp />); await screen.findByText('Welcome back.')
    await click('Explore the local demo Try it without an account')
    expect(screen.getByText('Hollow Knight')).toBeTruthy()
    act(() => mocks.listener!('SIGNED_IN', session))
    await screen.findByText('Private game')
    expect(screen.queryByText('Hollow Knight')).toBeNull()
    expect(mocks.persistGame).not.toHaveBeenCalled()
  })
  it('offers retry after a failed cloud load', async () => {
    mocks.fetchGames.mockRejectedValueOnce(new Error('Offline'))
    render(<App user={user} />)
    await screen.findByText(/Your library could not be loaded/)
    expect(screen.queryByText('Your story starts here')).toBeNull()
    await click('Retry loading'); await screen.findByText('Private game')
  })
  it('retains form values on a failed save, then saves successfully on retry', async () => {
    mocks.persistGame.mockRejectedValueOnce(new Error('Connection lost')).mockImplementationOnce(async g => g)
    render(<App user={user} />); await screen.findByText('Private game'); await click('Add game')
    await userEvent.type(screen.getByLabelText(/Game title/), 'New adventure')
    await click('Add to library')
    expect(screen.getByRole('alert').textContent).toContain('Connection lost')
    expect((screen.getByLabelText(/Game title/) as HTMLInputElement).value).toBe('New adventure')
    await click('Add to library'); await screen.findByText('New adventure')
    expect(mocks.persistGame).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'New adventure' }), 'account-a', false)
    expect(localStorage.getItem('backlog-quest:demo:v1')).toBeNull()
  })
  it('keeps the game after a failed delete and removes it after retry', async () => {
    mocks.removeGame.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(undefined)
    render(<App user={user} />); await screen.findByText('Private game'); await click('Delete Private game')
    await click('Remove game'); expect(screen.getByRole('alert').textContent).toContain('Offline')
    await click('Remove game')
    await waitFor(() => expect(screen.queryByText('Private game')).toBeNull())
    expect(mocks.removeGame).toHaveBeenLastCalledWith('game-a', 'account-a')
  })
})

describe('cloud library actions', () => {
  it('saves every edited field and reloads the confirmed game', async () => {
    mocks.persistGame.mockImplementation(async g => g)
    const view = render(<App user={user} />)
    await screen.findByText('Private game'); await click('Edit Private game')
    await userEvent.clear(screen.getByLabelText(/Game title/))
    await userEvent.type(screen.getByLabelText(/Game title/), 'Finished adventure')
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'Completed')
    await userEvent.type(screen.getByLabelText(/Rating/), '9')
    await userEvent.type(screen.getByLabelText('Notes'), 'Great ending')
    await click('Save changes')
    await screen.findByText('Finished adventure')
    const saved = { ...game, title: 'Finished adventure', status: 'Completed', rating: 9, notes: 'Great ending' }
    expect(mocks.persistGame).toHaveBeenCalledWith(saved, user.id, true)
    mocks.fetchGames.mockResolvedValue([saved])
    view.unmount(); render(<App user={user} />)
    await screen.findByText('Finished adventure')
    expect(screen.getByText('Great ending')).toBeTruthy()
  })
  it('keeps Start playing retryable after failure and waits for database confirmation', async () => {
    let resolve!: (value: unknown) => void
    mocks.startPlaying.mockRejectedValueOnce(new Error('Offline')).mockImplementationOnce(() => new Promise(r => { resolve = r }))
    render(<App user={user} />); await screen.findByText('Private game')
    await click('Pick my next game'); await click('Start playing')
    expect(screen.getByRole('alert').textContent).toContain('Offline')
    expect(screen.getByRole('dialog')).toBeTruthy()
    await click('Start playing')
    expect(screen.getByRole('button', { name: 'Saving…' })).toHaveProperty('disabled', true)
    expect(screen.getByRole('button', { name: 'Roll again' })).toHaveProperty('disabled', true)
    expect(mocks.startPlaying).toHaveBeenCalledTimes(2)
    await act(async () => resolve({ ...game, status: 'Playing', notes: 'Latest cloud notes' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByText('Latest cloud notes')).toBeTruthy()
    expect(mocks.startPlaying).toHaveBeenLastCalledWith(game.id, user.id)
    expect(mocks.persistGame).not.toHaveBeenCalled()
    await click('Pick my next game')
    expect(screen.getByText('Your backlog is empty')).toBeTruthy()
    expect(localStorage.getItem('backlog-quest:demo:v1')).toBeNull()
  })
  it('keeps Start playing in the local demo on the device', async () => {
    render(<App />); await click('Pick my next game'); await click('Start playing')
    expect(mocks.startPlaying).not.toHaveBeenCalled()
    expect(mocks.persistGame).not.toHaveBeenCalled()
    const stored = JSON.parse(localStorage.getItem('backlog-quest:demo:v1')!)
    expect(stored.filter((g: { status: string }) => g.status === 'Playing')).toHaveLength(3)
  })
})

describe('reliable feedback', () => {
  it('shows loading instead of an empty collection and locks actions during retry', async () => {
    let resolve!: (value: unknown) => void
    mocks.fetchGames.mockRejectedValueOnce(new Error('Offline')).mockImplementationOnce(() => new Promise(r => { resolve = r }))
    render(<App user={user} />)
    await screen.findByRole('alert')
    expect(screen.getByRole('button', { name: 'Add game' })).toHaveProperty('disabled', true)
    await click('Retry loading')
    expect(screen.getByText('Loading your library…').getAttribute('role')).toBe('status')
    expect(screen.queryByText('Your story starts here')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole('button', { name: 'Pick my next game' })).toHaveProperty('disabled', true)
    await act(async () => resolve([]))
    expect(screen.queryByText('Loading your library…')).toBeNull()
    expect(screen.getByRole('button', { name: 'Add game' })).toHaveProperty('disabled', false)
    expect(screen.getByText('Your story starts here')).toBeTruthy()
  })
  it('locks the full edit dialog while saving and preserves every input after rejection', async () => {
    let reject!: (error: Error) => void
    mocks.persistGame.mockImplementationOnce(() => new Promise((_, r) => { reject = r })).mockImplementationOnce(async g => g)
    render(<App user={user} />); await screen.findByText('Private game'); await click('Edit Private game')
    await userEvent.clear(screen.getByLabelText(/Game title/)); await userEvent.type(screen.getByLabelText(/Game title/), 'My edited title')
    await userEvent.clear(screen.getByLabelText('Platform')); await userEvent.type(screen.getByLabelText('Platform'), 'Switch')
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'Completed')
    await userEvent.type(screen.getByLabelText(/Rating/), '8')
    await userEvent.type(screen.getByLabelText('Notes'), 'Keep these notes')
    await click('Save changes')
    const form = screen.getByLabelText(/Game title/).closest('form')!
    expect(form.getAttribute('aria-busy')).toBe('true')
    expect(form.querySelector('fieldset')).toHaveProperty('disabled', true)
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveProperty('disabled', true)
    expect(screen.getByText('Saving your game…').getAttribute('role')).toBe('status')
    fireEvent.submit(form); fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: false, cancelable: true }))
    expect(mocks.persistGame).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog')).toBeTruthy()
    await act(async () => reject(new Error('Connection lost')))
    expect(screen.getByRole('alert').textContent).toContain('Your entries are still here. Try saving again.')
    expect(form.getAttribute('aria-busy')).toBe('false')
    for (const [label, value] of [[/Game title/, 'My edited title'], ['Platform', 'Switch'], ['Status', 'Completed'], [/Rating/, '8'], ['Notes', 'Keep these notes']] as const) {
      expect(screen.getByLabelText(label)).toHaveProperty('value', value)
    }
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveProperty('disabled', false)
    await click('Save changes'); await screen.findByText('My edited title')
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('locks deletion while pending and restores the retry controls after failure', async () => {
    let reject!: (error: Error) => void
    mocks.removeGame.mockImplementationOnce(() => new Promise((_, r) => { reject = r }))
    render(<App user={user} />); await screen.findByText('Private game'); await click('Delete Private game'); await click('Remove game')
    expect(screen.getByText('Removing your game…').getAttribute('role')).toBe('status')
    for (const name of ['Removing…', 'Keep game', 'Close dialog']) expect(screen.getByRole('button', { name })).toHaveProperty('disabled', true)
    await act(async () => reject(new Error('Offline')))
    expect(screen.getByRole('alert').textContent).toContain('Could not remove this game.')
    expect(screen.getByRole('button', { name: 'Remove game' })).toHaveProperty('disabled', false)
    expect(screen.getByRole('button', { name: 'Edit Private game' })).toBeTruthy()
  })
  it('prevents password changes during sign-out and preserves account inputs after failure', async () => {
    let reject!: (error: Error) => void
    const signOut = vi.fn(() => new Promise<void>((_, r) => { reject = r }))
    render(<App user={user} onSignOut={signOut} />); await screen.findByText('Private game'); await click('Manage account')
    await userEvent.type(screen.getByLabelText('New password'), 'a new password')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'a new password')
    await click('Sign out')
    expect(screen.getByLabelText('New password').closest('fieldset')).toHaveProperty('disabled', true)
    fireEvent.submit(screen.getByLabelText('New password').closest('form')!)
    expect(mocks.auth.updateUser).not.toHaveBeenCalled()
    await act(async () => reject(new Error('Offline')))
    expect(screen.getByRole('alert').textContent).toContain('Could not sign out.')
    expect(screen.getByLabelText('New password')).toHaveProperty('value', 'a new password')
    expect(screen.getByLabelText('New password').closest('fieldset')).toHaveProperty('disabled', false)
  })
  it('shows the right password progress and does not label it as signing out', async () => {
    let resolve!: (value: unknown) => void
    mocks.auth.updateUser.mockImplementationOnce(() => new Promise(r => { resolve = r }))
    render(<App user={user} />); await screen.findByText('Private game'); await click('Manage account')
    await userEvent.type(screen.getByLabelText('New password'), 'a new password')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'a new password')
    await click('Save new password')
    expect(screen.getByRole('button', { name: 'Saving password…' })).toBeTruthy()
    expect(screen.queryByText('Signing out…')).toBeNull()
    expect(screen.getByRole('button', { name: 'Sign out' })).toHaveProperty('disabled', true)
    await act(async () => resolve({ error: new Error('Try later') }))
    expect(screen.getByLabelText('New password')).toHaveProperty('value', 'a new password')
    expect(screen.getByLabelText('Confirm password')).toHaveProperty('value', 'a new password')
    expect(screen.getByRole('alert').textContent).toContain('try again')
  })
  it('prevents leaving for the demo during sign-in and keeps credentials after failure', async () => {
    let resolve!: (value: unknown) => void
    mocks.auth.signInWithPassword.mockImplementationOnce(() => new Promise(r => { resolve = r }))
    render(<AccountApp />); await screen.findByText('Welcome back.'); await fillCredentials(); await click('Sign in')
    expect(screen.getByRole('button', { name: 'Explore the local demo Try it without an account' })).toHaveProperty('disabled', true)
    await act(async () => resolve({ error: new Error('Offline') }))
    expect(screen.getByLabelText('Email address')).toHaveProperty('value', 'player@example.com')
    expect(screen.getByLabelText('Password')).toHaveProperty('value', 'a secure password')
    expect(screen.getByRole('button', { name: 'Sign in' }).closest('fieldset')).toHaveProperty('disabled', false)
  })
})
