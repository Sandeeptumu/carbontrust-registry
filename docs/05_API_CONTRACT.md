# API contract (2026-10-10)

JSON responses except authenticated evidence downloads; multipart MRV uploads. Backend validates inputs. No bearer JWT or provider login endpoints remain. All mutations require cookie + `X-XSRF-TOKEN` obtained from `GET /users/csrf`; public authentication mutations also require CSRF. CORS permits only APP_URL with credentials.

| Method | Path | Request / result | Permission |
|---|---|---|---|
| GET | /users/csrf | `{token,headerName}` and HttpOnly CSRF cookie | Public |
| POST | /users/register | `{username,email,password,passwordConfirmation}` → verification notice | Public, throttled; role input ignored |
| POST | /users/login | `{email,password}` → `{userId,username,email,role,token:null}` and CT_SESSION cookie | Verified enabled account |
| GET | /users/me | Current identity/role from database | Valid session |
| POST | /users/logout | Revoke current session, expire cookie | CSRF |
| POST | /users/forgot-password | `{email}` → generic eligibility notice | Public, throttled |
| POST | /users/resend-verification | `{email}` → generic eligibility notice | Public, throttled |
| POST | /users/verify-email | `{token}` → consume verification/email-change link | Public, throttled |
| POST | /users/reset-password | `{token,password,passwordConfirmation}` | Public, throttled |
| GET | /admin/users | Real accounts with username/email/createdAt/role/status/accountStatus/emailVerified | Admin |
| PUT | /admin/users/{id}/role | `{role,expectedRole}` → updated account | Admin; stale writes 409; cannot remove last active admin |
| PUT | /admin/users/{id}/status | `{status}` PENDING/APPROVED/ACTIVE/SUSPENDED | Admin; last-admin guard |
| PUT | /admin/users/{id}/email | `{email}` → send new address verification, current address unchanged | Admin |
| GET | /admin/users/{id}/audit | `[{id,userId,actorEmail,action,detail,createdAt}]` | Admin |
| GET | /admin/stats, /admin/projects, /admin/credits, /admin/purchases, /admin/retirements | Database records/aggregates | Admin |
| GET/POST | /projects | List own / create project | NGO (Admin can list all) |
| GET/PUT/DELETE | /projects/{id} | Read / edit / delete own project | NGO ownership; Admin read; evidence-bearing project edits/deletes blocked pending amendment policy |
| POST | /projects/{id}/mrv | multipart `file`, `remarks`, `photoVerification` | Active NGO owner |
| GET | /projects/{id}/mrv | Submission metadata/history | Owner NGO / Admin |
| GET | /mrv/{id}/evidence | Private attachment | Owner NGO, assigned Verifier, Admin |
| GET | /mrv/{id}/verifications | Review history | Owner NGO, assigned Verifier, Admin |
| GET | /admin/mrv | Submission queue | Admin |
| PUT | /admin/mrv/{id}/assignment | `{verifierId}` | Admin; pending submissions only |
| GET | /verifier/mrv?status=PENDING | Assigned submissions | Verifier |
| POST | /verifier/mrv/{id}/verify | `{verificationStatus:APPROVED\|REJECTED,comments}` | Assigned Verifier; pending only; comments required |
| GET | /verifier/verifications | Own review history | Verifier |
| POST | /projects/{id}/carbon-credits | Existing quantity request DTO | Admin; verified project |
| GET | /projects/{id}/carbon-credits | Issued batches | Owner NGO / Admin |
| GET | /marketplace/credits, /marketplace/projects/{id} | Available batches / associated project details | User |
| GET | /buyer/purchases, /buyer/retirements | Own history | User |
| POST | /buyer/purchases/{id}/retire | Existing retirement request | User ownership; completed purchase and available balance |
| POST | /buyer/carbon-credits/{id}/purchase | Unavailable until payment/pricing specification | User; no simulated success |

Roles: `ADMIN`, `NGO`, `VERIFIER`, `HEALTHCARE_ASSISTANT`, `USER`. Browser route names `/buyer` remain backward-compatible while account role is USER. Healthcare business APIs are intentionally absent pending requirements.

Errors: 400 invalid request/link/business transition, 401 no valid session/incorrect credentials, 403 insufficient access/CSRF/unverified or disabled login, 404 missing record/file, 409 duplicate/stale edit, 413 oversized upload, 429 throttled, 503 mail unavailable. No passwords or raw stored token hashes are returned. CSRF can rotate; fetch a fresh token before each mutation.
