# Hanoi Game Show

The public Hanoi Game Show landing page and scroll-world hero.

## Local development

```bash
npm install
PORT=3000 npm start
```

Open `http://localhost:3000/`. Health check: `GET /health`.

## Railway

This repository deploys as the `landing` service inside the existing `gameshow` Railway project. The apex and `www` custom domains belong only to this service.

Game applications remain separate Railway services. Prefer first-level subdomains for them because the current apps assume root-relative asset, API, redirect, and WebSocket paths.
