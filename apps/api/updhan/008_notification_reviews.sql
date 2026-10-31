-- Reviewed batch authorization, separate from all Ayambil queues/ownership.
CREATE TABLE updhan_notification_reviews (
 id CHAR(36) PRIMARY KEY, actor VARCHAR(180) NOT NULL, purpose VARCHAR(40) NOT NULL,
 jobs JSON NOT NULL, confirmation_hash CHAR(64) NOT NULL,
 expires_at DATETIME NOT NULL, consumed_at DATETIME,
 created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
