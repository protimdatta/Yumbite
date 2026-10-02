# YUMBYTE — Bite Into Happiness

Premium MERN fast-food restaurant website for **Yumbite**, CXRJ+JH7 Buddhist Temple Rd, Cox's Bazar.

## 1. Project overview
Cinematic dark + yellow/red brand site with menu, cart, checkout orders, gallery/lightbox, reviews, location, and JWT-protected admin dashboard. Uses real supplied assets in `client/public/images/` (logo.jpg, exterior.jpg, interior.png).

## 2. Features
- Hero with parallax, quick-info bar, popular menu carousel, about, gallery+reviews, horizontal-scroll "Yumbite Moment", location/maps/call
- Menu filtering (All/Burgers/Chicken/Wraps/Fries/Drinks/Combos), search on Menu page
- Cart drawer, localStorage persistence, quantity controls, free-delivery progress (৳500)
- Checkout: name/phone/pickup-delivery/address/note → POST /api/orders → MongoDB, demo fallback offline
- Admin: login (JWT), dashboard stats, menu CRUD + availability toggle, orders list/filter/status update
- Responsive: mobile drawer nav, sticky bottom Call/Menu/Cart bar, swipeable carousels
- SEO: title/meta/OG/Twitter/JSON-LD restaurant schema, semantic HTML, aria labels

## 3. Tech stack
Frontend: React 18, Vite, React Router 6, Tailwind 3, Framer Motion, Lucide, react-hot-toast
Backend: Node 18+, Express 4, Mongoose 8, JWT, bcryptjs, multer (local /uploads, Cloudinary-ready), cors, dotenv

## 4. Folder structure
```
/client/src/components|sections|pages|layouts|context|services|hooks|utils|assets|styles
/server/config|controllers|models|routes|middleware|utils  + index.js + uploads/
```

## 5. Environment variables
Server `.env` (see `.env.example`): PORT, MONGO_URI, JWT_SECRET, CLIENT_URL, NODE_ENV
Client (optional) `.env`: VITE_API_URL (default uses Vite proxy `/api` → :5000)

## 6. MongoDB setup
- Install/run MongoDB locally or Atlas. Create DB `yumbite`.
- Seed demo menu + admin: `cd server && npm run seed`
- Admin credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in server `.env` (change immediately)

## 7. Frontend setup
```
cd client
npm install
npm run dev   # http://localhost:5173
```

## 8. Backend setup
```
cd server
npm install
cp .env.example .env
npm run dev   # http://localhost:5000 (needs MONGO_URI)
```

## 9. How to run locally
Terminal 1: `cd server && npm run dev` — Terminal 2: `cd client && npm run dev`. Images must exist in client/public/images/.

## 10. How to build for production
```
cd client && npm run build   # dist/
cd server && npm start
```
Serve `client/dist` via Nginx/Vercel/Netlify; point API to server; set strong JWT_SECRET + Atlas URI. No lorem ipsum, no fake reviews (only 2 real 5.0 reviews shown).
