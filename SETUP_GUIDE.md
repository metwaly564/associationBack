# دليل الإعداد الكامل - لوحة إدارة المحتوى

## الخطوات الكاملة لإعداد النظام

### 1. تثبيت المتطلبات

```bash
# تثبيت المكتبات
cd admin-cms
npm install
```

### 2. إعداد قاعدة البيانات PostgreSQL

#### الطريقة الأولى: استخدام Script تلقائي (موصى به)

**Windows (PowerShell):**
```powershell
.\database\setup.ps1
```

**Linux/Mac:**
```bash
bash database/setup.sh
```

#### الطريقة الثانية: يدوياً

**أ) إنشاء قاعدة البيانات:**
```sql
CREATE DATABASE association_db;
```

**ب) تشغيل ملف Schema:**
```bash
psql -U postgres -d association_db -f database/schema.sql
```

### 3. إعداد ملف البيئة

انسخ ملف `.env.local.example` إلى `.env.local`:

```bash
cp .env.local.example .env.local
```

ثم عدّل القيم في `.env.local`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=association_db
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL=false
JWT_SECRET=your-very-secure-secret-key-minimum-32-characters
NEXT_PUBLIC_API_BASE=/api
```

**ملاحظة:** لتوليد JWT_SECRET قوي:
```bash
openssl rand -base64 32
```

### 4. إنشاء مستخدم إداري

```bash
npm run create-admin
```

أو مع بيانات مخصصة:
```bash
npm run create-admin admin@example.com your_password "اسم المستخدم"
```

المستخدم الافتراضي:
- **البريد**: `admin@example.com`
- **كلمة المرور**: `admin123`

⚠️ **مهم جداً**: قم بتغيير كلمة المرور بعد أول تسجيل دخول!

### 5. تشغيل التطبيق

```bash
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

### 6. تسجيل الدخول

استخدم بيانات المستخدم الإداري التي أنشأتها في الخطوة 4.

---

## هيكل قاعدة البيانات

### الجداول المتوفرة:

1. **users** - المستخدمون والمصادقة
2. **news** - الأخبار
3. **static_pages** - الصفحات الثابتة
4. **projects** - المشاريع
5. **team_members** - أعضاء الفريق
6. **association_members** - أعضاء الجمعية
7. **licenses** - التراخيص والاعتمادات
8. **policies** - السياسات واللوائح
9. **org_structure** - الهيكل التنظيمي
10. **donation_products** - منتجات التبرع
11. **donations** - التبرعات
12. **donors** - المتبرعون

---

## API Routes المتوفرة

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - معلومات المستخدم الحالي

### الأخبار
- `GET /api/news` - قائمة الأخبار
- `GET /api/news/[id]` - تفاصيل خبر
- `POST /api/news` - إنشاء خبر
- `PUT /api/news/[id]` - تحديث خبر
- `DELETE /api/news/[id]` - حذف خبر

### المشاريع
- `GET /api/projects` - قائمة المشاريع
- `GET /api/projects/[id]` - تفاصيل مشروع
- `POST /api/projects` - إنشاء مشروع
- `PUT /api/projects/[id]` - تحديث مشروع
- `DELETE /api/projects/[id]` - حذف مشروع

### الصفحات الثابتة
- `GET /api/pages` - قائمة الصفحات
- `GET /api/pages/[id]` - تفاصيل صفحة
- `POST /api/pages` - إنشاء صفحة
- `PUT /api/pages/[id]` - تحديث صفحة
- `DELETE /api/pages/[id]` - حذف صفحة

### فريق العمل
- `GET /api/team` - قائمة أعضاء الفريق
- `GET /api/team/[id]` - تفاصيل عضو
- `POST /api/team` - إضافة عضو
- `PUT /api/team/[id]` - تحديث عضو
- `DELETE /api/team/[id]` - حذف عضو

### أعضاء الجمعية
- `GET /api/members` - قائمة الأعضاء
- `GET /api/members/[id]` - تفاصيل عضو
- `POST /api/members` - إضافة عضو
- `PUT /api/members/[id]` - تحديث عضو
- `DELETE /api/members/[id]` - حذف عضو

### التراخيص
- `GET /api/licenses` - قائمة التراخيص
- `GET /api/licenses/[id]` - تفاصيل ترخيص
- `POST /api/licenses` - إضافة ترخيص
- `PUT /api/licenses/[id]` - تحديث ترخيص
- `DELETE /api/licenses/[id]` - حذف ترخيص

### السياسات
- `GET /api/policies` - قائمة السياسات
- `GET /api/policies/[id]` - تفاصيل سياسة
- `POST /api/policies` - إضافة سياسة
- `PUT /api/policies/[id]` - تحديث سياسة
- `DELETE /api/policies/[id]` - حذف سياسة

### الهيكل التنظيمي
- `GET /api/org-structure` - جلب الهيكل
- `POST /api/org-structure` - حفظ الهيكل

### منتجات التبرع
- `GET /api/donations/products` - قائمة المنتجات
- `GET /api/donations/products/[id]` - تفاصيل منتج
- `POST /api/donations/products` - إضافة منتج
- `PUT /api/donations/products/[id]` - تحديث منتج
- `DELETE /api/donations/products/[id]` - حذف منتج

### التبرعات
- `GET /api/donations` - قائمة التبرعات

### المتبرعون
- `GET /api/donors` - قائمة المتبرعين

---

## استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات

1. تأكد من تشغيل PostgreSQL
2. تحقق من بيانات الاتصال في `.env.local`
3. تأكد من وجود قاعدة البيانات

### خطأ في المصادقة

1. تحقق من `JWT_SECRET` في `.env.local`
2. تأكد من وجود مستخدم في جدول `users`
3. تحقق من أن كلمة المرور مشفرة بشكل صحيح

### خطأ 404 في API Routes

1. تأكد من تشغيل التطبيق (`npm run dev`)
2. تحقق من المسار الصحيح للـ API
3. تأكد من وجود الجداول في قاعدة البيانات

---

## الأمان

1. ✅ **غير JWT_SECRET** في الإنتاج
2. ✅ **غير كلمة المرور الافتراضية** فوراً
3. ✅ استخدم **SSL** في الإنتاج (`DB_SSL=true`)
4. ✅ استخدم **كلمات مرور قوية**
5. ✅ قم بعمل **نسخ احتياطي** منتظم للقاعدة
6. ✅ لا ترفع ملف `.env.local` إلى Git

---

## الدعم

إذا واجهت أي مشاكل، راجع:
- `database/README.md` - دليل قاعدة البيانات
- `README.md` - دليل المشروع الرئيسي
