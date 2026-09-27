import { useState } from 'react'
import { ArrowUpRight, ChevronRight, CirclePause, Gamepad2, LayoutGrid, Library, Pencil, Play, Plus, Search, Sparkles, Star, Swords, Trophy } from 'lucide-react'
import { demoGames, statuses } from './games'
import type { Game, Status } from './games'
import Modal from './components/Modal'
import GameForm from './components/GameForm'

const statusIcons = { Backlog: Library, Playing: Play, Completed: Trophy, Dropped: CirclePause }
type Filter = 'All games' | Status
type ActiveModal = { kind: 'form'; game: Game | null } | null

export default function App() {
  const [games, setGames] = useState(demoGames)
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState<Filter>('All games')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<ActiveModal>(null)
  const counts = Object.fromEntries(statuses.map(s => [s, games.filter(g => g.status === s).length])) as Record<Status, number>
  const visibleGames = games.filter(g => (filter === 'All games' || g.status === filter) && g.title.toLowerCase().includes(search.toLowerCase()))

  function updateGames(next: Game[], message: string) {
    setGames(next)
    setNotice(message)
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
      <div className="sidebar-tip"><Sparkles size={21} /><h3>Less scrolling.<br />More playing.</h3><p>Your next favorite game might already be in your backlog.</p></div>
      <div className="local-profile"><span className="avatar"><Gamepad2 size={20} /></span><div>Local demo<small>Sample collection</small></div><span className="live-dot" /></div>
    </aside>

    <main id="main">
      <header className="topbar"><span>Your space <ChevronRight size={13} /> <strong>My library</strong></span><span className="demo-badge"><span className="live-dot" /> DEMO COLLECTION</span></header>
      <div className="main-content">
        <section className="page-heading"><div><div className="eyebrow">MAKE TIME FOR PLAY</div><h1>Your next adventure awaits<span>.</span></h1><p>A home for your games. A little direction for what comes next.</p></div><button className="primary" onClick={() => setModal({ kind: 'form', game: null })}><Plus size={18} />Add game</button></section>

        <section className="overview" aria-label="Collection overview">{statuses.map(status => { const Icon = statusIcons[status]; return <button key={status} className={`stat ${status.toLowerCase()}`} onClick={() => setFilter(status)}><span className="stat-top"><span className="stat-icon"><Icon size={18} /></span>{status}<ArrowUpRight size={15} /></span><strong>{String(counts[status]).padStart(2, '0')}</strong><span className="stat-caption">{{ Backlog: 'Adventures ahead', Playing: 'In the thick of it', Completed: 'Credits rolled', Dropped: 'On to other things' }[status]}</span></button> })}</section>


        <section className="library-section" aria-labelledby="library-heading"><div className="library-heading"><h2 id="library-heading">Your library <span>{games.length} games</span></h2><span className="library-subtitle">Good games. Your pace.</span></div>
          <div className="library-toolbar"><div className="tabs" role="group" aria-label="Filter games by status">{(['All games', ...statuses] as Filter[]).map(s => <button key={s} aria-pressed={filter === s} className={filter === s ? 'selected' : ''} onClick={() => setFilter(s)}>{s}<span>{s === 'All games' ? games.length : counts[s]}</span></button>)}</div><div className="search-tools"><div className="search"><Search size={17} /><input aria-label="Search games" placeholder="Search games…" value={search} onChange={e => setSearch(e.target.value)} /></div></div></div>
          <p className="sr-only" role="status">{notice}</p>
          <div className="game-grid">{visibleGames.map(game => <article className={`game-card ${game.status.toLowerCase()}`} key={game.id}>
            <div className="card-top"><span className={`status-badge ${game.status.toLowerCase()}`}><span />{game.status}</span><div className="card-actions"><button className="icon-button" aria-label={`Edit ${game.title}`} onClick={() => setModal({ kind: 'form', game })}><Pencil size={15} /></button></div></div>
            <div className="game-title-row"><span className="game-symbol"><Gamepad2 size={24} /></span><div><h3><button onClick={() => setModal({ kind: 'form', game })}>{game.title}</button></h3><p>{game.platform || 'No platform added'}</p></div></div>
            <p className={`game-notes ${game.notes ? '' : 'no-notes'}`}>{game.notes || 'A new adventure waiting to happen.'}</p>
            <div className="card-footer"><span className={game.rating ? 'rating rated' : 'rating'}><Star size={14} fill={game.rating ? 'currentColor' : 'none'} />{game.rating ? <><strong>{game.rating}</strong><span>/ 10</span></> : 'Not rated'}</span><button onClick={() => setModal({ kind: 'form', game })}>View game <ChevronRight size={14} /></button></div>
          </article>)}</div>
          {!visibleGames.length && <div className="empty-state"><Library size={32} /><h3>{search ? 'No matches this time' : filter === 'All games' ? 'Your story starts here' : `No ${filter.toLowerCase()} games yet`}</h3><p>{search ? 'Try another title or clear your filters.' : 'Add a game or explore the rest of your library.'}</p><button className="secondary" onClick={() => { if (search || filter !== 'All games') { setSearch(''); setFilter('All games') } else setModal({ kind: 'form', game: null }) }}>{search || filter !== 'All games' ? 'Show all games' : 'Add your first game'}</button></div>}
        </section>
        <footer><span><Swords size={13} /> Built for the love of the game.</span><span>Demo data · Changes reset on refresh · No cloud sync</span></footer>
      </div>
    </main>

    {modal?.kind === 'form' && <Modal title={modal.game ? 'Edit game' : 'A new adventure'} onClose={() => setModal(null)}><GameForm game={modal.game} onCancel={() => setModal(null)} onSave={game => { updateGames(modal.game ? games.map(g => g.id === game.id ? game : g) : [game, ...games], `${game.title} saved.`); setModal(null) }} /></Modal>}
  </div>
}
