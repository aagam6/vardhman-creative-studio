-- Reviewed additive migration. Existing bookings/passes are untouched.
ALTER TABLE ayambil_family_reviews ADD COLUMN review_round VARCHAR(64) NOT NULL DEFAULT 'initial',
 ADD COLUMN contact_key VARCHAR(32) NULL,
 ADD COLUMN communication_key CHAR(64) NULL UNIQUE,
 ADD INDEX ayambil_review_contact (purpose,event_date,contact_key,review_round);
