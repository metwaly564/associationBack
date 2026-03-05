-- Migrate membership_types.requirements text column to jsonb array
-- Run once on existing database.

ALTER TABLE membership_types
  ALTER COLUMN requirements TYPE jsonb USING (
    CASE
      WHEN requirements IS NULL THEN '[]'::jsonb
      ELSE (
        -- split text by newline into array, trim and remove empty strings
        regexp_split_to_array(requirements, E'\\n+')
      )::jsonb
    END
  );

-- set default after alter
ALTER TABLE membership_types ALTER COLUMN requirements SET DEFAULT '[]'::jsonb;

SELECT '✅ membership_types.requirements converted to JSONB' AS message;
