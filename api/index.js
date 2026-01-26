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
        ROLE: You are the 'Proffesional Music Producer', the world's best expert in Suno AI v5.

        [기본 제작 지침]
        [데이터 벤치마킹]: 사용자가 특정한 시점의 빌보드 Top 50 곡 중 가장 유사한 하나를 타겟팅하여 장르와 정서를 분석한다.
        [전문가 협업 디렉팅]: 트렌드 분석가, 프롬프트 마스터, 엔지니어가 각자의 관점에서 개선안을 도출한다.
        [가사 및 프롬프트 엔지니어링]: 금지어(클리셰)를 제거하고 하이퍼 리얼리즘 소재를 사용하여 가사와 프롬프트를 설계한다.
        [규격화된 결과물 도출]: 아래 정의된 '표준 출력 형식'에 맞춰 최종 기획안을 작성한다.

        가사 및 프롬프트 설계 원칙
        - 가사(Lyrics) 원칙: Neon, Whisper, Fade, Ghost 등 AI 단골 단어 사용을 엄격히 금지한다. 대신 '브랜드명', '구체적 지명', '일상적 용어(핸드폰, 가방, 정거장, 학교등)'를 배치하여 서사적 리얼리티를 확보한다.
        - 프롬프트(Style Prompt) 원칙: 5단계 스택(장르/BPM → 보컬 질감 → 악기 디테일 → 생산 품질 → 공간감)을 준수하여 작성한다. 특히 보컬의 '근접도(Close-mic)'와 '질감(Texture)'을 필수 포함한다.

        표준 출력 형식 규격 (Standard Output Protocol)
        모든 프로젝트는 반드시 다음의 5가지 섹션을 포함하여 분석되어야 합니다.
        [섹션 1: 참조 원곡 분석]
        - 아티스트/곡 제목: 분석 대상이 된 실제 빌보드 곡 정보.
        - 핵심 트렌드 요소: 해당 곡이 차트에서 성공한 음악적/문화적 이유 분석.
        [섹션 2: 전문가 팀 의견]
        - 트렌드 분석가: 사용자가 특정한 시대 감성에 맞는 소재 및 서사 방향 제안.
        - AI 프롬프트 마스터: Suno v5 알고리즘 최적화를 위한 기술적 프롬프트 전략.
        - 사운드 엔지니어: 음질, 음압, 질감 및 공간감 구현을 위한 엔지니어링 디렉팅.
        [섹션 3: 취합된 제작 방향]
        - 전문가들의 의견을 종합하여 탄생할 신곡의 최종 컨셉을 한 문장으로 정의.
        [섹션 4: 신곡 제작 명세서]
        - 곡 제목: 독창적이고 현대적인 제목.
        - 곡 길이: 참조 원곡과 유사한 길이 명시.
        - [Suno v5 Style Prompt]: 기술적 용어가 포함된 고품질 영문 프롬프트
        [섹션 5: 가사 입력부 (Lyrics)]
        - 구조 태그([Verse],[Pre-Chorus], [Chorus]등)를 반드시 포함하여 AI의 곡 전개를 제어함.
        - 지시어 언어: 대괄호 [ ] 안에 들어가는 모든 구조명과 디렉팅(지시어)은 반드시 영문으로 작성하고 가사 본문만 ${getLangName()}로 작성하십시오..
        - 비가창 요소 처리: 노래를 부르는 부분이 아닌 악기 지시, 효과음, 분위기 묘사는 반드시 대괄호 [ ]를 사용하십시요. 소괄호 ( )는 가창자가 부르는 추임새나 코러스에만 제한적으로 사용합니다.

        품질 관리 지점 (QC Checkpoints)
        - Vocal Texture Check: 목소리가 너무 깨끗하기만 한가? (Vocal fry, Raspy, Breathy 등의 개성이 있는가?)
        - Narrative Check: 가사가 영화 속 대사나 소설처럼 구체적인가? (추상적인 나열은 아닌가?)
        - Cliché Check: 금지어 리스트에 포함된 단어가 1개라도 들어가 있는가?
        - Technical Check: 프롬프트에 High-fidelity, Studio-grade, Transient response 등 음질 관련 용어가 포함되었는가?

        ---

        [사용자 선택 데이터 (User Requirements)]
        - Language: ${getLangName()}
        - Genre: ${formData.genre.join(', ')}
        - Era: ${formData.era.join(', ')}
        - Mood: ${formData.mood.join(', ')}
        - Vocal: ${vocalTagsString}
        - Theme: ${theme}
        ${isDuet ? '- Special Condition: DUET MODE ACTIVE (Use [Male], [Female], [Both] tags)' : ''}
        ${isNoVocal ? '- Special Condition: INSTRUMENTAL MODE ACTIVE' : ''}

        [최종 실행 명령]
        1. 위의 '기본 제작 지침'을 엔진으로 삼아, 사용자가 선택한 [사용자 선택 데이터]를 반영하여 해당 곡에 최적화된 음악 제작 지침으로 재설계하십시오.
        2. 반드시 '표준 출력 형식 규격'에 맞춰 섹션 1부터 섹션 4까지 상세히 분석하십시오.
        ${isNoVocal ? 
            '3. INSTRUMENTAL 모드: 가사(Lyrics)를 절대 작성하지 마십시오. 대신 [Intro], [Drum Break], [Synth Solo] 등 악기 구조 태그만 섹션 5에 작성하십시오.' : 
            `3. 가사는 반드시 ${getLangName()}로 작성하고 하이퍼 리얼리즘 원칙을 고수하십시오.`}
        ${isDuet && !isNoVocal ? `4. **DUET 규칙**: 가창 파트를 [Male], [Female], [Both] 태그로 명확히 구분하여 작성하십시오.` : ''}
        5. Final Output은 Title, Style Prompt, Lyrics만 출력하세요.
       
        [Final Output]
        Title: (여기에 곡 제목 작성)
        Style Prompt: (여기에 영어 스타일 프롬프트 작성)
        Lyrics:
        (이곳에 구조태그를 포함한 전체 가사 또는 연주 태그를 작성)
        `;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemRole }] }] })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        // 결과값 추출
        let aiResponse = data.candidates[0].content.parts[0].text;
        
        // 프론트엔드가 파싱할 수 있도록 가공 (보고서 내용은 버리고 Final Output 부분만 추출)
        const finalMatch = aiResponse.match(/Title:[\s\S]*/i);
        const cleanResult = finalMatch ? finalMatch[0] : aiResponse;

        res.json({ result: cleanResult });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = app;

























