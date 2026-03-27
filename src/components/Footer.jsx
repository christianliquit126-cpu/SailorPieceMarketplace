import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="brand-icon">⚓</span>
          <span>SailorPiece Marketplace</span>
        </div>
        <p className="footer-tagline">Buy and sell nautical gear, sailing equipment, and marine items.</p>
        <nav className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/listings">Browse</Link>
          <Link to="/sell">Sell</Link>
          <Link to="/about">About</Link>
        </nav>
        <p className="footer-copy">© {new Date().getFullYear()} SailorPiece Marketplace. All rights reserved.</p>
      </div>
    </footer>
  )
}
