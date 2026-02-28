---
title: Car Garage
emoji: 🚗
colorFrom: indigo
colorTo: blue
sdk: docker
pinned: false
---

# Car Garage

Marketplace for buying/selling cars with listings, favorites, chat, and image uploads.

## Local Development

1. Server
   - Create `server/.env` (see `server/.env.example`)
   - `cd server && npm install && npm run dev`
   - Health: http://localhost:7860/api/health

2. Client
   - Create `client/.env` with `VITE_API_URL` and `VITE_SOCKET_URL`
   - `cd client && npm install && npm run dev`
   - Open http://localhost:5173

## Deploy

- **Hugging Face Spaces**: Docker Space (automatically builds both frontend and backend from the root `Dockerfile`).
- **Vercel**: (Optional) Frontend-only deployment (root directory `client`, build `npm run build`, output `dist`).

## Push to GitHub

Ensure you are in the **project root directory** (not inside `client` or `server`) before running:

```powershell
.\scripts\push.ps1
```

Or manually:

> Ensure you have a GitHub credential helper configured or use a Personal Access Token when prompted.
*** End Patch***} ?>"
