-- Additive review-only migration. Explicit operator application; never startup.
CREATE TABLE updhan_admission_settings (
 event_id VARCHAR(40) PRIMARY KEY, mode ENUM('open','waiting','closed') NOT NULL DEFAULT 'closed',
 policy ENUM('manual','automatic') NOT NULL DEFAULT 'manual', capacity INT UNSIGNED,
 maintenance_message VARCHAR(500) NOT NULL DEFAULT '', version INT NOT NULL DEFAULT 1,
 FOREIGN KEY(event_id) REFERENCES updhan_events(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE updhan_category_limits (
 option_id VARCHAR(40) PRIMARY KEY, mode ENUM('open','waiting','closed') NOT NULL DEFAULT 'closed',
 capacity INT UNSIGNED, version INT NOT NULL DEFAULT 1,
 FOREIGN KEY(option_id) REFERENCES updhan_options(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE updhan_operation_audit (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, actor VARCHAR(180) NOT NULL,
 subject VARCHAR(180) NOT NULL, action VARCHAR(50) NOT NULL, detail JSON NOT NULL,
 created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE updhan_attendance (
 application_id CHAR(36) PRIMARY KEY, checked_in BOOLEAN NOT NULL DEFAULT FALSE,
 version INT NOT NULL DEFAULT 1, updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 FOREIGN KEY(application_id) REFERENCES updhan_applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE updhan_duplicate_reviews (
 pair_hash CHAR(64) PRIMARY KEY, first_id CHAR(36) NOT NULL, second_id CHAR(36) NOT NULL,
 disposition ENUM('pending','distinct','confirmed') NOT NULL DEFAULT 'pending', note VARCHAR(500) NOT NULL DEFAULT '',
 version INT NOT NULL DEFAULT 1, FOREIGN KEY(first_id) REFERENCES updhan_applications(id),
 FOREIGN KEY(second_id) REFERENCES updhan_applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
