import { useState } from 'react'
import './ItemCard.css'

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical', 'divine']

export default function ItemCard({ item, onBuy }) {
  const [imgError, setImgError] = useState(false)
  const rarity = (item.rarity || 'common').toLowerCase()
  const outOfStock = !item.stock || item.stock <= 0

  return (
    <div className={`item-card rarity-border-${rarity} ${outOfStock ? 'out-of-stock' : ''}`}>
      <div className="item-card-glow" />
      <div className="item-image-wrap">
        {imgError || !item.image ? (
          <div className="item-image-fallback">
            <span>🎴</span>
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

        <div className="item-footer">
          <div className="item-price-row">
            <span className="price-icon">💎</span>
            <span className="item-price">{(item.price || 0).toLocaleString()}</span>
          </div>
          <span className={`item-stock ${outOfStock ? 'stock-zero' : ''}`}>
            {outOfStock ? 'Out of stock' : `${item.stock} left`}
          </span>
        </div>

        <button
          className="btn-primary buy-btn"
          disabled={outOfStock}
          onClick={() => onBuy(item)}
        >
          {outOfStock ? 'Unavailable' : 'Buy Now'}
        </button>
      </div>
    </div>
  )
}
