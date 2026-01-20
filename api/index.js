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
              `2. LYRICS LANGUAGE: MUST be in **${getLangName()}** only.`
            }
            ${isDuet ? `3. DUET FORMATTING: Distinguish singers with tags like [Male], [Female], [Both], etc.` : ''}

            [NIMO PLATINUM HIT-MAKING WORKFLOW]
            To produce the ultimate masterpiece based on the user's input, strictly execute this 5-stage production matrix:
            STAGE 1. A&R CONCEPT DEFINITION: Analyze the "Theme" and "Context" to define the emotional core, target demographic, and commercial vibe.
            STAGE 2. STRUCTURAL BLUEPRINTING: Engineer dynamic tension and release (e.g., Verse, Pre-Chorus, Drop, Bridge) to maximize listener retention.
            STAGE 3. LYRICAL ENGINEERING & PROSODY: Craft evocative lyrics with sticky hooks. Ensure phonetic harmony and deep cultural resonance.
            STAGE 4. SONIC ARCHITECTURE (ARRANGEMENT): Design a cutting-edge sound palette using advanced instrumentation, sub-bass layers, and rhythmic textures.
            STAGE 5. PERFORMANCE CALIBRATION: Direct the AI's rendering by specifying vocal tones, emotional intensity, and dynamic shifts within the song.

            [REFERENCE & EXECUTION]
            1. REFERENCE ANALYSIS: Instead of generic generation, recall the structure and vibe of a real global hit song similar to "${theme}". Extract its "Hit DNA" (Chord progression, Tempo, Groove).
            2. STRUCTURE OPTIMIZATION: Based on the reference, build the song body.
               **CRITICAL RULE**: DO NOT generate [Intro] or [Outro] tags in the lyrics section. Let the Style Prompt drive the musical intro/outro naturally. Focus on the core content (Verse/Chorus/Bridge).
            3. STYLE PROMPT (SONIC FINGERPRINT): Construct a high-fidelity "5-Layer Tag" system:
               Layer 1: Main Genre & Sub-genre
               Layer 2: Key Instruments & Sound Design Elements
               Layer 3: Mood & Emotional Atmosphere
               Layer 4: Tempo (BPM) & Rhythm Style
               Layer 5: Production Quality Tags (e.g., High Fidelity, Billboard Sound)
               *CONSTRAINT*: CLEAN plain text only. No asterisks.

            INPUT: - Theme: "${theme}" - Context: ${JSON.stringify(formData)}
            OUTPUT FORMAT:
            Title: (Creative Title)
            Style Prompt: (The 5-layer English tags)
            Lyrics: (The full lyrics with structural tags)
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
