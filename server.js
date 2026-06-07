import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        if (!userMessage) {
            return res.status(400).json({ error: "No message provided." });
        }

        const systemPrompt = `You are AVEN AI, a witty, energetic, and slightly sarcastic gaming tactical assistant. 
        The user is asking: "${userMessage}". 
        Give a highly detailed, accurate strategy answer. Use relevant emojis and gaming humor.
        Do not use markdown bolding formatting (no asterisks).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            prompt: systemPrompt,
        });

        // Safe extraction fallback for the new Google GenAI SDK
        let botReply = "";
        if (response && response.text) {
            botReply = response.text;
        } else if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
            botReply = response.candidates[0].content.parts[0].text;
        } else {
            botReply = "Mainframe hiccup. Let's try that command again.";
        }

        res.json({ reply: botReply });

    } catch (error) {
        console.error('Backend Error', error);
        res.status(500).json({ error: 'Signal lost. Mainframe connection dropped.' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`AVEN AI Backend running on port ${PORT}`);
});
