import { useState, useEffect } from 'react'
import { ref, onValue, off, update } from 'firebase/database'
import { db } from '../firebase'
import './Admin.css'

const STATUS_OPTIONS = ['pending', 'processing', 'completed', 'cancelled']

const STATUS_COLORS = {
  pending:    { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b',  border: 'rgba(245,158,11,0.3)'  },
  processing: { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6',  border: 'rgba(59,130,246,0.3)'  },
  completed:  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981',  border: 'rgba(16,185,129,0.3)'  },
  cancelled:  { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444',  border: 'rgba(239,68,68,0.3)'   },
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending
  return (
    <span className="status-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  )
}

export default function Admin() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    const ordersRef = ref(db, 'orders')
    const unsub = onValue(
      ordersRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.val()
          const arr = Object.entries(data)
            .map(([id, val]) => ({ _id: id, ...val }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
          setOrders(arr)
        } else {
          setOrders([])
        }
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError('Failed to load orders.')
        setLoading(false)
      }
    )
    return () => off(ordersRef)
  }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await update(ref(db, `orders/${orderId}`), { status: newStatus })
    } catch (e) {
      console.error(e)
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  const stats = {
    total:      orders.length,
    pending:    orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed:  orders.filter(o => o.status === 'completed').length,
  }

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((acc, o) => acc + (o.totalPrice || 0), 0)

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <p className="admin-eyebrow">Sailor Piece · Dashboard</p>
            <h1 className="admin-title">Order <span className="glow-text">Management</span></h1>
          </div>
          <div className="admin-live-badge">
            <span className="status-dot-sm" />
            Real-time
          </div>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <span className="astat-n">{stats.total}</span>
            <span className="astat-l">Total Orders</span>
          </div>
          <div className="admin-stat-card pending">
            <span className="astat-n">{stats.pending}</span>
            <span className="astat-l">Pending</span>
          </div>
          <div className="admin-stat-card processing">
            <span className="astat-n">{stats.processing}</span>
            <span className="astat-l">Processing</span>
          </div>
          <div className="admin-stat-card completed">
            <span className="astat-n">{stats.completed}</span>
            <span className="astat-l">Completed</span>
          </div>
          <div className="admin-stat-card revenue">
            <span className="astat-n">💎 {totalRevenue.toLocaleString()}</span>
            <span className="astat-l">Revenue</span>
          </div>
        </div>

        <div className="admin-filters">
          <span className="sidebar-label">Filter by Status</span>
          <div className="filter-tabs">
            {['all', ...STATUS_OPTIONS].map(s => (
              <button
                key={s}
                className={`filter-tab ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'all' ? `All (${stats.total})` : `${s} (${orders.filter(o => o.status === s).length})`}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="error-banner" style={{ marginBottom: 20 }}>⚠️ {error}</div>
        )}

        {loading ? (
          <div className="admin-loading">
            <div className="loader" />
            <p>Loading orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>{orders.length === 0 ? 'No orders yet' : 'No orders match this filter'}</h3>
            <p>{orders.length === 0 ? 'Orders from the marketplace will appear here in real-time.' : 'Try a different status filter.'}</p>
          </div>
        ) : (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order._id} className="order-row animate-fade-in">
                    <td className="order-id">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="order-item-cell">
                      <span className="order-item-name">{order.itemName || 'Unknown'}</span>
                      {order.rarity && (
                        <span className={`badge-rarity badge-${(order.rarity).toLowerCase()} order-rarity`}>
                          {order.rarity}
                        </span>
                      )}
                    </td>
                    <td className="order-qty">×{order.quantity || 1}</td>
                    <td className="order-total">💎 {(order.totalPrice || 0).toLocaleString()}</td>
                    <td className="order-date">
                      {order.timestamp
                        ? new Date(order.timestamp).toLocaleString('en-US', {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })
                        : '—'}
                    </td>
                    <td><StatusBadge status={order.status || 'pending'} /></td>
                    <td>
                      <select
                        className="status-select"
                        value={order.status || 'pending'}
                        onChange={e => handleStatusChange(order._id, e.target.value)}
                        disabled={updating === order._id}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
