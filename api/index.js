const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// [보안사항 1: 입장 비밀번호]
const ACCESS_PASSWORD = 'C91C75B6'; 

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

// [핵심 기술: 보컬 옵션 정밀 매핑 시스템]
        
        // 1. 입력 데이터 정규화 (배열이든 문자열이든 배열로 통일)
        const selectedVocals = Array.isArray(formData.vocal) ? formData.vocal : [formData.vocal];

        // 2. 한글 UI -> Suno 최적화 영문 태그 매핑 (A&R Dictionary)
        const vocalTypeMap = {
            '남성 보컬': 'Male Vocals',
            '여성 보컬': 'Female Vocals',
            '남성 듀엣': 'Male Duet',
            '여성 듀엣': 'Female Duet',
            '남녀 듀엣': 'Duet, Male and Female Vocals',
            '혼성 합창': 'Mixed Choir',
            '남성 합창': 'Male Choir',
            '여성 합창': 'Female Choir',
            '어린이 합창': 'Children Choir',
            '아카펠라': 'Acapella',
            '랩': 'Rap, Hiphop Vocals',
            '말하듯노래': 'Spoken Word, Narration',
            '보컬 없음': 'Instrumental',
            '허밍': 'Humming',
            '휘파람': 'Whistle',
            '비브라토': 'Strong Vibrato',
            '가성': 'Falsetto',
            '하모니': 'Harmonies',
            '백그라운드 보컬': 'Backing Vocals',
            '부드러운': 'Soft',
            '파워풀한': 'Powerful',
            '낮은': 'Deep',
            '거친': 'Raspy',
            '속삭이는': 'Whispered',
            '감성적인': 'Emotional',
            '공기섞인': 'Airy',
            '오토튠': 'Auto-tuned',
            '소울풀한': 'Soulful',
            '어린아이같은': 'Childlike',
            '매끄러운': 'Smooth',
            '탁하고 강한': 'Gritty',
            '여러층': 'Layered',
            '최소한의': 'Minimalist',
            '빠른 랩': 'Fast rap',
            '숨가쁜': 'Breathless delivery',
            '멜리스마 R&B': 'Melismatic R&B'
        };

        // 3. 선택된 옵션을 영문 태그로 변환 및 조합
        // '보컬 없음'은 스타일 태그엔 넣되, 로직 분기용으로 따로 체크함
        const vocalTagsString = selectedVocals
            .map(v => vocalTypeMap[v] || v) // 매핑된 영문값 가져오기 (없으면 원본 유지)
            .filter(v => v !== 'Instrumental') // Instrumental은 태그보다는 구조적 지시가 더 중요하므로 필터링 가능하나, 명확성을 위해 둠
            .join(', ');

        // 4. 로직 분기용 플래그 설정
        const isNoVocal = selectedVocals.some(v => v.includes('보컬 없음') || v.includes('No Vocal'));
        const isDuet = selectedVocals.some(v => v.includes('듀엣') || v.includes('Duet'));
        const getLangName = () => ({ ko: 'KOREAN (Hangul)', en: 'ENGLISH', jp: 'JAPANESE' }[formData.lyricsLanguage] || 'KOREAN');

        // [시스템 프롬프트 구성]
        const systemRole = ` 
            ROLE: You are the 'NIMO Music Prompt Architect', the world's best expert in Suno AI v5.
            
            [STRICT VOCAL & LANGUAGE RULES]
            ${isNoVocal ? 
              `1. VOCAL STATUS: **INSTRUMENTAL MODE**. 'No Vocal' is selected. 
                 - DO NOT write any lyrics. 
                 - OUTPUT STRUCTURE TAGS ONLY (e.g., [Intro], [Drum Break], [Synth Solo], [Drop], [Outro]).` :
              `1. LYRICS LANGUAGE: MUST be in **${getLangName()}** only.
               2. VOCAL TIMBRE: The user selected **"${vocalTagsString}"**. You MUST include these exact tags in the Style Prompt.`
            }
            ${isDuet ? `3. DUET FORMATTING: The song is a DUET. Distinguish singers in lyrics with tags like [Male], [Female], [Both], or [Choir] as appropriate.` : ''}

            [NIMO PLATINUM HIT-MAKING WORKFLOW]
            To produce the ultimate masterpiece, execute this 5-stage production matrix:
            STAGE 1. A&R CONCEPT DEFINITION: Define emotional core and commercial vibe based on Context and Do not use stereotypical AI vocabulary, including terms like 'echo', 'whisper', 'neon', '무너진', '메아리', '온기', and '선명'.
            STAGE 2. STRUCTURAL BLUEPRINTING: Engineer dynamic tension (Verse -> Pre-Chorus -> Chorus).
            STAGE 3. LYRICAL ENGINEERING(Hyper-realism): (If vocal) Craft sticky hooks with perfect prosody.
                     - STRICT ZERO-CLICHÉ POLICY: Regardless of the language used, absolutely avoid phrases or their translated equivalents for: "window pane", "rain on the glass", "tears", "whisper", "echo", "neon", "broken heart", "neon lights", "darkness", "scars", "chasing dreams".
                     - OBJECT-ORIENTED IMAGERY: Replace abstract emotional descriptors with gritty, specific, and tangible objects. Instead of expressing direct emotions (e.g., "I'm sad"), describe "The coffee stain on the receipt", "The rust on the bicycle", or "The blinking cursor on the screen". Focus on the physical world to evoke the psychological state.
            STAGE 4. SONIC ARCHITECTURE: 
                * AUTO INSTRUMENT MODE: ${formData.isAutoInstruments ? 'ON (AI chooses best instruments for the theme)' : 'OFF (Stick to user selection)'}
                * AUTO MIXING MODE: ${formData.isAutoMixing ? 'ON (AI chooses best production style)' : 'OFF (Stick to user selection)'}
            STAGE 5. PERFORMANCE CALIBRATION: Direct the AI's rendering tone.

            [REFERENCE & EXECUTION]
            1. REFERENCE ANALYSIS: Extract "Hit DNA" (Chord, Tempo, Groove) from a real global hit similar to "${theme}".
            2. STRUCTURE OPTIMIZATION: Build the song body based on the reference.
               **CRITICAL RULE**: DO NOT generate [Intro] or [Outro] tags in the lyrics section. Let the Style Prompt drive the intro naturally.
            3. STYLE PROMPT (SONIC FINGERPRINT): Construct a high-fidelity "5-Layer Tag" system:
               Layer 1: Main Genre & Sub-genre & **"${vocalTagsString}" (MANDATORY)**
               Layer 2: Key Instruments (e.g., "${selectedVocals.includes('휘파람') ? 'Whistling' : ''}", etc.)
               Layer 3: Mood & Emotional Atmosphere
               Layer 4: Tempo (BPM) & Rhythm Style
               Layer 5: Production Quality (e.g., High Fidelity, Billboard Sound)
               *CONSTRAINT*: CLEAN plain text only. No asterisks.

            INPUT: - Theme: "${theme}" - Context: ${JSON.stringify(formData)}
            OUTPUT FORMAT:
            Title: (Creative Title)
            Style Prompt: (The 5-layer English tags starting with "${vocalTagsString}")
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







