export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Intercept API calls
    if (url.pathname.startsWith('/api/')) {
      // Modify the URL to point to the actual payment backend
      const backendUrl = new URL(url.pathname, env.VITE_PAYMENT_API_URL || 'https://api.axim.us.com');

      let body;

      if (request.method === 'POST' && url.pathname === '/api/create-checkout-session') {
        try {
          body = await request.json();
          // Inject the current origin for success and cancel URLs
          body.success_url = `${url.origin}/success?session_id={CHECKOUT_SESSION_ID}`;
          body.cancel_url = `${url.origin}/?canceled=true`;
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
      headers.set('Origin', env.VITE_PAYMENT_API_URL || 'https://api.axim.us.com');
      headers.set('Referer', env.VITE_PAYMENT_API_URL || 'https://api.axim.us.com');

      const proxyRequest = new Request(backendUrl, {
        method: request.method,
        headers: headers,
        body: body,
        redirect: 'manual' // Don't automatically follow redirects; let the client handle them
      });

      try {
        const response = await fetch(proxyRequest);
        return response;
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Proxy error' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // Default: Return 404 for anything not handled by Vite/Pages in a production Cloudflare environment
    return new Response('Not Found', { status: 404 });
  }
};
