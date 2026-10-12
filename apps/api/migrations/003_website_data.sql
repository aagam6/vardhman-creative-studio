-- Explicit reviewed proposal only. Never executed by startup/build/deployment.
-- Existing database/user and Ayambil schema versions 1/2 remain unchanged.
-- Verify target identity, backup and absence of these tables before application.
-- DDL may commit partially: inspect both definitions before any recovery/rerun.
CREATE TABLE vcs_leads (
 id CHAR(36) PRIMARY KEY,
 name VARCHAR(120) NOT NULL,
 email VARCHAR(254) NOT NULL,
 company VARCHAR(200) NOT NULL DEFAULT '',
 message TEXT NOT NULL,
 created_at DATETIME(3) NOT NULL,
 INDEX(created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE vcs_imports (
 source_key CHAR(64) PRIMARY KEY,
 content_hash CHAR(64) NOT NULL,
 imported_at DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- No existing records are read, imported, overwritten or deleted here.
-- No administrator, credentials or processing gates are initialized here.