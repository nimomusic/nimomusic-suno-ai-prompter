export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const filePart = pathParts[pathParts.length - 1]; 
  const cleanId = filePart.replace('.mp3', '').replace('.m4a', '');

  // 수노 음원 원본 URL
  const targetUrl = `https://cdn1.suno.ai/${cleanId}.mp3`;

  // 헤더 구성 (실제 브라우저 오디오 재생 요청 위장)
  const fetchHeaders: Record<string, string> = {
    'Referer': 'https://suno.com/',
    'Origin': 'https://suno.com',
    'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Encoding': 'identity',
    'Sec-Fetch-Dest': 'audio',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
  };

  // 브라우저의 Range 헤더(부분 요청)가 존재하면 수노 서버로 그 전달
  const clientRange = request.headers.get('range');
  if (clientRange) {
    fetchHeaders['Range'] = clientRange;
  }

  try {
    const sunoResponse = await fetch(targetUrl, {
      headers: fetchHeaders,
      cache: 'no-store'
    });

    if (!sunoResponse.ok && sunoResponse.status !== 206) {
      return new Response('Audio blocked by Suno CDN', { status: sunoResponse.status });
    }

    // 응답 헤더 구성 (206 Partial Content 수용)
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', sunoResponse.headers.get('content-type') || 'audio/mpeg');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    // Vercel 자체 캐싱을 강력하게 막아 기존 경고음이 캐시되는 것 방지
    responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    responseHeaders.set('CDN-Cache-Control', 'no-store');
    responseHeaders.set('Vercel-CDN-Cache-Control', 'no-store');
    
    // 스트리밍 필수 범위 헤더 전달
    if (sunoResponse.headers.get('content-range')) {
      responseHeaders.set('Content-Range', sunoResponse.headers.get('content-range')!);
    }
    if (sunoResponse.headers.get('content-length')) {
      responseHeaders.set('Content-Length', sunoResponse.headers.get('content-length')!);
    }
    if (sunoResponse.headers.get('accept-ranges')) {
      responseHeaders.set('Accept-Ranges', sunoResponse.headers.get('accept-ranges')!);
    }

    return new Response(sunoResponse.body, {
      status: sunoResponse.status, // 200 또는 206 전달
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response('Error fetching audio', { status: 500 });
  }
}
