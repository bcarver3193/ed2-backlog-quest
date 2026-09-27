import { supabase } from './supabase'
import type { Game } from './games'

const fields = 'id,title,platform,status,rating,notes'
const normalize = (game: Game): Game => ({ ...game, platform: game.platform ?? '', notes: game.notes ?? '' })

export async function startPlaying(id: string, userId: string): Promise<Game> {
  // Only change status: another device may have edited the game's other fields.
  const { data, error } = await supabase!.from('games').update({ status: 'Playing' })
    .eq('id', id).eq('user_id', userId).select(fields).single()
  if (error) throw error
  return normalize(data as Game)
}

export async function fetchGames(userId: string): Promise<Game[]> {
  const { data, error } = await supabase!.from('games').select(fields).eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return (data as Game[]).map(normalize)
}

export async function persistGame(game: Game, userId: string, existing: boolean): Promise<Game> {
  const { id, title, platform, status, rating, notes } = game
  const values = { title, platform: platform || null, status, rating, notes: notes || null }
  const query = existing
    ? supabase!.from('games').update(values).eq('id', id).eq('user_id', userId)
    : supabase!.from('games').insert({ ...values, id, user_id: userId })
  const { data, error } = await query.select(fields).single()
  if (error) throw error
  return normalize(data as Game)
}

export async function removeGame(id: string, userId: string) {
  const { error } = await supabase!.from('games').delete().eq('id', id).eq('user_id', userId).select('id').single()
  if (error) throw error
}
