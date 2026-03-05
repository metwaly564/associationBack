import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    const result = await pool.query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const searchTerm = `%${query.trim()}%`;
    const results: any[] = [];

    // Search in news
    try {
      const newsResult = await pool.query(
        `SELECT id, title, excerpt, 'news' as type, slug
         FROM news 
         WHERE title ILIKE $1 OR body ILIKE $1 OR excerpt ILIKE $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [searchTerm]
      );
      newsResult.rows.forEach(row => {
        results.push({
          type: 'news',
          id: row.id,
          title: row.title,
          description: row.excerpt,
          url: `/news`,
        });
      });
    } catch (error: any) {
      if (error.code !== '42P01') console.error('Error searching news:', error);
    }

    // Search in projects
    try {
      const projectsResult = await pool.query(
        `SELECT 
            id, 
            title, 
            short_description, 
            body,
            file_url,
            file_name,
            'projects' as type, 
            slug
         FROM projects 
         WHERE title ILIKE $1 
            OR body ILIKE $1 
            OR short_description ILIKE $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [searchTerm]
      );
      projectsResult.rows.forEach(row => {
        results.push({
          type: 'projects',
          id: row.id,
          title: row.title,
          description: row.short_description,
          url: `/projects/${row.id}`,
          file_url: row.file_url,      // ✅ أضيفي هذا
          file_name: row.file_name,    // ✅ وهذا
        });
      });
    } catch (error: any) {
      if (error.code !== '42P01') console.error('Error searching projects:', error);
    }

    // Search in static pages
    try {
      const pagesResult = await pool.query(
        `SELECT id, title, summary, 'pages' as type, slug
         FROM static_pages 
         WHERE title ILIKE $1 OR body ILIKE $1 OR summary ILIKE $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [searchTerm]
      );
      pagesResult.rows.forEach(row => {
        results.push({
          type: 'pages',
          id: row.id,
          title: row.title,
          description: row.summary,
          url: `/pages`,
        });
      });
    } catch (error: any) {
      if (error.code !== '42P01') console.error('Error searching pages:', error);
    }

    // Search in team members
    try {
      const teamResult = await pool.query(
        `SELECT id, name, role, bio, 'team' as type
         FROM team_members 
         WHERE name ILIKE $1 OR role ILIKE $1 OR bio ILIKE $1
         ORDER BY order_index, name
         LIMIT 20`,
        [searchTerm]
      );
      teamResult.rows.forEach(row => {
        results.push({
          type: 'team',
          id: row.id,
          title: `${row.name} - ${row.role}`,
          description: row.bio,
          url: `/team/${row.id}`,
        });
      });
    } catch (error: any) {
      if (error.code !== '42P01') console.error('Error searching team:', error);
    }

    // Search in association members
    try {
      const membersResult = await pool.query(
        `SELECT id, name, position, 'members' as type
         FROM association_members 
         WHERE name ILIKE $1 OR position ILIKE $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [searchTerm]
      );
      membersResult.rows.forEach(row => {
        results.push({
          type: 'members',
          id: row.id,
          title: `${row.name} - ${row.position}`,
          description: row.position,
          url: `/members`,
        });
      });
    } catch (error: any) {
      if (error.code !== '42P01') console.error('Error searching members:', error);
    }

    // Search in donations
    try {
      const donationsResult = await pool.query(
        `SELECT id, donor_name, amount, notes, 'donations' as type
         FROM donations 
         WHERE donor_name ILIKE $1 OR notes ILIKE $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [searchTerm]
      );
      donationsResult.rows.forEach(row => {
        results.push({
          type: 'donations',
          id: row.id,
          title: `تبرع من ${row.donor_name} - ${row.amount} ر.س`,
          description: row.notes,
          url: `/donations/list`,
          metadata: { amount: row.amount },
        });
      });
    } catch (error: any) {
      if (error.code !== '42P01') console.error('Error searching donations:', error);
    }

    // Search in donors
    try {
      const donorsResult = await pool.query(
        `SELECT id, name, email, phone, 'donors' as type
         FROM donors 
         WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [searchTerm]
      );
      donorsResult.rows.forEach(row => {
        results.push({
          type: 'donors',
          id: row.id,
          title: row.name,
          description: `${row.email || ''} ${row.phone || ''}`.trim(),
          url: `/donors`,
        });
      });
    } catch (error: any) {
      if (error.code !== '42P01') console.error('Error searching donors:', error);
    }

    // Search in membership applications
    try {
      const membershipAppsResult = await pool.query(
        `SELECT id, name, email, phone, 'applications' as type
         FROM membership_applications 
         WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [searchTerm]
      );
      membershipAppsResult.rows.forEach(row => {
        results.push({
          type: 'applications',
          id: row.id,
          title: `طلب عضوية - ${row.name}`,
          description: `${row.email || ''} ${row.phone || ''}`.trim(),
          url: `/membership-applications`,
        });
      });
    } catch (error: any) {
      if (error.code !== '42P01') console.error('Error searching membership applications:', error);
    }

    // Search in job applications
    try {
      const jobAppsResult = await pool.query(
        `SELECT id, name, email, phone, 'applications' as type
         FROM job_applications 
         WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [searchTerm]
      );
      jobAppsResult.rows.forEach(row => {
        results.push({
          type: 'applications',
          id: row.id,
          title: `طلب وظيفة - ${row.name}`,
          description: `${row.email || ''} ${row.phone || ''}`.trim(),
          url: `/jobs`,
        });
      });
    } catch (error: any) {
      if (error.code !== '42P01') console.error('Error searching job applications:', error);
    }

    // Search in volunteering applications
    try {
      const volunteeringAppsResult = await pool.query(
        `SELECT id, name, email, phone, 'applications' as type
         FROM volunteering_applications 
         WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [searchTerm]
      );
      volunteeringAppsResult.rows.forEach(row => {
        results.push({
          type: 'applications',
          id: row.id,
          title: `طلب تطوع - ${row.name}`,
          description: `${row.email || ''} ${row.phone || ''}`.trim(),
          url: `/volunteering-applications`,
        });
      });
    } catch (error: any) {
      if (error.code !== '42P01') console.error('Error searching volunteering applications:', error);
    }

    // Search in partnership requests
    try {
      const partnershipResult = await pool.query(
        `SELECT id, name, email, phone, 'applications' as type
         FROM partnership_requests 
         WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [searchTerm]
      );
      partnershipResult.rows.forEach(row => {
        results.push({
          type: 'applications',
          id: row.id,
          title: `طلب شراكة - ${row.name}`,
          description: `${row.email || ''} ${row.phone || ''}`.trim(),
          url: `/partnership`,
        });
      });
    } catch (error: any) {
      if (error.code !== '42P01') console.error('Error searching partnership requests:', error);
    }

    // Search in jobs
    try {
      const jobsResult = await pool.query(
        `SELECT id, title, description, 'content' as type
         FROM jobs 
         WHERE title ILIKE $1 OR description ILIKE $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [searchTerm]
      );
      jobsResult.rows.forEach(row => {
        results.push({
          type: 'content',
          id: row.id,
          title: `وظيفة: ${row.title}`,
          description: row.description,
          url: `/jobs`,
        });
      });
    } catch (error: any) {
      if (error.code !== '42P01') console.error('Error searching jobs:', error);
    }

    // Search in committees
    try {
      const committeesResult = await pool.query(
        `SELECT id, name, description, 'content' as type
         FROM committees 
         WHERE name ILIKE $1 OR description ILIKE $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [searchTerm]
      );
      committeesResult.rows.forEach(row => {
        results.push({
          type: 'content',
          id: row.id,
          title: `لجنة: ${row.name}`,
          description: row.description,
          url: `/committees`,
        });
      });
    } catch (error: any) {
      if (error.code !== '42P01') console.error('Error searching committees:', error);
    }

    // Search in homepage content
    try {
      const homepageResult = await pool.query(
        `SELECT id, section_key, title, subtitle, description, 'content' as type
         FROM homepage_content 
         WHERE title ILIKE $1 OR subtitle ILIKE $1 OR description ILIKE $1 OR content ILIKE $1
         ORDER BY order_index
         LIMIT 20`,
        [searchTerm]
      );
      homepageResult.rows.forEach(row => {
        results.push({
          type: 'content',
          id: row.id,
          title: `${row.title || row.section_key}`,
          description: row.description || row.subtitle,
          url: `/homepage`,
        });
      });
    } catch (error: any) {
      if (error.code !== '42P01') console.error('Error searching homepage content:', error);
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error in search:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء البحث' },
      { status: 500 }
    );
  }
}
