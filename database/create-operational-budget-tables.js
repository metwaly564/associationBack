/**
 * إنشاء جداول الخطة التشغيلية والموازنة بدون الحاجة لـ psql
 * التشغيل: node database/create-operational-budget-tables.js
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

    console.log('جاري إنشاء الامتداد uuid-ossp...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    console.log('جاري إنشاء جدول operational_budgets...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS operational_budgets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        file_url VARCHAR(500),
        file_name VARCHAR(500),
        year INTEGER,
        type VARCHAR(50) NOT NULL CHECK (type IN ('plan', 'budget', 'both')),
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('جاري إنشاء جدول operational_budget_page_content...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS operational_budget_page_content (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        section_key VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(500),
        subtitle VARCHAR(500),
        description TEXT,
        content TEXT,
        image_url VARCHAR(500),
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('جاري إدراج المحتوى الافتراضي...');
    await client.query(`
      INSERT INTO operational_budget_page_content (section_key, title, subtitle, description, order_index)
      VALUES
        ('hero_title', 'الخطة التشغيلية والموازنة', 'نؤمن بالشفافية والتخطيط الاستراتيجي', NULL, 1),
        ('hero_subtitle', NULL, NULL, 'نعرض هنا الخطط التشغيلية والموازنات المعتمدة للجمعية', 2),
        ('intro_text', NULL, NULL, 'نؤمن بأهمية التخطيط الاستراتيجي والشفافية المالية. نعرض هنا الخطط التشغيلية والموازنات المعتمدة لضمان الشفافية والمساءلة.', 3)
      ON CONFLICT (section_key) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description
    `);

    console.log('جاري إنشاء الفهارس...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_operational_budgets_year ON operational_budgets(year)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_operational_budgets_type ON operational_budgets(type)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_operational_budgets_active ON operational_budgets(is_active)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_operational_budgets_order ON operational_budgets(order_index)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_operational_budget_page_content_key ON operational_budget_page_content(section_key)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_operational_budget_page_content_active ON operational_budget_page_content(is_active)');

    console.log('✅ تم إنشاء جداول صفحة الخطة التشغيلية والموازنة بنجاح!');
  } catch (err) {
    console.error('❌ خطأ:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
