-- Upgrade policies_page_content columns to TEXT to avoid varchar length issues
-- Usage: psql -U postgres -d association_db -f admin-cms/database/upgrade_policies_page_content_columns.sql

ALTER TABLE policies_page_content ALTER COLUMN title TYPE TEXT;
ALTER TABLE policies_page_content ALTER COLUMN subtitle TYPE TEXT;
ALTER TABLE policies_page_content ALTER COLUMN image_url TYPE TEXT;

SELECT '✅ Updated policies_page_content columns to TEXT' AS message;
