import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes.js';
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

// Update CORS configuration to be more permissive for local development
app.use(cors({
  origin: '*',  // Allow all origins for local development
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


app.use('/api', routes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
