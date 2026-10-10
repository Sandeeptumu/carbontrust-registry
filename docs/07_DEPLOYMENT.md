# Email authentication deployment

The web application uses React, Spring Boot 4.1, Java 17 and MySQL 8. No Firebase credentials are needed. Do not deploy with the previous JWT or Firebase setup.

## Configuration

Copy `.env.example` to `.env` and supply real unique database and SMTP credentials, your public `APP_URL` (exact origin without trailing slash), and verified sender `MAIL_FROM`. Keep `SECURE_COOKIES=true` for HTTPS deployment. For local HTTP only set it false and use your local frontend origin. SMTP defaults require authentication and STARTTLS; disable those only for a local mail-capture server. Mail connection/read/write timeouts are five seconds.

Both web and API should use the same origin. The nginx configuration serves client routes and proxies API requests; Vite does the same locally. `VITE_API_URL` normally stays empty. Vite's `API_PROXY_TARGET` optionally selects an isolated backend (default localhost:8080). Web API requests include cookies and fetch a CSRF token before mutations.

Compose publishes only frontend port 3000 on loopback. Put an HTTPS reverse proxy in front. It must **overwrite** X-Forwarded-For with the actual client IP. Configure nginx `set_real_ip_from` and backend Tomcat `internal-proxies` to exactly match trusted ingress networks. The example trusts the standard isolated Docker 172.16/12 network; change it for another network. Do not expose backend or MySQL directly. Configure HSTS at the HTTPS ingress after confirming HTTPS works. Verify that two clients have separate throttle buckets and spoofed forwarding headers are overwritten at ingress.

## Migrations and data preservation

Back up the database and validate restoration first. Existing data was inspected read-only during implementation; the local registry was not migrated. The versioned SQL lives in `backend/src/main/resources/db/migration`:

- V1 creates the existing seven registry tables on a new database, with no seeded accounts.
- V2 adds account security, audit and MRV evidence structures; maps BUYER to USER and HEALTHCARE_ADVISOR to HEALTHCARE_ASSISTANT. Existing user IDs, hashes, ownership, projects, purchases and health tables remain intact.
- V3 adds the restricted first-admin provisioning procedure.

For an existing database, check normalized duplicate/blank/null email and username values, unknown roles, and the actual seven-table schema against V1 before proceeding. Resolve conflicts with the account owners; do not discard accounts. Example preflight queries:

```sql
SELECT LOWER(TRIM(email)),COUNT(*) FROM users GROUP BY LOWER(TRIM(email)) HAVING COUNT(*)>1;
SELECT LOWER(username),COUNT(*) FROM users GROUP BY LOWER(username) HAVING COUNT(*)>1;
SELECT user_id FROM users WHERE email IS NULL OR TRIM(email)='' OR username IS NULL OR TRIM(username)='';
SELECT role,COUNT(*) FROM users GROUP BY role;
```

A legacy schema without Flyway history must be explicitly baselined at version 1 after that check. Run the migration profile once with `SPRING_FLYWAY_BASELINE_ON_MIGRATE=true` and `SPRING_FLYWAY_BASELINE_VERSION=1`. Never leave automatic baselining enabled on normal startup. MySQL DDL is not transactional: use a restored copy to test, and restore the backup on a failed migration rather than blindly rerunning partially applied SQL.

Compose uses a one-shot `migrate` service with operator credentials; the long-running `backend` receives only the runtime credentials and has Flyway disabled. On a fresh volume the MySQL init script explicitly restricts the runtime account to SELECT/INSERT/UPDATE/DELETE. **On an existing volume init scripts do not rerun**: an operator must restrict the existing runtime account before starting backend. Do not use root as DB_USERNAME. Grant the migration operator necessary DDL/CREATE ROUTINE privileges. Verify runtime `SHOW GRANTS` has no EXECUTE, ALTER, DROP, CREATE or GRANT privileges. Only the operator may execute the first-admin procedure.

