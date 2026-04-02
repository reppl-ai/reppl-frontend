# REPPL Frontend

This folder is ready to live as its own repo.

## Run frontend only

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If the backend is not running, the frontend automatically falls back to a built-in demo mission so the landing page, onboarding flow, and dashboard still work.

## Run against the real backend

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK_API=false
```

Then start the backend separately.

## Force demo mode

```env
NEXT_PUBLIC_USE_MOCK_API=true
```
