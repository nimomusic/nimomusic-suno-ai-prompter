import { NextRequest } from 'next/server';

// 1. Next.js 캐시 완전 비활성화 (항상 최신 원본 오디오를 가져오도록 강제)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 2. 대용량 오디오 파일 스트리밍 중 서버 메모리 초과/타임아웃 방지를 위한 Edge 런타임 적용
export const runtime = 'edge';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const songId = params.id;
  const cleanId = songId.replace('.mp3', ''); 
  const targetUrl = `https://cdn1.suno.ai/${cleanId}.mp3`;

  try {
    // 3. 실제 크롬 브라우저가 오디오를 재생할 때 보내는 필수 헤더 세트 완벽 위장
    const sunoResponse = await fetch(targetUrl, {
      headers: {
        'Referer': 'https://suno.com/',
        'Origin': 'https://suno.com',
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,video/*;q=0.6,*/*;q=0.5',
        'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
        'Sec-Fetch-Dest': 'audio',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      },
      cache: 'no-store' // fetch 자체 캐시도 방지
    });

    if (!sunoResponse.ok) {
      return new Response('Audio blocked by Suno CDN', { status: sunoResponse.status });
    }

    // 정상 스트림일 경우 클라이언트(브라우저)로 데이터 전달
    return new Response(sunoResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        // 브라우저 단에서도 이전 경고음을 로드하지 못하도록 강력한 캐시 방지 헤더 추가
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}