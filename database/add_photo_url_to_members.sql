-- Add photo_url column to association_members table if it doesn't exist
ALTER TABLE association_members
ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);
