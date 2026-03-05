import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Get single report
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

    const result = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'التقرير غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب التقرير' },
      { status: 500 }
    );
  }
}

// PUT - Update report
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
    const { title, description, file_url, year, type } = body;

    const result = await pool.query(
      `UPDATE reports 
       SET title = $1, description = $2, file_url = $3, year = $4, type = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, description || null, file_url || null, year || null, type || null, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'التقرير غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث التقرير' },
      { status: 500 }
    );
  }
}

// DELETE - Delete report
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

    await pool.query('DELETE FROM reports WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف التقرير' },
      { status: 500 }
    );
  }
}
