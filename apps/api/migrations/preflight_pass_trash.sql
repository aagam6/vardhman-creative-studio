-- READ ONLY. Prepared for the later approved maintenance window. Not executed yet.
SELECT DATABASE() AS database_name, VERSION() AS database_version;
SELECT version FROM ayambil_schema_version ORDER BY version;
SELECT TABLE_NAME,ENGINE,TABLE_ROWS,DATA_LENGTH,INDEX_LENGTH
FROM information_schema.TABLES
WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('ayambil_passes','ayambil_bookings','ayambil_attendees');
SELECT COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='ayambil_passes' AND COLUMN_NAME='trashed_at';
SELECT INDEX_NAME,SEQ_IN_INDEX,COLUMN_NAME
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='ayambil_passes' AND INDEX_NAME='ayambil_pass_trash';
-- Expected before the new migration: exact intended database, versions 1/2, no new column/index.
-- An unexpected result requires review, not automatic ALTER or deletion.
