import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { extname } from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> | { filename: string } }
) {
    try {
        const resolvedParams = await params;
        const filename = resolvedParams.filename;

        // Prevent directory traversal attacks
        if (filename.includes('..') || filename.includes('/')) {
            return new NextResponse('Invalid filename', { status: 400 });
        }

        const filepath = join(process.cwd(), 'public', 'uploads', filename);

        if (!existsSync(filepath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        const fileBuffer = await readFile(filepath);

        // Determine content type
        const ext = extname(filename).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.svg') contentType = 'image/svg+xml';
        else if (ext === '.pdf') contentType = 'application/pdf';

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
