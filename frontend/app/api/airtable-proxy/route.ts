import { NextResponse } from 'next/server';

export async function GET() {
  // Redirect to the Airtable embed URL
  return NextResponse.redirect('https://airtable.com/embed/shrURkIj2ake8WV9F?backgroundColor=gray');
}
