export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const cleanId = url.pathname.split('/').pop()?.replace('.mp3', '')?.replace('.m4a', '');
  const targetUrl = `https://cdn1.suno.ai/${cleanId}.mp3`;

  // Vercel 환경 변수에 등록한 내 계정 세션 쿠키 불러오기
  const sunoCookie = __session=eyJhbGciOiJSUzI1NiIsImtpZCI6InN1bm8tYXBpLXJzMjU2LWtleS0xIiwidHlwIjoiSldUIiwieC1hYmx5LXRva2VuIjoibnYzNlZ3LkluZDdWOF8wdFVlenFwZlU1b1owZnVteVVUYlppU0xoVG8zMTNiTkZONWg5SGgzSjdEOHMzVGoyVnlIMk52a3hoQ3NJWTlhb2luMER0MC14UnZYejlONVZNSUdKWm5feHBSeDFyWVV0QTRxR1ZxS0pSYlNsbms4RTVva0ZjdVI5SWtaR0QzTTU2bmFBWTk1TkhxWmdFNHZDdDlvamRnVUNYLTRqRUs3NnJLdE1KTFFoSzQ4cFBHYVk4ZTkzRzBMekhKb0pCaGFwdXRRUFUzVEZveDAxbDBpcXotTTRqdEg4aVhHcmlVeHgtY0hzIn0; __client=eyJhbGciOiJSUzI1NiIsImtpZCI6InN1bm8tYXBpLXJzMjU2LWtleS0xIiwidHlwIjoiSldUIn0.eyJzdW5vLmNvbS9jbGFpbXMvY2xpZW50X2lkIjoiY2xpZW50X0p5SHBOU1kyaW5VcU50cW8yY2JhdUciLCJzdW5vLmNvbS9jbGFpbXMvdG9rZW5fdHlwZSI6InJlZnJlc2giLCJpc3MiOiJodHRwczovL2F1dGguc3Vuby5jb20iLCJleHAiOjE4MTk1MDkxNTR9.r80sfS2-3U2h10ExjzLwC5Pejtb-TRn9YS4JIaIVCPQuhIZldSijYoTtNXz3_l4YxyUs7v--JacbvUqqboUnuRW80EgIZlD9hG38Aj-ZJpvoxYtf9gAKR5twbCWuRi69tja9VFr3Xk_DACDwlSF9VWpTfeRQgpXdvfnwqo_MV4RPBH7lBfk2uBcWubismT33u5CCdZ51r9qJfeSy75tdrpsC9OZCRu67DO4iCwZsnvX58Zo1OekbihCZZz6wptneULSVAn-9DuDrgHTXOd2Q0o8ufy_L7z__3s4of7JoyZyc0ftbPXEIjjBUfVrehiSZ3mZzTF7LtCGOtkK5bn_C6g; __u=noXc7bJoRhPC%2BQHEZsw%2F0jwaSnn9b93rFy8qZ31KZwmqgyKeJipOWjWQjGLcXWFop92YUkvuD%2BIkgUQU5GYM5MeDbvLYX7GILLRMVGdthCeK1V5EAj53C6AqMqPVl1afLOjXyJMpTrmFFzPbwt%2Fe3Q5xS2bcnfRAqzsjrPE8QxCLCRKQdu7fPVhmf3qcFC5x5ZnWhW8hAGN5E6Yv072wEPzuo3Z41z3ZeABy5XNw8X4Cy%2FLjyL9O07%2BeYEpp6goyMcc%2Bu85bVW4rmBmmyHt4Hl0aw1NsjL1wM%2F%2FyExRqyEK9egK9xPmCZKfg66jC4Z0teoCbCFim713KtWDK85U1TkWn1r%2BmWoYHedMdIQqBo6umOTEVh5Fp6rBR6nGexvE4IGLLttDYSI8ZgCEoGWt518PYZLDovnfVP8Q4TUylcPj8fbv2UQCqfc%2B5VVBrrmVzEbBw6rAM%2FF%2Fy6jOlJouzt4z1IK7IHBnU0EJlYF0fggmJh3Rp0UAmiui%2BNHy6uMhQF7abNQQKuUh5aC9M1oopTRK%2FRuz0%2B4ZmdMqp1WtX%2FhDf0Afx9AMsMZEzI08soqqSvAauLHOuFiHVJio9RS%2FipkowuyxERY5DHu1HvxP%2BcuQRfFdr4%2F7gQBUVVsPb5hYqzYe6PPUEm7o8ZmTM5mDjwxVl5wcw9X8WVVLbFyPH7E6rkVbRmEPOpucAaXr5XawvVLfl20Dsd3Z%2BnjkR8wY94nmq0Bhofy1oZlAojPblcbiqCrdkRySLWendkQaqJl6%2FjY5lBLL2eMgtqHmd4K%2F%2FnEJ5afQhg606%2Bb78Rvg9HJawaPOhQiRpRIGPNa9AZIbyQKHMt%2Fb2r4LwYz1aVIuZr7tfkomh8oxMJn8Dsg85Anv3bRg32xP7O2kTqSfZSbjzZ9OwM1JAj%2FmoXeO39%2Bw02QjWhobRAOZXVPFDE9jPXtql54iKTh%2F8eSbtez5WZZr0wQEcmR5UgF%2BtZfPSRo8Ihk%2B%2Fkwhokqhpg%2FGvaaqkW%2BCz3ZS6HkSnsdbpNde5%2BduoXlKf4dSg2QTLt8sifrdfPeExwYqLiKASYFwXDnM%2Fw2d%2FukuvxNxPLSYRuNx8lvJnAQ4ckQld5HKdB9DGy6UDr%2BPkRAWos7sXSAtVe7hEc2kZLwp72fpAh%2BONLHoVsarl%2F0OEYoI9Z0gD13Npx4R%2BazKqhIFBKFfLBF8bFpqM6W6hFDkkUTR955NL8%2F7aZ80KoqjOILblqVbmZOu3Wqb4lawEuLGk%2FB8DR5QW6PlgXZULH8ag8XwVuyf8M9k6xFxM1wWpisC6Ry7Pt%2FHpuOxBYddtI%2FupDhHW2DKbIARCLSxEOBwxmCU2vo%2BbbnW3xlmMwRLR%2FSuxofYofLCO7Tez6pqSG6Qwa%2FEPlC17PAXgD6AKxlCk9g56VGXFDK6rdrzlKxTLzcWBgzuTVfj8HDAp%2BC%2BuNqsTa5axdF%2FXX5tbWKcxcRWiTNg4BhV02VS54Q%3D%3D.F%2FNHCq1039XOx9Vfbrpr2ughdDWj33QKjktbytzBPRs%3D; clerk_active_context=session_43c64cd557409b414da3e7:;

  const fetchHeaders = new Headers({
    'Referer': 'https://suno.com/',
    'Origin': 'https://suno.com',
    'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Cookie': sunoCookie, // <-- 로그인 인증 쿠키 장착
    'Sec-Fetch-Dest': 'audio',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
  });

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
