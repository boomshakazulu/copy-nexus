# Copy Nexus

Modern, bilingual e‑commerce and admin platform for copier sales, rentals, parts, and maintenance requests.

---

## Overview
Copy Nexus provides a customer‑facing storefront and an admin back office to manage products, orders, rentals, reports, and access logs. The UI is fully responsive, optimized for mobile, and includes polished loading states and accessibility improvements.

---

## Screenshots

<!-- Screenshot: Home / Landing -->

<!-- Screenshot: Product Detail (Support section) -->

<!-- Screenshot: Cart / Quote Request -->

<!-- Screenshot: Admin Dashboard -->

---

## Key Features
- Bilingual UI (EN / ES‑LatAm) with shared content model.
- Product catalog with filters, search, and responsive cards.
- Product detail view with integrated support section for compatible parts and maintenance requests.
- Cart and quote request flow with validation and anti‑spam checks.
- Admin area for products, orders, rentals, reports, and access logs.
- Image optimization: lazy loading, blur‑up placeholders, and proxy caching.
- Mobile‑first layouts and improved admin usability on small screens.

---

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Email:** Nodemailer (SMTP)
- **Auth:** JWT (localStorage on client)

---

## Architecture Highlights
- **Image Proxy:** Optional server proxy adds long‑lived cache headers for external images.
- **Rate Limiting:** Basic in‑memory rate limits on public endpoints.
- **Caching:** Response TTL caching for product list endpoints with invalidation on product changes.
- **Accessibility:** Modal focus traps and `aria` attributes for improved keyboard/screen‑reader support.

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance
- SMTP credentials for email notifications

### Environment Variables
Create `server/.env` and set:
```
SECRET_JWT=...
ADMIN_NOTIFY_EMAIL=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
SMTP_SECURE=false
SMTP_FROM=...
IMAGE_PROXY_ALLOWLIST= (optional, comma‑separated hosts)
```

### Install & Run
```
# root install (client + server dependencies)
npm install

# client
cd client
npm install
npm run dev

# server (in another terminal)
cd server
npm install
npm run dev
```

---

## Project Structure
```
client/    # React app (Vite)
server/    # Express API
```

---

## Notes for Deployment
- Set `ADMIN_NOTIFY_EMAIL` to receive contact and order notifications.
- Configure SMTP credentials to send emails.
- Optional: set `IMAGE_PROXY_ALLOWLIST` to restrict allowed image hosts.

---

## License
This project is provided for portfolio review and demonstration purposes.
