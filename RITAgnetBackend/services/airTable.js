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
        'My English has improved because of this English class at RIT.': data.row1 || '',
        'Thanks to attending this program, I feel more confident using English in my daily life.': data.row2 || '',
        'The English lessons are right for my level of reading, writing, speaking, and listening.': data.row3 || '',
        'My teacher continues on a topic until I fully understand and then moves to the next lesson/topic.': data.row4 || '',
        'What can RIT do to help you?': data.row5|| '',
        'RIT staff make e feel welcome.': data.row6 || '', 
        'In this program, I have learned about other cultures.': data.row7 || '',
        'In this program, I made friends from other countries.': data.row8 || '',
        'In this program, I have learned more about technology (phones, computers).': data.row9 || '', 
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
