-- Fix donation_products deletion issue
-- This script fixes the foreign key constraint to allow deletion of donation products

-- Drop the existing constraint
ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_product_id_fkey;

-- Add the corrected constraint with ON DELETE SET NULL
ALTER TABLE donations 
ADD CONSTRAINT donations_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES donation_products(id) ON DELETE SET NULL;
