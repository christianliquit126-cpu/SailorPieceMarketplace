# SailorPiece Marketplace

A community marketplace for sailors to buy and sell nautical gear, sailing equipment, and marine items.

## Tech Stack

- **Frontend**: React 18 + Vite 6
- **Routing**: React Router v6
- **Language**: JavaScript (JSX)
- **Styling**: Plain CSS with CSS custom properties

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Navbar.jsx / Navbar.css
│   │   ├── Footer.jsx / Footer.css
│   │   └── ListingCard.jsx / ListingCard.css
│   ├── pages/
│   │   ├── Home.jsx / Home.css
│   │   ├── Listings.jsx / Listings.css
│   │   ├── ListingDetail.jsx / ListingDetail.css
│   │   ├── Sell.jsx / Sell.css
│   │   └── About.jsx / About.css
│   ├── data/
│   │   └── listings.js     (sample data + categories)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css           (global CSS variables + resets)
├── index.html
├── vite.config.js
└── package.json
```

## Pages

- **Home** (`/`) — Hero, category chips, featured listings, CTA
- **Listings** (`/listings`) — Filterable/searchable listing grid with sidebar
- **Listing Detail** (`/listings/:id`) — Full item view with related listings
- **Sell** (`/sell`) — Form to submit a new listing
- **About** (`/about`) — Mission, stats, features

## Development

- Runtime: Node.js 20
- Dev server: `npm run dev` on port 5000 (host 0.0.0.0)
- Build: `npm run build` → `dist/`

## Deployment

- Target: Static site
- Build command: `npm run build`
- Public directory: `dist`
