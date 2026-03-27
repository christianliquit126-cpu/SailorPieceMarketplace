import { useState } from 'react'
import './ItemCard.css'

// ─── CLICK SOUND ──────────────────────────────────────────────────────────────
// Uses the Web Audio API to generate a short, satisfying click sound when a
// card is clicked — no external audio files needed.
function playClickSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    // A short, high-frequency click (like a soft UI tap)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08)

    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.08)
  } catch (e) {
    // Silently ignore if the browser doesn't support Web Audio API
  }
}

export default function ItemCard({ item, onBuy }) {
  const [imgError, setImgError] = useState(false)
  const rarity = (item.rarity || 'common').toLowerCase()
  const outOfStock = !item.stock || item.stock <= 0

  // Play click sound and open the buy modal
  const handleCardClick = () => {
    playClickSound()
  }

  // Play click sound and trigger the buy flow
  const handleBuyClick = () => {
    playClickSound()
    onBuy(item)
  }

  return (
    // The entire card plays a click sound when clicked
    <div
      className={`item-card rarity-border-${rarity} ${outOfStock ? 'out-of-stock' : ''}`}
      onClick={handleCardClick}
    >
      <div className="item-card-glow" />
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
        <div className={`badge-rarity badge-${rarity} rarity-badge-pos`}>{item.rarity || 'Common'}</div>
      </div>

      <div className="item-card-body">
        <p className="item-category">{item.category || 'Uncategorized'}</p>
        <h3 className="item-name">{item.name || 'Unknown Item'}</h3>

        {/* Stock indicator — price is intentionally hidden from the store view */}
        <div className="item-footer">
          <span className={`item-stock ${outOfStock ? 'stock-zero' : ''}`}>
            {outOfStock ? 'Out of stock' : `${item.stock} left`}
          </span>
        </div>

        <button
          className="btn-primary buy-btn"
          disabled={outOfStock}
          onClick={(e) => {
            // Stop the click from bubbling up to the card again
            e.stopPropagation()
            handleBuyClick()
          }}
        >
          {outOfStock ? 'Unavailable' : 'Buy Now'}
        </button>
      </div>
    </div>
  )
}
