# إصلاح مشكلة المكتبات المفقودة

## المشكلة:
```
Error: Cannot find module 'bcryptjs'
```

## الحل:

### 1. تثبيت المكتبات المطلوبة

من PowerShell في مجلد `admin-cms`:

```powershell
npm install pg bcryptjs jsonwebtoken dotenv
npm install -D @types/pg @types/bcryptjs @types/jsonwebtoken
```

أو ببساطة:

```powershell
npm install
```

(تم تحديث package.json لإضافة المكتبات المطلوبة)

### 2. بعد التثبيت، جرب مرة أخرى:

```powershell
npm run create-admin
```

---

## إذا استمرت المشكلة:

1. احذف مجلد `node_modules`:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   ```

2. احذف ملف `package-lock.json`:
   ```powershell
   Remove-Item package-lock.json
   ```

3. أعد التثبيت:
   ```powershell
   npm install
   ```

4. جرب مرة أخرى:
   ```powershell
   npm run create-admin
   ```
