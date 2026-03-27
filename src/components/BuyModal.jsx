import { useState } from 'react'
import { ref, update, push } from 'firebase/database'
import { db } from '../firebase'
import './BuyModal.css'

// ─── DISCORD WEBHOOK ──────────────────────────────────────────────────────────
// Your Discord webhook URL — messages are sent here whenever a purchase is made.
const DISCORD_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1486968367113048194/MvgrzgiJZv2-bY8mT-hun_Ue5aU-rI4Zsrbjn9FuVh3sxZAguBJs3XTiBxj0CFCOAzQa'

// Sends a notification to the Discord channel with order details.
// This runs silently in the background — a failure won't block the purchase.
async function sendDiscordNotification(itemName, qty, rarity, category) {
  try {
    const message = [
      `🛒 **New Order Received!**`,
      `> Hi, this is my order for **${itemName}**. Please check the admin panel.`,
      ``,
      `**Item:** ${itemName}`,
      `**Rarity:** ${rarity || 'Unknown'}`,
      `**Category:** ${category || 'Unknown'}`,
      `**Quantity:** ×${qty}`,
      `**Status:** Pending — awaiting admin review`,
    ].join('\n')

    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    })
  } catch (e) {
    // Discord notification failure is non-critical — the order still goes through
    console.warn('Discord notification failed:', e)
  }
}

// ─── BUY MODAL ────────────────────────────────────────────────────────────────
// Shown when a user clicks "Buy Now" on an item. Lets them choose quantity,
// confirm the order, and handles the Firebase write + Discord notification.
export default function BuyModal({ item, onClose }) {
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const maxQty = item.stock || 0
  const total = (item.price || 0) * qty

  // Adjust the selected quantity within allowed bounds
  const handleQty = (delta) => {
    setQty(q => Math.max(1, Math.min(maxQty, q + delta)))
  }

  const handleBuy = async () => {
    if (qty < 1 || qty > maxQty) return
    setLoading(true)
    setError(null)

    try {
      // 1. Write the order to Firebase
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

      // 2. Reduce the item's stock in Firebase
      const itemRef = ref(db, `items/${item._id}`)
      await update(itemRef, { stock: maxQty - qty })

      // 3. Send a Discord notification to the admin channel (non-blocking)
      sendDiscordNotification(item.name, qty, item.rarity, item.category)

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
          // ── Success state shown after a confirmed purchase ──
          <div className="modal-success">
            <div className="success-ring">✓</div>
            <h2 className="success-title">Order Placed!</h2>
            <p className="success-sub">
              Your order has been submitted and is pending processing.
              The admin has been notified via Discord.
            </p>
            <div className="success-summary">
              <span>{item.name}</span>
              <span>×{qty}</span>
            </div>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Purchase</h2>
              <p className="modal-sub">Review your order below</p>
            </div>

            {/* Item preview card inside the modal */}
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
              </div>
            </div>

            {/* Quantity selector */}
            <div className="modal-qty-row">
              <span className="modal-label">Quantity</span>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => handleQty(-1)} disabled={qty <= 1}>−</button>
                <span className="qty-value">{qty}</span>
                <button className="qty-btn" onClick={() => handleQty(1)} disabled={qty >= maxQty}>+</button>
              </div>
              <span className="modal-stock-hint">{maxQty} in stock</span>
            </div>

            {error && <p className="modal-error">{error}</p>}

            {/* Action buttons */}
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
