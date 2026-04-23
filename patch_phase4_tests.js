import fs from 'fs';
let file = fs.readFileSync('src/hooks/useNDAForm.security.test.js', 'utf8');

file = file.replace(/sessionStorage/g, 'localStorage');

fs.writeFileSync('src/hooks/useNDAForm.security.test.js', file);
