import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - List news (supports optional pagination)
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
          'SELECT * FROM news ORDER BY created_at DESC LIMIT $1 OFFSET $2',
          [limit, offset]
        ),
        pool.query('SELECT COUNT(*)::int AS count FROM news'),
      ]);

      const total = countResult.rows[0]?.count ?? 0;

      return NextResponse.json(
        {
          items: dataResult.rows,
          total,
          page,
          limit,
        },
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    const result = await pool.query(
      'SELECT * FROM news ORDER BY created_at DESC'
    );
    return NextResponse.json(result.rows, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الأخبار' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// POST - Create new news
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      body: content,
      excerpt,
      category = 'events',
      status = 'draft',
      meta_title,
      meta_description,
      published_at,
      show_on_home = false,
      priority = 0,
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
      `INSERT INTO news (title, slug, body, excerpt, category, status, meta_title, meta_description, published_at, show_on_home, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        title,
        slug,
        content,
        excerpt,
        category,
        status,
        meta_title,
        meta_description,
        publishedAtValue,
        show_on_home,
        priority,
      ]
    );

    return NextResponse.json(result.rows[0], { 
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الخبر' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
