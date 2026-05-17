/**
 * Cloudflare Pages Function — Anthropic API 中继
 * 备用通道 (Anthropic 在中国已可达，此为中继冗余)
 */

export async function onRequest(context) {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  const url = new URL(request.url);
  const path = url.pathname.replace('/api/anthropic', '');
  const anthropicUrl = `https://api.anthropic.com${path}`;

  const headers = new Headers(request.headers);
  headers.set('Host', 'api.anthropic.com');

  try {
    const response = await fetch(anthropicUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' ? await request.text() : undefined,
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('X-Relay', 'cf-pages-anthropic');

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
