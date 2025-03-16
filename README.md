# RIT AI Form Extractor

A web application that extracts data from PDF forms using Google's Gemini AI and stores it in Airtable.

## Features

- Upload PDF forms for data extraction
- Process forms using Google's Gemini AI
- Store extracted data in Airtable
- View data in an embedded Airtable view

## Project Structure

- **RITAgnetBackend**: Node.js backend for processing PDFs and interacting with Airtable
- **frontend/ritagentfrontend**: Next.js frontend for user interface

## Prerequisites

- Node.js 18+ and npm
- Google Gemini AI API key
- Airtable API key and access to a base

## Environment Variables

Create a `.env` file in the `RITAgnetBackend` directory with the following variables:

```
GEMINI_API_KEY=your_gemini_api_key
AIRTABLE_API_KEY=your_airtable_api_key
BASE_ID=your_airtable_base_id
TABLE_ID=your_airtable_table_id
PORT=3000
```

## Local Development

### Backend Setup

```bash
cd RITAgnetBackend
npm install
npm start
```

The backend server will run on http://localhost:3000.

### Frontend Setup

```bash
cd frontend/ritagentfrontend
npm install
npm run dev
```

The frontend will run on http://localhost:3001 (or another port if 3000 is in use).

## Deployment

This application can be deployed on Replit. See [REPLIT_DEPLOYMENT.md](./REPLIT_DEPLOYMENT.md) for detailed deployment instructions.

## API Endpoints

- `POST /api/extract`: Upload and process a PDF form
- `GET /health`: Health check endpoint

## Technologies Used

- **Backend**: Node.js, Express, Multer
- **Frontend**: Next.js, React, Tailwind CSS
- **AI**: Google Gemini AI
- **Database**: Airtable
- **Deployment**: Replit

## License

MIT