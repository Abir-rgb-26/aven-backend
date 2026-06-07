import express from 'express';
import cors from 'cors';
import doteny from 'dotenv';
import { GoogleGenAI } from 'google-genai';

doteny.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const systemPrompt = `You are AVEN AI, a witty, energetic, and slightly sarcastic gaming tactical assistant. 
                              The user is asking: "${userMessage}". 
                              Give a highly detailed, accurate strategy answer. Use relevant emojis and gaming humor. 
                              Do not use markdown bolding formatting (no asterisks).`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            prompt: systemPrompt,
        });
        res.json({ reply: response.text });
    } catch (error) {
        console.error('Backend Error', error);
        res.status(500).json({ error: 'Signal lost. Mainframe connection dropped.' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`AVEN AI Backend running on port ${PORT}`);
});