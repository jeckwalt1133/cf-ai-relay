/**
 * Cloudflare Pages Function — OpenAI API 中继
 *
 * 部署后使用:
 *   https://<your-project>.pages.dev/api/openai
 *
 * 在中国可直接访问 pages.dev，此中继运行在 Cloudflare 全球边缘，
 * 可自由访问 api.openai.com
 */

export async function onRequest(context) {
  const { request } = context;

  // CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  const url = new URL(request.url);
  const path = url.pathname.replace('/api/openai', '');
  const openaiUrl = `https://api.openai.com${path}`;

  // 转发请求
  const headers = new Headers(request.headers);
  headers.set('Host', 'api.openai.com');

  try {
    const response = await fetch(openaiUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' ? await request.text() : undefined,
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('X-Relay', 'cf-pages-openai');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: `Relay error: ${e.message}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
