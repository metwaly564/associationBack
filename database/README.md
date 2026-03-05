# إعداد قاعدة البيانات PostgreSQL

## المتطلبات
- PostgreSQL 12 أو أحدث
- Node.js و npm

## خطوات الإعداد

### 1. إنشاء قاعدة البيانات

```sql
CREATE DATABASE association_db;
```

### 2. تشغيل ملف Schema

قم بتشغيل ملف `schema.sql` لإنشاء جميع الجداول:

```bash
psql -U postgres -d association_db -f database/schema.sql
```

أو من داخل psql:

```sql
\i database/schema.sql
```

### 3. إعداد متغيرات البيئة

أنشئ ملف `.env.local` في مجلد `admin-cms`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=association_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

# JWT Secret (استخدم مفتاح قوي في الإنتاج)
JWT_SECRET=your-very-secure-secret-key-change-this-in-production

# API Base URL
NEXT_PUBLIC_API_BASE=/api
```

### 4. إنشاء مستخدم إداري

المستخدم الافتراضي:
- **البريد الإلكتروني**: `admin@example.com`
- **كلمة المرور**: `admin123`

**⚠️ مهم جداً**: قم بتغيير كلمة المرور فوراً بعد أول تسجيل دخول!

لإنشاء مستخدم جديد:

```sql
-- استخدم bcrypt لتشفير كلمة المرور
-- يمكنك استخدام هذا الموقع: https://bcrypt-generator.com/
-- أو استخدام Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('your_password', 10);

INSERT INTO users (email, password, name) 
VALUES ('your_email@example.com', '$2a$10$hashed_password_here', 'اسم المستخدم');
```

### 5. تشغيل التطبيق

```bash
npm run dev
```

## هيكل الجداول

- **users**: المستخدمون والمصادقة
- **news**: الأخبار
- **static_pages**: الصفحات الثابتة
- **projects**: المشاريع
- **team_members**: أعضاء الفريق
- **association_members**: أعضاء الجمعية
- **licenses**: التراخيص والاعتمادات
- **policies**: السياسات واللوائح
- **org_structure**: الهيكل التنظيمي
- **donation_products**: منتجات التبرع
- **donations**: التبرعات
- **donors**: المتبرعون

## ملاحظات الأمان

1. **غير JWT_SECRET** في الإنتاج
2. **غير كلمة المرور الافتراضية** فوراً
3. استخدم **SSL** في الإنتاج (`DB_SSL=true`)
4. استخدم **كلمات مرور قوية** للمستخدمين
5. قم بعمل **نسخ احتياطي** منتظم للقاعدة
