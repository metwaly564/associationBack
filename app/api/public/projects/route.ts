import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - لا يحتاج مصادقة
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT 
          p.id, 
          p.title, 
          p.slug, 
          p.short_description, 
          p.body, 
          p.status, 
          p.start_date, 
          p.end_date, 
          p.location, 
          p.show_on_home, 
          p.priority,
          p.file_url,          
          p.file_name,        
          pc.id as category_id, 
          pc.name as category_name, 
          pc.slug as category_slug, 
          pc.color as category_color, 
          pc.icon_name as category_icon
       FROM projects p
       LEFT JOIN project_categories pc ON p.category_id = pc.id
       WHERE p.status IN ('ongoing', 'completed')
       ORDER BY p.priority DESC, p.created_at DESC`
    );
    return NextResponse.json(result.rows, {
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error('Error fetching public projects:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المشاريع' },
      { 
        status: 500,
        headers: corsHeaders,
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
