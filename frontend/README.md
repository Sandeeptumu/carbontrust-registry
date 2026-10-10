# CarbonTrust web

Run `npm ci`, then `npm run dev`. The Vite server proxies APIs to localhost:8080; set `API_PROXY_TARGET` to use another local backend. Leave `VITE_API_URL` empty for same-origin deployment.

Checks: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.

Sessions use secure HttpOnly cookies; no Firebase SDK or browser bearer credential storage. Configure the backend's APP_URL to the frontend origin and use SECURE_COOKIES=false only for local HTTP. See ../docs/07_DEPLOYMENT.md.
