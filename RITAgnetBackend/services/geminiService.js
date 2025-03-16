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


        const prompt = `extract the pdf to json in a structure with the following keys: date in the form of MM/DD/YYYY, firstName, lastName, row2, row3, row4, row5.. row10. do integer values starting at date and moving down the page. for the rows with x define which column they are in i.e. row 2 the x is in column 3 so print the value of the column the x is in for the rows with an x value.`

        const filePart = {
            inlineData: {
                data: base64Data,
                mimeType: 'application/pdf'
            } 
        }

        const result = await model.generateContent([prompt, filePart]);
        const response = result.response.text();
        try {
                const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                response.match(/```\s*([\s\S]*?)\s*```/) || 
                response.match(/(\{[\s\S]*\})/)

                const JsonStr = jsonMatch?jsonMatch[1]:response;
                const parsedJson = JSON.parse(JsonStr);
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