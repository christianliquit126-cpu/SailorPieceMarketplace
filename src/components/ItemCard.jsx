import { useState } from 'react'
import { CATEGORY_META } from '../pages/Marketplace'
import './ItemCard.css'

function playClickSound() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(700, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.07)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.07)
  } catch (e) {}
}

export default function ItemCard({ item, onBuy }) {
  const [imgError, setImgError] = useState(false)

  const outOfStock = !item.stock || item.stock <= 0
  const lowStock   = !outOfStock && item.stock <= 3

  const catColor = (CATEGORY_META[item.category] || CATEGORY_META['All']).color

  const handleBuyClick = (e) => {
    e.stopPropagation()
    playClickSound()
    onBuy(item)
  }

  return (
    <div
      className={`item-card ${outOfStock ? 'out-of-stock' : ''} animate-fade-in`}
      style={{ '--cat-color': catColor }}
    >
      {/* Category accent stripe */}
      <div className="item-cat-stripe" />

      {/* Image area */}
      <div className="item-image-wrap">
        {imgError || !item.image ? (
          <div className="item-image-fallback">
            <span className="ci ci-card fallback-icon" />
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
        {lowStock && !outOfStock && (
          <div className="low-stock-badge">Only {item.stock} left!</div>
        )}
      </div>

      {/* Card body */}
      <div className="item-card-body">
        <p className="item-category" style={{ color: catColor }}>
          {item.category || 'Uncategorized'}
        </p>
        <h3 className="item-name">{item.name || 'Unknown Item'}</h3>

        <div className="item-card-footer">
          <span className={`item-stock-label ${outOfStock ? 'out' : lowStock ? 'low' : ''}`}>
            {outOfStock ? 'Out of stock' : `${item.stock} available`}
          </span>
          <button
            className="buy-btn"
            disabled={outOfStock}
            onClick={handleBuyClick}
          >
            {outOfStock ? 'Sold Out' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
