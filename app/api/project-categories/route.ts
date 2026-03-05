import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - List all project categories
export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(
      'SELECT * FROM project_categories ORDER BY order_index, created_at ASC'
    );
    return NextResponse.json(result.rows, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching project categories:', error);
    
    // Check if table doesn't exist
    if (error.code === '42P01') {
      return NextResponse.json(
        { 
          error: 'جدول تصنيفات المشاريع غير موجود. يرجى تشغيل ملف SQL لإنشاء الجدول.',
          details: 'قم بتشغيل: psql -U postgres -d association_db -f admin-cms/database/create_project_categories_table.sql'
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
        error: 'حدث خطأ أثناء جلب تصنيفات المشاريع',
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

// POST - Create new project category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      color = '#1890ff',
      icon_name,
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
      `INSERT INTO project_categories (name, slug, description, color, icon_name, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, slug, description || null, color, icon_name || null, order_index, is_active]
    );

    return NextResponse.json(result.rows[0], { 
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error creating project category:', error);
    
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
