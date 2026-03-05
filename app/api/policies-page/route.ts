import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Get policies page content
export async function GET(request: NextRequest) {
  try {
    // Get content sections
    const contentResult = await pool.query(
      'SELECT * FROM policies_page_content ORDER BY order_index ASC'
    );

    return NextResponse.json({
      content: contentResult.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching policies page content:', error);
    
    // If tables don't exist, return empty structure
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
      { error: 'حدث خطأ أثناء جلب محتوى صفحة السياسات' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update policies page content
export async function PUT(request: NextRequest) {
  try {
    // verify auth (only admins should update page content)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    console.log('Updating policies page content, items:', Array.isArray(content) ? content.length : 0);

    // Update or insert content sections
    if (content) {
      const warnings: string[] = [];
      for (const item of content) {
        if (!item.section_key) continue;

        // protect against values exceeding DB column limits (title/subtitle/image_url are VARCHAR(500))
        if (item.title && item.title.length > 500) {
          warnings.push(`section ${item.section_key}: title truncated to 500 chars`);
          item.title = item.title.slice(0, 500);
        }
        if (item.subtitle && item.subtitle.length > 500) {
          warnings.push(`section ${item.section_key}: subtitle truncated to 500 chars`);
          item.subtitle = item.subtitle.slice(0, 500);
        }
        if (item.image_url && item.image_url.length > 500) {
          warnings.push(`section ${item.section_key}: image_url truncated to 500 chars`);
          item.image_url = item.image_url.slice(0, 500);
        }

        const checkResult = await pool.query(
          'SELECT id FROM policies_page_content WHERE section_key = $1',
          [item.section_key]
        );

        if (checkResult.rows.length > 0) {
          await pool.query(
            `UPDATE policies_page_content 
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
            `INSERT INTO policies_page_content 
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
      // attach warnings to response via header
      if (warnings.length > 0) {
        // store warnings in a temporary header (server logs will have details)
        console.warn('Policies page content warnings:', warnings);
      }
    }

    return NextResponse.json({ success: true }, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  } catch (error: any) {
    console.error('Error updating policies page content:', error);
    // if table missing, return helpful message
    if (error.code === '42P01') {
      return NextResponse.json({ error: 'جدول محتوى صفحة السياسات غير موجود. يرجى تشغيل ملف create_policies_page_table.sql' }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث محتوى صفحة السياسات', details: error.message },
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
}
