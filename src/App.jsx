import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/Navbar'
import Marketplace from './pages/Marketplace'
import Admin from './pages/Admin'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app-layout">
        <Sidebar theme={theme} onToggleTheme={toggleTheme} />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Marketplace />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
