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

// PUT - Update supervising authority
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
    const { name, image_url, icon_name, website_url, order_index, is_active } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'اسم الجهة المشرفة مطلوب' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE supervising_authorities 
       SET name = $1, image_url = $2, icon_name = $3, website_url = $4, 
           order_index = $5, is_active = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, image_url || null, icon_name || null, website_url || null, order_index || 0, is_active !== false, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الجهة المشرفة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating supervising authority:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الجهة المشرفة' },
      { status: 500 }
    );
  }
}

// DELETE - Delete supervising authority
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

    const result = await pool.query(
      'DELETE FROM supervising_authorities WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الجهة المشرفة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting supervising authority:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الجهة المشرفة' },
      { status: 500 }
    );
  }
}