Fresh local deployment after filling `.env`:

```sh
docker compose up --build -d
```

For an existing Compose volume, preserve its existing project/volume identity; do not remove or rename the volume. Run the migration service with the temporary baseline overrides described above, inspect logs and schema history, then start backend/frontend. Existing Firebase-only users with no password use forgot-password to establish one, and all legacy accounts must verify email through resend-verification. Existing suspended accounts remain suspended. Old JWTs are no longer accepted.

Without Docker, run a migration job using the packaged jar with operator DB credentials and `--spring.main.web-application-type=none --spring.profiles.active=migrate`; it closes after migration and schema validation. Start the normal backend with the runtime DB account and `SPRING_FLYWAY_ENABLED=false`.

## First real administrator

Do not seed a user or password. Have the intended person register and verify their own email. Then, as a database operator (not the application's runtime account):

```sql
CALL provision_first_admin('the-persons-verified-address@example.org');
```

The procedure requires an existing verified active account, locks provisioning, refuses when any ADMIN already exists, and writes an audit event. It never sets a password. Existing installations with administrators must use their verified accounts to assign additional admins; provisioning deliberately refuses to bypass them. If access to every administrator's mailbox is lost, follow your organization’s identity-verified recovery process; no recovery bypass is included.

## Sessions, email and retention

New accounts are USER/PENDING. Verification activates PENDING; it never overrides SUSPENDED. APPROVED and ACTIVE permit sign-in only with verified email. Role changes are read from the database for each request; suspension deletes all sessions. Password reset and completed email changes revoke all sessions and outstanding links. Sessions expire after eight hours. The browser stores only HttpOnly cookies, not passwords or bearer credentials.

Verification, reset and email-change links expire after 30 minutes. Their random 256-bit tokens are stored only as SHA-256 hashes. SMTP failures roll back signup/token issuance and return a recoverable 503. Configure sender SPF/DKIM/DMARC and test real delivery before launch. Delivery to a real inbox and HTTPS infrastructure were not available for implementation verification.

Auth throttling uses atomic database counters shared by instances: 40 requests per IP and 10 per normalized email per 15-minute window. Plan scheduled maintenance to remove expired `auth_session`, `email_token` and `auth_throttle` rows; preserve `account_audit` according to your retention policy. Do not log tokens, passwords or email-link URLs. nginx uses no-referrer, access logs omit query strings, and downloads are attachments with nosniff.

## MRV storage

PDF/JPEG/PNG evidence up to 10 MiB is validated by extension, MIME and signature, and stored as private MySQL LONGBLOB with hash, size and project association. Database backups therefore include evidence. Ensure MySQL max_allowed_packet supports uploads (at least 16 MiB; 64 MiB recommended), database capacity and backup restore tests. Downloads are authenticated and authorized. No public file path or local ephemeral storage is used. Signature validation is not malware scanning; if policy requires scanning, connect an approved scanner before accepting untrusted evidence at scale.

## Verification commands

```sh
JAVA_HOME=/path/to/jdk17 ./backend/mvnw -f backend/pom.xml clean verify
cd frontend
npm ci
npm test
npm run lint
npm run typecheck
npm run build
```

Tests use an isolated H2 database and mocked email delivery, never production accounts. See `08_REQUIREMENTS_AND_VERIFICATION.md` for outcomes and unresolved business specifications.
# Local development email

For the localhost Docker installation, use `docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build`. The local override runs Mailpit at http://localhost:8025 and routes the backend's verification/reset emails there. These messages are captured locally and are **not delivered to Gmail or other external inboxes**. The override also uses HTTP cookies for localhost; do not use it for a public deployment.

The login page is at http://localhost:3000/login. Frontend and backend must be rebuilt together after authentication changes. The frontend proxies `/users/*` to the backend: `/users/csrf` with `Accept: application/json` must return JSON, never the SPA HTML. Existing users retain their passwords and must complete verification through the configured mail transport after migration.

