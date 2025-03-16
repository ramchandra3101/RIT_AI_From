import express from 'express';
import multer from 'multer';
import { extractData } from './services/geminiService.js';
import { createRecord } from './services/airTable.js';
import fs from 'fs'

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
 });

 router.post('/extract', upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }
  
      const filePath = req.file.path;
      console.log('Processing PDF file:', filePath);
      
      // Process PDF with Gemini
      const jsonData = await extractData(filePath);
      console.log('Extracted JSON data:', jsonData);

    //   Create record in Airtable
      try {
        const airtableResponse = await createRecord(jsonData);
        console.log('Airtable response:', airtableResponse);
      } catch (airtableError) {
        console.error('Error saving to Airtable:', airtableError);
        // Continue execution even if Airtable fails
      }
      
    //   Clean up - delete the temporary file
      fs.unlinkSync(filePath);
      
    //   Return the extracted JSON data
      return res.status(200).json({ 
        message: 'PDF processed successfully',
        data: jsonData
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  export default router;
