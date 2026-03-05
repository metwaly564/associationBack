import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get programs page content
export async function GET(request: NextRequest) {
  try {
    // Get content sections
    const contentResult = await pool.query(
      'SELECT * FROM programs_page_content WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get categories
    const categoriesResult = await pool.query(
      'SELECT * FROM programs_page_categories WHERE is_active = true ORDER BY order_index ASC'
    );

    return NextResponse.json({
      content: contentResult.rows,
      categories: categoriesResult.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching programs page content:', error);
    
    // If tables don't exist, return empty structure
    if (error.code === '42P01') {
      return NextResponse.json({
        content: [],
        categories: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى صفحة البرامج والمشاريع' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update programs page content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, categories } = body;

    // Update or insert content sections
    if (content) {
      for (const item of content) {
        if (!item.section_key) continue;
        
        // Check if section exists
        const checkResult = await pool.query(
          'SELECT id FROM programs_page_content WHERE section_key = $1',
          [item.section_key]
        );
        
        if (checkResult.rows.length > 0) {
          // Update existing
          await pool.query(
            `UPDATE programs_page_content 
             SET title = $1, subtitle = $2, description = $3, order_index = $4, 
                 is_active = $5, updated_at = NOW()
             WHERE section_key = $6`,
            [
              item.title,
              item.subtitle,
              item.description,
              item.order_index || 0,
              item.is_active !== false,
              item.section_key,
            ]
          );
        } else {
          // Insert new
          await pool.query(
            `INSERT INTO programs_page_content 
             (section_key, title, subtitle, description, order_index, is_active)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              item.section_key,
              item.title,
              item.subtitle,
              item.description,
              item.order_index || 0,
              item.is_active !== false,
            ]
          );
        }
      }
    }

    // Delete and recreate categories
    if (categories) {
      await pool.query('DELETE FROM programs_page_categories');
      for (const category of categories) {
        await pool.query(
          `INSERT INTO programs_page_categories (category_key, label, order_index, is_active)
           VALUES ($1, $2, $3, $4)`,
          [
            category.category_key,
            category.label,
            category.order_index || 0,
            category.is_active !== false,
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
    console.error('Error updating programs page content:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث محتوى صفحة البرامج والمشاريع', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
