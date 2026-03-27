# SailorPiece Marketplace

A real-time web marketplace for the Sailor Piece Roblox game, powered by Firebase Realtime Database.

## Tech Stack

- **Frontend**: React 18 + Vite 6
- **Database**: Firebase Realtime Database (real-time listeners)
- **Routing**: React Router v6
- **Fonts**: Rajdhani + Exo 2 (Google Fonts)
- **Theme**: Dark anime / Rimuru Tempest — blue/cyan glow

## Firebase Config

All Firebase config values are stored as environment variables (VITE_ prefix for Vite client exposure):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Firebase Database Structure

```
items/
  {itemId}/
    name: string
    category: string
    rarity: string          (Common | Uncommon | Rare | Epic | Legendary | Mythical | Divine)
    price: number
    image: string           (URL, optional)
    stock: number

orders/
  {orderId}/
    itemId: string
    itemName: string
    category: string
    rarity: string
    quantity: number
    totalPrice: number
    priceEach: number
    timestamp: number       (Unix ms)
    status: string          (pending | processing | completed | cancelled)
```

## Pages

- **`/`** — Marketplace: real-time item grid with search, category & rarity filters, buy modal
- **`/admin`** — Admin dashboard: live order table with status management and revenue stats

## Project Structure

```
src/
├── firebase.js             Firebase app + db init
├── App.jsx                 Router + layout
├── main.jsx
├── index.css               Global styles, CSS vars, theme
├── components/
│   ├── Navbar.jsx/.css
│   ├── ItemCard.jsx/.css   Item grid card
│   └── BuyModal.jsx/.css   Purchase confirmation modal
└── pages/
    ├── Marketplace.jsx/.css  Main shop page
    └── Admin.jsx/.css        Order management dashboard
```

## Development

- Dev server: `npm run dev` on port 5000 (host: 0.0.0.0)
- Vite allowedHosts: true (required for Replit proxy)

## Deployment

- Target: Static site
- Build: `npm run build` → `dist/`
