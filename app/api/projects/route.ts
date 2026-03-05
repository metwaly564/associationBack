import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const page = pageParam ? parseInt(pageParam, 10) : NaN;
    const limit = limitParam ? parseInt(limitParam, 10) : NaN;

    const hasValidPagination = Number.isFinite(page) && page > 0 && Number.isFinite(limit) && limit > 0;

    const baseSelect = `SELECT p.*, pc.name as category_name, pc.slug as category_slug, pc.color as category_color
       FROM projects p
       LEFT JOIN project_categories pc ON p.category_id = pc.id`;

    if (hasValidPagination) {
      const offset = (page - 1) * limit;

      const dataQuery = `${baseSelect}
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`;

      const [dataResult, countResult] = await Promise.all([
        pool.query(dataQuery, [limit, offset]),
        pool.query('SELECT COUNT(*)::int AS count FROM projects'),
      ]);

      const total = countResult.rows[0]?.count ?? 0;

      return NextResponse.json({
        items: dataResult.rows,
        total,
        page,
        limit,
      });
    }

    const query = `${baseSelect}
       ORDER BY p.created_at DESC`;
    const result = await pool.query(query);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    // column missing -> add it (non‑paginated legacy path)
    if (error.code === '42703' && /category_id/.test(error.message)) {
      try {
        await pool.query(
          `ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES project_categories(id) ON DELETE SET NULL`
        );
        console.warn('Added missing category_id column to projects table.');
        const result2 = await pool.query(`SELECT p.*, pc.name as category_name, pc.slug as category_slug, pc.color as category_color
       FROM projects p
       LEFT JOIN project_categories pc ON p.category_id = pc.id
       ORDER BY p.created_at DESC`);
        return NextResponse.json(result2.rows);
      } catch (inner) {
        console.error('Failed to add category_id column:', inner);
      }
    }
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المشاريع', details: error.message },
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
      short_description,
      body: content,
      status = 'ongoing',
      category_id,
      start_date,
      end_date,
      location,
      show_on_home = false,
      priority = 0,
      file_url,
      file_name,
    } = body;

    const result = await pool.query(
      `INSERT INTO projects (title, slug, short_description, body, status, category_id, start_date, end_date, location, show_on_home, priority, file_url, file_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [title, slug, short_description, content, status, category_id || null, start_date, end_date, location, show_on_home, priority, file_url || null, file_name || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);
    if (error.code === '42703' && /file_url|file_name/.test(error.message)) {
      try {
        await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS file_url VARCHAR(500)`);
        await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS file_name VARCHAR(255)`);
        const bodyRetry = await request.clone().json();
        const b = bodyRetry as any;
        const result = await pool.query(
          `INSERT INTO projects (title, slug, short_description, body, status, category_id, start_date, end_date, location, show_on_home, priority, file_url, file_name)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING *`,
          [b.title, b.slug, b.short_description, b.body, b.status ?? 'ongoing', b.category_id || null, b.start_date, b.end_date, b.location, b.show_on_home ?? false, b.priority ?? 0, b.file_url || null, b.file_name || null]
        );
        return NextResponse.json(result.rows[0], { status: 201 });
      } catch (inner) {
        console.error('Failed to add file columns and retry:', inner);
      }
    }
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء المشروع' },
      { status: 500 }
    );
  }
}
