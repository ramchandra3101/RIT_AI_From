import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { extractData } from '../../../utils/geminiService';
import { createRecord } from '../../../utils/airTableService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file uploaded' },
        { status: 400 }
      );
    }

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    try {
      await writeFile(path.join(uploadsDir, 'test.txt'), 'test');
    } catch (error) {
      // Directory doesn't exist, create it
      // Note: In Vercel, we'll use tmp storage instead
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join('/tmp', filename);
    
    // Write file to disk (in Vercel, this will be in /tmp)
    await writeFile(filepath, buffer);
    
    // Process PDF with Gemini
    const jsonData = await extractData(filepath);
    
    // Create record in Airtable
    try {
      const airtableResponse = await createRecord(jsonData);
      console.log('Airtable response:', airtableResponse);
    } catch (airtableError) {
      console.error('Error saving to Airtable:', airtableError);
      // Continue execution even if Airtable fails
    }
    
    // Return the extracted JSON data
    return NextResponse.json({ 
      message: 'PDF processed successfully',
      data: jsonData
    });
    
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process the PDF file' },
      { status: 500 }
    );
  }
}
