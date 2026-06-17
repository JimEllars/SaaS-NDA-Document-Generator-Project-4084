const fs = require('fs');
let code = fs.readFileSync('src/components/VerificationPortal.jsx', 'utf8');

code = code.replace(
  `      // Base64 Payload Trimming (Memory Protection)
      let finalSignatureImage = signatureImage;
      const sizeInBytes = Math.ceil((finalSignatureImage.length * 3) / 4);
      if (sizeInBytes > 1000000) { // > 1MB
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = finalSignatureImage;
        await new Promise(resolve => {
          img.onload = () => {
            canvas.width = img.width / 2;
            canvas.height = img.height / 2;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            finalSignatureImage = canvas.toDataURL('image/jpeg', 0.5); // Downscale & compress
            resolve();
          };
        });
      }`,
  `      // Base64 Payload Trimming (Memory Protection)
      let finalSignatureImage = signatureImage;
      const sizeInBytes = Math.ceil((finalSignatureImage.length * 3) / 4);
      if (sizeInBytes > 1000000) { // > 1MB
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = finalSignatureImage;
        await new Promise((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width / 2;
            canvas.height = img.height / 2;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            finalSignatureImage = canvas.toDataURL('image/jpeg', 0.5); // Downscale & compress
            resolve();
          };
          img.onerror = reject;
        });
      }`
);

fs.writeFileSync('src/components/VerificationPortal.jsx', code);
