import { useState, useEffect, useMemo } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../firebase'
import ItemCard from '../components/ItemCard'
import BuyModal from '../components/BuyModal'
import './Marketplace.css'

const CATEGORIES = ['Specs Set', 'Materials', 'Chest', 'Key']

export default function Marketplace() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState('')
  const [category, setCategory] = useState('All')
  const [buyItem, setBuyItem] = useState(null)

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
  const inStockCount = items.filter(i => i.stock > 0).length

  return (
    <div className="marketplace">

      {/* ── Page header ── */}
      <div className="market-header">
        <div className="market-header-left">
          <h1 className="market-title">Marketplace</h1>
          <span className="market-subtitle">SailorPiece · Roblox</span>
        </div>
        <div className="market-header-stats">
          <div className="header-stat">
            <span className="header-stat-n">{items.length}</span>
            <span className="header-stat-l">Items</span>
          </div>
          <div className="header-stat">
            <span className="header-stat-n">{inStockCount}</span>
            <span className="header-stat-l">In Stock</span>
          </div>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="search-bar-wrap">
        <span className="ci ci-search search-bar-icon" />
        <input
          type="text"
          className="search-bar-input"
          placeholder="Search the Marketplace…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-bar-clear" onClick={() => setSearch('')}>
            Clear
          </button>
        )}
      </div>

      {/* ── Main layout: grid + filter panel ── */}
      <div className="market-body">

        {/* Items grid */}
        <main className="market-main">
          {error && (
            <div className="error-banner">
              <span className="ci ci-warn" style={{ marginRight: 8, color: 'var(--red)' }} />
              {error}
            </div>
          )}

          <div className="results-bar">
            <span className="results-count">
              {loading ? 'Loading…' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`}
            </span>
            {hasFilters && (
              <button
                className="clear-all-btn"
                onClick={() => { setSearch(''); setCategory('All') }}
              >
                Clear all
              </button>
            )}
          </div>

          {loading ? (
            <div className="items-grid">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-wave-icon" />
              <h3>No items found</h3>
              <p>
                {items.length === 0
                  ? 'The marketplace is currently empty. Check back soon!'
                  : 'Try a different search or category.'}
              </p>
              {hasFilters && (
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

        {/* ── Right filter panel ── */}
        <aside className="market-filter-panel">
          <div className="filter-panel-header">
            <span className="filter-panel-title">Category filter</span>
            {category !== 'All' && (
              <button className="filter-clear-btn" onClick={() => setCategory('All')}>Clear</button>
            )}
          </div>
          <ul className="filter-list">
            {['All', ...CATEGORIES].map(cat => (
              <li key={cat}>
                <button
                  className={`filter-item ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  <span className="filter-check">
                    {category === cat && <span className="ci ci-check filter-check-icon" />}
                  </span>
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {buyItem && (
        <BuyModal item={buyItem} onClose={() => setBuyItem(null)} />
      )}
    </div>
  )
}
