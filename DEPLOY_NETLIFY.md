# Netlify Deployment (Frontend) + API Wiring

## 1) Prerequisites

- Frontend code is in `app/frontend`.
- Backend API is deployed separately (Render/Railway/etc.) and has a public URL.
- Netlify account and either:
  - interactive login, or
  - `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID`.

## 2) Netlify Build Config

This repo includes `netlify.toml` at the root:

- Base: `app/frontend`
- Build: `pnpm install --frozen-lockfile && pnpm build`
- Publish: `app/frontend/dist`

## 3) Configure Frontend API URL

The frontend reads API base in this order:

1. `window.TRACKAJO_API_BASE`
2. `VITE_API_BASE` (build-time env var)
3. local fallback (`http://localhost:5000`) on localhost
4. production fallback (`https://trackajo-api.onrender.com`)

Set Netlify env var:

```bash
netlify env:set VITE_API_BASE https://your-backend-url.example.com
```

## 4) Deploy Commands

From repository root:

```bash
corepack pnpm --dir app/frontend install --frozen-lockfile
corepack pnpm --dir app/frontend build
```

If this is your first link:

```bash
npx netlify-cli login
npx netlify-cli init
```

Deploy preview:

```bash
npx netlify-cli deploy --dir=app/frontend/dist
```

Deploy production:

```bash
npx netlify-cli deploy --dir=app/frontend/dist --prod
```

## 5) Non-Interactive CI/Terminal Deploy

```bash
export NETLIFY_AUTH_TOKEN=your_token
export NETLIFY_SITE_ID=your_site_id
npx netlify-cli deploy --dir=app/frontend/dist --prod
```
