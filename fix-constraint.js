const { Pool } = require('pg');

require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'association_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function fixConstraint() {
  const client = await pool.connect();
  try {
    console.log('🔧 جاري إصلاح قيد المفتاح الأجنبي...');
    
    // Drop existing constraint if exists
    await client.query(`
      ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_product_id_fkey
    `);
    console.log('✅ تم حذف القيد القديم');
    
    // Add corrected constraint
    await client.query(`
      ALTER TABLE donations 
      ADD CONSTRAINT donations_product_id_fkey 
      FOREIGN KEY (product_id) REFERENCES donation_products(id) ON DELETE SET NULL
    `);
    console.log('✅ تم إضافة القيد الجديد مع ON DELETE SET NULL');
    
    console.log('\n✨ تم إصلاح المشكلة بنجاح! يمكنك الآن حذف منتجات التبرع بدون مشاكل');
  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

fixConstraint();
