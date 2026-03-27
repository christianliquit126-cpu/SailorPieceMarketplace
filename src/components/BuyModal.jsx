import { useState } from 'react'
import { ref, update, push, serverTimestamp } from 'firebase/database'
import { db } from '../firebase'
import './BuyModal.css'

export default function BuyModal({ item, onClose }) {
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const maxQty = item.stock || 0
  const total = (item.price || 0) * qty

  const handleQty = (delta) => {
    setQty(q => Math.max(1, Math.min(maxQty, q + delta)))
  }

  const handleBuy = async () => {
    if (qty < 1 || qty > maxQty) return
    setLoading(true)
    setError(null)
    try {
      const ordersRef = ref(db, 'orders')
      await push(ordersRef, {
        itemId: item._id,
        itemName: item.name,
        category: item.category || '',
        rarity: item.rarity || '',
        quantity: qty,
        totalPrice: total,
        priceEach: item.price,
        timestamp: Date.now(),
        status: 'pending',
      })
      const itemRef = ref(db, `items/${item._id}`)
      await update(itemRef, { stock: maxQty - qty })
      setDone(true)
    } catch (e) {
      setError('Purchase failed. Please try again.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box animate-fade-in">
        <button className="modal-close" onClick={onClose}>✕</button>

        {done ? (
          <div className="modal-success">
            <div className="success-ring">✓</div>
            <h2 className="success-title">Order Placed!</h2>
            <p className="success-sub">Your order has been submitted and is pending processing.</p>
            <div className="success-summary">
              <span>{item.name}</span>
              <span>×{qty}</span>
              <span className="success-total">💎 {total.toLocaleString()}</span>
            </div>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Purchase</h2>
              <p className="modal-sub">Review your order below</p>
            </div>

            <div className="modal-item-preview">
              {item.image ? (
                <img src={item.image} alt={item.name} className="modal-item-img" onError={e => e.target.style.display='none'} />
              ) : (
                <div className="modal-item-img-fallback">🎴</div>
              )}
              <div className="modal-item-info">
                <span className={`badge-rarity badge-${(item.rarity||'common').toLowerCase()}`}>{item.rarity || 'Common'}</span>
                <h3>{item.name}</h3>
                <p className="modal-item-cat">{item.category || 'Uncategorized'}</p>
                <p className="modal-item-each">💎 {(item.price||0).toLocaleString()} each</p>
              </div>
            </div>

            <div className="modal-qty-row">
              <span className="modal-label">Quantity</span>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => handleQty(-1)} disabled={qty <= 1}>−</button>
                <span className="qty-value">{qty}</span>
                <button className="qty-btn" onClick={() => handleQty(1)} disabled={qty >= maxQty}>+</button>
              </div>
              <span className="modal-stock-hint">{maxQty} in stock</span>
            </div>

            <div className="modal-total-row">
              <span className="modal-label">Total</span>
              <span className="modal-total-value">💎 {total.toLocaleString()}</span>
            </div>

            {error && <p className="modal-error">{error}</p>}

            <div className="modal-actions">
              <button className="btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={handleBuy} disabled={loading || maxQty < 1}>
                {loading ? <span className="btn-spinner" /> : 'Confirm Purchase'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
