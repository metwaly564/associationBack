import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get membership page content
export async function GET(request: NextRequest) {
  try {
    // Get content sections
    const contentResult = await pool.query(
      'SELECT * FROM membership_page_content ORDER BY order_index ASC'
    );
    
    // Get membership types
    const typesResult = await pool.query(
      'SELECT * FROM membership_types ORDER BY order_index ASC'
    );

    return NextResponse.json({
      content: contentResult.rows,
      types: typesResult.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching membership page content:', error);
    
    // If tables don't exist, return empty structure
    if (error.code === '42P01') {
      return NextResponse.json({
        content: [],
        types: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى صفحة العضوية' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update membership page content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, types } = body;

    // Update or insert content sections
    if (content) {
      for (const item of content) {
        if (!item.section_key) continue;
        
        const checkResult = await pool.query(
          'SELECT id FROM membership_page_content WHERE section_key = $1',
          [item.section_key]
        );
        
        if (checkResult.rows.length > 0) {
          await pool.query(
            `UPDATE membership_page_content 
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
            `INSERT INTO membership_page_content 
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

    // Delete and recreate membership types
    if (types) {
      await pool.query('DELETE FROM membership_types');
      for (const type of types) {
        await pool.query(
          `INSERT INTO membership_types (title, icon_name, color, features, requirements, order_index, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            type.title,
            type.icon_name,
            type.color || 'emerald',
            JSON.stringify(type.features || []),
            JSON.stringify(type.requirements || []),
            type.order_index || 0,
            type.is_active !== false,
          ]
        );
      }
    }

    return NextResponse.json({ success: true }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error updating membership page content:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث محتوى صفحة العضوية', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
