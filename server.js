import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize the Gemini client using Render's Environment Variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/explain', async (req, res) => {
    const word = req.query.word;
    
    if (!word) {
        return res.status(400).send('<h1>Error: No word provided.</h1>');
    }

    try {
        // Enforce the simplified context via system instruction
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: `Explain this word or phrase: "${word}"`,
            config: {
                systemInstruction: "You are a built-in reading assistant. Explain the user's word or phrase in simple, clear, and concise terms. Max 3 sentences. Give 2 relatable examples of using it in a sentence.",
            }
        });

        const definition = response.text || "Could not generate a definition.";

        // Send clean HTML back so it renders perfectly inside Moon+ Reader's viewer
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
                        padding: 20px; 
                        background-color: #f9f9f9; 
                        color: #333; 
                        line-height: 1.6;
                    }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    h2 { color: #1a73e8; margin-top: 0; font-size: 1.4rem; }
                    p { font-size: 1.1rem; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>${word}</h2>
                    <p>${definition}</p>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error(error);
        res.status(500).send('<h1>Failed to fetch explanation from AI</h1>');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});