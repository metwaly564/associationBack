import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get single financial statement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'SELECT * FROM financial_statements WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'القائمة المالية غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching financial statement:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب القائمة المالية' },
      { status: 500 }
    );
  }
}

// PUT - Update financial statement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, file_url, file_name, year, type, order_index, is_active } = body;

    const result = await pool.query(
      `UPDATE financial_statements 
       SET title = $1, description = $2, file_url = $3, file_name = $4, 
           year = $5, type = $6, order_index = $7, is_active = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        title,
        description,
        file_url,
        file_name,
        year,
        type || 'statement',
        order_index || 0,
        is_active !== false,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'القائمة المالية غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating financial statement:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث القائمة المالية' },
      { status: 500 }
    );
  }
}

// DELETE - Delete financial statement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'DELETE FROM financial_statements WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'القائمة المالية غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error deleting financial statement:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف القائمة المالية' },
      { status: 500 }
    );
  }
}
