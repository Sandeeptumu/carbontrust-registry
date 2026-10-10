# CarbonTrust Registry

React + Spring Boot + MySQL registry with email/password authentication, admin-managed accounts, NGO projects, assigned MRV review, private evidence storage, and carbon registry history.

See [deployment and first-admin setup](docs/07_DEPLOYMENT.md), [workflow coverage and verification](docs/08_REQUIREMENTS_AND_VERIFICATION.md), and [API contract](docs/05_API_CONTRACT.md).

Authentication uses BCrypt, revocable database sessions, HttpOnly cookies, CSRF protection, SMTP single-use links and persistent rate limits. Roles are Admin, NGO, Verifier, Healthcare Assistant and User. No demo users or default login credentials are created.

Copy `.env.example` and configure database, SMTP and application URL before running. The web interface uses the same-origin API; `frontend/.env.example` documents the optional API URL. Existing installations require migration preflight and an explicit baseline—see deployment instructions before starting against existing data.

Healthcare-specific workflows, payment processing and carbon quantification rules require specifications. The application shows those limitations instead of simulated records or successful payments. Existing registry and healthcare records are preserved.

For development, run the backend with Java 17 and configured environment, then `npm ci && npm run dev` from `frontend`. The web development proxy targets localhost:8080. For mobile compatibility and unverified native limitations see [mobile README](mobile/README.md).
