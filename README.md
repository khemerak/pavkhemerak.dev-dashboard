# pavkhemerak.dev Dashboard

Admin dashboard for managing dynamic content without frontend code edits/redeploys.

## Features

- Blog CMS (create, edit, delete posts)
- Portfolio CMS JSON editor at `/portfolio`
- Runtime-safe backend proxy routes (`/api/blog-proxy`, `/api/portfolio-proxy`, `/api/health-proxy`)
- Session/logout controls for admin access

## Local Development

```bash
pnpm install
pnpm dev
```

Dashboard runs on `http://localhost:3002` (or your configured Next.js port).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BACKEND_URL` | Rust backend URL (example: `http://localhost:3001`) |
| `NEXT_PUBLIC_BACKEND_URL` | Optional client-safe backend URL fallback |
| `ADMIN_API_KEY` | Admin key forwarded by dashboard proxies to protected backend routes |

## Portfolio CMS Flow

1. Open `/portfolio` in dashboard.
2. Edit JSON content for profile, skills, projects, and contact.
3. Save changes; dashboard sends `PUT /api/portfolio-proxy`.
4. Proxy forwards to backend `PUT /api/portfolio/content`.
5. Frontend home page consumes `GET /api/portfolio/content` at runtime.
