# Deployment Guide for RIT AI Form Extractor

This guide will walk you through deploying the RIT AI Form Extractor application on Vercel.

## Prerequisites

1. A GitHub account with your repository pushed
2. A Vercel account (you can sign up at [vercel.com](https://vercel.com) using your GitHub account)
3. API keys for the following services:
   - Gemini AI API key
   - Airtable API key
   - Airtable Base ID and Table ID

## Deployment Steps

### 1. Push Your Code to GitHub

Ensure all your changes are committed and pushed to your GitHub repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import Your Project to Vercel

1. Log in to your Vercel account
2. Click "Add New" > "Project"
3. Select your GitHub repository from the list
4. Vercel will automatically detect that you're using Next.js

### 3. Configure Environment Variables

Add the following environment variables in the Vercel project settings:

- `GEMINI_API_KEY`: Your Google Gemini AI API key
- `AIRTABLE_API_KEY`: Your Airtable API key
- `BASE_ID`: Your Airtable Base ID (default: appZqxR0t6GigXUMt)
- `TABLE_ID`: Your Airtable Table ID (default: tblWzZCcbxGzWOBWM)

### 4. Deploy Your Application

1. Click "Deploy" to start the deployment process
2. Vercel will build and deploy your application
3. Once complete, you'll receive a URL for your deployed application (e.g., `https://your-project-name.vercel.app`)

### 5. Custom Domain (Optional)

If you want to use a custom domain:

1. Go to your project settings in Vercel
2. Navigate to the "Domains" section
3. Add your custom domain
4. Update your DNS settings at your domain registrar according to Vercel's instructions

## Troubleshooting

- **Build Errors**: Check the build logs in Vercel for any errors
- **API Issues**: Verify that your environment variables are correctly set
- **PDF Processing**: Ensure that the Gemini API key has the correct permissions

## Updating Your Deployment

Any new commits pushed to your main branch will automatically trigger a new deployment on Vercel.

## Local Development

To run the application locally:

```bash
cd frontend/ritagentfrontend
npm run dev
```

The application will be available at `http://localhost:3000` (or another port if 3000 is in use).
