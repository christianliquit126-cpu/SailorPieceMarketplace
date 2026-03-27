import { useState, useEffect, useMemo } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../firebase'
import ItemCard from '../components/ItemCard'
import BuyModal from '../components/BuyModal'
import './Marketplace.css'

const RARITIES = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythical', 'Divine']

export default function Marketplace() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [rarity, setRarity] = useState('All')
  const [buyItem, setBuyItem] = useState(null)

  useEffect(() => {
    const itemsRef = ref(db, 'items')
    const unsub = onValue(
      itemsRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.val()
          const arr = Object.entries(data).map(([id, val]) => ({ _id: id, ...val }))
          setItems(arr)
        } else {
          setItems([])
        }
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error(err)
        setError('Failed to load items. Check Firebase config.')
        setLoading(false)
      }
    )
    return () => off(itemsRef)
  }, [])

  const categories = useMemo(() => {
    const cats = new Set(items.map(i => i.category).filter(Boolean))
    return ['All', ...Array.from(cats).sort()]
  }, [items])

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (category !== 'All' && item.category !== category) return false
      if (rarity !== 'All' && (item.rarity || '').toLowerCase() !== rarity.toLowerCase()) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !(item.name || '').toLowerCase().includes(q) &&
          !(item.category || '').toLowerCase().includes(q) &&
          !(item.rarity || '').toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [items, category, rarity, search])

  return (
    <div className="marketplace">
      <header className="market-hero">
        <div className="container">
          <div className="hero-left">
            <p className="hero-eyebrow">Sailor Piece · Roblox</p>
            <h1 className="hero-title">
              Item <span className="glow-text">Marketplace</span>
            </h1>
            <p className="hero-desc">Browse and purchase rare items for your adventure. All transactions update in real-time.</p>
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
        <aside className="market-sidebar">
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
                <button className="search-clear" onClick={() => setSearch('')}><span className="ci ci-close" /></button>
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <label className="sidebar-label">Category</label>
            <ul className="filter-list">
              {categories.map(cat => (
                <li key={cat}>
                  <button
                    className={`filter-btn ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >{cat}</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <label className="sidebar-label">Rarity</label>
            <ul className="filter-list">
              {RARITIES.map(r => (
                <li key={r}>
                  <button
                    className={`filter-btn ${rarity === r ? 'active' : ''} ${r !== 'All' ? `rarity-btn-${r.toLowerCase()}` : ''}`}
                    onClick={() => setRarity(r)}
                  >{r}</button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="market-main">
          <div className="results-bar">
            <span className="results-count">
              {loading ? 'Loading…' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`}
            </span>
            {(search || category !== 'All' || rarity !== 'All') && (
              <button className="clear-filters" onClick={() => { setSearch(''); setCategory('All'); setRarity('All') }}>
                Clear filters
              </button>
            )}
          </div>

          {error && (
            <div className="error-banner">
              <span className="ci ci-warn" style={{ color: 'var(--red)', marginRight: 8 }} />{error}
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
                  ? 'The marketplace is empty. Items added to Firebase will appear here automatically.'
                  : 'No items match your current filters.'}
              </p>
              {items.length > 0 && (
                <button className="btn-ghost" onClick={() => { setSearch(''); setCategory('All'); setRarity('All') }}>
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

      {buyItem && (
        <BuyModal item={buyItem} onClose={() => setBuyItem(null)} />
      )}
    </div>
  )
}
