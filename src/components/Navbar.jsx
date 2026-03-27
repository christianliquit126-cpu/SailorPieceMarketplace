import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⚓</span>
          <span className="brand-name">SailorPiece</span>
        </Link>
        <ul className="navbar-links">
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
          <li><Link to="/listings" className={location.pathname.startsWith('/listings') ? 'active' : ''}>Browse</Link></li>
          <li><Link to="/sell" className={location.pathname === '/sell' ? 'active' : ''}>Sell</Link></li>
          <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link></li>
        </ul>
        <div className="navbar-actions">
          <Link to="/sell" className="btn-primary">List an Item</Link>
        </div>
      </div>
    </nav>
  )
}
