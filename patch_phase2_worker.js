import fs from 'fs';
let file = fs.readFileSync('worker.js', 'utf8');

// I need to add the /api/generate-preview route.
// It is similar to /api/generate-nda but doesn't check isPaid and adds a watermark.
// I'll extract the core generation logic into a function or just duplicate it in the worker.
// The instructions say "Duplicate the logic from /api/generate-nda, but skip the payment validation."

const generatePreviewLogic = `
    if (request.method === 'POST' && url.pathname === '/api/generate-preview') {
      try {
        const formData = await request.json();

        // Skip payment validation for preview
        const docData = generateDocument({ ...formData, isPaid: true }); // We still pass isPaid: true so it generates
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

        const lines = plainText.split('\\n');

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

        // Add Watermark to all pages
        const pages = pdfDoc.getPages();
        import { degrees } from 'pdf-lib';
        for (const p of pages) {
            const { width, height } = p.getSize();
            p.drawText('DRAFT - NOT FOR LEGAL USE', {
                x: width / 2 - 250,
                y: height / 2 - 50,
                size: 60,
                color: rgb(0.8, 0.8, 0.8),
                opacity: 0.5,
                rotate: degrees(45),
            });
        }

        const pdfBytes = await pdfDoc.save();

        return new Response(pdfBytes, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="Preview.pdf"',
            'Access-Control-Allow-Origin': '*',
          }
        });
      } catch (err) {
        console.error('PDF Preview Generation Error:', err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }
`;

// It complains about "import { degrees }" not being top level. I will just import it at the top of worker.js
file = file.replace("import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';", "import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';");

// Remove the import inside generatePreviewLogic
const finalPreviewLogic = generatePreviewLogic.replace("import { degrees } from 'pdf-lib';", "");

file = file.replace("if (request.method === 'POST' && url.pathname === '/api/generate-nda') {", finalPreviewLogic + "\n    if (request.method === 'POST' && url.pathname === '/api/generate-nda') {");

fs.writeFileSync('worker.js', file);
