-- Explicit separately reviewed additive migration; never run at startup.
CREATE TABLE ayambil_message_queue (
 id CHAR(36) PRIMARY KEY,
 dedupe_hash CHAR(64) NOT NULL UNIQUE,
 booking_id CHAR(36) NULL,
 notification_type VARCHAR(32) NOT NULL,
 payload MEDIUMTEXT NOT NULL,
 status ENUM('queued','preparing','sending','accepted','sent','delivered','read','failed','uncertain','cancelled') NOT NULL DEFAULT 'queued',
 attempts INT NOT NULL DEFAULT 0,
 provider_id VARCHAR(200) NULL UNIQUE,
 next_attempt_at DATETIME(3) NOT NULL,
 updated_at DATETIME(3) NOT NULL,
 error_code VARCHAR(40) NULL,
 FOREIGN KEY(booking_id) REFERENCES ayambil_bookings(id),
 INDEX(status,next_attempt_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO ayambil_schema_version(version) VALUES(2);
