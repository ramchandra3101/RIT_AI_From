import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes.js';
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());


app.use('/api', routes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

