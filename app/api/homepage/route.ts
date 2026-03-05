import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get all homepage content
export async function GET(request: NextRequest) {
  try {
    // Get all sections
    const sectionsResult = await pool.query(
      'SELECT * FROM homepage_content WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Parse metadata JSON for sections
    const sections = sectionsResult.rows.map((section: any) => {
      if (section.metadata && typeof section.metadata === 'string') {
        try {
          section.metadata = JSON.parse(section.metadata);
        } catch (e) {
          section.metadata = null;
        }
      }
      return section;
    });
    
    // Get stats
    const statsResult = await pool.query(
      'SELECT * FROM homepage_stats WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get values
    const valuesResult = await pool.query(
      'SELECT * FROM homepage_values WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get partners
    const partnersResult = await pool.query(
      'SELECT * FROM homepage_partners WHERE is_active = true ORDER BY order_index ASC'
    );

    return NextResponse.json({
      sections: sections,
      stats: statsResult.rows,
      values: valuesResult.rows,
      partners: partnersResult.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching homepage content:', error);
    
    // If tables don't exist, return empty structure
    if (error.code === '42P01') {
      return NextResponse.json({
        sections: [],
        stats: [],
        values: [],
        partners: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى الصفحة الرئيسية' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update homepage content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sections, stats, values, partners } = body;

    // Update or insert sections
    if (sections) {
      for (const section of sections) {
        if (!section.section_key) continue;
        
        // Check if section exists
        const checkResult = await pool.query(
          'SELECT id FROM homepage_content WHERE section_key = $1',
          [section.section_key]
        );
        
        if (checkResult.rows.length > 0) {
          // Update existing
          await pool.query(
            `UPDATE homepage_content 
             SET title = $1, subtitle = $2, description = $3, content = $4, 
                 image_url = $5, button_text = $6, button_link = $7, 
                 order_index = $8, is_active = $9, metadata = $10, updated_at = NOW()
             WHERE section_key = $11`,
            [
              section.title,
              section.subtitle,
              section.description,
              section.content,
              section.image_url,
              section.button_text,
              section.button_link,
              section.order_index || 0,
              section.is_active !== false,
              section.metadata && typeof section.metadata === 'object' 
                ? JSON.stringify(section.metadata) 
                : (section.metadata || null),
              section.section_key,
            ]
          );
        } else {
          // Insert new
          await pool.query(
            `INSERT INTO homepage_content 
             (section_key, title, subtitle, description, content, image_url, 
              button_text, button_link, order_index, is_active, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              section.section_key,
              section.title,
              section.subtitle,
              section.description,
              section.content,
              section.image_url,
              section.button_text,
              section.button_link,
              section.order_index || 0,
              section.is_active !== false,
              section.metadata && typeof section.metadata === 'object' 
                ? JSON.stringify(section.metadata) 
                : (section.metadata || null),
            ]
          );
        }
      }
    }

    // Delete and recreate stats
    if (stats) {
      await pool.query('DELETE FROM homepage_stats');
      for (const stat of stats) {
        await pool.query(
          `INSERT INTO homepage_stats (label, value, icon_name, order_index, is_active)
           VALUES ($1, $2, $3, $4, $5)`,
          [stat.label, stat.value, stat.icon_name, stat.order_index || 0, stat.is_active !== false]
        );
      }
    }

    // Delete and recreate values
    if (values) {
      await pool.query('DELETE FROM homepage_values');
      for (const value of values) {
        await pool.query(
          `INSERT INTO homepage_values (title, description, icon_name, order_index, is_active)
           VALUES ($1, $2, $3, $4, $5)`,
          [value.title, value.description, value.icon_name, value.order_index || 0, value.is_active !== false]
        );
      }
    }

    // Delete and recreate partners
    if (partners) {
      await pool.query('DELETE FROM homepage_partners');
      for (const partner of partners) {
        await pool.query(
          `INSERT INTO homepage_partners (name, image_url, website_url, order_index, is_active)
           VALUES ($1, $2, $3, $4, $5)`,
          [partner.name, partner.image_url, partner.website_url, partner.order_index || 0, partner.is_active !== false]
        );
      }
    }

    return NextResponse.json({ success: true }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error updating homepage content:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث محتوى الصفحة الرئيسية', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
