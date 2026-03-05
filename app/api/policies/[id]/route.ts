import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query('SELECT * FROM policies WHERE id = $1', [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'السياسة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching policy:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب السياسة' },
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
    const body = await request.json();
    const { title, description, file_url } = body;

    const result = await pool.query(
      `UPDATE policies 
       SET title = $1, description = $2, file_url = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [title, description, file_url, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'السياسة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating policy:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث السياسة' },
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
    const result = await pool.query('DELETE FROM policies WHERE id = $1 RETURNING id', [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'السياسة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error deleting policy:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف السياسة' },
      { status: 500 }
    );
  }
}
