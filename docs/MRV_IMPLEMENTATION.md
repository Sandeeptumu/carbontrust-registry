# MRV implementation and limits

Requirements are docs 01–04: NGO uploads project evidence, an assigned verifier reviews, every decision has comments, approvals permit administrator issuance, historical decisions remain available. Docs do not define correction requests, document replacement versions, assignment policy, credit quantification, re-verification effects on issued credits, refunds, payments, or clinical workflows. No correction state or document replacement API is invented.

Each multipart submission creates a new immutable MRV record. Existing submissions, including those without stored files, are preserved. New files require PDF/JPEG/PNG extension, declared MIME type and matching signature, nonempty contents and size at most 10 MiB. Stored metadata includes sanitized original filename, size, media type, SHA-256 and upload date. Binary evidence resides in MySQL LONGBLOB, so database backups/restore cover evidence as well as metadata; no local deployment disk is required. Configure MySQL max_allowed_packet greater than 11 MiB and operational database backup/storage capacity. Signature validation is not malware scanning or content authenticity verification.

Endpoints:

- `POST /projects/{projectId}/mrv`: multipart `file`, `remarks`, `photoVerification`; active NGO owner only.
- `GET /projects/{projectId}/mrv`: owner/admin submission history and file metadata.
- `GET /mrv/{id}/evidence`: attachment download for active owner, assigned verifier, admin; no-store/nosniff headers. Historical missing files return 404.
- `GET /mrv/{id}/verifications`: owner/assigned verifier/admin review records.
- `GET /admin/mrv`: administrator assignment list.
- `PUT /admin/mrv/{id}/assignment`: `{ "verifierId": 123 }`, active verifier assignment for pending submissions only.
- `GET /verifier/mrv`: caller's assigned submissions, optional status filter.
- `POST /verifier/mrv/{id}/verify`: assigned active verifier, `APPROVED` or `REJECTED`, required comments (max 2000).
- `GET /verifier/verifications`: caller's decision history.

Assignment and review lock the submission. Review record creation, submission status and project status commit atomically; repeat decisions fail. Project writes lock the project, and edits/deletes are rejected after MRV exists so existing evidence remains tied to its original project details. Issuance locks the verified project and requires an active administrator. Supplied documents do not specify how to calculate or cap credit quantity; administrators remain responsible for that input. Existing project-state semantics are retained: approving sets VERIFIED, rejecting sets REJECTED. Multiple reporting periods and conflicting review effects require a policy before regulatory production use.

Purchases were previously marked COMPLETED without any payment provider and used a hardcoded price. New purchases now fail explicitly without changing inventory or recording a fake payment. Historical purchases remain readable under the deliberately mapped USER role. Commercial checkout requires pricing, settlement, refund and idempotency rules plus a real provider.

Verification: focused unit tests cover required review comments, file validation/hash/bytes, assignment access checks and repeat decision rejection. The H2 integration test writes and reloads evidence, assignment and review in separate transactions; no production database or accounts are used. Browser and actual deployment/object retention backups require environment-level verification.
