@echo off
chcp 65001 >nul
echo ========================================
echo   إعداد لوحة إدارة المحتوى
echo ========================================
echo.

REM الانتقال إلى مجلد admin-cms
cd /d "%~dp0"

echo [1/4] التحقق من ملف .env.local...
if not exist .env.local (
    echo ⚠️  ملف .env.local غير موجود
    echo 📝 جاري نسخ .env.local.example...
    copy .env.local.example .env.local >nul
    echo ✅ تم إنشاء ملف .env.local
    echo ⚠️  يرجى تعديل القيم في .env.local قبل المتابعة
    pause
    exit /b
)

echo ✅ ملف .env.local موجود
echo.

echo [2/4] تثبيت المكتبات...
call npm install
if errorlevel 1 (
    echo ❌ فشل تثبيت المكتبات
    pause
    exit /b
)
echo ✅ تم تثبيت المكتبات
echo.

echo [3/4] إنشاء مستخدم إداري...
echo.
echo يرجى إدخال بيانات المستخدم الإداري:
set /p ADMIN_EMAIL="البريد الإلكتروني (admin@example.com): "
if "%ADMIN_EMAIL%"=="" set ADMIN_EMAIL=admin@example.com

set /p ADMIN_PASSWORD="كلمة المرور (admin123): "
if "%ADMIN_PASSWORD%"=="" set ADMIN_PASSWORD=admin123

set /p ADMIN_NAME="الاسم (مدير النظام): "
if "%ADMIN_NAME%"=="" set ADMIN_NAME=مدير النظام

call node database/create-admin.js %ADMIN_EMAIL% %ADMIN_PASSWORD% "%ADMIN_NAME%"
if errorlevel 1 (
    echo ❌ فشل إنشاء المستخدم الإداري
    pause
    exit /b
)
echo.

echo [4/4] تشغيل التطبيق...
echo.
echo ✅ جاري تشغيل التطبيق على http://localhost:3000
echo.
call npm run dev
