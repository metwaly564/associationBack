import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query('SELECT * FROM team_members WHERE id = $1', [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'عضو الفريق غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching team member:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب عضو الفريق' },
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
      role,
      type,
      bio,
      image_url,
      order_index,
    } = body;

    const result = await pool.query(
      `UPDATE team_members 
       SET name = $1, role = $2, type = $3, bio = $4, image_url = $5, order_index = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, role, type, bio, image_url, order_index, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'عضو الفريق غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث عضو الفريق' },
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
    const result = await pool.query('DELETE FROM team_members WHERE id = $1 RETURNING id', [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'عضو الفريق غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف عضو الفريق' },
      { status: 500 }
    );
  }
}
