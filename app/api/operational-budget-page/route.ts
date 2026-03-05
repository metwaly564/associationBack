import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get operational budget page content
export async function GET(request: NextRequest) {
  try {
    const contentResult = await pool.query(
      'SELECT * FROM operational_budget_page_content ORDER BY order_index ASC'
    );

    return NextResponse.json({
      content: contentResult.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching operational budget page content:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json({
        content: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى صفحة الخطة التشغيلية والموازنة' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update operational budget page content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (content) {
      for (const item of content) {
        if (!item.section_key) continue;
        
        const checkResult = await pool.query(
          'SELECT id FROM operational_budget_page_content WHERE section_key = $1',
          [item.section_key]
        );
        
        if (checkResult.rows.length > 0) {
          await pool.query(
            `UPDATE operational_budget_page_content 
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
            `INSERT INTO operational_budget_page_content 
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

    return NextResponse.json({ success: true }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error updating operational budget page content:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث محتوى صفحة الخطة التشغيلية والموازنة', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
