## Vistagram Backend Architecture (Minimal)

This document describes the minimal backend we will build: a simple REST API using Node.js + Express + TypeScript with Prisma ORM. Images are uploaded directly from the frontend to Firebase Storage; the backend stores only the image URL and post metadata. No CDN, cache, or background workers are required for the MVP.

### Goals
- Keep it simple and deployable quickly
- Separate `frontend/` and `backend/` folders
- Store only metadata in our DB; host images on Firebase Storage
- Provide a clean path to scale (swap SQLite→Postgres, add auth, etc.) later

### Tech Stack
- Runtime: Node.js 20 LTS, TypeScript 5
- Framework: Express 4
- ORM & DB: Prisma 5
  - Dev: SQLite (file-based)
  - Prod: PostgreSQL (managed; Neon/Supabase/Railway)
- Validation: minimal builtin checks (Zod optional later)
- CORS: `cors` (allow `frontend` origin)
- Config: `dotenv`

### High-level Flow
1) Frontend uploads images directly to Firebase Storage using Firebase Web SDK (Anonymous Auth is fine for MVP).
2) Frontend obtains a public `downloadURL` for the uploaded image.
3) Frontend calls backend `POST /api/posts` with `{ imageUrl, caption, userId }`.
4) Backend stores the post in the DB and returns it.

Notes:
- No server-side file handling (no Multer) since files live in Firebase Storage.
- The backend serves only JSON APIs; images are accessed via Firebase-provided URLs.

### Data Model (Prisma)
Minimal schema for users, posts, likes, and shares. `imageUrl` points to Firebase Storage.

```prisma
model User {
  id       String  @id @default(cuid())
  username String  @unique
  createdAt DateTime @default(now())
  posts    Post[]
  likes    Like[]
  shares   Share[]
}

model Post {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  imageUrl    String
  caption     String
  likeCount   Int      @default(0)
  shareCount  Int      @default(0)
  createdAt   DateTime @default(now())
  likes       Like[]
  shares      Share[]

  @@index([createdAt, id])
}

model Like {
  postId    String
  userId    String
  post      Post   @relation(fields: [postId], references: [id])
  user      User   @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())

  @@id([postId, userId])
}

model Share {
  id        String   @id @default(cuid())
  postId    String
  userId    String?
  channel   String   // "copy_link" | "native_share"
  createdAt DateTime @default(now())
  post      Post     @relation(fields: [postId], references: [id])
  user      User?    @relation(fields: [userId], references: [id])
}
```

### API Endpoints (Minimal)
- POST `/api/posts`
  - Body (JSON): `{ imageUrl: string, caption: string, userId: string }`
  - Creates a post and returns it.
  - Example request:
```json
{
  "imageUrl": "https://firebasestorage.googleapis.com/v0/b/<bucket>/o/posts%2Fuid%2Fkey.jpg?alt=media",
  "caption": "Sunset at the Golden Gate",
  "userId": "anon-uid-or-user-id"
}
```

- GET `/api/posts?cursor=<createdAt_id>&limit=20`
  - Returns posts in reverse chronological order with simple cursor pagination.
  - Response shape:
```json
{
  "items": [
    { "id": "...", "imageUrl": "...", "caption": "...", "likeCount": 0, "shareCount": 0, "createdAt": "...", "user": { "id": "...", "username": "..." } }
  ],
  "nextCursor": "2025-09-26T10:00:00.000Z_ckxy..." // or null
}
```

- GET `/api/posts/:id`
  - Returns a single post by id.

- PUT `/api/posts/:id/like`
  - Idempotent like: upsert into `Like`, increment `Post.likeCount`.

- DELETE `/api/posts/:id/like`
  - Remove like and decrement `Post.likeCount`.

- POST `/api/posts/:id/share`
  - Body: `{ channel: "copy_link" | "native_share", userId?: string }`
  - Records share and increments `Post.shareCount`.

### Pagination Strategy
- Cursor format: `"<createdAt ISO>_<postId>"` to ensure stable ordering and pagination.
- Query: fetch posts where `(createdAt, id) < (cursorCreatedAt, cursorId)` ordered by `(createdAt DESC, id DESC)`.
- Limit default: 20.

### Environment Variables
Create `backend/.env` for local dev. For production, set env vars in your hosting provider.

```
PORT=4000
NODE_ENV=development

# SQLite (dev) example
DATABASE_URL="file:./dev.db"

# Postgres (prod) example
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"

# CORS
FRONTEND_ORIGIN="http://localhost:5173"
```

### Firebase Storage (Frontend Responsibility)
- Frontend initializes Firebase, signs in anonymously once, and uploads to a path like `posts/<uid>/<uuid>.jpg`.
- After `uploadBytesResumable` completes, frontend calls `getDownloadURL()` and sends that as `imageUrl` to the backend.
- Storage rules (high-level): allow authenticated writes under their own folder, restrict file types to `image/*`, and cap size (e.g., 10 MB). Reads can be open for demo or restricted later.

### Local Development
- DB: SQLite with Prisma; no external dependencies required.
- Typical scripts (in `backend/package.json`):
  - `dev`: start Express with ts-node or tsx
  - `build`: TypeScript compile
  - `start`: run compiled server
  - `migrate`: `prisma migrate dev`
  - `seed` (optional): populate users and posts

### Deployment
- Provision managed Postgres (Neon/Supabase/Railway) and set `DATABASE_URL`.
- Run `npx prisma migrate deploy` on deploy.
- Start the Node process; the backend is stateless (no local file uploads).
- Images remain on Firebase; the DB stores only `imageUrl`.

### Security & Limits (MVP)
- CORS allow only the known `FRONTEND_ORIGIN`.
- Basic request size limits for JSON.
- Minimal server-side validation: ensure `imageUrl` is a valid URL and `caption` is within length limits.

### Future Extensions (non-breaking)
- Add real auth (email/password, OAuth) and associate posts with real users.
- Migrate to Postgres by changing `DATABASE_URL` and running Prisma migrations.
- Add comments, hashtags, locations, and real-time updates.
- Move to presigned uploads (S3) or keep Firebase, add deletion via Admin SDK.

### Link Sharing (Copy Link Only)
- Shareable URL: use the SPA route `/p/:id`.
- Client copies the URL to clipboard (no native share, no OG/Twitter preview page).
- After a successful copy, record the share via `POST /api/posts/:id/share` with `{ channel: "copy_link", userId?: string }`.
- The backend creates a `Share` row and increments `Post.shareCount`.
- Firebase image URLs remain public for viewing in the app; no special requirements for link unfurling since we are not generating previews.


