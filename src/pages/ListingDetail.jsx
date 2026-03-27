import { useParams, Link } from 'react-router-dom'
import { getListingById, listings } from '../data/listings'
import ListingCard from '../components/ListingCard'
import './ListingDetail.css'

export default function ListingDetail() {
  const { id } = useParams()
  const listing = getListingById(id)

  if (!listing) {
    return (
      <div className="detail-not-found container">
        <h2>Listing not found</h2>
        <Link to="/listings">← Back to listings</Link>
      </div>
    )
  }

  const related = listings.filter(l => l.category === listing.category && l.id !== listing.id).slice(0, 3)

  return (
    <div className="listing-detail-page">
      <div className="container">
        <Link to="/listings" className="back-link">← Back to listings</Link>

        <div className="listing-detail-grid">
          <div className="listing-detail-image">
            <img src={listing.image} alt={listing.title} />
          </div>

          <div className="listing-detail-info">
            <span className="detail-category">{listing.category}</span>
            <h1>{listing.title}</h1>
            <p className="detail-price">${listing.price.toLocaleString()}</p>

            <div className="detail-meta">
              <div className="meta-item">
                <span className="meta-label">Condition</span>
                <span className="meta-value condition-badge">{listing.condition}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Location</span>
                <span className="meta-value">📍 {listing.location}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Listed by</span>
                <span className="meta-value">👤 {listing.seller}</span>
              </div>
            </div>

            <div className="detail-description">
              <h3>Description</h3>
              <p>{listing.description}</p>
            </div>

            <div className="detail-actions">
              <button className="contact-btn">Contact Seller</button>
              <button className="save-btn">Save Listing</button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="related-section">
            <h2>More in {listing.category}</h2>
            <div className="listings-grid">
              {related.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
