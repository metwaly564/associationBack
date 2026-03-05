import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    const result = await pool.query('SELECT * FROM licenses WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الترخيص غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching license:', error);
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
      { error: 'حدث خطأ أثناء جلب الترخيص', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
      query = `UPDATE licenses 
               SET title = $1, description = $2, file_url = $3, file_name = $4, updated_at = NOW()
               WHERE id = $5
               RETURNING *`;
      values = [title, description || null, file_url || null, file_name || null, id];
    } else {
      query = `UPDATE licenses 
               SET title = $1, description = $2, file_url = $3, updated_at = NOW()
               WHERE id = $4
               RETURNING *`;
      values = [title, description || null, file_url || null, id];
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الترخيص غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating license:', error);
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
      { error: 'حدث خطأ أثناء تحديث الترخيص', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    const result = await pool.query('DELETE FROM licenses WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الترخيص غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error deleting license:', error);
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
      { error: 'حدث خطأ أثناء حذف الترخيص', details: error.message },
      { status: 500 }
    );
  }
}
