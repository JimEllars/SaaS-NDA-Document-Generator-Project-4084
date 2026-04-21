import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { generateDocument, generatePlainText } from './workerDocumentGenerator.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/generate-nda') {
      try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        const formData = await request.json();

        // Ensure the formData has isPaid = true before generating
        const docData = generateDocument({ ...formData, isPaid: true });
        if (!docData) {
          return new Response(JSON.stringify({ error: 'Failed to generate document data' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const plainText = generatePlainText(docData, formData);

        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const margin = 50;
        let currentY = height - margin;
        const fontSize = 12;
        const lineHeight = fontSize * 1.5;

        const lines = plainText.split('\n');

        for (const line of lines) {
          if (currentY < margin) {
            page = pdfDoc.addPage();
            currentY = height - margin;
          }

          if (line.trim() !== '') {
             const isHeader = (line === line.toUpperCase() && line.trim().length > 0) || line.startsWith('Article');
             const currentFont = isHeader ? timesRomanBoldFont : timesRomanFont;
             const currentFontSize = isHeader ? 14 : fontSize;
             const currentLineHeight = currentFontSize * 1.5;

             // Basic word wrap
             const words = line.split(' ');
             let currentLine = '';

             for (let i = 0; i < words.length; i++) {
                const testLine = currentLine + words[i] + ' ';
                const textWidth = currentFont.widthOfTextAtSize(testLine, currentFontSize);

                if (textWidth > width - 2 * margin && i > 0) {
                   page.drawText(currentLine, {
                     x: margin,
                     y: currentY,
                     size: currentFontSize,
                     font: currentFont,
                     color: rgb(0, 0, 0),
                   });
                   currentLine = words[i] + ' ';
                   currentY -= currentLineHeight;
                   if (currentY < margin) {
                      page = pdfDoc.addPage();
                      currentY = height - margin;
                   }
                } else {
                   currentLine = testLine;
                }
             }

             if (currentLine.trim() !== '') {
                 page.drawText(currentLine, {
                   x: margin,
                   y: currentY,
                   size: currentFontSize,
                   font: currentFont,
                   color: rgb(0, 0, 0),
                 });
                 currentY -= currentLineHeight;

                 if (isHeader) {
                    currentY -= (lineHeight * 1.5); // Additional spacing after headers
                 }
             }
          } else {
             currentY -= lineHeight;
          }
        }

        const pdfBytes = await pdfDoc.save();

        return new Response(pdfBytes, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="NDA.pdf"',
            'Access-Control-Allow-Origin': '*',
          }
        });
      } catch (err) {
        console.error('PDF Generation Error:', err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

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

      const internalRoutes = ['/api/v1/telemetry/ingest', '/api/v1/telemetry/events', '/api/v1/telemetry/errors', '/api/v1/telemetry/feedback', '/api/v1/user/document-history', '/api/verify-session'];

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
