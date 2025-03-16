// ES6 version using import syntax
// Note: To use ES6 imports, you need to either:
// 1. Add "type": "module" to your package.json, or
// 2. Save this file with a .mjs extension

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY; // Store your API key in a .env file
const BASE_ID = 'appj9mwmJYKJRI856';
const TABLE_ID = 'tblCgZVVFeoIk9Uru';

// Your input data
const inputData = [
  {
    "date": "13",
    "firstName": "Aurelia maria",
    "lastName": "Santos",
    "row2": "3",
    "row3": "3",
    "row4": "3",
    "row5": "4",
    "row6": "find job",
    "row7": "5",
    "row8": "5",
    "row9": "5",
    "row10": "5"
  }
];

// Function to create a new record
const createRecord = async (data) => {
  // Map your input data to Airtable fields
  const fields = {
    'Date': data.date,
    'First Name': data.firstName,
    'Last Name': data.lastName,
    'Row 1': data.row1 || '', // Using your column names as seen in the image
    'Row 2': data.row2 || '',
    'Row 3': data.row3 || '',
    'Row 4': data.row4 || '',
    'Row 5': data.row5 || '',
    'Row 6': data.row6 || '',
    'Row 7': data.row7 || '',
    'Row 8': data.row8 || '',
    'Row 9': data.row9 || '',
    'Row 10': data.row10 || ''
  };

  try {
    const response = await axios({
      method: 'POST',
      url: `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`,
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        records: [
          { fields }
        ]
      }
    });

    console.log('Record created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating record:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Main function to run the script
const main = async () => {
  try {
    // Create a new record with your data
    const newRecord = await createRecord(inputData[0]);
    
    console.log('New record creation successful!');
  } catch (error) {
    console.error('Script failed:', error);
  }
};

// Run the script
main();