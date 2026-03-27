import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Sidebar({ theme, onToggleTheme }) {
  const { pathname } = useLocation()
  const isHome  = pathname === '/'
  const isAdmin = pathname === '/admin'

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-top">
        <Link to="/" className="sidebar-brand" title="Sailor Piece Marketplace">
          <div className="sidebar-brand-icon">
            <span className="ci ci-anchor sidebar-logo-icon" />
          </div>
          <span className="sidebar-brand-label">SP</span>
        </Link>

        {/* Live dot */}
        <div className="sidebar-live" title="Store is live">
          <span className="sidebar-live-dot" />
        </div>
      </div>

      {/* Nav icons */}
      <nav className="sidebar-nav">
        <Link
          to="/"
          className={`sidebar-btn ${isHome ? 'active' : ''}`}
          title="Marketplace"
        >
          <span className="ci ci-home sidebar-icon" />
        </Link>

        <Link
          to="/admin"
          className={`sidebar-btn ${isAdmin ? 'active' : ''}`}
          title="Admin Panel"
        >
          <span className="ci ci-settings sidebar-icon" />
        </Link>
      </nav>

      {/* Bottom controls */}
      <div className="sidebar-bottom">
        <button
          className="sidebar-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span className={`ci sidebar-icon ${theme === 'dark' ? 'ci-sun' : 'ci-moon'}`} />
        </button>
      </div>
    </aside>
  )
}
