-- Add new 'both' value to committees.type check constraint
-- Usage: psql -U postgres -d association_db -f admin-cms/database/update_committees_type_constraint.sql

ALTER TABLE committees DROP CONSTRAINT IF EXISTS committees_type_check;
ALTER TABLE committees ADD CONSTRAINT committees_type_check CHECK (type IN ('permanent', 'temporary', 'both'));

SELECT '✅ committees.type constraint updated' AS message;