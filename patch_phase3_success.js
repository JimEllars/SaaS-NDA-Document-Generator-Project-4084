import fs from 'fs';
let file = fs.readFileSync('src/components/SuccessPage.jsx', 'utf8');

file = file.replace(/sessionStorage/g, 'localStorage');

fs.writeFileSync('src/components/SuccessPage.jsx', file);
