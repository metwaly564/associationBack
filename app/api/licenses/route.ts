import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? parseInt(pageParam, 10) : NaN;
    const limit = limitParam ? parseInt(limitParam, 10) : NaN;
    const hasPagination = Number.isFinite(page) && page > 0 && Number.isFinite(limit) && limit > 0;

    if (hasPagination) {
      const offset = (page - 1) * limit;
      const [dataResult, countResult] = await Promise.all([
        pool.query('SELECT * FROM licenses ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
        pool.query('SELECT COUNT(*)::int AS count FROM licenses'),
      ]);
      const total = countResult.rows[0]?.count ?? 0;
      return NextResponse.json({ items: dataResult.rows, total, page, limit });
    }

    const result = await pool.query(
      'SELECT * FROM licenses ORDER BY created_at DESC'
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching licenses:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      detail: error.detail,
    });
    
    // If table doesn't exist
    if (error.code === '42P01') {
      return NextResponse.json(
        { error: 'جدول التراخيص غير موجود. يرجى تشغيل ملف SQL: admin-cms/database/add_file_name_to_licenses.sql' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب التراخيص', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, file_url, file_name } = body;

    // Check if file_name column exists
    const columnCheck = await pool.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'licenses' AND column_name = 'file_name'`
    );
    
    const hasFileNameColumn = columnCheck.rows.length > 0;
    
    let query: string;
    let values: any[];
    
    if (hasFileNameColumn) {
      query = `INSERT INTO licenses (title, description, file_url, file_name)
               VALUES ($1, $2, $3, $4)
               RETURNING *`;
      values = [title, description || null, file_url || null, file_name || null];
    } else {
      query = `INSERT INTO licenses (title, description, file_url)
               VALUES ($1, $2, $3)
               RETURNING *`;
      values = [title, description || null, file_url || null];
    }

    const result = await pool.query(query, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating license:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      detail: error.detail,
      hint: error.hint,
    });
    
    // If table doesn't exist
    if (error.code === '42P01') {
      return NextResponse.json(
        { error: 'جدول التراخيص غير موجود. يرجى تشغيل ملف SQL: admin-cms/database/add_file_name_to_licenses.sql' },
        { status: 500 }
      );
    }
    
    // If column doesn't exist
    if (error.code === '42703') {
      return NextResponse.json(
        { error: 'حقل file_name غير موجود. يرجى تشغيل ملف SQL: admin-cms/database/add_file_name_to_licenses.sql' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الترخيص', details: error.message },
      { status: 500 }
    );
  }
}
