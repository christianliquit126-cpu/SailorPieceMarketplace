import { Link } from 'react-router-dom'
import './About.css'

export default function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1>About SailorPiece</h1>
          <p>A community marketplace built by sailors, for sailors.</p>
        </div>
      </div>
      <div className="container about-content">
        <div className="about-section">
          <h2>Our Mission</h2>
          <p>SailorPiece is the dedicated marketplace for the sailing community. Whether you're looking for sails, rigging, navigation equipment, safety gear, or a complete boat, you'll find it here — listed by fellow sailors who understand what quality marine gear means.</p>
        </div>

        <div className="about-stats">
          <div className="stat-card">
            <span className="stat-number">500+</span>
            <span className="stat-label">Active Listings</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">1,200+</span>
            <span className="stat-label">Community Members</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">50+</span>
            <span className="stat-label">States Covered</span>
          </div>
        </div>

        <div className="about-section">
          <h2>Why SailorPiece?</h2>
          <ul className="about-list">
            <li>🎯 <strong>Focused community</strong> — Only sailing and marine items, so you're always talking to the right people.</li>
            <li>💰 <strong>Free to list</strong> — Post your gear at no cost. We believe in supporting the sailing community.</li>
            <li>🔒 <strong>Safe transactions</strong> — Connect with verified sellers and buyers across the country.</li>
            <li>⚡ <strong>Easy to use</strong> — Browse by category, condition, and location to find exactly what you need.</li>
          </ul>
        </div>

        <div className="about-cta">
          <h2>Ready to get started?</h2>
          <div className="about-cta-actions">
            <Link to="/listings" className="hero-btn-primary">Browse Listings</Link>
            <Link to="/sell" className="hero-btn-outline">List Your Gear</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
