import fs from 'fs';
let file = fs.readFileSync('src/components/NDAGeneratorForm.jsx', 'utf8');

file = file.replace('} catch (e) {} // fire and forget', '} catch (e) { /* fire and forget */ }');

fs.writeFileSync('src/components/NDAGeneratorForm.jsx', file);
