-- Reviewed additive migration. Apply explicitly after verified backup; never on startup.
CREATE TABLE ayambil_booking_controls (
 event_date CHAR(10) PRIMARY KEY, mode ENUM('open','waiting','closed') NOT NULL DEFAULT 'closed',
 capacity INT UNSIGNED NOT NULL DEFAULT 0, version INT UNSIGNED NOT NULL DEFAULT 1,
 FOREIGN KEY(event_date) REFERENCES ayambil_events(event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO ayambil_booking_controls(event_date) SELECT event_date FROM ayambil_events;
CREATE TABLE ayambil_waiting (
 id CHAR(36) PRIMARY KEY, number VARCHAR(64) NOT NULL UNIQUE, request_hash CHAR(64) NOT NULL UNIQUE,
 payload_hash CHAR(64) NOT NULL, event_date CHAR(10) NOT NULL, payload JSON NOT NULL,
 status ENUM('waiting','approved') NOT NULL DEFAULT 'waiting', booking_id CHAR(36) NULL UNIQUE,
 created_at DATETIME(3) NOT NULL, approved_at DATETIME(3) NULL,
 FOREIGN KEY(event_date) REFERENCES ayambil_events(event_date), FOREIGN KEY(booking_id) REFERENCES ayambil_bookings(id), INDEX(event_date,status,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE ayambil_family_reviews (
 id CHAR(36) PRIMARY KEY, purpose ENUM('duplicate','attendance') NOT NULL, event_date CHAR(10) NOT NULL,
 snapshot JSON NOT NULL, token_hash CHAR(64) NULL UNIQUE, expires_at DATETIME(3) NULL,
 response JSON NULL, response_hash CHAR(64) NULL, decision JSON NULL, created_at DATETIME(3) NOT NULL,
 FOREIGN KEY(event_date) REFERENCES ayambil_events(event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE ayambil_control_audit (
 id CHAR(36) PRIMARY KEY, actor VARCHAR(64) NOT NULL, subject VARCHAR(64) NOT NULL,
 action VARCHAR(40) NOT NULL, detail JSON NOT NULL, created_at DATETIME(3) NOT NULL, INDEX(subject,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE ayambil_notification_previews (
 dedupe_hash CHAR(64) PRIMARY KEY, subject VARCHAR(64) NOT NULL, kind VARCHAR(32) NOT NULL,
 body JSON NOT NULL, created_at DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
