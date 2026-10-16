-- Apply before deploying the pass trash feature. Never run automatically at startup.
ALTER TABLE ayambil_passes ADD COLUMN trashed_at DATETIME(3) NULL, ADD INDEX ayambil_pass_trash (trashed_at,id);
INSERT INTO ayambil_schema_version(version) VALUES(3);
