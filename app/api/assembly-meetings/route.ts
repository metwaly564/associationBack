import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - List assembly meetings
export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(
      'SELECT * FROM assembly_meetings ORDER BY meeting_date DESC, order_index ASC'
    );

    return NextResponse.json({
      meetings: result.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching assembly meetings:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json({
        meetings: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب اجتماعات الجمعية العمومية' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// POST - Create assembly meeting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, meeting_date, file_url, file_name, meeting_number, order_index, is_active } = body;

    const result = await pool.query(
      `INSERT INTO assembly_meetings 
       (title, description, meeting_date, file_url, file_name, meeting_number, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title,
        description,
        meeting_date || null,
        file_url || null,
        file_name || null,
        meeting_number || null,
        order_index || 0,
        is_active !== false,
      ]
    );

    return NextResponse.json({ meeting: result.rows[0] }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error creating assembly meeting:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء اجتماع الجمعية العمومية', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
