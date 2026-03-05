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

// GET - Get all membership applications (Admin only)
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = 'SELECT * FROM membership_applications';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    return NextResponse.json({
      applications: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching membership applications:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json({
        applications: [],
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب طلبات العضوية' },
      { status: 500 }
    );
  }
}

// PUT - Update membership application status (Admin only)
export async function PUT(request: NextRequest) {
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
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'الرجاء إرسال معرف الطلب والحالة' },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE membership_applications 
       SET status = $1, notes = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $4`,
      [status, notes || null, user.id, id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating membership application:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث طلب العضوية', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete membership application (Admin only)
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'الرجاء إرسال معرف الطلب' },
        { status: 400 }
      );
    }

    await pool.query('DELETE FROM membership_applications WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting membership application:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف طلب العضوية', details: error.message },
      { status: 500 }
    );
  }
}
