import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'SELECT * FROM news_categories WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'التصنيف غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0], {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب التصنيف' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      slug,
      description,
      color,
      order_index,
      is_active,
    } = body;

    const result = await pool.query(
      `UPDATE news_categories 
       SET name = $1, slug = $2, description = $3, color = $4, 
           order_index = $5, is_active = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, slug, description || null, color, order_index, is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'التصنيف غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0], {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'التصنيف موجود بالفعل (الاسم أو الرابط مستخدم)' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث التصنيف', details: error.message },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if category is used in news
    const newsCheck = await pool.query(
      'SELECT COUNT(*) as count FROM news WHERE category = (SELECT slug FROM news_categories WHERE id = $1)',
      [id]
    );

    if (parseInt(newsCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف التصنيف لأنه مستخدم في أخبار موجودة' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM news_categories WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'التصنيف غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true }, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف التصنيف' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}
