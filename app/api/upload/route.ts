import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('📤 Upload request received:', { name: file?.name, size: file?.size, type: file?.type });

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم إرسال ملف' },
        { status: 400 }
      );
    }

    // Validate file size (100MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'حجم الملف يتجاوز 100MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    // More lenient PDF check - some systems might report different MIME types
    const isPDF = file.type.includes('pdf') || fileExt === 'pdf';
    const isImage = allowedTypes.some(type => type.includes('image')) && file.type.includes('image');
    
    if (!isPDF && !isImage && !allowedTypes.includes(file.type)) {
      console.log('❌ File type not allowed:', { fileType: file.type, fileExt, fileName: file.name });
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم. الصيغ المسموحة: JPG, PNG, WebP, GIF, PDF' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${randomStr}.${ext}`;
    const filepath = join(UPLOAD_DIR, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    console.log('✅ File saved:', filename);

    // Return public URL - full URL for frontend access
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const url = `${baseUrl}/uploads/${filename}`;

    console.log('📡 Returning URL:', url);

    return NextResponse.json({
      url,
      filename,
      size: file.size,
      type: file.type,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('❌ Error uploading file:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء رفع الملف', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
