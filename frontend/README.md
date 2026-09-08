# 🌱 CarbonTrust Registry — Frontend

Production-style React frontend for the CarbonTrust Registry, a role-based platform
for blue carbon projects: MRV submission, independent verification, carbon credit
issuance, a buyer marketplace, purchases, retirement certificates, and personal
health records.

**Stack:** React 19 · Vite · React Router 7 · Framer Motion · Recharts · Lucide · plain CSS

---

## Quick start

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

The Vite dev server proxies all API prefixes (`/users`, `/projects`, `/verifier`,
`/buyer`, `/admin`, `/marketplace`) to the Spring Boot backend on
`http://localhost:8080`, so **no CORS configuration is needed in development**.
(For good measure the backend also enables permissive CORS for local development.)

If your backend runs on another port, update the targets in `vite.config.js` or set
`VITE_API_URL` in `.env` to an absolute URL.

Other scripts:

```bash
npm run build    # production build -> dist/
npm run lint     # eslint
npm run preview  # preview the production build
```

---

## Roles & demo accounts

New accounts registered through the UI always receive the **BUYER** role (backend
behaviour). To explore the other dashboards, create accounts for each role directly
in MySQL, for example:

```sql
-- in the carbontrust database
INSERT INTO users (first_name,last_name,username,email,phone_number,address,password,role,status,date_of_birth)
VALUES
('Platform','Admin','admin','admin@carbontrust.com','9000000001','Hyderabad',
 '$2a$10$<bcrypt-hash-of-a-password>','ADMIN',true,'1990-01-01'),

('Coastal','NGO','bluecarbon_ngo','ngo@carbontrust.com','9000000002','Hyderabad',
 '<bcrypt-hash>','NGO',true,'1992-01-01'),

('Green','Verifier','verifier_one','verifier@carbontrust.com','9000000003','Hyderabad',
 '<bcrypt-hash>','VERIFIER',true,'1991-01-01');
```

> Tip: register a normal buyer via the UI first, copy its BCrypt hash from the
> `users` table and reuse it for the role accounts so you know the password.

The special demo roles **USER** and **HEALTHCARE_ADVISOR** are also supported by the
frontend. They are not enforced by the backend security rules, so create them the
same way if you want to preview the personal-health module.

| Role                 | Home                |
| -------------------- | ------------------- |
| ADMIN                | `/admin`            |
| NGO                  | `/ngo`              |
| VERIFIER             | `/verifier`         |
| BUYER                | `/buyer`            |
| USER                 | `/personal-health`  |
| HEALTHCARE_ADVISOR   | `/health`           |

---

## Personal Health module (demo mode)

The Spring Boot backend does **not** yet expose a Personal Health API, so the health
module runs on a clearly isolated, localStorage-backed service in
`src/api/health.js`. It is shaped like an API client (`listHealthRecords`,
`getHealthRecord`, `saveHealthRecord`) with a `USE_MOCK` flag and documentation for
the endpoints it maps to — swap the bodies for real HTTP calls when the backend is
ready and nothing else changes.

---

## Project structure

```
src/
  api/         central client + per-domain endpoint modules (auth, projects, mrv,
               verifier, credits, purchases, retirements, admin, health)
  components/  ui kit (Button/Input/Modal/Badge/Skeleton/EmptyState/…),
               layout shell (Sidebar/Topbar), credits & health building blocks
  context/     AuthContext (JWT session) & ToastContext (notifications)
  hooks/       useAsync (data fetching), useCountUp (animated numbers), …
  pages/       landing, auth, and one folder per role (admin, ngo, verifier,
               buyer, health)
  utils/       formatting, role/status metadata, storage helpers
```

Every page handles loading skeletons, empty states, error states and success
toasts. Unauthorised / expired JWTs (the backend returns 403 for both) sign the
user out automatically and redirect to `/login`.

## New backend endpoints added for the dashboard

To power the marketplace, verifier queue and admin analytics, small **additive**
read-only endpoints were added to the backend (no existing contract changed):

- `GET /marketplace/credits` · `GET /marketplace/projects/{id}`
- `GET /verifier/mrv?status=` · `GET /verifier/verifications`
- `GET /admin/stats|users|projects|credits|purchases|retirements`

plus CORS support and `createdAt`/`updatedAt` on project responses.
