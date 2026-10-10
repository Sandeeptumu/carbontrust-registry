# Vercel + Render free demo deployment

Status (2026-10-10): release branch `codex/registry-email-auth` is pushed. The Vercel project `carbontrust-registry` exists, but no public deployment is live. Aiven Free MySQL 8.4 has passed a connection check with certificate/hostname verification; Flyway V1–V3 and Hibernate validation completed. A dedicated `carbontrust_runtime` account has only SELECT/INSERT/UPDATE/DELETE privileges. Brevo's sender is verified; its SMTP key still needs creation by the account owner. Render service creation and external email/browser verification remain pending. Local Mailpit must not be used for the public application.

## Database and email prerequisites

Create an Aiven Free MySQL service (currently 1 GB storage), or supply an existing hosted MySQL database. Store credentials directly in provider settings, not in chat or Git. Use a JDBC URL with TLS certificate and hostname verification. Download the provider's CA certificate and configure the JVM trust store if its CA is not publicly trusted; do not disable certificate verification.

Run the existing Flyway migration profile once against the hosted database with its operator account. Create a separate runtime user with only SELECT, INSERT, UPDATE and DELETE privileges. Keep operator credentials out of Render's long-running backend. Fresh deployment starts with no accounts; register and verify the real administrator through external email, then use the documented `provision_first_admin` procedure. Do not copy localhost sessions or the locally verified administrator into production.

Render Free blocks outbound ports 25, 465 and 587. The prepared template uses SMTP port 2525 with required STARTTLS; choose a provider that supports it, such as Brevo, and verify actual delivery and sender approval before launch. If the chosen provider requires an HTTPS API instead, an email transport implementation is needed first. Never turn off TLS to make delivery succeed. Provider signup/sender verification must be completed by the account owner.

## Backend: Render

Import `render.yaml` from the release branch. It defines only a Free Docker web service; it does not create a paid database or disk. Supply `SPRING_DATASOURCE_URL`, the runtime database credentials, the final Vercel origin as `APP_URL`, and the real sender/SMTP settings. The service uses Render's `PORT`, keeps secure cookies enabled and does not run schema changes with runtime credentials. The health check is `/users/csrf`.

## Frontend: Vercel

Set the project root directory to `frontend`. `vercel.json` runs the Build Output API packaging script. Set `BACKEND_ORIGIN` to the actual Render service origin, such as `https://YOUR-SERVICE.onrender.com`. Missing or invalid origins fail the build rather than publishing a broken proxy. No database or SMTP secrets belong in Vercel frontend environment variables.

The script builds with `VITE_API_URL=/api`. Vercel proxies `/api/*` to Render and serves other client routes from the SPA. Cookies stay on the frontend origin, avoiding cross-site cookie restrictions. Auth/API responses are not cached. Direct navigation to `/admin`, `/ngo/projects/new`, and email-link routes must work after refresh.

## Release verification

After both services and external email are configured, test signup, email delivery, verification, sign-in, refresh, logout and reset through the final HTTPS Vercel URL. Verify unauthorized access is rejected and MRV uploads/downloads work through the proxy. Check client-IP rate limiting through both hosting proxies before opening unrestricted registration. Preserve database backups using database-native backup tools.

Free hosting is intended here for a low-volume demo: Render sleeps when idle; database storage and email quotas are limited. Payment purchases remain disabled, and healthcare workflows still require specifications. No claim of complete production readiness is implied.

References: [Render Free](https://render.com/docs/free), [Aiven MySQL Free](https://aiven.io/docs/products/mysql/concepts/mysql-free-tier), [Brevo SMTP](https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP), [Vercel Build Output routing](https://vercel.com/docs/build-output-api/configuration).
