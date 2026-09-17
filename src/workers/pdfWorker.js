import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

self.onmessage = async (e) => {
  try {
    const { formData } = e.data;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText('Generated Offline NDA', {
      x: 50,
      y: height - 50,
      size: 20,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Disclosing Party: ${formData.disclosing}`, {
      x: 50,
      y: height - 100,
      size: 12,
      font: font,
    });

    page.drawText(`Receiving Party: ${formData.receiving}`, {
      x: 50,
      y: height - 130,
      size: 12,
      font: font,
    });

    const pdfBytes = await pdfDoc.save();

    // Transfer the bytes back
    self.postMessage({ type: 'SUCCESS', pdfBytes }, [pdfBytes.buffer]);
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: error.message });
  }
};
