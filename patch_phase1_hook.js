import fs from 'fs';
let file = fs.readFileSync('src/hooks/useNDAForm.js', 'utf8');

file = file.replace('includeReturn: true,', 'includeReturn: true,\n  includeNonSolicitation: false,');

fs.writeFileSync('src/hooks/useNDAForm.js', file);
