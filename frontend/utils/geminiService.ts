import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI client
const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const extractData = async(filePath: string) => {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString('base64');

        const prompt = `extract the pdf to json in a structure with the following keys: date in the form of MM/DD/YYYY, firstName, lastName, row1, row3, row4, row5.. row9. do integer values starting at date and moving down the page. for the rows with x define which column they are in i.e. row 2 the x is in column 3 so print the value of the column the x is in for the rows with an x value.`

        const filePart = {
            inlineData: {
                data: base64Data,
                mimeType: 'application/pdf'
            } 
        }

        const result = await model.generateContent([prompt, filePart]);
        const response = result.response.text();
        console.log(response);

        try {
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                             response.match(/```\s*([\s\S]*?)\s*```/) || 
                             response.match(/(\{[\s\S]*\})/);

            const JsonStr = jsonMatch ? jsonMatch[1] : response;
            let parsedJson = JSON.parse(JsonStr);
            
            // Process any "column" values in the response
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
                            const columnNumber = columnWithNumberMatch[1];
                            parsedJson[key] = columnNumber;
                        }
                    }
                }
            }
            
            return parsedJson;
        } catch (jsonError) {
            console.error('Error parsing JSON from Gemini response:', jsonError);
            throw new Error('Failed to parse JSON from Gemini response');
        }
    } catch (error) {
        console.error('Error extracting data from PDF:', error);
        throw error;
    }
};
