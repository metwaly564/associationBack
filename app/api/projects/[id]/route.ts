import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      `SELECT p.*, pc.name as category_name, pc.slug as category_slug, pc.color as category_color
       FROM projects p
       LEFT JOIN project_categories pc ON p.category_id = pc.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'المشروع غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المشروع' },
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
      short_description,
      body: content,
      status,
      category_id,
      start_date,
      end_date,
      location,
      show_on_home,
      priority,
      file_url,
      file_name,
    } = body;

    const result = await pool.query(
      `UPDATE projects 
       SET title = $1, slug = $2, short_description = $3, body = $4, status = $5, 
           category_id = $6, start_date = $7, end_date = $8, location = $9, 
           show_on_home = $10, priority = $11, file_url = $12, file_name = $13, updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [title, slug, short_description, content, status, category_id || null, start_date, end_date, location, show_on_home, priority, file_url ?? null, file_name ?? null, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'المشروع غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating project:', error);
    if (error.code === '42703' && /file_url|file_name/.test(error.message)) {
      try {
        await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS file_url VARCHAR(500)`);
        await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS file_name VARCHAR(255)`);
        const { id: id2 } = await params;
        const body = await request.clone().json();
        const b = body as any;
        const result = await pool.query(
          `UPDATE projects 
           SET title = $1, slug = $2, short_description = $3, body = $4, status = $5, 
               category_id = $6, start_date = $7, end_date = $8, location = $9, 
               show_on_home = $10, priority = $11, file_url = $12, file_name = $13, updated_at = NOW()
           WHERE id = $14
           RETURNING *`,
          [b.title, b.slug, b.short_description, b.body, b.status, b.category_id || null, b.start_date, b.end_date, b.location, b.show_on_home, b.priority, b.file_url ?? null, b.file_name ?? null, id2]
        );
        if (result.rows.length === 0) {
          return NextResponse.json({ error: 'المشروع غير موجود' }, { status: 404 });
        }
        return NextResponse.json(result.rows[0]);
      } catch (inner) {
        console.error('Failed to add file columns and retry:', inner);
      }
    }
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث المشروع' },
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
    console.log('Deleting project with id:', id);
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [
      id,
    ]);

    if (result.rows.length === 0) {
      console.warn('Attempted to delete non-existent project:', id);
      // treat as success to avoid confusing the client
      return NextResponse.json({ ok: true, message: 'المشروع غير موجود' });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المشروع', details: error.message },
      { status: 500 }
    );
  }
}
