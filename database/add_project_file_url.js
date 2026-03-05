/**
 * إضافة أعمدة file_url و file_name لجدول المشاريع
 * التشغيل: node database/add_project_file_url.js
 */
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'association_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding TO 'UTF8'");

    console.log('جاري إضافة عمود file_url لجدول projects...');
    await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS file_url VARCHAR(500)');

    console.log('جاري إضافة عمود file_name لجدول projects...');
    await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS file_name VARCHAR(255)');

    console.log('✅ تم إضافة أعمدة file_url و file_name لجدول المشاريع بنجاح!');
  } catch (err) {
    console.error('❌ خطأ:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
