import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get committees content
export async function GET() {
  try {
    // Get page content
    let pageContent: any[] = [];
    try {
      const contentResult = await pool.query(
        'SELECT * FROM committees_page_content WHERE is_active = true ORDER BY order_index ASC'
      );
      pageContent = contentResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching committees page content:', error);
      }
    }
    
    // Get committees with members and tasks
    let committees: any[] = [];
    try {
      const committeesResult = await pool.query(
        `SELECT c.* FROM committees c 
         WHERE c.is_active = true 
         ORDER BY c.order_index ASC, c.name ASC`
      );
      
      // For each committee, get members and tasks
      for (const committee of committeesResult.rows) {
        const membersResult = await pool.query(
          `SELECT id, name, role, position, order_index 
           FROM committee_members 
           WHERE committee_id = $1 AND is_active = true 
           ORDER BY order_index ASC, name ASC`,
          [committee.id]
        );
        
        const tasksResult = await pool.query(
          `SELECT id, task_text, order_index 
           FROM committee_tasks 
           WHERE committee_id = $1 AND is_active = true 
           ORDER BY order_index ASC`,
          [committee.id]
        );
        
        committees.push({
          ...committee,
          members: membersResult.rows,
          tasks: tasksResult.rows,
        });
      }
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching committees:', error);
      }
    }

    // Get supervising authorities
    let supervisingAuthorities: any[] = [];
    try {
      const authoritiesResult = await pool.query(
        `SELECT id, name, image_url, icon_name, website_url, order_index
         FROM supervising_authorities 
         WHERE is_active = true 
         ORDER BY order_index ASC, name ASC`
      );
      supervisingAuthorities = authoritiesResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching supervising authorities:', error);
      }
    }

    return NextResponse.json({
      content: pageContent,
      committees: committees,
      supervisingAuthorities: supervisingAuthorities,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public committees:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى اللجان', content: [], committees: [] },
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
