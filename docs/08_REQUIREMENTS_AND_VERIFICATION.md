# Requirements coverage and verification

Authoritative request: attached Pasted text.txt dated 2026-10-10. Inspected repository docs 01–06, React frontend, Spring backend, Expo mobile, Compose/nginx/Dockerfiles and MySQL schema/account aggregates. Existing database has 42 accounts across six legacy roles, registry records and legacy health tables. All inspection of that database was read-only.

The referenced screenshot and additional MRV/healthcare attachments were not supplied. Docs 01–04 describe four old roles, 05 previously described JWT, and 06 provider login; the new request supersedes those. Doc 03 assigns credit issuance to Admin while the old NGO page offered issuance; implementation follows Doc 03. Buyer is deliberately mapped to User, preserving IDs, purchase history and buyer route bookmarks. Healthcare Advisor maps to Healthcare Assistant.

## Workflow checklist

| Requirement / source | Role & page | Endpoint | Persistent records | Permission / verification | Status |
|---|---|---|---|---|---|
| Signup/login (request 1, doc02) | Public /register, /login | /users/register, /login | users, auth_session | HTTP integration: normalized email, default USER, hash, invalid/duplicate handling | Implemented |
| Verification/reset/logout (request1) | Public email screens | /users/verify-email, /forgot-password, /reset-password, /logout | email_token, auth_session, account_audit | Replay/expiry, reset revocation, CSRF, SMTP rollback integration | Implemented; real SMTP delivery pending |
| Current account/session (request2, doc02 profile) | All dashboards | /users/me | users/session | Server identity, refresh, role polling, expiry test | Identity display; no unspecified profile edit workflow |
| List/search users (request2) | Admin /admin/users | GET /admin/users | users | Admin-only HTTP; UI search/filter | Implemented |
| Five role assignment (request2) | Admin /admin/users | PUT role | users, account_audit | All five roles + stale edits + self/last admin tests | Implemented |
| Approve/activate/suspend/reactivate (request2) | Admin /admin/users | PUT status | users, auth_session, audit | Last-admin guard; suspension invalidates sessions | Implemented |
| Manage email (request2) | Admin /admin/users + new inbox | PUT email, POST verify | email_token/users/audit | Address unchanged until confirmation; sessions invalidated | Implemented |
| First admin (request2) | Database operator | restricted stored procedure | users/audit/security_lock | Verified existing user; refuses existing admin | Implemented, documented; no seeded account |
| NGO project registration/list (doc02) | /ngo/projects/new, /ngo/projects | /projects | projects | Owner active NGO; backend validation | Implemented |
| Project edit/delete (doc02) | NGO project detail | /projects/{id} | projects | Owner; lock; evidence/history protection | Unsubmitted projects supported; refund/amendment rules missing |
| MRV upload (docs01–04) | NGO MRV form | multipart /projects/{id}/mrv | mrv_submissions including private evidence | Type/signature/size validation, owner guards, H2 persistence | Implemented |
| MRV metadata/history/download (request5) | NGO details, verifier queue | /projects/{id}/mrv, /mrv/{id}/evidence | same immutable submission | Owner/assigned/admin authorization and stored digest | Implemented; legacy missing evidence displays unavailable |
| Assign verifier (doc02 assigned review) | Admin /admin/mrv | PUT assignment | assigned_verifier_id | Admin only; pending only | Implemented |
| Review approve/reject/comments (doc02) | Verifier /verifier/mrv | POST verify | verifications + project/submission status | Assigned active verifier; atomic lock; comments mandatory | Implemented |
| Previous verification history (doc02) | /verifier/history + NGO details | /verifier/verifications, /mrv/{id}/verifications | verifications | Own/authorized history; persistence integration | Implemented |
| Correction requests/version replacement (request5 conditional) | — | — | Immutable submissions preserved | No correction transition/version policy in supplied docs | Specification needed; no invented states |
| Issued credit batches (doc02/03) | NGO details, Admin /admin/credits | GET batches, Admin POST carbon-credits | carbon_credit_batches | Verified project; admin role; UI issuance test | Implemented manual quantity; methodology/reissuance policy needed |
| Marketplace/project details (doc02 Buyer) | User /buyer/marketplace | /marketplace/* | projects/batches | USER role server-side | Implemented real data |
| Purchase history (doc02 Buyer) | User /buyer/credits | /buyer/purchases | purchases | Owner USER only | Implemented |
| Purchase credits (doc02 Buyer) | User marketplace | purchase endpoint | existing purchases preserved | No configured payment provider or documented pricing | Blocked; simulated success removed |
| Retire owned purchased credits (existing app) | User /buyer/retirements | POST retire | carbon_credit_retirements | Completed purchase, owner, positive balance, transaction lock; 3 tests | Preserved and hardened |
| Admin monitor projects/approvals/credits/purchases (doc02) | Admin dashboards | /admin/* | actual aggregates/records | ADMIN endpoints | Implemented |
| Healthcare Assistant (request4) | /health | /users/me | account identity only | Role restricted, no legacy patient data exposed | Dashboard exists; healthcare workflows blocked on specification |
| Auth visual design (request3) | /login, /register and token flows | Auth APIs | — | Responsive desktop/mobile, keyboard/labels, reduced motion, visibility controls | Implemented; screenshot was absent |

## Verification record

Automated checks and their final outcomes are recorded below when final verification finishes. Earlier failures were used to reproduce and fix missing DTO getters, role defaults, CSRF behavior and an old-password/reset concurrency race. The regression test proves the reviewed race by failing with one surviving session under the old implementation and passing with account locking before first entity load.

External limits: production deployment/HTTPS DNS, real sender/inbox delivery, operator grants on the existing database, restore of the existing production dataset, native-device cookies, and organization-specific carbon/healthcare/payment policies cannot be claimed verified. No test users or migration writes were made to the existing registry database.

## Final results — 2026-10-10

- Java 17 `./backend/mvnw -f backend/pom.xml clean verify`: **35 tests, zero failures/errors/skips**, packaged production jar. Includes live HTTP account lifecycle, all five admin role assignments, email address verification, SMTP failure rollback, CSRF/rate limits, session expiry/revocation, deterministic concurrent password reset/login regression, project metadata validation, MRV evidence persistence/authorization/review, project-credit privacy, marketplace draft privacy and retirement balance/ownership.
- Frontend: **8 tests passed**, lint/typecheck/production build passed. `npm audit` reported zero known vulnerabilities at the time checked.
- Opt-in live React integration: **passed** against the actual Vite proxy, packaged backend, disposable MySQL 8 and local SMTP capture: signup, verification, login, User dashboard, direct-route restoration, logout, unauthorized direct route, forgot/reset and new-password login. This used jsdom with real HTTP and a cookie jar, **not a full browser E2E test**. The browser tool became unavailable; earlier desktop login and 390px mobile signup visual inspection succeeded.
- Disposable MySQL: Flyway V1–V3 fresh install and Hibernate schema validation passed. Explicit version-1 baselining/upgrading a legacy fixture schema preserved six accounts and project ownership, mapped both legacy roles and preserved suspension. First-admin provisioning succeeded for an already verified real-flow fixture and rejected repeat provisioning. Runtime DML grant restriction was executed and its inability to execute provisioning was verified.
- Packaged backend + real local SMTP + MySQL HTTP workflow passed: admin account listing, role updates applied to existing sessions, NGO project/upload, admin verifier assignment, authorized evidence download, assigned review/comments/status history, admin issuance, denied NGO issuance, suspension/reactivation and User marketplace. Purchase endpoint correctly remained unavailable rather than fabricating a payment.
- Docker Compose configuration validation and nginx syntax checks passed. nginx logs omit query strings to avoid logging email-link tokens.
- Mobile Expo web export passed; three retirement tests pass within the backend count. Native-device execution, cookie persistence and native MRV file selection/download are not verified; mobile directs MRV actions to the web workflow.

All test accounts, uploaded fixtures and migration fixtures were confined to disposable storage. The existing registry's 42 accounts and data were not migrated or modified. Local SMTP capture is not proof of external email deliverability. No deployment was published and no production credentials were provisioned.

## Remaining blockers / limits

1. Supply healthcare records/consent/access/retention/workflow requirements before healthcare actions can be implemented. Legacy healthcare data remains untouched and is not exposed through invented permissions.
2. Supply payment provider, pricing, settlement/refund rules. New payments are blocked; existing purchase/retirement history remains functional.
3. Supply carbon quantification and reissuance methodology. Admin can manually issue quantities only on verified projects; the application does not certify a scientifically correct quantity or prevent policy-defined duplicate issuance without that policy.
4. Supply MRV correction/amendment/version-replacement rules if those states are intended. Current submissions/evidence and reviews remain immutable historical records; evidence-bearing project deletion/edit is blocked to preserve history.
5. The screenshot and additional documents mentioned in the request were absent. General profile editing beyond identity display/admin email management also lacks defined fields/permissions.
6. Configure real SMTP sender/domain, public APP_URL, TLS ingress/trusted proxies, runtime database grants, backup/restore and storage capacity. Validate external delivery and HTTPS cookies in the actual deployment. Existing database migration requires operator preflight/backups and explicit baselining, not automatic startup against production.
7. Perform full browser end-to-end, native mobile and load/concurrency testing appropriate to deployment volume. Large admin tables currently use complete API lists with client-side filters; pagination is a future scaling improvement.

Cleanup confirmed: the disposable MySQL container and its fixture databases were removed; isolated backend/SMTP were stopped and captured email-token files deleted. A final read-only query confirmed the original database still had 42 accounts and no new email-auth columns (no production migration applied).
