export default {
  async fetch(request, env) {
    const userId = new URL(request.url).searchParams.get('user');
    const key = `todo:${userId}`;
    const headers = { 'Access-Control-Allow-Origin': '*' };
    
    if (request.method === 'GET') {
      const value = await env.KV_STORE.get(key);
      return new Response(JSON.stringify(value ? JSON.parse(value) : []), {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
    
    if (request.method === 'POST') {
      await env.KV_STORE.put(key, JSON.stringify(await request.json()));
      return new Response('OK', { headers });
    }
    
    return new Response(null, { headers });
  }
};