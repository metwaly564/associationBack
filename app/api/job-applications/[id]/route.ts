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
    if (result.rows.length === 0) return null;
    return result.rows[0];
  } catch (error) {
    return null;
  }
}

// PUT - Update job application
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    await pool.query(
      `UPDATE job_applications 
       SET status = $1, notes = $2, updated_at = NOW()
       WHERE id = $3`,
      [status, notes || null, id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating job application:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث طلب الوظيفة', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete job application
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = await params;
    await pool.query('DELETE FROM job_applications WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting job application:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف طلب الوظيفة', details: error.message },
      { status: 500 }
    );
  }
}
