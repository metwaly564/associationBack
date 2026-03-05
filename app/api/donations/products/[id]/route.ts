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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const result = await pool.query('SELECT * FROM donation_products WHERE id = $1', [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'منتج التبرع غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching donation product:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب منتج التبرع' },
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
      is_active,
      order_index,
      image_url,
    } = body;

    if (!title || !description || !donation_type) {
      return NextResponse.json(
        { error: 'العنوان والوصف ونوع التبرع مطلوبة' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE donation_products 
       SET title = $1, description = $2, donation_type = $3, suggested_amount = $4, 
           min_amount = $5, is_active = $6, order_index = $7, image_url = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [title, description, donation_type, suggested_amount, min_amount, is_active, order_index, image_url, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'منتج التبرع غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating donation product:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث منتج التبرع' },
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

    const result = await pool.query('DELETE FROM donation_products WHERE id = $1 RETURNING id', [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'منتج التبرع غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error deleting donation product:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف منتج التبرع' },
      { status: 500 }
    );
  }
}
