import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const page = pageParam ? parseInt(pageParam, 10) : NaN;
    const limit = limitParam ? parseInt(limitParam, 10) : NaN;
    const hasValidPagination =
      Number.isFinite(page) && page > 0 && Number.isFinite(limit) && limit > 0;

    if (hasValidPagination) {
      const offset = (page - 1) * limit;

      const [dataResult, countResult] = await Promise.all([
        pool.query(
          'SELECT * FROM static_pages ORDER BY menu_order, created_at DESC LIMIT $1 OFFSET $2',
          [limit, offset]
        ),
        pool.query('SELECT COUNT(*)::int AS count FROM static_pages'),
      ]);

      const total = countResult.rows[0]?.count ?? 0;

      return NextResponse.json(
        {
          items: dataResult.rows,
          total,
          page,
          limit,
        },
        { status: 200 }
      );
    }

    const result = await pool.query(
      'SELECT * FROM static_pages ORDER BY menu_order, created_at DESC'
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الصفحات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      type = 'default',
      summary,
      body: content,
      status = 'draft',
      show_in_menu = false,
      menu_label,
      menu_order = 0,
      seo_title,
      seo_description,
    } = body;

    const result = await pool.query(
      `INSERT INTO static_pages (title, slug, type, summary, body, status, show_in_menu, menu_label, menu_order, seo_title, seo_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title, slug, type, summary, content, status, show_in_menu, menu_label, menu_order, seo_title, seo_description]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الصفحة' },
      { status: 500 }
    );
  }
}
