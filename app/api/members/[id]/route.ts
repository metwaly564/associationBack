import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query('SELECT * FROM association_members WHERE id = $1', [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'عضو الجمعية غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching association member:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب عضو الجمعية' },
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
    const {
      name,
      position,
      category,
      email,
      join_date,
      membership_number,
      photo_url,
    } = body;

    const result = await pool.query(
      `UPDATE association_members 
       SET name = $1, position = $2, category = $3, email = $4, join_date = $5, membership_number = $6, photo_url = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [name, position, category, email, join_date, membership_number, photo_url || null, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'عضو الجمعية غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating association member:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث عضو الجمعية' },
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
    const result = await pool.query('DELETE FROM association_members WHERE id = $1 RETURNING id', [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'عضو الجمعية غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error deleting association member:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف عضو الجمعية' },
      { status: 500 }
    );
  }
}
