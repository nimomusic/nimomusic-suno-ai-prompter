export const config = {
  runtime: 'edge', // 빠른 스트리밍 처리를 위한 Edge 런타임
};

export default async function handler(request: Request) {
  // 요청된 URL에서 클립 ID 추출 (예: /api/play/12345.mp3 -> 12345)
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const filePart = pathParts[pathParts.length - 1]; 
  const cleanId = filePart.replace('.mp3', '');

  const targetUrl = `https://cdn1.suno.ai/${cleanId}.mp3`;

  try {
    // 수노 서버로 위장 헤더를 담아 요청 전송
    const sunoResponse = await fetch(targetUrl, {
      headers: {
        'Referer': 'https://suno.com/',
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9',
        'Sec-Fetch-Dest': 'audio',
      },
    });

    if (!sunoResponse.ok) {
      return new Response('Audio blocked by Suno CDN', { status: sunoResponse.status });
    }

    // 정상 오디오 스트림을 브라우저로 반환
    return new Response(sunoResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    return new Response('Error fetching audio', { status: 500 });
  }
}
