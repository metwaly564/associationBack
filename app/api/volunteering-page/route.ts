import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get volunteering page content
export async function GET(request: NextRequest) {
  try {
    // Get content sections
    const contentResult = await pool.query(
      'SELECT * FROM volunteering_page_content WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get benefits
    const benefitsResult = await pool.query(
      'SELECT * FROM volunteering_benefits WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get opportunities
    const opportunitiesResult = await pool.query(
      'SELECT * FROM volunteering_opportunities WHERE is_active = true ORDER BY order_index ASC'
    );

    return NextResponse.json({
      content: contentResult.rows,
      benefits: benefitsResult.rows,
      opportunities: opportunitiesResult.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching volunteering page content:', error);
    
    // If tables don't exist, return empty structure
    if (error.code === '42P01') {
      return NextResponse.json({
        content: [],
        benefits: [],
        opportunities: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى صفحة التطوع' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update volunteering page content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, benefits, opportunities } = body;

    // Update or insert content sections
    if (content) {
      for (const item of content) {
        if (!item.section_key) continue;
        
        const checkResult = await pool.query(
          'SELECT id FROM volunteering_page_content WHERE section_key = $1',
          [item.section_key]
        );
        
        if (checkResult.rows.length > 0) {
          await pool.query(
            `UPDATE volunteering_page_content 
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
            `INSERT INTO volunteering_page_content 
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

    // Delete and recreate benefits
    if (benefits) {
      await pool.query('DELETE FROM volunteering_benefits');
      for (const benefit of benefits) {
        await pool.query(
          `INSERT INTO volunteering_benefits (title, description, icon_name, order_index, is_active)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            benefit.title,
            benefit.description,
            benefit.icon_name,
            benefit.order_index || 0,
            benefit.is_active !== false,
          ]
        );
      }
    }

    // Delete and recreate opportunities
    if (opportunities) {
      await pool.query('DELETE FROM volunteering_opportunities');
      for (const opp of opportunities) {
        await pool.query(
          `INSERT INTO volunteering_opportunities (title, description, duration, icon_name, order_index, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            opp.title,
            opp.description,
            opp.duration,
            opp.icon_name,
            opp.order_index || 0,
            opp.is_active !== false,
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
    console.error('Error updating volunteering page content:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث محتوى صفحة التطوع', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
