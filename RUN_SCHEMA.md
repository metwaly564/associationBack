# تشغيل ملف Schema لإنشاء الجداول

## المشكلة:
```
❌ خطأ: relation "users" does not exist
```

هذا يعني أن الجداول لم يتم إنشاؤها بعد في قاعدة البيانات.

## الحل:

### الطريقة 1: من PowerShell (موصى به)

```powershell
# من مجلد المشروع الرئيسي
cd "D:\My Documents\DIT Tech\موقع الجمعية ابو بسام\project"

# تشغيل ملف schema.sql
psql -U postgres -d association_db -f admin-cms\database\schema.sql
```

### الطريقة 2: من داخل psql

```sql
-- الاتصال بقاعدة البيانات
\c association_db

-- تشغيل ملف schema.sql
\i admin-cms/database/schema.sql

-- أو نسخ محتوى الملف ولصقه مباشرة
```

### الطريقة 3: نسخ ولصق SQL مباشرة

1. افتح ملف `admin-cms/database/schema.sql`
2. انسخ كل المحتوى
3. افتح psql:
   ```powershell
   psql -U postgres -d association_db
   ```
4. الصق المحتوى واضغط Enter

---

## بعد تشغيل Schema:

1. تأكد من نجاح العملية (يجب أن ترى رسائل CREATE TABLE)
2. ثم أنشئ المستخدم الإداري:
   ```powershell
   cd admin-cms
   npm run create-admin
   ```

---

## التحقق من الجداول:

```sql
-- من داخل psql
\dt

-- يجب أن ترى قائمة بالجداول مثل:
-- users, news, projects, pages, team_members, etc.
```
