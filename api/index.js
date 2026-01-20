const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const ACCESS_PASSWORD = 'nimo123'; // 서버에만 저장되는 비밀번호

// 로그인 API
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ACCESS_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

// 프롬프트 생성 API
app.post('/api/generate', async (req, res) => {
    try {
        const { theme, formData, apiKey, lyricsLanguage, password } = req.body;

        if (password !== ACCESS_PASSWORD) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const isNoVocal = formData.vocal.includes('보컬 없음') || formData.vocal.includes('No Vocal');
        const getLangName = (code) => ({ ko: 'KOREAN', en: 'ENGLISH', jp: 'JAPANESE' }[code]);

        const systemRole = `
            ROLE: NIMO Music Prompt Architect.
            VOCAL: ${isNoVocal ? 'Instrumental' : getLangName(lyricsLanguage)}.
            THEME: ${theme}.
            FORMAT: Title, Style Prompt, Lyrics.
        `;

        // Node 18 이상은 fetch가 내장되어 있습니다.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemRole }] }] })
        });

        const data = await response.json();
        res.json({ result: data.candidates[0].content.parts[0].text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app; // Vercel을 위해 서버 객체를 내보냄