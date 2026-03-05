import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    const result = await pool.query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// GET - List all supervising authorities
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const result = await pool.query(
      'SELECT * FROM supervising_authorities ORDER BY order_index ASC, name ASC'
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching supervising authorities:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الجهات المشرفة' },
      { status: 500 }
    );
  }
}

// POST - Create new supervising authority
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, image_url, icon_name, website_url, order_index, is_active } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'اسم الجهة المشرفة مطلوب' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO supervising_authorities (name, image_url, icon_name, website_url, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, image_url || null, icon_name || null, website_url || null, order_index || 0, is_active !== false]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating supervising authority:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      detail: error.detail,
      hint: error.hint,
    });
    
    // Check if table doesn't exist
    if (error.code === '42P01') {
      return NextResponse.json(
        { error: 'جدول الجهات المشرفة غير موجود. يرجى تشغيل ملف SQL: admin-cms/database/add_supervising_authorities_table.sql' },
        { status: 500 }
      );
    }
    
    // Return more detailed error message
    const errorMessage = error.detail || error.message || 'حدث خطأ أثناء إنشاء الجهة المشرفة';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
