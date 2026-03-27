import { useState, useEffect, useMemo } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../firebase'
import ItemCard from '../components/ItemCard'
import BuyModal from '../components/BuyModal'
import './Marketplace.css'

const CATEGORIES = ['Specs Set', 'Materials', 'Chest', 'Key']

export const CATEGORY_META = {
  'All':       { color: '#4f8ef7', label: 'All' },
  'Specs Set': { color: '#8b5cf6', label: 'Specs Set' },
  'Materials': { color: '#f59e0b', label: 'Materials' },
  'Chest':     { color: '#f97316', label: 'Chest' },
  'Key':       { color: '#22c55e', label: 'Key' },
}

export default function Marketplace() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('All')
  const [buyItem, setBuyItem]   = useState(null)

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

  const hasFilters   = search || category !== 'All'
  const inStockCount = items.filter(i => i.stock > 0).length

  return (
    <div className="marketplace">

      {/* ── Page header ── */}
      <div className="market-header">
        <div className="market-header-left">
          <div className="market-brand-row">
            <h1 className="market-title">Sailor Piece</h1>
            <span className="roblox-badge">on Roblox</span>
          </div>
          <p className="market-subtitle">Item Marketplace — browse &amp; order in-game items</p>
        </div>
        <div className="market-header-stats">
          <div className="header-stat">
            <span className="header-stat-n">{items.length}</span>
            <span className="header-stat-l">Total Items</span>
          </div>
          <div className="header-stat in-stock">
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
          placeholder="Search items by name or category…"
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
              {loading
                ? 'Loading items…'
                : `${filtered.length} item${filtered.length !== 1 ? 's' : ''}${category !== 'All' ? ` in ${category}` : ''}`
              }
            </span>
            {hasFilters && (
              <button
                className="clear-all-btn"
                onClick={() => { setSearch(''); setCategory('All') }}
              >
                Clear all filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="items-grid">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-anchor-icon">
                <span className="ci ci-anchor empty-anchor" />
              </div>
              <h3>No items found</h3>
              <p>
                {items.length === 0
                  ? 'The Sailor Piece marketplace is currently empty. Items will appear here once the admin seeds the database.'
                  : 'No items match your current search or category filter.'}
              </p>
              {hasFilters && (
                <button
                  className="btn-ghost"
                  style={{ marginTop: 4 }}
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
            <span className="filter-panel-title">Category</span>
            {category !== 'All' && (
              <button className="filter-clear-btn" onClick={() => setCategory('All')}>Clear</button>
            )}
          </div>
          <ul className="filter-list">
            {['All', ...CATEGORIES].map(cat => {
              const meta = CATEGORY_META[cat] || { color: 'var(--accent)' }
              const isActive = category === cat
              return (
                <li key={cat}>
                  <button
                    className={`filter-item ${isActive ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                    style={{ '--cat-color': meta.color }}
                  >
                    <span className="filter-dot" style={{ background: meta.color }} />
                    {cat}
                    {isActive && <span className="ci ci-check filter-active-check" />}
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Category item counts */}
          {!loading && items.length > 0 && (
            <div className="category-counts">
              {['All', ...CATEGORIES].map(cat => {
                const count = cat === 'All'
                  ? items.length
                  : items.filter(i => i.category === cat).length
                if (count === 0 && cat !== 'All') return null
                return (
                  <div key={cat} className="cat-count-row">
                    <span className="cat-count-name">{cat}</span>
                    <span className="cat-count-n">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </aside>
      </div>

      {buyItem && (
        <BuyModal item={buyItem} onClose={() => setBuyItem(null)} />
      )}
    </div>
  )
}
