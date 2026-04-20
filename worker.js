export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Intercept API calls
    if (url.pathname.startsWith('/api/')) {
      // Modify the URL to point to the actual payment backend
      const targetBackendUrl = env.BACKEND_URL || env.VITE_PAYMENT_API_URL || 'https://api.axim.us.com';
      const backendUrl = new URL(url.pathname, targetBackendUrl);

      let body;

      if (request.method === 'POST' && url.pathname === '/api/create-checkout-session') {
        try {
          body = await request.json();
          // Inject the current origin for success and cancel URLs
          const clientOrigin = request.headers.get('Origin') || url.origin;
          body.success_url = `${clientOrigin}/success?session_id={CHECKOUT_SESSION_ID}`;
          body.cancel_url = `${clientOrigin}/?canceled=true`;
          body = JSON.stringify(body);
        } catch (err) {
          // Fallback if we cannot parse JSON
          body = await request.text();
        }
      } else {
        body = request.method === 'GET' || request.method === 'HEAD' ? null : await request.text();
      }

      const headers = new Headers(request.headers);

      // Prevent Stripe backend from rejecting the request due to Origin/Referer issues
      headers.set('Origin', targetBackendUrl);
      headers.set('Referer', targetBackendUrl);

      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        });
      }

      const proxyRequest = new Request(backendUrl, {
        method: request.method,
        headers: headers,
        body: body,
        redirect: 'manual' // Don't automatically follow redirects; let the client handle them
      });

      try {
        const response = await fetch(proxyRequest);

        // Ensure CORS headers allow Authorization
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return newResponse;
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Proxy error' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // Default: Return static assets or route to app
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
