
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const folder = formData.get('folder'); 

    if (!imageFile || !folder) {
      return NextResponse.json(
        { error: 'Missing image file or folder' },
        { status: 400 }
      );
    }

    // Generate UUID file name with extension
    const ext = imageFile.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;

    // Define uploads folder dynamically
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const finalPath = path.join(uploadsDir, fileName);
    fs.writeFileSync(finalPath, buffer);

    console.log(`✅ File uploaded to /uploads/${folder}/`, fileName);

    return NextResponse.json({
      success: true,
      fileName,
      message: 'Image uploaded successfully',
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload image',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
