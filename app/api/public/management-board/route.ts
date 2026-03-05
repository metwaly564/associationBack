import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get management board content
export async function GET() {
  try {
    // Get page content
    let pageContent: any[] = [];
    try {
      const contentResult = await pool.query(
        'SELECT * FROM management_board_content WHERE is_active = true ORDER BY order_index ASC'
      );
      pageContent = contentResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching management board page content:', error);
      }
    }
    
    // Get board members (from team_members where type = 'board')
    let members: any[] = [];
    try {
      const membersResult = await pool.query(
        `SELECT id, name, role, bio, image_url, order_index 
         FROM team_members 
         WHERE type = 'board'
         ORDER BY order_index ASC, name ASC`
      );
      members = membersResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching board members:', error);
      }
    }

    return NextResponse.json({
      content: pageContent,
      members: members,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public management board:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى مجلس الإدارة', content: [], members: [] },
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
