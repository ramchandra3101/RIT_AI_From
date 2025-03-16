import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// This is a proxy API route that forwards requests to the backend server
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Forward the request to the backend server
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    
    // Create a new FormData object to send to the backend
    const backendFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }
    
    // Make the request to the backend
    const response = await axios.post(
      `${backendUrl}/api/extract`, 
      backendFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      }
    );
    
    // Return the response from the backend
    return NextResponse.json(response.data);
    
  } catch (error) {
    console.error('Error proxying request to backend:', error);
    
    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The backend responded with an error status
        return NextResponse.json(
          { error: error.response.data.error || 'Backend server error' },
          { status: error.response.status }
        );
      } else if (error.request) {
        // The request was made but no response was received
        return NextResponse.json(
          { error: 'No response from backend server' },
          { status: 503 }
        );
      } else {
        // Something happened in setting up the request
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }
    
    // Generic error handling
    return NextResponse.json(
      { error: 'Failed to process the request' },
      { status: 500 }
    );
  }
}
