import { Link } from 'react-router-dom'
import './ListingCard.css'

export default function ListingCard({ listing }) {
  return (
    <Link to={`/listings/${listing.id}`} className="listing-card">
      <div className="listing-card-image">
        <img src={listing.image} alt={listing.title} loading="lazy" />
        <span className="listing-condition">{listing.condition}</span>
      </div>
      <div className="listing-card-body">
        <span className="listing-category">{listing.category}</span>
        <h3 className="listing-title">{listing.title}</h3>
        <p className="listing-location">📍 {listing.location}</p>
        <p className="listing-price">${listing.price.toLocaleString()}</p>
      </div>
    </Link>
  )
}
