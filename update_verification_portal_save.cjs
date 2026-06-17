const fs = require('fs');
let code = fs.readFileSync('src/components/VerificationPortal.jsx', 'utf8');

code = code.replace(
  `    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const trimmedCanvas = sigCanvas.current.getTrimmedCanvas();
      const jpegCanvas = document.createElement('canvas');
      jpegCanvas.width = trimmedCanvas.width;
      jpegCanvas.height = trimmedCanvas.height;
      const ctx = jpegCanvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, jpegCanvas.width, jpegCanvas.height);
      ctx.drawImage(trimmedCanvas, 0, 0);

      setSignatureImage(jpegCanvas.toDataURL("image/jpeg", 0.75));
      setIsSigEmpty(false);
      ctx.clearRect(0, 0, jpegCanvas.width, jpegCanvas.height);
    }`,
  `    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const trimmedCanvas = sigCanvas.current.getTrimmedCanvas();
      const jpegCanvas = document.createElement('canvas');
      jpegCanvas.width = trimmedCanvas.width;
      jpegCanvas.height = trimmedCanvas.height;
      const ctx = jpegCanvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, jpegCanvas.width, jpegCanvas.height);
      ctx.drawImage(trimmedCanvas, 0, 0);

      let dataUrl = jpegCanvas.toDataURL("image/jpeg", 0.75);
      const sizeInBytes = Math.ceil((dataUrl.length * 3) / 4);

      // Canvas Export Optimization & Downscaling
      if (sizeInBytes > 1000000) { // > 1MB
        const downscaledCanvas = document.createElement('canvas');
        downscaledCanvas.width = jpegCanvas.width / 2;
        downscaledCanvas.height = jpegCanvas.height / 2;
        const dsCtx = downscaledCanvas.getContext('2d');
        dsCtx.fillStyle = 'white';
        dsCtx.fillRect(0, 0, downscaledCanvas.width, downscaledCanvas.height);
        dsCtx.drawImage(jpegCanvas, 0, 0, downscaledCanvas.width, downscaledCanvas.height);
        dataUrl = downscaledCanvas.toDataURL("image/jpeg", 0.5);
      }

      setSignatureImage(dataUrl);
      setIsSigEmpty(false);
      ctx.clearRect(0, 0, jpegCanvas.width, jpegCanvas.height);
    }`
);

fs.writeFileSync('src/components/VerificationPortal.jsx', code);
