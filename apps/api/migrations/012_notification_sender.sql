-- Explicit additive migration only. Existing queues/bookings/passes untouched.
CREATE TABLE ayambil_notification_owner (
 id INT PRIMARY KEY,owner ENUM('paused','bilingual') NOT NULL DEFAULT 'paused',version INT UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB;
INSERT INTO ayambil_notification_owner VALUES(1,'paused',1);
CREATE TABLE ayambil_notification_outbox (
 id CHAR(36) PRIMARY KEY,dedupe_hash CHAR(64) NOT NULL UNIQUE,revision_hash CHAR(64) NOT NULL,
 purpose VARCHAR(40) NOT NULL,subject CHAR(36) NOT NULL,round_name VARCHAR(64) NOT NULL,
 envelope MEDIUMTEXT NOT NULL,state ENUM('held','ready','processing','accepted','sent','delivered','read','failed','uncertain','blocked','cancelled') NOT NULL DEFAULT 'held',
 attempts INT UNSIGNED NOT NULL DEFAULT 0,claim_id CHAR(36) NULL,
 provider_id VARCHAR(200) NULL UNIQUE,error_code VARCHAR(40) NULL,last_checked_at DATETIME(3) NULL,
 created_at DATETIME(3) NOT NULL,updated_at DATETIME(3) NOT NULL,INDEX(state,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE ayambil_notification_audit (
 id CHAR(36) PRIMARY KEY,actor VARCHAR(64) NOT NULL,action VARCHAR(40) NOT NULL,detail JSON NOT NULL,created_at DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
