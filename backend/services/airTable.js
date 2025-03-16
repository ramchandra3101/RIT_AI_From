import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.BASE_ID || 'appZqxR0t6GigXUMt';  // Default value if not in .env
const TABLE_ID = process.env.TABLE_ID || 'tblWzZCcbxGzWOBWM';  // Default value if not in .env

// Helper function to convert numeric ratings to expected Airtable format
// Modify this function based on what your Airtable expects (e.g., "4" -> "Strongly Agree")
const formatRating = (rating) => {
  if (rating === null || rating === undefined || rating === '') return '';
  
  // Option 1: Convert to string (if Airtable expects string representation of numbers)
  return String(rating);
  
  // Option 2: Map numeric values to text ratings (uncomment if needed)
  /*
  const ratingMap = {
    1: 'Strongly Disagree',
    2: 'Disagree',
    3: 'Neutral',
    4: 'Agree',
    5: 'Strongly Agree'
  };
  return ratingMap[rating] || '';
  */
};

export const createRecord = async (data) => {
    console.log('Creating record with data:', data);
    
    // Format all numeric fields with the helper function
    const fields = {
        'Date': data.date,
        'First Name': data.firstName,
        'Last Name': data.lastName,
        'My English has improved because of this English class at RIT.': formatRating(data.row1),
        'Thanks to attending this program, I feel more confident using English in my daily life.': formatRating(data.row2),
        'The English lessons are right for my level of reading, writing, speaking, and listening.': formatRating(data.row3),
        'My teacher continues on a topic until I fully understand and then moves to the next lesson/topic.': formatRating(data.row4),
        'What can RIT do to help you?': data.row5 || '',
        'RIT staff make e feel welcome.': formatRating(data.row6), 
        'In this program, I have learned about other cultures.': formatRating(data.row7),
        'In this program, I made friends from other countries.': formatRating(data.row8),
        'In this program, I have learned more about technology (phones, computers).': formatRating(data.row9), 
    };

    try {
        console.log(`Making request to Airtable with API key: ${AIRTABLE_API_KEY.substring(0, 5)}...`);
        console.log(`BASE_ID: ${BASE_ID}, TABLE_ID: ${TABLE_ID}`);
        
        // Add debugging to see exactly what we're sending
        console.log('Sending fields to Airtable:', JSON.stringify(fields, null, 2));
        
        const response = await axios({
            method: 'POST',
            url: `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`,
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                records: [
                    { fields: fields }
                ]
            }
        });
        console.log('Record created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating record:', error.response ? error.response.data : error.message);
        
        // Enhanced error logging to better understand Airtable's expectations
        if (error.response && error.response.data) {
            console.error('Detailed error:', JSON.stringify(error.response.data, null, 2));
        }
        
        throw error;
    }
};

export default createRecord;