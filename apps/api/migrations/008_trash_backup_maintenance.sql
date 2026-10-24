-- Apply explicitly during a verified registration pause, after a fresh backup.
-- Never restore a historical backup over a live database as part of deployment.
CREATE TABLE ayambil_trash_backup (
 id CHAR(36) PRIMARY KEY, batch_id CHAR(36) NOT NULL, pass_number VARCHAR(64) NOT NULL,
 booking_id CHAR(36) NOT NULL, admin_id CHAR(36) NOT NULL, payload JSON NOT NULL,
 created_at DATETIME(3) NOT NULL, INDEX(batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE ayambil_settings ADD COLUMN maintenance_active BOOLEAN NOT NULL DEFAULT FALSE,
 ADD COLUMN maintenance_until DATETIME(3) NULL;
