import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar({ theme, onToggleTheme }) {
  const { pathname } = useLocation()
  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon ci ci-anchor" />
          <span className="brand-name">Sailor<span className="brand-accent">Piece</span></span>
          <span className="brand-tag">Marketplace</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Shop</Link>
          <Link to="/admin" className={`nav-link ${pathname === '/admin' ? 'active' : ''}`}>Admin</Link>
        </div>
        <div className="navbar-right">
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className={`theme-icon ${theme === 'dark' ? 'ci-sun' : 'ci-moon'}`} />
          </button>
          <div className="navbar-status">
            <span className="status-dot" />
            <span className="status-text">Live</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
