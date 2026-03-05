# PowerShell Script لإعداد قاعدة البيانات بالكامل
# استخدم: .\database\setup.ps1

Write-Host "🚀 بدء إعداد قاعدة البيانات..." -ForegroundColor Yellow

# التحقق من وجود PostgreSQL
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "❌ PostgreSQL غير مثبت. يرجى تثبيته أولاً." -ForegroundColor Red
    exit 1
}

Write-Host "📝 يرجى إدخال معلومات قاعدة البيانات:" -ForegroundColor Yellow

$DB_USER = Read-Host "اسم المستخدم (postgres)"
if ([string]::IsNullOrWhiteSpace($DB_USER)) { $DB_USER = "postgres" }

$securePassword = Read-Host "كلمة المرور" -AsSecureString
$DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

$DB_NAME = Read-Host "اسم قاعدة البيانات (association_db)"
if ([string]::IsNullOrWhiteSpace($DB_NAME)) { $DB_NAME = "association_db" }

$DB_PORT = Read-Host "المنفذ (5432)"
if ([string]::IsNullOrWhiteSpace($DB_PORT)) { $DB_PORT = "5432" }

$DB_HOST = Read-Host "العنوان (localhost)"
if ([string]::IsNullOrWhiteSpace($DB_HOST)) { $DB_HOST = "localhost" }

# إنشاء قاعدة البيانات
Write-Host "📦 إنشاء قاعدة البيانات..." -ForegroundColor Yellow
$env:PGPASSWORD = $DB_PASSWORD
$createDbQuery = "CREATE DATABASE $DB_NAME;"
try {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c $createDbQuery 2>$null
    Write-Host "✅ تم إنشاء قاعدة البيانات" -ForegroundColor Green
} catch {
    Write-Host "⚠️  قاعدة البيانات موجودة بالفعل" -ForegroundColor Yellow
}

# تشغيل ملف Schema
Write-Host "📋 إنشاء الجداول..." -ForegroundColor Yellow
$env:PGPASSWORD = $DB_PASSWORD
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database\schema.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ تم إنشاء قاعدة البيانات والجداول بنجاح!" -ForegroundColor Green
    
    # إنشاء ملف .env.local
    Write-Host "📝 إنشاء ملف .env.local..." -ForegroundColor Yellow
    
    # توليد JWT Secret
    $jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    $envContent = @"
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_SSL=false
JWT_SECRET=$jwtSecret
NEXT_PUBLIC_API_BASE=/api
"@
    
    $envContent | Out-File -FilePath .env.local -Encoding utf8
    Write-Host "✅ تم إنشاء ملف .env.local" -ForegroundColor Green
    Write-Host "⚠️  الآن قم بتشغيل: npm run create-admin" -ForegroundColor Yellow
} else {
    Write-Host "❌ حدث خطأ أثناء إنشاء قاعدة البيانات" -ForegroundColor Red
    exit 1
}
