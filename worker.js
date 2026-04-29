import { generateDocument, generatePlainText, generatePdfBytes } from './workerDocumentGenerator.js';


async function hashFormData(formData) {
    const dataToHash = { ...formData };
    delete dataToHash.sessionId; // Don't include sessionId in hash
    const message = JSON.stringify(dataToHash, Object.keys(dataToHash).sort());
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}



// In-memory rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

// Note: Cloudflare Workers are stateless per isolate and can't use setInterval like Node.
// But we can clean up passively.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health' && request.method === 'GET') {
      return new Response(JSON.stringify({ status: "operational", service: "nda_generator", timestamp: Date.now() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Passive cleanup of rate limits every ~100 requests to avoid memory leaks in isolate
    if (Math.random() < 0.01) {
      const now = Date.now();
      for (const [ip, data] of rateLimitMap.entries()) {
        if (now - data.timestamp > RATE_LIMIT_WINDOW) {
          rateLimitMap.delete(ip);
        }
      }
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }


    if (request.method === 'POST' && url.pathname === '/api/generate-preview') {
      // Edge Rate Limiting
      const clientIP = request.headers.get('CF-Connecting-IP');
      if (clientIP) {
        const now = Date.now();
        const userLimit = rateLimitMap.get(clientIP);

        if (userLimit && now - userLimit.timestamp < RATE_LIMIT_WINDOW) {
          if (userLimit.count >= MAX_REQUESTS) {
            return new Response(JSON.stringify({ error: "Rate limit exceeded. Please finalize your document to continue." }), {
              status: 429,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          userLimit.count += 1;
          rateLimitMap.set(clientIP, userLimit);
        } else {
          rateLimitMap.set(clientIP, { count: 1, timestamp: now });
        }
      }
      try {
        const formData = await request.json();

        // Skip payment validation for preview
        const docData = generateDocument({ ...formData, isPaid: true }); // We still pass isPaid: true so it generates
        if (!docData) {
          return new Response(JSON.stringify({ error: 'Failed to generate document data' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const plainText = generatePlainText(docData, formData);

        const { pdfBytes, docId } = await generatePdfBytes(plainText, formData);

        return new Response(pdfBytes, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="Preview.pdf"',
            'Access-Control-Allow-Origin': '*',
          }
        });
      } catch (err) {
        console.error('PDF Preview Generation Error:', err);

        ctx.waitUntil(
          fetch(`${env.VITE_PAYMENT_API_URL || 'https://api.axim.us.com'}/v1/telemetry/ingest`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${env.AXIM_SERVICE_KEY}`
            },
            body: JSON.stringify({
              event: 'pdf_generation_failed',
              app_type: 'nda',
              severity: 'CRITICAL',
              error_message: err.message
            })
          })
        );

        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (request.method === 'POST' && url.pathname === '/api/generate-nda') {
      try {
        const formData = await request.json();
        const sessionId = formData.sessionId;

        if (!sessionId) {
          return new Response(JSON.stringify({ error: 'Unauthorized: Missing sessionId' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        const backendUrl = env.BACKEND_URL || env.VITE_PAYMENT_API_URL || 'https://api.axim.us.com';
        const verifyRes = await fetch(`${backendUrl}/api/verify-session?session_id=${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.AXIM_SERVICE_KEY}`
          }
        });

        if (!verifyRes.ok) {
          return new Response(JSON.stringify({ error: 'Unauthorized: Invalid session' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }


        const sessionData = await verifyRes.json();
        if (!sessionData.isPaid) {
          return new Response(JSON.stringify({ error: 'Unauthorized: Session not paid' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        // Verify Cryptographic Binding
        const incomingHash = await hashFormData(formData);
        const storedHash = sessionData.metadata?.formHash;

        if (!storedHash || incomingHash !== storedHash) {
          return new Response(JSON.stringify({ error: 'Unauthorized: Data integrity verification failed' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }


        // Ensure the formData has isPaid = true before generating
        const docData = generateDocument({ ...formData, isPaid: true });
        if (!docData) {
          return new Response(JSON.stringify({ error: 'Failed to generate document data' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const plainText = generatePlainText(docData, formData);

        const { pdfBytes, docId } = await generatePdfBytes(plainText, formData);

        // Phase 1: Secure Vault Upload
        const vaultFormData = new FormData();
        vaultFormData.append('document', new Blob([pdfBytes], { type: 'application/pdf' }), 'document.pdf');
        vaultFormData.append('document_type', 'nda');
        vaultFormData.append('trace_id', docId);

        ctx.waitUntil(
          fetch(`${env.VITE_PAYMENT_API_URL || 'https://api.axim.us.com'}/v1/vault-upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.AXIM_SERVICE_KEY}`
            },
            body: vaultFormData
          }).catch(err => console.error('Vault upload failed:', err))
        );

        // --- NEW: Telemetry hook for B2B Lead Converted ---
        ctx.waitUntil(
          fetch(`${env.VITE_PAYMENT_API_URL || 'https://api.axim.us.com'}/v1/telemetry/ingest`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${env.AXIM_SERVICE_KEY}`
            },
            body: JSON.stringify({
              event: 'b2b_lead_converted',
              app_type: 'nda',
              client_email: formData.email || '',
              disclosing_party: formData.disclosing || ''
            })
          }).catch(err => console.error('Telemetry ingest failed:', err))
        );
        // ----------------------------------------------------

        return new Response(pdfBytes, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="NDA.pdf"',
            'Access-Control-Allow-Origin': '*',
          }
        });
      } catch (err) {
        console.error('PDF Generation Error:', err);

        ctx.waitUntil(
          fetch(`${env.VITE_PAYMENT_API_URL || 'https://api.axim.us.com'}/v1/telemetry/ingest`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${env.AXIM_SERVICE_KEY}`
            },
            body: JSON.stringify({
              event: 'pdf_generation_failed',
              app_type: 'nda',
              severity: 'CRITICAL',
              error_message: err.message
            })
          })
        );

        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // Intercept API calls
    if (url.pathname === '/api/send-email' && request.method === 'POST') {
      try {
        const payload = await request.json();

        const response = await fetch(`${env.VITE_PAYMENT_API_URL || 'https://api.axim.us.com'}/v1/functions/document-orchestrator`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.AXIM_SERVICE_KEY}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        console.error('Email proxy error:', err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

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
          // Customer email is already in body.customer_email
          if (body.formHash) {
            body.metadata = body.metadata || {};
            body.metadata.formHash = body.formHash;
          }
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

      const internalRoutes = ['/api/v1/telemetry/ingest', '/api/v1/telemetry/events', '/api/v1/telemetry/errors', '/api/v1/telemetry/feedback', '/api/v1/user/document-history', '/api/verify-session', '/api/v1/auth/session'];

      if (internalRoutes.some(route => url.pathname.startsWith(route))) {
        if (!headers.has('Authorization') && env.AXIM_SERVICE_KEY) {
          headers.set('Authorization', `Bearer ${env.AXIM_SERVICE_KEY}`);
        } else if (!env.AXIM_SERVICE_KEY) {
          console.warn("AXIM_SERVICE_KEY is missing from worker environment.");
        }
      }

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
