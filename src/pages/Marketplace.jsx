import { useState, useEffect, useMemo } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../firebase'
import ItemCard from '../components/ItemCard'
import BuyModal from '../components/BuyModal'
import './Marketplace.css'

// Fixed category list — must match what the admin panel uses.
const CATEGORIES = ['Specs Set', 'Materials', 'Chest', 'Key']

export default function Marketplace() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState('')
  const [category, setCategory] = useState('All')
  const [buyItem, setBuyItem] = useState(null)

  // Subscribe to real-time item updates from Firebase
  useEffect(() => {
    const itemsRef = ref(db, 'items')
    const unsub = onValue(
      itemsRef,
      (snap) => {
        if (snap.exists()) {
          const arr = Object.entries(snap.val()).map(([id, val]) => ({ _id: id, ...val }))
          setItems(arr)
        } else {
          setItems([])
        }
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error(err)
        setError('Failed to load items. Check your Firebase configuration.')
        setLoading(false)
      }
    )
    return () => off(itemsRef)
  }, [])

  // Filter items by category and search query
  const filtered = useMemo(() => {
    return items.filter(item => {
      if (category !== 'All' && item.category !== category) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !(item.name     || '').toLowerCase().includes(q) &&
          !(item.category || '').toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [items, category, search])

  const hasFilters = search || category !== 'All'

  return (
    <div className="marketplace">

      {/* ── Hero banner ── */}
      <header className="market-hero">
        <div className="container">
          <div className="hero-left">
            <p className="hero-eyebrow">Sailor Piece · Roblox</p>
            <h1 className="hero-title">
              Item <span className="glow-text">Marketplace</span>
            </h1>
            <p className="hero-desc">
              Browse and purchase items for your adventure. All inventory updates in real-time.
            </p>
          </div>
          <div className="hero-stats">
            <div className="stat-pill">
              <span className="stat-n">{items.length}</span>
              <span className="stat-l">Total Items</span>
            </div>
            <div className="stat-pill">
              <span className="stat-n">{items.filter(i => i.stock > 0).length}</span>
              <span className="stat-l">In Stock</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container market-body">

        {/* ── Sidebar filters ── */}
        <aside className="market-sidebar">

          {/* Search */}
          <div className="sidebar-section">
            <label className="sidebar-label">Search</label>
            <div className="search-wrap">
              <span className="search-icon ci ci-search" />
              <input
                type="text"
                className="search-input"
                placeholder="Search items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')}>
                  <span className="ci ci-close" />
                </button>
              )}
            </div>
          </div>

          {/* Category filter */}
          <div className="sidebar-section">
            <label className="sidebar-label">Category</label>
            <ul className="filter-list">
              {['All', ...CATEGORIES].map(cat => (
                <li key={cat}>
                  <button
                    className={`filter-btn ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </aside>

        {/* ── Main grid ── */}
        <main className="market-main">
          <div className="results-bar">
            <span className="results-count">
              {loading ? 'Loading…' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`}
            </span>
            {hasFilters && (
              <button
                className="clear-filters"
                onClick={() => { setSearch(''); setCategory('All') }}
              >
                Clear filters
              </button>
            )}
          </div>

          {error && (
            <div className="error-banner">
              <span className="ci ci-warn" style={{ color: 'var(--red)', marginRight: 8 }} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-grid">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><span className="css-empty-wave" /></div>
              <h3>No items found</h3>
              <p>
                {items.length === 0
                  ? 'The marketplace is currently empty. Check back soon!'
                  : 'No items match your current filters.'}
              </p>
              {items.length > 0 && (
                <button
                  className="btn-ghost"
                  onClick={() => { setSearch(''); setCategory('All') }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="items-grid">
              {filtered.map(item => (
                <ItemCard key={item._id} item={item} onBuy={setBuyItem} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Buy modal (shown when a card is clicked) ── */}
      {buyItem && (
        <BuyModal item={buyItem} onClose={() => setBuyItem(null)} />
      )}
    </div>
  )
}
