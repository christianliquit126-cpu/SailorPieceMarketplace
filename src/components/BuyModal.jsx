import { useState } from 'react'
import { ref, update, push } from 'firebase/database'
import { db } from '../firebase'
import './BuyModal.css'

// ─── DISCORD WEBHOOK ──────────────────────────────────────────────────────────
// Webhook URL — messages are sent here whenever a purchase is confirmed.
const DISCORD_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1486968367113048194/MvgrzgiJZv2-bY8mT-hun_Ue5aU-rI4Zsrbjn9FuVh3sxZAguBJs3XTiBxj0CFCOAzQa'

// Sends a structured notification to Discord with full order details.
// Runs silently — a failure never blocks the purchase from completing.
async function sendDiscordNotification({ name, robloxUsername, itemName, qty, rarity, category }) {
  try {
    const lines = [
      `**New Order Received!**`,
      ``,
      `**Name:** ${name}`,
      `**Roblox Username:** ${robloxUsername}`,
      `**Item:** ${itemName}`,
      `**Rarity:** ${rarity || 'Unknown'}`,
      `**Category:** ${category || 'Unknown'}`,
      `**Quantity:** ×${qty}`,
      `**Status:** Pending — awaiting admin review`,
    ]

    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: lines.join('\n') }),
    })
  } catch (e) {
    // Discord failure is non-critical — the order still goes through
    console.warn('Discord notification failed:', e)
  }
}

// ─── BUY MODAL ────────────────────────────────────────────────────────────────
// Shown when a user clicks "Buy Now" on an item. Collects the buyer's name and
// Roblox username, lets them choose quantity, and handles the Firebase write
// plus the Discord notification on confirm.
export default function BuyModal({ item, onClose }) {
  // Buyer identity fields
  const [buyerName, setBuyerName]           = useState('')
  const [robloxUsername, setRobloxUsername] = useState('')

  // Order state
  const [qty, setQty]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)
  const [error, setError]   = useState(null)

  const maxQty = item.stock || 0

  // Adjust the selected quantity within the allowed bounds
  const handleQty = (delta) => {
    setQty(q => Math.max(1, Math.min(maxQty, q + delta)))
  }

  // Validates required fields and returns an error string or null
  const validate = () => {
    if (!buyerName.trim())       return 'Please enter your name.'
    if (!robloxUsername.trim())  return 'Please enter your Roblox username.'
    if (qty < 1 || qty > maxQty) return 'Invalid quantity.'
    return null
  }

  const handleBuy = async () => {
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError(null)

    try {
      // 1. Write the full order record to Firebase
      await push(ref(db, 'orders'), {
        buyerName:     buyerName.trim(),
        robloxUsername: robloxUsername.trim(),
        itemId:        item._id,
        itemName:      item.name,
        category:      item.category || '',
        rarity:        item.rarity   || '',
        quantity:      qty,
        timestamp:     Date.now(),
        status:        'pending',
      })

      // 2. Reduce the item's stock in Firebase
      await update(ref(db, `items/${item._id}`), { stock: maxQty - qty })

      // 3. Notify the Discord admin channel (fire-and-forget)
      sendDiscordNotification({
        name:          buyerName.trim(),
        robloxUsername: robloxUsername.trim(),
        itemName:      item.name,
        qty,
        rarity:        item.rarity,
        category:      item.category,
      })

      setDone(true)
    } catch (e) {
      setError('Purchase failed. Please try again.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Buyer fields are required — the Confirm button stays disabled until filled
  const canSubmit = buyerName.trim() && robloxUsername.trim() && maxQty >= 1 && !loading

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box animate-fade-in">

        {/* Close button */}
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <span className="ci ci-close" />
        </button>

        {done ? (
          // ── Success screen shown after a confirmed purchase ──
          <div className="modal-success">
            <div className="success-ring"><span className="ci ci-check" /></div>
            <h2 className="success-title">Order Placed!</h2>
            <p className="success-sub">
              Your order is pending and the admin has been notified via Discord.
            </p>
            <div className="success-summary">
              <span>{item.name}</span>
              <span>×{qty}</span>
            </div>
            <div className="success-buyer-info">
              <span className="success-buyer-label">Name</span>
              <span>{buyerName}</span>
              <span className="success-buyer-label">Roblox</span>
              <span>{robloxUsername}</span>
            </div>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Purchase</h2>
              <p className="modal-sub">Fill in your details to place this order</p>
            </div>

            {/* Item preview card inside the modal */}
            <div className="modal-item-preview">
              {item.image ? (
                <img src={item.image} alt={item.name} className="modal-item-img"
                     onError={e => e.target.style.display = 'none'} />
              ) : (
                <div className="modal-item-img-fallback"><span className="ci ci-card" /></div>
              )}
              <div className="modal-item-info">
                <span className={`badge-rarity badge-${(item.rarity || 'common').toLowerCase()}`}>
                  {item.rarity || 'Common'}
                </span>
                <h3>{item.name}</h3>
                <p className="modal-item-cat">{item.category || 'Uncategorized'}</p>
              </div>
            </div>

            {/* ── Buyer identity fields (required) ── */}
            <div className="modal-fields">
              <div className="modal-field">
                <label className="modal-field-label" htmlFor="buyer-name">Your Name</label>
                <input
                  id="buyer-name"
                  className="modal-input"
                  type="text"
                  placeholder="e.g. John Smith"
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  autoComplete="name"
                  maxLength={60}
                />
              </div>
              <div className="modal-field">
                <label className="modal-field-label" htmlFor="roblox-user">Roblox Username</label>
                <input
                  id="roblox-user"
                  className="modal-input"
                  type="text"
                  placeholder="e.g. CoolPlayer123"
                  value={robloxUsername}
                  onChange={e => setRobloxUsername(e.target.value)}
                  autoComplete="off"
                  maxLength={20}
                />
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

            {/* Inline error message */}
            {error && <p className="modal-error">{error}</p>}

            {/* Action buttons */}
            <div className="modal-actions">
              <button className="btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={handleBuy} disabled={!canSubmit}>
                {loading ? <span className="btn-spinner" /> : 'Confirm Purchase'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
