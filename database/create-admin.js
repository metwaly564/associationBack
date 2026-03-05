const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'association_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function createAdmin() {
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'مدير النظام';

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    const checkResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (checkResult.rows.length > 0) {
      console.log('⚠️  المستخدم موجود بالفعل. جاري تحديث كلمة المرور...');
      await pool.query('UPDATE users SET password = $1, name = $2 WHERE email = $3', [
        hashedPassword,
        name,
        email,
      ]);
      console.log('✅ تم تحديث كلمة المرور بنجاح');
    } else {
      // Create new user
      await pool.query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3)',
        [email, hashedPassword, name]
      );
      console.log('✅ تم إنشاء المستخدم الإداري بنجاح');
    }

    console.log('\n📋 معلومات تسجيل الدخول:');
    console.log(`   البريد الإلكتروني: ${email}`);
    console.log(`   كلمة المرور: ${password}`);
    console.log('\n⚠️  مهم: قم بتغيير كلمة المرور بعد أول تسجيل دخول!');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();
