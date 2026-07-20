import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to create a delay (pause) execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        if (!userMessage) {
            return res.status(400).json({ error: "No message provided." });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API key missing on backend setup." });
        }

        const systemInstruction = `You are AVEN AI, a witty, energetic, and slightly sarcastic gaming tactical assistant. 
        Give a highly detailed, accurate strategy answer based on the user's inquiry. Use relevant emojis and gaming humor.
        Do not use markdown bolding formatting (no asterisks).
        If you need to share a website link, write it out strictly as a clean clickable HTML link like this: <a href="URL" target="_blank">Link Text</a>.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        let response;
        let retries = 3; // Maximum number of automatic retry attempts
        let waitTime = 2000; // Start by waiting 2 seconds if throttled

        for (let i = 0; i < retries; i++) {
            response = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userMessage }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] }
                })
            });

            // If we hit a 429 Rate Limit error, pause and back off
            if (response.status === 429) {
                console.warn(`Rate limit hit! Retrying in ${waitTime / 1000} seconds...`);
                await delay(waitTime);
                waitTime *= 2; // Double the wait time for the next round (exponential)
                continue; 
            }

            // Break out of the loop if the request is successful or has a different error
            break;
        }

        const data = await response.json();
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
