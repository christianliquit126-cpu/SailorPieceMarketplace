import { useState, useEffect } from 'react'
import { ref, onValue, off, update, push, remove } from 'firebase/database'
import { db } from '../firebase'
import './Admin.css'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
// Fixed category options — the only values allowed for items in the store.
const CATEGORIES = ['Specs Set', 'Materials', 'Chest', 'Key']

const STATUS_OPTIONS = ['pending', 'processing', 'completed', 'cancelled']

const STATUS_COLORS = {
  pending:    { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b',  border: 'rgba(245,158,11,0.3)'  },
  processing: { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6',  border: 'rgba(59,130,246,0.3)'  },
  completed:  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981',  border: 'rgba(16,185,129,0.3)'  },
  cancelled:  { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444',  border: 'rgba(239,68,68,0.3)'   },
}

// Default values for the add/edit item form
const EMPTY_FORM = { name: '', category: 'Specs Set', stock: '', image: '' }

// Admin password + session storage key
const ADMIN_PASSWORD = 'xyruu2005'
const SESSION_KEY    = 'sp_admin_auth'

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
// Small coloured pill that shows the current order status.
function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending
  return (
    <span
      className="status-badge"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {status}
    </span>
  )
}

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
// Full-screen gate that must be passed before accessing the dashboard.
function AdminLogin({ onSuccess }) {
  const [pw, setPw]       = useState('')
  const [error, setError] = useState(null)
  const [shake, setShake] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1')
      onSuccess()
    } else {
      setError('Incorrect password. Please try again.')
      setShake(true)
      setTimeout(() => setShake(false), 600)
      setPw('')
    }
  }

  return (
    <div className="login-backdrop">
      <form className={`login-box ${shake ? 'shake' : ''}`} onSubmit={handleSubmit}>
        <div className="login-icon"><span className="ci ci-lock" /></div>
        <h2 className="login-title">Admin Access</h2>
        <p className="login-sub">Enter the password to continue to the dashboard.</p>
        <div className="login-field">
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(null) }}
            autoFocus
          />
        </div>
        {error && <p className="login-error">{error}</p>}
        <button type="submit" className="btn-primary login-btn">Unlock Panel</button>
      </form>
    </div>
  )
}

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────
// Real-time list of all orders placed from the store. Supports filtering by
// status and searching by item name, buyer name, or Roblox username.
function OrdersTab() {
  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [filterStatus, setFilter]   = useState('all')
  const [updating, setUpdating]     = useState(null)
  const [search, setSearch]         = useState('')

  // Subscribe to real-time order updates from Firebase
  useEffect(() => {
    const r = ref(db, 'orders')
    onValue(
      r,
      snap => {
        if (snap.exists()) {
          const arr = Object.entries(snap.val())
            .map(([id, v]) => ({ _id: id, ...v }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
          setOrders(arr)
        } else {
          setOrders([])
        }
        setLoading(false)
        setError(null)
      },
      () => { setError('Failed to load orders.'); setLoading(false) }
    )
    return () => off(r)
  }, [])

  // Update the status of a single order in Firebase
  const handleStatus = async (id, val) => {
    setUpdating(id)
    try { await update(ref(db, `orders/${id}`), { status: val }) }
    catch (e) { console.error(e) }
    finally { setUpdating(null) }
  }

  // Filter by status tab, then by the search query
  const byStatus = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  const filtered = search
    ? byStatus.filter(o => {
        const q = search.toLowerCase()
        return (
          (o.itemName       || '').toLowerCase().includes(q) ||
          (o.buyerName      || '').toLowerCase().includes(q) ||
          (o.robloxUsername || '').toLowerCase().includes(q)
        )
      })
    : byStatus

  const stats = {
    total:      orders.length,
    pending:    orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed:  orders.filter(o => o.status === 'completed').length,
    cancelled:  orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <>
      {/* ── Stat summary cards ── */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="astat-icon ci ci-list" />
          <span className="astat-n">{stats.total}</span>
          <span className="astat-l">Total Orders</span>
        </div>
        <div className="admin-stat-card pending">
          <span className="astat-icon ci ci-clock" />
          <span className="astat-n">{stats.pending}</span>
          <span className="astat-l">Pending</span>
        </div>
        <div className="admin-stat-card processing">
          <span className="astat-icon ci ci-gear" />
          <span className="astat-n">{stats.processing}</span>
          <span className="astat-l">Processing</span>
        </div>
        <div className="admin-stat-card completed">
          <span className="astat-icon ci ci-circle-check" />
          <span className="astat-n">{stats.completed}</span>
          <span className="astat-l">Completed</span>
        </div>
        <div className="admin-stat-card cancelled">
          <span className="astat-icon ci ci-circle-x" />
          <span className="astat-n">{stats.cancelled}</span>
          <span className="astat-l">Cancelled</span>
        </div>
      </div>

      {/* ── Status filter tabs + search ── */}
      <div className="orders-controls">
        <div className="filter-tabs">
          {['all', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              className={`filter-tab ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all'
                ? `All (${stats.total})`
                : `${s} (${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>
        <input
          className="items-search"
          placeholder="Search by item, buyer or Roblox username…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-banner">
          <span className="ci ci-warn" style={{ marginRight: 8 }} />{error}
        </div>
      )}

      {loading ? (
        <div className="admin-loading"><div className="loader" /><p>Loading orders…</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><span className="ci ci-list css-empty-icon" /></div>
          <h3>{orders.length === 0 ? 'No orders yet' : 'No orders match your search'}</h3>
          <p>
            {orders.length === 0
              ? 'Orders placed in the marketplace appear here in real-time.'
              : 'Try a different filter or search.'}
          </p>
        </div>
      ) : (
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Date</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o._id} className="order-row animate-fade-in">
                  <td className="order-id">#{o._id.slice(-6).toUpperCase()}</td>
                  <td className="order-buyer-cell">
                    <span className="order-buyer-name">{o.buyerName || '—'}</span>
                    {o.robloxUsername && (
                      <span className="order-roblox">@{o.robloxUsername}</span>
                    )}
                  </td>
                  <td className="order-item-cell">
                    <span className="order-item-name">{o.itemName || 'Unknown'}</span>
                    {o.category && (
                      <span className="order-category">{o.category}</span>
                    )}
                  </td>
                  <td className="order-qty">×{o.quantity || 1}</td>
                  <td className="order-date">
                    {o.timestamp
                      ? new Date(o.timestamp).toLocaleString('en-US', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td><StatusBadge status={o.status || 'pending'} /></td>
                  <td>
                    <select
                      className="status-select"
                      value={o.status || 'pending'}
                      onChange={e => handleStatus(o._id, e.target.value)}
                      disabled={updating === o._id}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ─── ITEM FORM ────────────────────────────────────────────────────────────────
// Shared form for both adding a new item and editing an existing one.
// No rarity field — category is a fixed dropdown.
function ItemForm({ initial = EMPTY_FORM, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)
  const set_ = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = e => { e.preventDefault(); onSave(form) }

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <div className="item-form-grid">

        {/* Item name */}
        <div className="form-group">
          <label>Item Name *</label>
          <input
            required
            value={form.name}
            onChange={e => set_('name', e.target.value)}
            placeholder="e.g. Dragon Chest"
          />
        </div>

        {/* Fixed category dropdown */}
        <div className="form-group">
          <label>Category *</label>
          <select value={form.category} onChange={e => set_('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Stock count */}
        <div className="form-group">
          <label>Stock *</label>
          <input
            required
            type="number"
            min="0"
            value={form.stock}
            onChange={e => set_('stock', e.target.value)}
            placeholder="0"
          />
        </div>

        {/* Cloudinary image URL */}
        <div className="form-group form-group-full">
          <label>
            Image URL <span className="optional">(paste your Cloudinary link here)</span>
          </label>
          <input
            value={form.image}
            onChange={e => set_('image', e.target.value)}
            placeholder="https://res.cloudinary.com/..."
          />
          {form.image && (
            <div className="image-preview-wrap">
              <img
                src={form.image}
                alt="preview"
                className="image-preview"
                onError={e => { e.target.style.display = 'none' }}
              />
            </div>
          )}
        </div>

      </div>

      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <span className="btn-spinner" /> : (initial.name ? 'Save Changes' : 'Add Item')}
        </button>
      </div>
    </form>
  )
}

// ─── ITEMS TAB ────────────────────────────────────────────────────────────────
// Manage all items in Firebase — add, edit, delete. Items appear in the store
// immediately after being saved here.
function ItemsTab() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [search, setSearch]     = useState('')

  // Subscribe to real-time item updates from Firebase
  useEffect(() => {
    const r = ref(db, 'items')
    onValue(
      r,
      snap => {
        if (snap.exists()) {
          const arr = Object.entries(snap.val())
            .map(([id, v]) => ({ _id: id, ...v }))
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
          setItems(arr)
        } else {
          setItems([])
        }
        setLoading(false)
        setError(null)
      },
      () => { setError('Failed to load items.'); setLoading(false) }
    )
    return () => off(r)
  }, [])

  // Add a new item to Firebase
  const handleAdd = async (form) => {
    setSaving(true)
    try {
      await push(ref(db, 'items'), {
        name:     form.name.trim(),
        category: form.category,
        stock:    Number(form.stock),
        ...(form.image.trim() ? { image: form.image.trim() } : {}),
      })
      setShowForm(false)
    } catch (e) {
      setError('Failed to add item: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  // Update an existing item in Firebase
  const handleEdit = async (form) => {
    setSaving(true)
    try {
      await update(ref(db, `items/${editItem._id}`), {
        name:     form.name.trim(),
        category: form.category,
        stock:    Number(form.stock),
        image:    form.image.trim() || '',
      })
      setEditItem(null)
    } catch (e) {
      setError('Failed to update: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  // Delete an item from Firebase after confirmation
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return
    setDeleting(id)
    try { await remove(ref(db, `items/${id}`)) }
    catch (e) { setError('Failed to delete: ' + e.message) }
    finally { setDeleting(null) }
  }

  // Filter displayed items by search query (name or category)
  const displayed = items.filter(i =>
    !search ||
    (i.name     || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(search.toLowerCase())
  )

  // ── Edit view ──
  if (editItem) return (
    <div>
      <div className="section-head">
        <button className="back-btn" onClick={() => setEditItem(null)}>← Back to Items</button>
        <h2 className="section-title">Edit Item</h2>
      </div>
      <ItemForm
        initial={{
          name:     editItem.name,
          category: editItem.category || 'Specs Set',
          stock:    editItem.stock,
          image:    editItem.image || '',
        }}
        onSave={handleEdit}
        onCancel={() => setEditItem(null)}
        saving={saving}
      />
    </div>
  )

  // ── Add view ──
  if (showForm) return (
    <div>
      <div className="section-head">
        <button className="back-btn" onClick={() => setShowForm(false)}>← Back to Items</button>
        <h2 className="section-title">Add New Item</h2>
      </div>
      <ItemForm onSave={handleAdd} onCancel={() => setShowForm(false)} saving={saving} />
    </div>
  )

  // ── List view ──
  return (
    <>
      <div className="items-tab-header">
        <div className="items-tab-left">
          <span className="items-count-badge">{items.length} items in database</span>
          <input
            className="items-search"
            placeholder="Search by name or category…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="items-tab-actions">
          <button className="btn-ghost" onClick={() => setShowForm(true)}>+ Add Item</button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span className="ci ci-warn" style={{ marginRight: 8 }} />{error}
        </div>
      )}

      {loading ? (
        <div className="admin-loading"><div className="loader" /><p>Loading items…</p></div>
      ) : displayed.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><span className="ci ci-box css-empty-icon" /></div>
          <h3>{items.length === 0 ? 'No items yet' : 'No items match your search'}</h3>
          <p>
            {items.length === 0
              ? 'Click "+ Add Item" to create your first item. It will appear in the store immediately.'
              : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <div className="items-mgmt-table-wrap">
          <table className="orders-table items-mgmt-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(item => (
                <tr key={item._id} className="order-row animate-fade-in">
                  <td>
                    <div className="item-name-cell">
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          className="item-thumb"
                          onError={e => e.target.style.display = 'none'}
                        />
                      )}
                      <span className="item-cell-name">{item.name}</span>
                    </div>
                  </td>
                  <td className="cell-muted">{item.category || '—'}</td>
                  <td>
                    <span className={`stock-pill ${item.stock > 0 ? 'stock-in' : 'stock-out'}`}>
                      {item.stock > 0 ? `${Number(item.stock).toLocaleString()} left` : 'Out of stock'}
                    </span>
                  </td>
                  <td>
                    <div className="item-row-actions">
                      <button className="row-btn edit-btn" onClick={() => setEditItem(item)}>Edit</button>
                      <button
                        className="row-btn delete-btn"
                        onClick={() => handleDelete(item._id)}
                        disabled={deleting === item._id}
                      >
                        {deleting === item._id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────
export default function Admin() {
  const [tab, setTab]     = useState('orders')
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="admin-page">
      <div className="container">

        {/* ── Header ── */}
        <div className="admin-header">
          <div>
            <p className="admin-eyebrow">Sailor Piece · Dashboard</p>
            <h1 className="admin-title">Admin <span className="glow-text">Panel</span></h1>
          </div>
          <div className="admin-header-right">
            <div className="admin-live-badge">
              <span className="status-dot-sm" />Real-time
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <span className="ci ci-logout" style={{ marginRight: 6 }} />Logout
            </button>
          </div>
        </div>

        {/* ── Tab switcher ── */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${tab === 'orders' ? 'active' : ''}`}
            onClick={() => setTab('orders')}
          >
            Orders
          </button>
          <button
            className={`admin-tab ${tab === 'items' ? 'active' : ''}`}
            onClick={() => setTab('items')}
          >
            Items
          </button>
        </div>

        {tab === 'orders' ? <OrdersTab /> : <ItemsTab />}
      </div>
    </div>
  )
}
