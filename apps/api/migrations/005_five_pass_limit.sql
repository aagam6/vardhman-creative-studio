-- MariaDB: replace the inline ordinal check; existing records are preserved.
ALTER TABLE ayambil_attendees MODIFY COLUMN ordinal TINYINT NOT NULL CHECK (ordinal BETWEEN 1 AND 5);
