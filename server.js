import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        if (!userMessage) {
            return res.status(400).json({ error: "No message provided." });
        }

        // PASTE YOUR WORKING GEMINI KEY DIRECTLY BETWEEN THESE QUOTES:
        const apiKey = 'GEMINI_API_KEY';

        const systemInstruction = `You are AVEN AI, a witty, energetic, and slightly sarcastic gaming tactical assistant. 
        Give a highly detailed, accurate strategy answer based on the user's inquiry. Use relevant emojis and gaming humor.
        Do not use markdown bolding formatting (no asterisks).`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: userMessage }]
                }],
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                }
            })
        });

        const data = await response.json();
        
        // This will print the message OR the raw JSON structure so it never hits a blind mismatch text
        const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data);

        res.json({ reply: botReply });

    } catch (error) {
        console.error('Backend Error:', error);
        res.status(500).json({ error: 'Signal lost. Mainframe connection dropped.' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`AVEN AI Backend running on port ${PORT}`);
});
