import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get featured news and projects for homepage
export async function GET() {
  try {
    // Get featured news (show_on_home = true, ordered by priority)
    const newsResult = await pool.query(
      `SELECT id, title, slug, excerpt, body, category, status, published_at, created_at, show_on_home, priority
       FROM news 
       WHERE status = 'published' AND show_on_home = true
       ORDER BY priority DESC, published_at DESC
       LIMIT 6`
    );
    
    // Get featured projects (show_on_home = true, ordered by priority)
    const projectsResult = await pool.query(
      `SELECT p.id, p.title, p.slug, p.short_description, p.body, p.status, 
              p.start_date, p.end_date, p.location, p.show_on_home, p.priority,
              pc.id as category_id, pc.name as category_name, pc.slug as category_slug, 
              pc.color as category_color, pc.icon_name as category_icon
       FROM projects p
       LEFT JOIN project_categories pc ON p.category_id = pc.id
       WHERE p.show_on_home = true
       ORDER BY p.priority DESC, p.created_at DESC
       LIMIT 6`
    );

    return NextResponse.json({
      news: newsResult.rows,
      projects: projectsResult.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching featured content:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المحتوى المميز' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders,
        },
      }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
