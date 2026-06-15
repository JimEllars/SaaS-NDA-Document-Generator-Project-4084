import re

with open('worker.js', 'r') as f:
    content = f.read()

webhook_code = """
    // Handle Stripe Webhook Idempotency
    if (request.method === "POST" && url.pathname === "/api/webhook/stripe") {
      try {
        const signature = request.headers.get("stripe-signature");
        let rawBody = await request.text();
        let payload;
        try {
          payload = JSON.parse(rawBody);
        } catch (err) {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        // HMAC-SHA256 Webhook Verification natively at the Edge
        if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
          return new Response(JSON.stringify({ error: "Missing signature or secret" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        const sigParts = signature.split(',').reduce((acc, part) => {
          const [key, value] = part.split('=');
          acc[key] = value;
          return acc;
        }, {});

        const t = sigParts.t;
        const v1 = sigParts.v1;

        if (!t || !v1) {
           return new Response(JSON.stringify({ error: "Invalid signature format" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        const signedPayload = `${t}.${rawBody}`;
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(env.STRIPE_WEBHOOK_SECRET),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["verify", "sign"]
        );

        const expectedSigBuffer = await crypto.subtle.sign(
          "HMAC",
          key,
          encoder.encode(signedPayload)
        );

        const expectedSigHex = Array.from(new Uint8Array(expectedSigBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        if (expectedSigHex !== v1) {
          return new Response(JSON.stringify({ error: "Invalid Stripe Signature" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        const eventId = payload.id;
        if (!eventId) {
          return new Response(JSON.stringify({ error: "Missing event ID" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        // Use cache API for idempotency check (60 second TTL)
        const cache = caches.default;
"""

pattern = re.compile(r'\s*// Handle Stripe Webhook Idempotency\s*if \(request\.method === "POST" && url\.pathname === "/api/webhook/stripe"\) \{\s*try \{\s*const signature = request\.headers\.get\("stripe-signature"\);\s*let payload;\s*try \{\s*payload = await request\.json\(\);\s*\} catch \(err\) \{\s*payload = await request\.text\(\);\s*payload = JSON\.parse\(payload\);\s*\}\s*const eventId = payload\.id;\s*if \(!eventId\) \{\s*return new Response\(JSON\.stringify\(\{ error: "Missing event ID" \}\), \{\s*status: 400,\s*headers: \{ "Content-Type": "application/json" \}\s*\}\);\s*\}\s*// Use cache API for idempotency check \(60 second TTL\)\s*const cache = caches\.default;')

new_content = pattern.sub(webhook_code, content)

with open('worker.js', 'w') as f:
    f.write(new_content)
