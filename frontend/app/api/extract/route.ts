import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

// Inline implementation of Gemini service
async function extractData(filePath: string) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');
    
    // Check if GEMINI_API_KEY is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // Use the Gemini API directly with fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `extract the pdf to json in a structure with the following keys: date in the form of MM/DD/YYYY, firstName, lastName, row1, row3, row4, row5.. row9. do integer values starting at date and moving down the page. for the rows with x define which column they are in i.e. row 2 the x is in column 3 so print the value of the column the x is in for the rows with an x value.`
              },
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: base64Data
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const textResponse = result.candidates[0].content.parts[0].text;
    console.log(textResponse);

    try {
      const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                        textResponse.match(/```\s*([\s\S]*?)\s*```/) || 
                        textResponse.match(/(\{[\s\S]*\})/);

      const JsonStr = jsonMatch ? jsonMatch[1] : textResponse;
      let parsedJson = JSON.parse(JsonStr);
      
      // Process any "column" values in the response
      for (const key in parsedJson) {
        if (typeof parsedJson[key] === 'string') {
          // Case 1: Exact match to "column" (case insensitive)
          if (parsedJson[key].toLowerCase() === 'column') {
            delete parsedJson[key];
          } 
          // Case 2: Value contains "column" followed by numbers (e.g., "column4")
          else {
            const columnWithNumberMatch = parsedJson[key].match(/^column(\d+)$/i);
            if (columnWithNumberMatch) {
              const columnNumber = columnWithNumberMatch[1];
              parsedJson[key] = columnNumber;
            }
          }
        }
      }
      
      return parsedJson;
    } catch (jsonError) {
      console.error('Error parsing JSON from Gemini response:', jsonError);
      throw new Error('Failed to parse JSON from Gemini response');
    }
  } catch (error) {
    console.error('Error extracting data from PDF:', error);
    throw error;
  }
}

// Inline implementation of Airtable service
async function createRecord(data: any) {
  console.log('Creating record with data:', data);
  
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.BASE_ID || 'appZqxR0t6GigXUMt';
  const TABLE_ID = process.env.TABLE_ID || 'tblWzZCcbxGzWOBWM';
  
  if (!AIRTABLE_API_KEY) {
    throw new Error('AIRTABLE_API_KEY is not set in environment variables');
  }
  
  const fields = {
    'Date': data.date || '',
    'First Name': data.firstName || '',
    'Last Name': data.lastName || '',
    'My English has improved because of this English class at RIT.': data.row1 || '',
    'Thanks to attending this program, I feel more confident using English in my daily life.': data.row2 || '',
    'The English lessons are right for my level of reading, writing, speaking, and listening.': data.row3 || '',
    'My teacher continues on a topic until I fully understand and then moves to the next lesson/topic.': data.row4 || '',
    'What can RIT do to help you?': data.row5 || '',
    'RIT staff make e feel welcome.': data.row6 || '', 
    'In this program, I have learned about other cultures.': data.row7 || '',
    'In this program, I made friends from other countries.': data.row8 || '',
    'In this program, I have learned more about technology (phones, computers).': data.row9 || '', 
  };

  try {
    console.log(`Making request to Airtable with API key: ${AIRTABLE_API_KEY.substring(0, 5)}...`);
    
    const response = await axios.post(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`,
      { fields },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Airtable response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating record in Airtable:', error);
    throw error;
  }
}

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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename
    const filename = `${Date.now()}-${file.name}`;
    let filepath = path.join('/tmp', filename);
    
    try {
      // Ensure /tmp directory exists in Replit environment
      await writeFile(filepath, buffer);
    } catch (writeError) {
      console.error('Error writing file:', writeError);
      // Try an alternative location if /tmp fails
      filepath = path.join(process.cwd(), 'uploads', filename);
      await writeFile(filepath, buffer);
    }
    
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
