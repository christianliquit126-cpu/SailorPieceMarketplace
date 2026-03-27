import { useState } from 'react'
import { CATEGORIES } from '../data/listings'
import './Sell.css'

export default function Sell() {
  const [form, setForm] = useState({
    title: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    description: '',
    contact: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="sell-page">
        <div className="container">
          <div className="success-box">
            <div className="success-icon">✓</div>
            <h2>Listing Submitted!</h2>
            <p>Your listing has been submitted for review. We'll get it live shortly.</p>
            <button onClick={() => { setSubmitted(false); setForm({ title:'', price:'', category:'', condition:'', location:'', description:'', contact:'' }) }} className="reset-btn">List Another Item</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="sell-page">
      <div className="sell-header">
        <div className="container">
          <h1>List Your Sailing Gear</h1>
          <p>Fill out the form below to list your item on SailorPiece.</p>
        </div>
      </div>
      <div className="container">
        <form className="sell-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Item Title *</label>
            <input id="title" name="title" type="text" required placeholder="e.g., North Sails Main Sail - 40ft" value={form.title} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (USD) *</label>
              <input id="price" name="price" type="number" required min="1" placeholder="0" value={form.price} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select id="category" name="category" required value={form.category} onChange={handleChange}>
                <option value="">Select a category</option>
                {CATEGORIES.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="condition">Condition *</label>
              <select id="condition" name="condition" required value={form.condition} onChange={handleChange}>
                <option value="">Select condition</option>
                <option>Excellent</option>
                <option>Very Good</option>
                <option>Good</option>
                <option>Fair</option>
                <option>For Parts</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input id="location" name="location" type="text" required placeholder="City, State" value={form.location} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea id="description" name="description" required rows={5} placeholder="Describe your item in detail — size, brand, age, any repairs, etc." value={form.description} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contact Email *</label>
            <input id="contact" name="contact" type="email" required placeholder="your@email.com" value={form.contact} onChange={handleChange} />
          </div>

          <button type="submit" className="submit-btn">Submit Listing</button>
        </form>
      </div>
    </div>
  )
}
