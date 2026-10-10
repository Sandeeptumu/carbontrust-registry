# Opt-in live frontend verification

Run this only with a disposable local database. The test creates a uniquely named
`browsercheck-…@example.test` account and random passwords; it never seeds a default
account or grants privileges. Drop the disposable database after verification.

1. Start the backend against an isolated migrated database, with local SMTP capture
   enabled and `APP_URL=http://localhost:5188`.
2. Start Vite with `API_PROXY_TARGET=http://localhost:8098 npm run dev -- --host localhost --port 5188 --strictPort`.
3. Run `python3 backend/scripts/local_mail_capture.py` from the repository root (localhost:2528), with backend SMTP_AUTH=false and SMTP_TLS=false. It writes JSON lines containing `to` and decoded `body` fields.
4. From `frontend`, run:

   ```sh
   ISOLATED_INTEGRATION=1 \
   ISOLATED_FRONTEND_URL=http://localhost:5188 \
   ISOLATED_MAIL_CAPTURE=/tmp/registry-captured-mail.jsonl \
   npm run test:integration
   ```

This runs real React forms in jsdom, with live HTTP through Vite and a test cookie
jar. It covers signup, captured verification mail, verification, login, session
restoration after remount/direct navigation, logout, denied access after logout,
forgot-password, reset-password, and login using the new password. It does not
replace a browser rendering/cookie-policy test. URLs must use localhost or 127.0.0.1;
the environment opt-in is mandatory. `npm test` excludes this integration file.
