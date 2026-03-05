import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get single news item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query('SELECT * FROM news WHERE id = $1', [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الخبر غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0], {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الخبر' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}

// PUT - Update news item
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
      body: content,
      excerpt,
      category,
      status,
      meta_title,
      meta_description,
      published_at,
      show_on_home,
      priority,
    } = body;

    // Handle published_at: use provided value, or set to NOW() if status is 'published' and no date provided
    let publishedAtValue: Date | null = null;
    if (published_at) {
      // Convert ISO string to Date object if needed
      publishedAtValue = published_at instanceof Date ? published_at : new Date(published_at);
    } else if (status === 'published') {
      publishedAtValue = new Date();
    }

    const result = await pool.query(
      `UPDATE news 
       SET title = $1, slug = $2, body = $3, excerpt = $4, category = $5, status = $6, 
           meta_title = $7, meta_description = $8, updated_at = NOW(),
           published_at = $9, show_on_home = $10, priority = $11
       WHERE id = $12
       RETURNING *`,
      [title, slug, content, excerpt, category, status, meta_title, meta_description, publishedAtValue, show_on_home || false, priority || 0, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الخبر غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0], {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Error updating news:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الخبر', details: error.message },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'DELETE FROM news WHERE id = $1 RETURNING id',
      [id]
    );

    console.log('DELETE result:', result.rows);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'الخبر غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الخبر' },
      { status: 500 }
    );
  }
}