import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query('SELECT * FROM static_pages WHERE id = $1', [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الصفحة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الصفحة' },
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
      title,
      slug,
      type,
      summary,
      body: content,
      status,
      show_in_menu,
      menu_label,
      menu_order,
      seo_title,
      seo_description,
    } = body;

    const result = await pool.query(
      `UPDATE static_pages 
       SET title = $1, slug = $2, type = $3, summary = $4, body = $5, status = $6, 
           show_in_menu = $7, menu_label = $8, menu_order = $9, seo_title = $10, 
           seo_description = $11, updated_at = NOW()
       WHERE id = $12
       RETURNING *`,
      [title, slug, type, summary, content, status, show_in_menu, menu_label, menu_order, seo_title, seo_description, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الصفحة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الصفحة' },
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
    const result = await pool.query('DELETE FROM static_pages WHERE id = $1 RETURNING id', [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الصفحة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الصفحة' },
      { status: 500 }
    );
  }
}
