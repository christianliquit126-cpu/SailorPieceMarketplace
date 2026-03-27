import { useState } from 'react'
import './ItemCard.css'

// ─── CLICK SOUND ──────────────────────────────────────────────────────────────
// Uses the Web Audio API to generate a short tap sound on each card click.
// No external audio files needed — all generated in the browser.
function playClickSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08)

    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.08)
  } catch (e) {
    // Silently ignore — Web Audio API may not be available in all environments
  }
}

// ─── ITEM CARD ────────────────────────────────────────────────────────────────
// Displays a single store item. Clicking the card plays a sound.
// Clicking "Buy Now" opens the purchase modal.
export default function ItemCard({ item, onBuy }) {
  const [imgError, setImgError] = useState(false)
  const outOfStock = !item.stock || item.stock <= 0

  // Play sound on card click (but not on button click — that's handled separately)
  const handleCardClick = () => {
    playClickSound()
  }

  // Play sound then open the buy modal
  const handleBuyClick = (e) => {
    e.stopPropagation() // prevent bubbling up to the card handler
    playClickSound()
    onBuy(item)
  }

  return (
    <div
      className={`item-card ${outOfStock ? 'out-of-stock' : ''}`}
      onClick={handleCardClick}
    >
      <div className="item-card-glow" />

      {/* ── Item image ── */}
      <div className="item-image-wrap">
        {imgError || !item.image ? (
          <div className="item-image-fallback">
            <span className="ci ci-card" />
          </div>
        ) : (
          <img
            src={item.image}
            alt={item.name}
            className="item-image"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        {outOfStock && <div className="sold-out-overlay">SOLD OUT</div>}
      </div>

      {/* ── Item details ── */}
      <div className="item-card-body">
        <p className="item-category">{item.category || 'Uncategorized'}</p>
        <h3 className="item-name">{item.name || 'Unknown Item'}</h3>

        {/* Stock indicator — no price shown */}
        <div className="item-footer">
          <span className={`item-stock ${outOfStock ? 'stock-zero' : ''}`}>
            {outOfStock ? 'Out of stock' : `${item.stock} left`}
          </span>
        </div>

        <button
          className="btn-primary buy-btn"
          disabled={outOfStock}
          onClick={handleBuyClick}
        >
          {outOfStock ? 'Unavailable' : 'Buy Now'}
        </button>
      </div>
    </div>
  )
}
