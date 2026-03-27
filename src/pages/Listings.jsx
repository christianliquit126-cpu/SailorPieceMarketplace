import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listings, CATEGORIES } from '../data/listings'
import ListingCard from '../components/ListingCard'
import './Listings.css'

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setSelectedCategory(cat)
  }, [searchParams])

  let filtered = listings.filter(l => {
    const matchesCategory = selectedCategory === 'All' || l.category === selectedCategory
    const matchesSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price)
  else if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price)

  return (
    <div className="listings-page">
      <div className="listings-header">
        <div className="container">
          <h1>Browse Listings</h1>
          <p>{filtered.length} item{filtered.length !== 1 ? 's' : ''} available</p>
        </div>
      </div>

      <div className="container listings-layout">
        <aside className="listings-sidebar">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <label>Category</label>
            <ul className="category-list">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button
                    className={selectedCategory === cat ? 'active' : ''}
                    onClick={() => {
                      setSelectedCategory(cat)
                      setSearchParams(cat !== 'All' ? { category: cat } : {})
                    }}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="filter-group">
            <label>Sort by</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </aside>

        <section className="listings-results">
          {filtered.length === 0 ? (
            <div className="no-results">
              <p>No listings found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="listings-grid">
              {filtered.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
