import re

with open('worker.js', 'r') as f:
    content = f.read()

# Pattern for /api/generate-preview
pattern1 = r"(const { pdfBytes, docId } = await generatePdfBytes\(plainText, formData\);)"
replacement1 = """const start = Date.now();
        const { pdfBytes, docId } = await generatePdfBytes(plainText, formData);
        const duration_ms = Date.now() - start;

        ctx.waitUntil(
          fetch(
            `${env.VITE_PAYMENT_API_URL || "https://api.axim.us.com"}/v1/telemetry/ingest`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${env.AXIM_SERVICE_KEY}`,
              },
              body: JSON.stringify({
                event: "pdf_generation_success",
                app_type: "nda",
                duration_ms: duration_ms,
              }),
            }
          ).catch(e => console.error(e))
        );"""

# Replace all occurrences (preview and nda)
new_content = re.sub(pattern1, replacement1, content)

with open('worker.js', 'w') as f:
    f.write(new_content)
