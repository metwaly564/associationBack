import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Get reports page content
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

    const contentResult = await pool.query(
      'SELECT * FROM reports_page_content WHERE is_active = true ORDER BY order_index ASC'
    );

    return NextResponse.json({
      content: contentResult.rows,
    });
  } catch (error: any) {
    console.error('Error fetching reports page content:', error);
    
    // If table doesn't exist, return empty structure
    if (error.code === '42P01') {
      return NextResponse.json({
        content: [],
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى صفحة التقارير' },
      { status: 500 }
    );
  }
}

// PUT - Update reports page content
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
    const { content } = body;

    // Update or insert content sections
    if (content) {
      for (const item of content) {
        if (!item.section_key) continue;
        
        const checkResult = await pool.query(
          'SELECT id FROM reports_page_content WHERE section_key = $1',
          [item.section_key]
        );
        
        if (checkResult.rows.length > 0) {
          await pool.query(
            `UPDATE reports_page_content 
             SET title = $1, subtitle = $2, description = $3, content = $4, 
                 image_url = $5, order_index = $6, is_active = $7, updated_at = NOW()
             WHERE section_key = $8`,
            [
              item.title,
              item.subtitle,
              item.description,
              item.content,
              item.image_url,
              item.order_index || 0,
              item.is_active !== false,
              item.section_key,
            ]
          );
        } else {
          await pool.query(
            `INSERT INTO reports_page_content 
             (section_key, title, subtitle, description, content, image_url, order_index, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              item.section_key,
              item.title,
              item.subtitle,
              item.description,
              item.content,
              item.image_url,
              item.order_index || 0,
              item.is_active !== false,
            ]
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating reports page content:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث محتوى صفحة التقارير', details: error.message },
      { status: 500 }
    );
  }
}
