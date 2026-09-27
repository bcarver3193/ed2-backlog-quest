import { useState } from 'react'
import { ArrowDownAZ, ArrowUpRight, Check, ChevronRight, CirclePause, Dice5, Gamepad2, LayoutGrid, Library, Pencil, Play, Plus, Search, Sparkles, Star, Swords, Trash2, Trophy } from 'lucide-react'
import { loadGames, saveGames, statuses } from './games'
import type { Game, Status } from './games'
import Modal from './components/Modal'
import GameForm from './components/GameForm'

const statusIcons = { Backlog: Library, Playing: Play, Completed: Trophy, Dropped: CirclePause }
type Filter = 'All games' | Status
type ActiveModal = { kind: 'form'; game: Game | null } | { kind: 'delete'; game: Game } | { kind: 'pick'; game: Game | null } | null

export default function App() {
  const [initial] = useState(loadGames)
  const [games, setGames] = useState(initial.games)
  const [error, setError] = useState(initial.error)
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState<Filter>('All games')
  const [search, setSearch] = useState('')
  const [alphabetical, setAlphabetical] = useState(false)
  const [modal, setModal] = useState<ActiveModal>(null)
  const counts = Object.fromEntries(statuses.map(s => [s, games.filter(g => g.status === s).length])) as Record<Status, number>
  const visibleGames = games.filter(g => (filter === 'All games' || g.status === filter) && g.title.toLowerCase().includes(search.toLowerCase()))
  if (alphabetical) visibleGames.sort((a, b) => a.title.localeCompare(b.title))

  function updateGames(next: Game[], message: string) {
    setGames(next)
    setNotice(message)
    try { saveGames(next); setError('') } catch { setError('Changes are available for this visit, but your browser could not save them. They may be lost on refresh.') }
  }
  function pickGame() {
    const backlog = games.filter(g => g.status === 'Backlog')
    setModal({ kind: 'pick', game: backlog.length ? backlog[Math.floor(Math.random() * backlog.length)] : null })
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a href="#main" className="brand"><span className="brand-icon"><Swords size={23} /></span><span>backlog<span className="brand-light">quest</span><small>ONE ADVENTURE AT A TIME</small></span></a>
      <div className="nav-label">YOUR SPACE</div>
      <nav aria-label="Library navigation">
        <button className={filter === 'All games' ? 'nav-item active' : 'nav-item'} onClick={() => setFilter('All games')}><LayoutGrid size={18} />My library<span>{games.length}</span></button>
        <div className="nav-label collection-label">COLLECTION</div>
        {statuses.map(status => { const Icon = statusIcons[status]; return <button key={status} className={`nav-item ${filter === status ? 'active' : ''}`} onClick={() => setFilter(status)}><Icon size={18} />{status}<span>{counts[status]}</span></button> })}
      </nav>
      <div className="sidebar-tip"><Sparkles size={21} /><h3>Less scrolling.<br />More playing.</h3><p>Your next favorite game might already be in your backlog.</p><button onClick={pickGame}>Find my next game <ArrowUpRight size={16} /></button></div>
      <div className="local-profile"><span className="avatar"><Gamepad2 size={20} /></span><div>Local demo<small>Saved in this browser</small></div><span className="live-dot" /></div>
    </aside>

    <main id="main">
      <header className="topbar"><span>Your space <ChevronRight size={13} /> <strong>My library</strong></span><span className="demo-badge"><span className="live-dot" /> DEMO COLLECTION</span></header>
      <div className="main-content">
        <section className="page-heading"><div><div className="eyebrow">MAKE TIME FOR PLAY</div><h1>Your next adventure awaits<span>.</span></h1><p>A home for your games. A little direction for what comes next.</p></div><button className="primary" onClick={() => setModal({ kind: 'form', game: null })}><Plus size={18} />Add game</button></section>

        <section className="overview" aria-label="Collection overview">{statuses.map(status => { const Icon = statusIcons[status]; return <button key={status} className={`stat ${status.toLowerCase()}`} onClick={() => setFilter(status)}><span className="stat-top"><span className="stat-icon"><Icon size={18} /></span>{status}<ArrowUpRight size={15} /></span><strong>{String(counts[status]).padStart(2, '0')}</strong><span className="stat-caption">{{ Backlog: 'Adventures ahead', Playing: 'In the thick of it', Completed: 'Credits rolled', Dropped: 'On to other things' }[status]}</span></button> })}</section>

        <section className="quest-banner"><div className="quest-copy"><span className="eyebrow"><Sparkles size={13} /> LET FATE PICK</span><h2>Big backlog. Tough choice.</h2><p>Roll the dice and discover your next adventure.</p><button className="light-button" onClick={pickGame}><Dice5 size={17} />Pick my next game<ArrowUpRight size={17} /></button></div><div className="quest-art" aria-hidden="true"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="art-star star-one">✦</span><span className="art-star star-two">✧</span><div className="dice"><Dice5 strokeWidth={1.2} /></div><span className="art-plus">+</span></div></section>

        <section className="library-section" aria-labelledby="library-heading"><div className="library-heading"><h2 id="library-heading">Your library <span>{games.length} games</span></h2><span className="library-subtitle">Good games. Your pace.</span></div>
          <div className="library-toolbar"><div className="tabs" role="group" aria-label="Filter games by status">{(['All games', ...statuses] as Filter[]).map(s => <button key={s} aria-pressed={filter === s} className={filter === s ? 'selected' : ''} onClick={() => setFilter(s)}>{s}<span>{s === 'All games' ? games.length : counts[s]}</span></button>)}</div><div className="search-tools"><div className="search"><Search size={17} /><input aria-label="Search games" placeholder="Search games…" value={search} onChange={e => setSearch(e.target.value)} /></div><button className={`icon-button sort-button ${alphabetical ? 'selected' : ''}`} aria-label="Sort by title" aria-pressed={alphabetical} title="Sort by title" onClick={() => setAlphabetical(!alphabetical)}><ArrowDownAZ size={19} /></button></div></div>
          {error && <p className="error" role="alert">{error}</p>}
          <p className="sr-only" role="status">{notice}</p>
          <div className="game-grid">{visibleGames.map(game => <article className={`game-card ${game.status.toLowerCase()}`} key={game.id}>
            <div className="card-top"><span className={`status-badge ${game.status.toLowerCase()}`}><span />{game.status}</span><div className="card-actions"><button className="icon-button" aria-label={`Edit ${game.title}`} onClick={() => setModal({ kind: 'form', game })}><Pencil size={15} /></button><button className="icon-button" aria-label={`Delete ${game.title}`} onClick={() => setModal({ kind: 'delete', game })}><Trash2 size={15} /></button></div></div>
            <div className="game-title-row"><span className="game-symbol"><Gamepad2 size={24} /></span><div><h3><button onClick={() => setModal({ kind: 'form', game })}>{game.title}</button></h3><p>{game.platform || 'No platform added'}</p></div></div>
            <p className={`game-notes ${game.notes ? '' : 'no-notes'}`}>{game.notes || 'A new adventure waiting to happen.'}</p>
            <div className="card-footer"><span className={game.rating ? 'rating rated' : 'rating'}><Star size={14} fill={game.rating ? 'currentColor' : 'none'} />{game.rating ? <><strong>{game.rating}</strong><span>/ 10</span></> : 'Not rated'}</span><button onClick={() => setModal({ kind: 'form', game })}>View game <ChevronRight size={14} /></button></div>
          </article>)}</div>
          {!visibleGames.length && <div className="empty-state"><Library size={32} /><h3>{search ? 'No matches this time' : filter === 'All games' ? 'Your story starts here' : `No ${filter.toLowerCase()} games yet`}</h3><p>{search ? 'Try another title or clear your filters.' : 'Add a game or explore the rest of your library.'}</p><button className="secondary" onClick={() => { if (search || filter !== 'All games') { setSearch(''); setFilter('All games') } else setModal({ kind: 'form', game: null }) }}>{search || filter !== 'All games' ? 'Show all games' : 'Add your first game'}</button></div>}
        </section>
        <footer><span><Swords size={13} /> Built for the love of the game.</span><span>Demo data · Stored on this device · No cloud sync</span></footer>
      </div>
    </main>

    {modal?.kind === 'form' && <Modal title={modal.game ? 'Edit game' : 'A new adventure'} onClose={() => setModal(null)}><GameForm game={modal.game} onCancel={() => setModal(null)} onSave={game => { updateGames(modal.game ? games.map(g => g.id === game.id ? game : g) : [game, ...games], `${game.title} saved.`); setModal(null) }} /></Modal>}
    {modal?.kind === 'delete' && <Modal title="Remove this game?" onClose={() => setModal(null)}><p className="dialog-copy">Remove <strong>{modal.game.title}</strong> and its notes from your demo library? This cannot be undone.</p><div className="dialog-actions"><button className="secondary" onClick={() => setModal(null)}>Keep game</button><button className="danger" onClick={() => { updateGames(games.filter(g => g.id !== modal.game.id), `${modal.game.title} removed.`); setModal(null) }}>Remove game</button></div></Modal>}
    {modal?.kind === 'pick' && <Modal title="Your next quest" onClose={() => setModal(null)}><div className="pick-result"><span className="pick-icon"><Dice5 size={36} /></span><div className="eyebrow">{modal.game ? 'THE DICE HAVE SPOKEN' : 'A CLEAN SLATE'}</div><h3>{modal.game?.title ?? 'Your backlog is empty'}</h3><p>{modal.game ? modal.game.platform || 'Your next adventure is ready.' : 'Add a game to your backlog to let fate choose your next adventure.'}</p></div><div className="dialog-actions">{modal.game ? <><button className="secondary" onClick={pickGame}><Dice5 size={16} />Roll again</button><button className="primary" onClick={() => { const picked = modal.game!; updateGames(games.map(g => g.id === picked.id ? { ...g, status: 'Playing' } : g), `${picked.title} is now Playing.`); setModal(null) }}><Check size={16} />Start playing</button></> : <button className="primary" onClick={() => setModal({ kind: 'form', game: null })}><Plus size={16} />Add game</button>}</div></Modal>}
  </div>
}
