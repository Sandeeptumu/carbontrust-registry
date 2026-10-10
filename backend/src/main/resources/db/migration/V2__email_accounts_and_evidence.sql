-- Preflight (run before baseline/migration on an existing installation):
-- SELECT LOWER(TRIM(email)),COUNT(*) FROM users GROUP BY LOWER(TRIM(email)) HAVING COUNT(*)>1;
-- SELECT LOWER(username),COUNT(*) FROM users GROUP BY LOWER(username) HAVING COUNT(*)>1;
-- Resolve duplicate/blank addresses and usernames with account owners before running this migration.
-- MySQL DDL is not transactional: back up and validate on a restored copy first.
ALTER TABLE users ADD COLUMN email_verified BIT(1) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN account_status VARCHAR(255) NOT NULL DEFAULT 'PENDING';
UPDATE users SET email=LOWER(TRIM(email));
CREATE UNIQUE INDEX uk_users_email ON users(email);
CREATE UNIQUE INDEX uk_users_username ON users(username);
UPDATE users SET role='USER' WHERE role='BUYER';
UPDATE users SET role='HEALTHCARE_ASSISTANT' WHERE role='HEALTHCARE_ADVISOR';
UPDATE users SET account_status=CASE WHEN status=1 THEN 'ACTIVE' ELSE 'SUSPENDED' END;
-- Existing users prove email ownership through resend verification; passwords and ownership stay intact.
CREATE TABLE auth_session (
 token_hash VARCHAR(255) PRIMARY KEY, user_id BIGINT NOT NULL, expires_at DATETIME(6) NOT NULL,
 CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(user_id), INDEX idx_session_user(user_id), INDEX idx_session_expiry(expires_at)
);
CREATE TABLE email_token (
 token_hash VARCHAR(255) PRIMARY KEY, user_id BIGINT NOT NULL, purpose VARCHAR(255) NOT NULL,
 target_email VARCHAR(255), expires_at DATETIME(6) NOT NULL, used_at DATETIME(6),
 CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES users(user_id), INDEX idx_token_user(user_id,purpose)
);
CREATE TABLE account_audit (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,user_id BIGINT,actor_email VARCHAR(255),action VARCHAR(255),detail VARCHAR(2000),created_at DATETIME(6), INDEX idx_audit_user(user_id,created_at)
);
INSERT INTO account_audit(user_id,actor_email,action,detail,created_at)
 SELECT user_id,'migration','ROLE_MODEL_MIGRATED',CONCAT('Role: ',role,'; preserved account and registry records'),UTC_TIMESTAMP(6) FROM users;
CREATE TABLE auth_throttle (bucket VARCHAR(255) PRIMARY KEY, attempts INT NOT NULL, expires_at DATETIME(6), INDEX idx_throttle_expiry(expires_at));
CREATE TABLE security_lock (id BIGINT PRIMARY KEY);
INSERT INTO security_lock VALUES (1);
-- Apply through the versioned migration mechanism, not directly to production.
ALTER TABLE mrv_submissions ADD COLUMN assigned_verifier_id BIGINT NULL;
ALTER TABLE mrv_submissions ADD COLUMN file_name VARCHAR(255) NULL;
ALTER TABLE mrv_submissions ADD COLUMN content_type VARCHAR(255) NULL;
ALTER TABLE mrv_submissions ADD COLUMN file_size BIGINT NULL;
ALTER TABLE mrv_submissions ADD COLUMN sha256 VARCHAR(255) NULL;
ALTER TABLE mrv_submissions ADD COLUMN evidence LONGBLOB NULL;
ALTER TABLE mrv_submissions ADD CONSTRAINT fk_mrv_assigned_verifier FOREIGN KEY (assigned_verifier_id) REFERENCES users(user_id);
CREATE INDEX idx_mrv_assignment ON mrv_submissions(assigned_verifier_id, mrv_status);
