const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// [보안사항 1: 입장 비밀번호]
const ACCESS_PASSWORD = 'nimo123'; 

// [보안사항 2: 로그인 체크 API]
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ACCESS_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: '비밀번호가 틀렸습니다.' });
    }
});

// [보안사항 3: 프롬프트 생성 API]
app.post('/api/generate', async (req, res) => {
    try {
        const { theme, formData, apiKey, password } = req.body;

        // 권한 확인
        if (password !== ACCESS_PASSWORD) {
            return res.status(403).json({ error: '권한이 없습니다.' });
        }

        const isNoVocal = formData.vocal.includes('보컬 없음') || formData.vocal.includes('No Vocal');
        const isDuet = formData.vocal.some(v => v.includes('듀엣') || v.includes('Duet'));
        const getLangName = (code) => ({ ko: 'KOREAN (Hangul)', en: 'ENGLISH', jp: 'JAPANESE' }[formData.lyricsLanguage]);

        // [핵심 기술: 프롬프트 로직 은닉]
        const systemRole = ` 
            ROLE: You are the 'NIMO Music Prompt Architect', the world's best expert in Suno AI v5.
            [STRICT VOCAL RULES]
            ${isNoVocal ? 
              `1. VOCAL STATUS: 'No Vocal(Instrumental)' is selected. DO NOT write any lyrics. Provide structural layout tags like [Drum Break], [Guitar Solo], etc.` :
              `1. LYRICS LANGUAGE: MUST be in **${getLangName()}** only.`
            }
            ${isDuet ? `2. DUET FORMATTING: Distinguish singers with tags like [Male], [Female], [Both], etc.` : ''}
            [STRUCTURE] - Benchmark a real song similar to "${theme}". DO NOT generate [Intro] or [Outro].
            [PROMPT] - STYLE: Construct 5-layer tech tags. CLEAN: Plain text only, no asterisks.
            INPUT: - Theme: "${theme}" - Context: ${JSON.stringify(formData)}
            OUTPUT FORMAT:
            Title: (Creative Title)
            Style Prompt: (The 5-layer English tags)
            Lyrics: (The full lyrics)
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemRole }] }] })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        res.json({ result: data.candidates[0].content.parts[0].text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;