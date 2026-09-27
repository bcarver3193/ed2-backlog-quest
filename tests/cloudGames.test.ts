import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchGames, persistGame, removeGame, startPlaying } from '../src/cloudGames'
import type { Game } from '../src/games'

const { request } = vi.hoisted(() => ({ request: vi.fn() }))
// Exercise the real Supabase query builder; replace only the HTTP transport.
vi.mock('../src/supabase', async () => {
  const { createClient } = await import('@supabase/supabase-js')
  return { supabase: createClient('https://example.supabase.co', 'test-publishable-key', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: request },
  }) }
})
const game: Game = { id: 'game-a', title: 'Adventure', platform: '', status: 'Backlog', rating: null, notes: '' }
function respond(data: unknown, status = 200) {
  request.mockResolvedValueOnce(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }))
}
function sent() {
  const [url, options] = request.mock.calls.at(-1)!
  return { url: new URL(url), method: options.method, body: options.body ? JSON.parse(options.body) : undefined }
}
beforeEach(() => request.mockReset())

describe('cloud database requests', () => {
  it('loads only the signed-in owner and normalizes optional database fields', async () => {
    respond([{ ...game, platform: null, notes: null }])
    expect(await fetchGames('owner-a')).toEqual([game])
    expect(sent().url.searchParams.get('user_id')).toBe('eq.owner-a')
    expect(sent().url.searchParams.get('order')).toBe('created_at.desc')
    respond([])
    expect(await fetchGames('owner-b')).toEqual([])
  })
  it('inserts all game fields with explicit ownership and uses the returned row', async () => {
    respond({ ...game, title: 'Database title' }, 201)
    expect(await persistGame(game, 'owner-a', false)).toEqual({ ...game, title: 'Database title' })
    expect(sent().method).toBe('POST')
    expect(sent().body).toEqual({ ...game, user_id: 'owner-a', platform: null, notes: null })
  })
  it('saves edits only to the matching game and owner', async () => {
    const edited = { ...game, title: 'Edited', platform: 'PC', status: 'Completed' as const, rating: 9, notes: 'Finished' }
    respond(edited)
    expect(await persistGame(edited, 'owner-a', true)).toEqual(edited)
    expect(sent().method).toBe('PATCH')
    expect(sent().body).toEqual({ title: 'Edited', platform: 'PC', status: 'Completed', rating: 9, notes: 'Finished' })
    expect(sent().url.searchParams.get('id')).toBe('eq.game-a')
    expect(sent().url.searchParams.get('user_id')).toBe('eq.owner-a')
  })
  it('starts playing without overwriting fields edited on another device', async () => {
    const current = { ...game, notes: 'Updated elsewhere', status: 'Playing' }
    respond(current)
    expect(await startPlaying(game.id, 'owner-a')).toEqual(current)
    expect(sent().method).toBe('PATCH')
    expect(sent().body).toEqual({ status: 'Playing' })
    expect(sent().url.searchParams.get('id')).toBe('eq.game-a')
    expect(sent().url.searchParams.get('user_id')).toBe('eq.owner-a')
  })
  it('deletes only the matching game and owner, requiring a confirmed row', async () => {
    respond({ id: game.id })
    await removeGame(game.id, 'owner-a')
    expect(sent().method).toBe('DELETE')
    expect(sent().url.searchParams.get('id')).toBe('eq.game-a')
    expect(sent().url.searchParams.get('user_id')).toBe('eq.owner-a')
  })
  it('propagates database failures for reads and every mutation, including missing rows', async () => {
    const operations = [() => fetchGames('owner-a'), () => persistGame(game, 'owner-a', false),
      () => persistGame(game, 'owner-a', true), () => startPlaying(game.id, 'owner-a'), () => removeGame(game.id, 'owner-a')]
    for (const operation of operations) {
      respond({ message: 'Row unavailable', code: 'PGRST116' }, 406)
      await expect(operation()).rejects.toMatchObject({ message: 'Row unavailable', code: 'PGRST116' })
    }
  })
})
