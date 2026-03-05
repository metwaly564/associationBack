# دليل البدء السريع

## المشكلة: أنت في مجلد خاطئ!

أنت حالياً في: `C:\WINDOWS\system32`

يجب أن تكون في: `D:\My Documents\DIT Tech\موقع الجمعية ابو بسام\project\admin-cms`

---

## الحل السريع:

### الطريقة 1: استخدام ملف setup.bat (الأسهل)

1. افتح File Explorer
2. اذهب إلى: `D:\My Documents\DIT Tech\موقع الجمعية ابو بسام\project\admin-cms`
3. انقر نقراً مزدوجاً على `setup.bat`
4. اتبع التعليمات

### الطريقة 2: من PowerShell يدوياً

```powershell
# 1. الانتقال إلى مجلد المشروع
cd "D:\My Documents\DIT Tech\موقع الجمعية ابو بسام\project\admin-cms"

# 2. التحقق من وجود .env.local
# إذا لم يكن موجوداً، انسخه:
copy .env.local.example .env.local

# 3. افتح .env.local وعدّل القيم (خاصة DB_PASSWORD و JWT_SECRET)

# 4. إنشاء مستخدم إداري
npm run create-admin

# 5. تشغيل التطبيق
npm run dev
```

### الطريقة 3: استخدام مسار قصير (إذا كان متاحاً)

```powershell
# إنشاء اختصار للمجلد
cd D:\
cd "My Documents\DIT Tech\موقع الجمعية ابو بسام\project\admin-cms"
```

---

## ملاحظات مهمة:

1. ✅ **قاعدة البيانات جاهزة** - `association_db` موجودة
2. ⚠️ **ملف Schema** - تأكد من تشغيل `schema.sql` أولاً:
   ```powershell
   psql -U postgres -d association_db -f admin-cms\database\schema.sql
   ```
3. ⚠️ **ملف .env.local** - يجب تعديله قبل التشغيل

---

## إذا واجهت مشاكل:

1. تأكد من أنك في المجلد الصحيح:
   ```powershell
   pwd  # أو Get-Location
   ```

2. تأكد من وجود ملف package.json:
   ```powershell
   ls package.json
   ```

3. إذا لم تجد package.json، أنت في مجلد خاطئ!
