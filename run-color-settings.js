// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'association_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function runColorSettings() {
  try {
    console.log('🔄 جاري تنفيذ إعدادات الألوان...');
    console.log('📊 معلومات الاتصال:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '5432',
      database: process.env.DB_NAME || 'association_db',
      user: process.env.DB_USER || 'postgres',
    });

    // Test connection first
    console.log('🔍 اختبار الاتصال...');
    await pool.query('SELECT 1');
    console.log('✅ الاتصال بالقاعدة ناجح');

    // Check if site_settings table exists
    console.log('🔍 فحص جدول site_settings...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'site_settings'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('❌ جدول site_settings غير موجود. يرجى تشغيل schema.sql أولاً');
      process.exit(1);
    }

    console.log('✅ جدول site_settings موجود');

    // Insert color settings directly
    console.log('🎨 إدراج إعدادات الألوان...');
    const colorSettings = [
      ['primary_color', '#1f2937', 'color', 'اللون الأساسي الرئيسي', 'theme', 100],
      ['secondary_color', '#3b82f6', 'color', 'اللون الثانوي', 'theme', 101],
      ['accent_color', '#10b981', 'color', 'لون التمييز', 'theme', 102],
      ['background_color', '#ffffff', 'color', 'لون خلفية الصفحة', 'theme', 103],
      ['header_background', '#ffffff', 'color', 'لون خلفية الهيدر', 'theme', 104],
      ['footer_background', '#f9fafb', 'color', 'لون خلفية الفوتر', 'theme', 105],
      ['text_primary', '#111827', 'color', 'لون النص الأساسي', 'theme', 106],
      ['text_secondary', '#6b7280', 'color', 'لون النص الثانوي', 'theme', 107],
      ['text_light', '#9ca3af', 'color', 'لون النص الفاتح', 'theme', 108],
      ['link_color', '#3b82f6', 'color', 'لون الروابط', 'theme', 109],
      ['link_hover_color', '#2563eb', 'color', 'لون الروابط عند التمرير', 'theme', 110],
      ['button_primary_bg', '#3b82f6', 'color', 'خلفية الزر الأساسي', 'theme', 111],
      ['button_primary_text', '#ffffff', 'color', 'نص الزر الأساسي', 'theme', 112],
      ['button_secondary_bg', '#f3f4f6', 'color', 'خلفية الزر الثانوي', 'theme', 113],
      ['button_secondary_text', '#374151', 'color', 'نص الزر الثانوي', 'theme', 114],
      ['card_background', '#ffffff', 'color', 'خلفية البطاقات', 'theme', 115],
      ['card_border', '#e5e7eb', 'color', 'حدود البطاقات', 'theme', 116],
      ['border_color', '#d1d5db', 'color', 'لون الحدود العام', 'theme', 117],
      ['font_family_primary', 'Tajawal, sans-serif', 'font', 'الخط الأساسي', 'typography', 200],
      ['font_family_headings', 'Tajawal, sans-serif', 'font', 'خط العناوين', 'typography', 201],
      ['font_size_base', '16px', 'size', 'حجم الخط الأساسي', 'typography', 202],
      ['font_size_h1', '2.25rem', 'size', 'حجم عنوان H1', 'typography', 203],
      ['font_size_h2', '1.875rem', 'size', 'حجم عنوان H2', 'typography', 204],
      ['font_size_h3', '1.5rem', 'size', 'حجم عنوان H3', 'typography', 205],
      ['font_size_h4', '1.25rem', 'size', 'حجم عنوان H4', 'typography', 206],
      ['font_size_h5', '1.125rem', 'size', 'حجم عنوان H5', 'typography', 207],
      ['font_size_h6', '1rem', 'size', 'حجم عنوان H6', 'typography', 208],
      ['font_weight_normal', '400', 'weight', 'وزن الخط العادي', 'typography', 209],
      ['font_weight_bold', '700', 'weight', 'وزن الخط الجريء', 'typography', 210],
      ['line_height_base', '1.6', 'height', 'ارتفاع السطر الأساسي', 'typography', 211],
      ['line_height_headings', '1.3', 'height', 'ارتفاع السطر للعناوين', 'typography', 212],
    ];

    for (const [setting_key, setting_value, setting_type, description, category, order_index] of colorSettings) {
      await pool.query(`
        INSERT INTO site_settings (setting_key, setting_value, setting_type, description, category, order_index)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (setting_key) DO UPDATE SET
          setting_value = EXCLUDED.setting_value,
          description = EXCLUDED.description,
          setting_type = EXCLUDED.setting_type,
          category = EXCLUDED.category,
          order_index = EXCLUDED.order_index
      `, [setting_key, setting_value, setting_type, description, category, order_index]);
    }

    console.log('✅ تم إضافة إعدادات الألوان بنجاح!');
    console.log('🎨 يمكنك الآن تخصيص ألوان الموقع من لوحة التحكم في http://localhost:3001/settings');

  } catch (error) {
    console.error('❌ خطأ في تنفيذ إعدادات الألوان:', error.message);
    console.error('🔍 تفاصيل الخطأ:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
runColorSettings();