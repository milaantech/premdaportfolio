# Server for Book Frontend

This is a minimal Express + Mongoose backend scaffold for the Book Frontend project.

Features
- Connects to MongoDB using `MONGO_URI` from `.env`.
- CRUD endpoints for books, with a `/toggle-featured` helper.
- Get and upsert author content.
- Create and fetch orders.

Quick start
1. Copy `.env.example` to `.env` and set `MONGO_URI` (e.g., your MongoDB connection string).
2. Install dependencies:

```bash
cd server
npm install
```

3. Run in development:

```bash
npm run dev
```

API endpoints
- GET /api/books
- POST /api/books
- PUT /api/books/:id
- DELETE /api/books/:id
- POST /api/books/:id/toggle-featured
- GET /api/author
- POST /api/author
- POST /api/orders
- GET /api/orders/:id

Notes
- This is a minimal scaffold meant for local development. Add authentication, validation, rate-limiting and production-ready best practices before deploying.
