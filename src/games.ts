export const statuses = ['Backlog', 'Playing', 'Completed', 'Dropped'] as const
export type Status = typeof statuses[number]
export interface Game {
  id: string
  title: string
  platform: string
  status: Status
  rating: number | null
  notes: string
}

export const demoGames: Game[] = [
  { id: 'demo-1', title: 'Hollow Knight', platform: 'PC', status: 'Playing', rating: null, notes: 'There is always another path to explore in Hallownest.' },
  { id: 'demo-2', title: 'Hades', platform: 'Nintendo Switch', status: 'Playing', rating: 9, notes: 'One more escape attempt.' },
  { id: 'demo-3', title: 'Outer Wilds', platform: 'PC', status: 'Backlog', rating: null, notes: 'Go in blind. Take my time exploring.' },
  { id: 'demo-4', title: 'Celeste', platform: 'Nintendo Switch', status: 'Backlog', rating: null, notes: '' },
  { id: 'demo-5', title: 'Elden Ring', platform: 'PlayStation 5', status: 'Backlog', rating: null, notes: '' },
  { id: 'demo-6', title: 'Portal 2', platform: 'PC', status: 'Completed', rating: 10, notes: 'An all-time favorite. Revisit co-op someday.' },
]

const storageKey = 'backlog-quest:demo:v1'
export function loadGames(): { games: Game[]; error: string } {
  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return { games: demoGames, error: '' }
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed) || !parsed.every((game: unknown) => {
      if (!game || typeof game !== 'object') return false
      const g = game as Game
      return typeof g.id === 'string' && typeof g.title === 'string' && !!g.title.trim()
        && typeof g.platform === 'string' && typeof g.notes === 'string' && statuses.includes(g.status)
        && (g.rating === null || (Number.isInteger(g.rating) && g.rating >= 1 && g.rating <= 10))
    })) throw new Error('Invalid saved collection')
    return { games: parsed, error: '' }
  } catch {
    return { games: demoGames, error: 'Your saved demo could not be loaded. Showing sample games; changes will replace the saved demo.' }
  }
}
export function saveGames(games: Game[]) {
  localStorage.setItem(storageKey, JSON.stringify(games))
}
