# كيفية الوصول إلى مجلد admin-cms

## الطريقة 1: من PowerShell

انسخ والصق هذا الأمر:

```powershell
cd "D:\My Documents\DIT Tech\موقع الجمعية ابو بسام\project\admin-cms"
```

## الطريقة 2: من File Explorer

1. افتح **File Explorer** (Windows + E)
2. انسخ والصق هذا المسار في شريط العنوان:
   ```
   D:\My Documents\DIT Tech\موقع الجمعية ابو بسام\project\admin-cms
   ```
3. اضغط Enter

## الطريقة 3: من CMD

```cmd
cd /d "D:\My Documents\DIT Tech\موقع الجمعية ابو بسام\project\admin-cms"
```

## الطريقة 4: استخدام اختصار

1. افتح File Explorer
2. اذهب إلى: `D:\My Documents\DIT Tech\موقع الجمعية ابو بسام\project`
3. انقر بزر الماوس الأيمن على مجلد `admin-cms`
4. اختر "Pin to Quick access" (تثبيت في الوصول السريع)

## التحقق من أنك في المجلد الصحيح:

```powershell
# يجب أن ترى ملف package.json
ls package.json

# أو
dir package.json
```

إذا ظهر الملف، فأنت في المكان الصحيح! ✅
