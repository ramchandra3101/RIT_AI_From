import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });


export const extractData = async(filePath) => {
    try{
        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString('base64');


        const prompt = `
        Extract the information from this PDF into a structured JSON format with the following fields:
        - date: The date in MM/DD/YYYY format
        - firstName: The person's first name 
        - lastName: The person's last name
        - row1 through row9: For each row (EXCEPT row5), identify which column (1, 2, 3, etc.) contains a mark, selection, or filled value.
        
        SPECIAL CASE - row5: For row5 specifically, extract the handwritten text value that the user has written in, not a column number.
        
        A mark could be an X, checkmark, filled circle, dot, or any other indication that the column has been selected.
        For example:
        - If row2 has a mark in the third column, the value for row2 should be "3"
        - If row5 contains handwritten text saying "Referred by Dr. Smith", then row5 should be "Referred by Dr. Smith"
        
        Please only return valid JSON without any additional text or formatting.
        `;
        const filePart = {
            inlineData: {
                data: base64Data,
                mimeType: 'application/pdf'
            } 
        }

        const result = await model.generateContent([prompt, filePart]);
        const response = result.response.text();
        console.log(response)
        try {
                const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                response.match(/```\s*([\s\S]*?)\s*```/) || 
                response.match(/(\{[\s\S]*\})/)

                const JsonStr = jsonMatch?jsonMatch[1]:response;
                let parsedJson = JSON.parse(JsonStr);
                
                // Process any "column" values in the response
                // This will iterate through all properties in the JSON object
                for (const key in parsedJson) {
                    if (typeof parsedJson[key] === 'string') {
                        // Case 1: Exact match to "column" (case insensitive)
                        if (parsedJson[key].toLowerCase() === 'column') {
                            delete parsedJson[key];
                        } 
                        // Case 2: Value contains "column" followed by numbers (e.g., "column4")
                        else {
                            const columnWithNumberMatch = parsedJson[key].match(/^column(\d+)$/i);
                            if (columnWithNumberMatch) {
                                // Extract the numeric part and update the value
                                parsedJson[key] = columnWithNumberMatch[1];
                            }
                        }
                    }
                }
                
                return parsedJson;
        } catch (parseError) {
                console.error('Error parsing JSON response:', parseError);
                console.log('Raw response:', response);
                throw new Error('Failed to extract structured data from the PDF');
            }
    } catch(error){
        console.error('Error processing PDF:', error);
        throw error;
    }
}