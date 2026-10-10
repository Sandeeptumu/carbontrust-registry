-- Run by a database operator only, after the person signs up and verifies their email.
-- Application database user should not have EXECUTE privilege for this procedure.
DELIMITER $$
CREATE PROCEDURE provision_first_admin(IN requested_email VARCHAR(254))
SQL SECURITY DEFINER
BEGIN
 DECLARE target_id BIGINT DEFAULT NULL;
 DECLARE lock_id BIGINT;
 DECLARE admin_count INT;
 DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
 START TRANSACTION;
 SELECT id INTO lock_id FROM security_lock WHERE id=1 FOR UPDATE;
 SELECT COUNT(*) INTO admin_count FROM users WHERE role='ADMIN';
 IF admin_count <> 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='An administrator already exists; use administrator role management'; END IF;
 SELECT user_id INTO target_id FROM users WHERE email=LOWER(TRIM(requested_email)) AND email_verified=1 AND status=1 AND account_status IN ('ACTIVE','APPROVED') FOR UPDATE;
 IF target_id IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Register and verify an active account first'; END IF;
 UPDATE users SET role='ADMIN' WHERE user_id=target_id;
 INSERT INTO account_audit(user_id,actor_email,action,detail,created_at) VALUES(target_id,'database-operator','FIRST_ADMIN_PROVISIONED','Verified account promoted through restricted procedure',UTC_TIMESTAMP(6));
 COMMIT;
END$$
DELIMITER ;
