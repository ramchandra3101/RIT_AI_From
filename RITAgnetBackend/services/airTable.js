import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.BASE_ID || 'appZqxR0t6GigXUMt';  // Default value if not in .env
const TABLE_ID = process.env.TABLE_ID || 'tblWzZCcbxGzWOBWM';  // Default value if not in .env

export const createRecord = async (data) => {
    console.log('Creating record with data:', data);
    const fields = {
        'Date': data.date,
        'First Name': data.firstName,
        'Last Name': data.lastName,
        'Row 1': data.row1 || '',
        'Row 2': data.row2 || '',
        'Row 3': data.row3 || '',
        'Row 4': data.row4 || '',
        'Row 5': data.row5 || '',
        'Row 6': data.row6 || '',
        'Row 7': data.row7 || '',
        'Row 8': data.row8 || '',
        'Row 9': data.row9 || '',
        'Row 10': data.row10 || ''

    }

    
    try {
        console.log(`Making request to Airtable with API key: ${AIRTABLE_API_KEY.substring(0, 5)}...`);
        console.log(`BASE_ID: ${BASE_ID}, TABLE_ID: ${TABLE_ID}`);
        
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
        throw error;
    }
}

export default createRecord;
