import { Link } from 'react-router-dom'
import { listings, CATEGORIES } from '../data/listings'
import ListingCard from '../components/ListingCard'
import './Home.css'

export default function Home() {
  const featured = listings.slice(0, 4)

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>The Marketplace for Sailors</h1>
          <p>Buy and sell nautical gear, sailing equipment, and marine items from sailors across the country.</p>
          <div className="hero-actions">
            <Link to="/listings" className="hero-btn-primary">Browse Listings</Link>
            <Link to="/sell" className="hero-btn-secondary">Sell Your Gear</Link>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="container">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            {CATEGORIES.filter(c => c !== 'All').map(cat => (
              <Link key={cat} to={`/listings?category=${encodeURIComponent(cat)}`} className="category-chip">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Recent Listings</h2>
            <Link to="/listings" className="see-all-link">See all →</Link>
          </div>
          <div className="listings-grid">
            {featured.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Sell Your Sailing Gear?</h2>
            <p>List your items for free and connect with buyers in the sailing community.</p>
            <Link to="/sell" className="hero-btn-primary">List an Item</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
