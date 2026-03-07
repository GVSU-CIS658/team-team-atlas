import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.get('/api/v1/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok' } });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

