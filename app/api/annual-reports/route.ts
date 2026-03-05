import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - List annual reports
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching annual reports...');
    
    const result = await pool.query(
      `SELECT * FROM annual_reports 
       ORDER BY year DESC, order_index ASC`
    );

    console.log(`✅ Found ${result.rows.length} annual reports`);

    return NextResponse.json({
      reports: result.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('❌ Error fetching annual reports:', error);
    
    if (error.code === '42P01') {
      console.log('⚠️  Table does not exist yet');
      return NextResponse.json({
        reports: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب التقارير السنوية' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// POST - Create annual report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, year, file_url, file_name, cover_image_url, order_index, is_active } = body;

    console.log('📝 Creating annual report:', { title, year, file_url });

    // Validate required fields
    if (!title || !year || !file_url) {
      return NextResponse.json(
        { error: 'العنوان والسنة ورابط الملف مطلوبة جميعاً' },
        { status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    const result = await pool.query(
      `INSERT INTO annual_reports 
       (title, description, year, file_url, file_name, cover_image_url, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title,
        description || null,
        year,
        file_url || null,
        file_name || null,
        cover_image_url || null,
        order_index || 0,
        is_active !== false,
      ]
    );

    console.log('✅ Report created successfully:', result.rows[0]);

    return NextResponse.json({ report: result.rows[0] }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('❌ Error creating annual report:', error);
    
    // Return a more detailed error message
    const errorMessage = error.message || 'حدث خطأ أثناء إنشاء التقرير السنوي';
    const errorDetails = error.detail || error.message;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
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
