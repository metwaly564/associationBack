import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      
      // Get user from database
      const result = await pool.query(
        'SELECT id, email, name FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'المستخدم غير موجود' },
          { status: 404 }
        );
      }

      return NextResponse.json(result.rows[0]);
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'رمز غير صالح' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحقق من الهوية' },
      { status: 500 }
    );
  }
}
