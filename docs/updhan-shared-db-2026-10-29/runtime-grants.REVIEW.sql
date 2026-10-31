-- REVIEW ONLY. Not applied. Provision NEW, dedicated accounts securely first.
-- Do not alter/revoke the existing Ayambil account. No passwords in this file.
-- Host names and final account names require hosting/operator confirmation.
-- Table grants apply only after the reviewed additive migration is installed.
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_events` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_options` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_applications` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_companions` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_consents` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_photos` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_audit` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_outbox` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_delivery_events` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_admin_sessions` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_rate_limits` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_attribution` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_schema_version` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_admission_settings` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_category_limits` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_operation_audit` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_attendance` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_duplicate_reviews` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_notification_reviews` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT,INSERT,UPDATE,DELETE ON `u531246927_vcs`.`updhan_worker_ownership` TO 'updhan_runtime'@'127.0.0.1';
GRANT SELECT (id,email,password_hash,enabled) ON `u531246927_vcs`.`ayambil_admins` TO 'updhan_identity_read'@'127.0.0.1';
-- Verify SHOW GRANTS separately for both accounts. No database-wide ALL or GRANT OPTION.
