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
      'SELECT * FROM donation_products ORDER BY order_index, created_at DESC'
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching donation products:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب منتجات التبرع' },
      { status: 500 }
    );
  }
}

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
    const {
      title,
      description,
      donation_type,
      suggested_amount,
      min_amount,
      is_active = true,
      order_index = 0,
      image_url,
    } = body;

    if (!title || !description || !donation_type) {
      return NextResponse.json(
        { error: 'العنوان والوصف ونوع التبرع مطلوبة' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO donation_products (title, description, donation_type, suggested_amount, min_amount, is_active, order_index, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description, donation_type, suggested_amount, min_amount, is_active, order_index, image_url]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating donation product:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء منتج التبرع' },
      { status: 500 }
    );
  }
}
