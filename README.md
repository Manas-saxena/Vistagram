Vistagram – Full-stack overview

Overview
- A simple visit-Instagram style app to create posts (image + caption), browse a feed, like/unlike, and share.
- Monorepo layout:
  - backend/ – Node.js (Express, TypeScript), Prisma ORM, JWT (access + refresh)
  - frontend/ – React + Vite + TypeScript, TailwindCSS

Local development (build and run)
- Prerequisites: Node.js 20+, npm 10+, Git
- Backend
  1) cd backend && npm install
  2) Create .env with at least:
     - PORT=4000
     - FRONTEND_ORIGIN=http://localhost:5173
     - DATABASE_URL="file:./dev.db"
     - JWT_ACCESS_SECRET=dev_access
     - JWT_REFRESH_SECRET=dev_refresh
     - JWT_ACCESS_TTL=15m
     - JWT_REFRESH_TTL_DAYS=30
     - BCRYPT_ROUNDS=12
  3) Prisma: npx prisma migrate dev --name init
  4) Run dev: npm run dev (http://localhost:4000)
  5) Build prod: npm run build → start: npm start
- Frontend
  1) cd frontend && npm install
  2) Vite proxy is set to backend at http://localhost:4000; no extra env needed
  3) Run dev: npm run dev (http://localhost:5173)
  4) Build prod: npm run build → preview: npm run preview

Backend architecture
- Tech
  - Express (TS), Prisma (SQLite dev, Postgres-ready), bcryptjs, jsonwebtoken, cookie-parser
  - JWT auth: short-lived access token (Authorization: Bearer ...) + long-lived refresh token (httpOnly cookie)
- Data model (simplified)
  - users(id, username, createdAt)
  - local_auth(userId PK, email unique, passwordHash, createdAt, updatedAt)
  - refresh_tokens(id, userId, tokenHash, expiresAt, revokedAt, userAgent?, ip?)
  - posts(id, userId, imageUrl, caption, likeCount, shareCount, createdAt)
  - likes(postId, userId) composite PK
  - shares(id, postId, userId?, channel, createdAt) with unique (postId,userId) to prevent double shares
- Auth endpoints
  - POST /api/auth/signup { email, username, password } → { accessToken, user } + sets refresh cookie
  - POST /api/auth/login { emailOrUsername, password } → { accessToken, user } + sets refresh cookie
  - POST /api/auth/refresh → { accessToken } (rotates refresh cookie)
  - POST /api/auth/logout → revokes refresh + clears cookie
- Post/feed endpoints
  - GET /api/posts?cursor&limit (optional JWT to compute likedByMe)
  - GET /api/posts/:id (optional JWT)
  - POST /api/posts { imageUrl, caption } (require JWT)
  - PUT /api/posts/:id/like / DELETE /api/posts/:id/like (require JWT)
  - POST /api/posts/:id/share { channel } (optional JWT, one share per user enforced)
- Middleware
  - requireJwt / optionalJwt – verifies access JWT; sets req.user = { uid }
- Env
  - PORT=4000, FRONTEND_ORIGIN=http://localhost:5173
  - DATABASE_URL=...
  - JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_TTL=15m, JWT_REFRESH_TTL_DAYS=30
  - BCRYPT_ROUNDS=12
- Run
  - cd backend && npm install
  - npx prisma migrate dev --name init && npm run dev

Frontend architecture
- Tech
  - React + Vite + TypeScript, TailwindCSS, react-router, react-hot-toast
  - Vite dev proxy forwards /api to http://localhost:4000
- Auth
  - In-memory access token store with localStorage persistence (vistagram_token)
  - api client attaches Authorization header; on 401, auto-calls /api/auth/refresh (credentials: include) then retries once
- UI
  - /login – email/username + password (sign-in)
  - /signup – email, username, password
  - / – feed with PostCard (image preserved aspect, like/share buttons, skeleton shimmer)
  - /new – create post (camera/upload, preview, caption)
  - /p/:id – post detail
- Run
  - cd frontend && npm install && npm run dev
  - Open the Vite URL (e.g., http://localhost:5173)

Notes
- Images are stored on Firebase Storage (or any object storage) and the backend stores only the imageUrl.
- Development-only caveat: React Strict Mode can double-invoke effects; guards are used to avoid duplicate fetches.

