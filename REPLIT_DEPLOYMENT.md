# Deployment Guide for RIT AI Form Extractor on Replit

This guide will walk you through deploying the RIT AI Form Extractor application on Replit.

## Prerequisites

1. A GitHub account with your repository pushed
2. A Replit account (you can sign up at [replit.com](https://replit.com))
3. API keys for the following services:
   - Gemini AI API key
   - Airtable API key
   - Airtable Base ID and Table ID

## Deployment Steps

### 1. Import Your Repository to Replit

1. Log in to your Replit account
2. Click "Create" > "Import from GitHub"
3. Paste your GitHub repository URL
4. Click "Import from GitHub"

### 2. Configure Environment Variables

1. In your Replit project, click on the "Secrets" tool in the left sidebar (lock icon)
2. Add the following environment variables:
   - `GEMINI_API_KEY`: Your Google Gemini AI API key
   - `AIRTABLE_API_KEY`: Your Airtable API key
   - `BASE_ID`: Your Airtable Base ID (default: appZqxR0t6GigXUMt)
   - `TABLE_ID`: Your Airtable Table ID (default: tblWzZCcbxGzWOBWM)
   - `PORT`: Set to `3000` (or any port you prefer)

### 3. Install Dependencies

In the Replit Shell, run:

```bash
cd RITAgnetBackend && npm install
cd ../frontend/ritagentfrontend && npm install
```

### 4. Configure CORS for the Backend

Since your frontend and backend will be on different Replit instances, you need to update the CORS configuration in your backend.

Edit the `RITAgnetBackend/server.js` file to update the CORS settings:

```javascript
// Update the CORS configuration
app.use(cors({
  origin: '*', // In production, specify your frontend Replit URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 5. Update API Endpoint in Frontend

Edit the `frontend/ritagentfrontend/app/page.tsx` file to update the API endpoint to point to your backend Replit URL:

```javascript
// Update the API endpoint to your backend Replit URL
await axios.post('https://your-backend-replit-url.replit.app/api/extract', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
```

### 6. Deploy Backend on Replit

1. Make sure your `.replit` file has the correct run command:
   ```
   run = "cd RITAgnetBackend && npm start"
   ```

2. Click the "Run" button at the top of the Replit interface
3. Your backend will start running and be accessible at your Replit URL

### 7. Deploy Frontend on a Separate Replit

1. Create a new Replit for the frontend
2. Import the same GitHub repository
3. Update the `.replit` file to run the frontend:
   ```
   run = "cd frontend/ritagentfrontend && npm run dev"
   ```
4. Click the "Run" button

### 8. Connect Your Custom Domain (Optional)

If you have a custom domain:

1. Go to your Replit project settings
2. Navigate to the "Custom Domains" section
3. Follow the instructions to connect your domain

## Troubleshooting

- **CORS Issues**: Ensure your CORS settings in the backend allow requests from your frontend Replit URL
- **API Connection**: Verify that your frontend is using the correct backend Replit URL
- **Environment Variables**: Check that all required environment variables are set in the Secrets panel

## Updating Your Deployment

To update your deployment after making changes:

1. Push your changes to GitHub
2. In Replit, pull the latest changes using the Git panel
3. Restart your Replit by clicking the "Stop" and then "Run" buttons

## Local Development

To run the application locally:

```bash
# Terminal 1 - Backend
cd RITAgnetBackend
npm start

# Terminal 2 - Frontend
cd frontend/ritagentfrontend
npm run dev
```

The backend will be available at `http://localhost:3000` and the frontend at `http://localhost:3001` (or another port if 3000 is in use).
