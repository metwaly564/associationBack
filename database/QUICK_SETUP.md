# إعداد سريع - خطوات مباشرة

## الخطوات الصحيحة:

### 1. الخروج من psql
```sql
\q
```

### 2. تشغيل ملف Schema من PowerShell/CMD
```powershell
# تأكد أنك في مجلد المشروع الرئيسي
cd "D:\My Documents\DIT Tech\موقع الجمعية ابو بسام\project"

# تشغيل ملف schema.sql
psql -U postgres -d association_db -f admin-cms\database\schema.sql
```

### 3. إنشاء ملف .env.local
```powershell
cd admin-cms
copy .env.local.example .env.local
```

ثم افتح `.env.local` وعدّل القيم:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=association_db
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL=false
JWT_SECRET=your-secret-key-here-minimum-32-characters
NEXT_PUBLIC_API_BASE=/api
```

### 4. إنشاء مستخدم إداري
```powershell
npm run create-admin
```

أو مع بيانات مخصصة:
```powershell
npm run create-admin admin@example.com admin123 "مدير النظام"
```

### 5. تشغيل التطبيق
```powershell
npm run dev
```

---

## ملاحظات مهمة:

✅ **قاعدة البيانات**: `association_db` موجودة وجاهزة
✅ **الترميز**: UTF8 (صحيح)
✅ **المنطقة الزمنية**: Asia/Riyadh (صحيح)

⚠️ **المشكلة**: حاولت تشغيل أوامر shell من داخل psql - يجب الخروج أولاً

---

## بديل: تشغيل SQL مباشرة من psql

إذا أردت البقاء داخل psql، يمكنك:

```sql
-- تشغيل ملف schema.sql
\i admin-cms/database/schema.sql

-- أو نسخ محتوى الملف ولصقه مباشرة
```

ثم الخروج:
```sql
\q
```

وبعدها من PowerShell:
```powershell
cd admin-cms
npm run create-admin
npm run dev
```
