const fs = require('fs');

let workerCode = fs.readFileSync('worker.js', 'utf8');

workerCode = workerCode.replace(
  `        newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        newHeaders.set('X-Content-Type-Options', 'nosniff');
        newHeaders.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://api.axim.us.com wss://api.axim.us.com; frame-src https://js.stripe.com;");
        // Do not overwrite if it already exists, but for DENY it's probably fine
        if (!newHeaders.has('X-Frame-Options')) {
          newHeaders.set('X-Frame-Options', 'DENY');
        }`,
  `        newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        newHeaders.set('X-Content-Type-Options', 'nosniff');
        newHeaders.set('X-XSS-Protection', '1; mode=block');
        newHeaders.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://api.axim.us.com wss://api.axim.us.com; frame-src https://js.stripe.com;");
        // Do not overwrite if it already exists, but for DENY it's probably fine
        if (!newHeaders.has('X-Frame-Options')) {
          newHeaders.set('X-Frame-Options', 'DENY');
        }`
);

fs.writeFileSync('worker.js', workerCode);
