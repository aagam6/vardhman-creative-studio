-- Explicit reviewed additive follow-up. No existing booking/pass mutations.
ALTER TABLE ayambil_booking_controls ADD COLUMN approval_capacity_configured BOOLEAN NOT NULL DEFAULT FALSE;
CREATE TABLE ayambil_booking_controls_release (
 id INT PRIMARY KEY, enabled BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;
INSERT INTO ayambil_booking_controls_release VALUES(1,FALSE);
CREATE TABLE ayambil_notification_intents (
 id CHAR(36) PRIMARY KEY, dedupe_hash CHAR(64) NOT NULL UNIQUE,
 booking_id CHAR(36) NULL, subject VARCHAR(64) NOT NULL, purpose VARCHAR(40) NOT NULL,
 review_round VARCHAR(64) NOT NULL, context JSON NOT NULL,
 state ENUM('held','uncertain','dispatched','cancelled') NOT NULL DEFAULT 'held',
 created_at DATETIME(3) NOT NULL, FOREIGN KEY(booking_id) REFERENCES ayambil_bookings(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
