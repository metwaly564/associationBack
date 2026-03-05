import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - List all categories
export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(
      'SELECT * FROM news_categories ORDER BY order_index, created_at ASC'
    );
    return NextResponse.json(result.rows, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    console.error('Error details:', error.message, error.code);
    
    // Check if table doesn't exist
    if (error.code === '42P01') {
      return NextResponse.json(
        { 
          error: 'جدول التصنيفات غير موجود. يرجى تشغيل ملف SQL لإنشاء الجدول.',
          details: 'قم بتشغيل: psql -U postgres -d association_db -f admin-cms/database/create_categories_table.sql'
        },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'حدث خطأ أثناء جلب التصنيفات',
        details: error.message 
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      color = '#1890ff',
      order_index = 0,
      is_active = true,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'الاسم والرابط مطلوبان' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO news_categories (name, slug, description, color, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, slug, description || null, color, order_index, is_active]
    );

    return NextResponse.json(result.rows[0], { 
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'التصنيف موجود بالفعل (الاسم أو الرابط مستخدم)' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء التصنيف' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
