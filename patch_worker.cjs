const fs = require('fs');
let content = fs.readFileSync('worker.js', 'utf8');

const injectionPoint = '// ----------------------------------------------------';
const emailDispatchLogic = `// ----------------------------------------------------
        // --- NEW: Phase 61 Centralized Core Email Dispatch ---
        const recipientEmail = formData.recipientEmail || formData.email;
        if (recipientEmail) {
          ctx.waitUntil(
            (async () => {
              try {
                const emailResponse = await fetch("https://api.axim.us.com/v1/email/transactional/nda-receipt", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: \`Bearer \${env.AXIM_CORE_API_KEY}\`,
                  },
                  body: JSON.stringify({
                    docId: docId,
                    recipientEmail: recipientEmail,
                    timestamp: new Date().toISOString()
                  })
                });

                if (!emailResponse.ok) {
                  throw new Error(\`Email API returned \${emailResponse.status}\`);
                }
              } catch (emailErr) {
                console.error("Email dispatch failed:", emailErr);
                if (env.AXIM_EDGE_KV) {
                   try {
                     const dlqPayload = {
                       event: "email_delivery_failed",
                       docId: docId,
                       recipientEmail: recipientEmail,
                       error: emailErr.message,
                       timestamp: new Date().toISOString()
                     };
                     await env.AXIM_EDGE_KV.put(\`dlq:email:\${docId}\`, JSON.stringify(dlqPayload));
                   } catch (kvErr) {
                     console.error("KV DLQ write failed:", kvErr);
                   }
                }
              }
            })()
          );
        }
        // ----------------------------------------------------`;

content = content.replace(injectionPoint, emailDispatchLogic);
fs.writeFileSync('worker.js', content, 'utf8');
