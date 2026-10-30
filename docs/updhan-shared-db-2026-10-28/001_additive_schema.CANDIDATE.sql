-- REVIEW-ONLY CANDIDATE: NOT AUTHORIZED FOR LIVE IMPORT.
-- Target concept: EXISTING u531246927_vcs database, new updhan_* objects only.
-- Actual live schema/version/grants/collisions and backup/restore NOT VERIFIED.
-- No USE, CREATE DATABASE, CREATE USER, existing-table ALTER, seed or open gate.
-- No IF NOT EXISTS: any existing target name requires an explicit schema diff.
-- NOT the current mock application's schema contract: production adapter,
-- encrypted outbox worker, admin identity and photo retention require review.
-- Do not wrap this multi-statement DDL in a transaction and claim rollback.
-- Execute nothing until a separately approved migration window and manifest.

CREATE TABLE updhan_events (
 id VARCHAR(40) PRIMARY KEY, title VARCHAR(180) NOT NULL,
 starts_on DATE NOT NULL, ends_on DATE NOT NULL, registration_open BOOLEAN NOT NULL DEFAULT FALSE,
 rules_version VARCHAR(40), next_registration_number BIGINT UNSIGNED NOT NULL DEFAULT 1, CHECK (ends_on >= starts_on)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE updhan_options (
 id VARCHAR(40) PRIMARY KEY, event_id VARCHAR(40) NOT NULL, label VARCHAR(180) NOT NULL,
 starts_on DATE, ends_on DATE, approved BOOLEAN NOT NULL DEFAULT FALSE,
 FOREIGN KEY (event_id) REFERENCES updhan_events(id),
 CHECK ((starts_on IS NULL AND ends_on IS NULL) OR (starts_on IS NOT NULL AND ends_on IS NOT NULL AND ends_on >= starts_on))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE updhan_applications (
 sequence BIGINT UNSIGNED AUTO_INCREMENT UNIQUE,
 id CHAR(36) PRIMARY KEY, request_key CHAR(36) NOT NULL UNIQUE, request_hash CHAR(64) NOT NULL,
 reference VARCHAR(40) NOT NULL UNIQUE, event_id VARCHAR(40) NOT NULL,
 option_snapshot JSON NOT NULL, applicant JSON NOT NULL, health TEXT,
 status ENUM('received','under_review','approved','waitlisted','rejected','cancelled','trashed') NOT NULL DEFAULT 'received',
 previous_status VARCHAR(30), version INT NOT NULL DEFAULT 1, created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY (event_id) REFERENCES updhan_events(id), INDEX updhan_status_created(status,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE updhan_companions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, application_id CHAR(36) NOT NULL,
 name VARCHAR(180) NOT NULL, form_number VARCHAR(40), FOREIGN KEY (application_id) REFERENCES updhan_applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE updhan_consents (
 application_id CHAR(36) PRIMARY KEY, rules_version VARCHAR(40) NOT NULL, privacy_version VARCHAR(40) NOT NULL,
 whatsapp BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (application_id) REFERENCES updhan_applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE updhan_photos (
 application_id CHAR(36) PRIMARY KEY, object_key CHAR(64) NOT NULL UNIQUE, sha256 CHAR(64) NOT NULL,
 mime VARCHAR(30) NOT NULL, bytes INT NOT NULL, expires_at DATETIME NOT NULL,
 FOREIGN KEY (application_id) REFERENCES updhan_applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE updhan_audit (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, application_id CHAR(36) NOT NULL,
 actor VARCHAR(180) NOT NULL, action VARCHAR(40) NOT NULL, old_status VARCHAR(30), new_status VARCHAR(30),
 created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3), FOREIGN KEY (application_id) REFERENCES updhan_applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE updhan_outbox (
 id CHAR(36) PRIMARY KEY, application_id CHAR(36) NOT NULL, type VARCHAR(40) NOT NULL, template_version INT NOT NULL,
 dedupe_key VARCHAR(140) NOT NULL UNIQUE,
 encrypted_payload MEDIUMTEXT NOT NULL, payload_key_version VARCHAR(40) NOT NULL,
 state ENUM('queued','preparing','sending','submitted','delivered','read','failed','uncertain') NOT NULL DEFAULT 'queued',
 provider_reference VARCHAR(180) UNIQUE, intent_at DATETIME, lease_until DATETIME, attempts INT NOT NULL DEFAULT 0,
 claim_token CHAR(36), updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 failure_code VARCHAR(80), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (application_id) REFERENCES updhan_applications(id), INDEX updhan_claim(state,lease_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE updhan_delivery_events (
 id VARCHAR(180) PRIMARY KEY, outbox_id CHAR(36) NOT NULL, state VARCHAR(30) NOT NULL,
 occurred_at DATETIME NOT NULL, FOREIGN KEY (outbox_id) REFERENCES updhan_outbox(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE updhan_admin_sessions (
 token_hash CHAR(64) PRIMARY KEY, csrf_token CHAR(64) NOT NULL,
 actor_id VARCHAR(180) NOT NULL, roles JSON NOT NULL,
 expires_at DATETIME(3) NOT NULL, revoked_at DATETIME(3),
 created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3), INDEX updhan_session_expiry(expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE updhan_rate_limits (
 bucket_key CHAR(64) PRIMARY KEY, hits INT UNSIGNED NOT NULL,
 expires_at DATETIME(3) NOT NULL, INDEX updhan_rate_expiry(expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE updhan_attribution (
 application_id CHAR(36) PRIMARY KEY,
 first_touch JSON NOT NULL, last_touch JSON NOT NULL,
 consent_version VARCHAR(40) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (application_id) REFERENCES updhan_applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE updhan_schema_version (
 version INT PRIMARY KEY, artifact_sha256 CHAR(64) NOT NULL,
 applied_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
