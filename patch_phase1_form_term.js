import fs from 'fs';
let file = fs.readFileSync('src/components/NDAGeneratorForm.jsx', 'utf8');

file = file.replace('and will remain in effect for a duration of <strong>{formData.term} {formData.term === \'1\' ? \'year\' : \'years\'}</strong>.', 'and will remain in effect {formData.term === "Indefinitely" ? <strong>indefinitely</strong> : <>for a duration of <strong>{formData.term} {formData.term === \'1\' ? \'year\' : \'years\'}</strong></>}.');
file = file.replace('                  Protection level is set to <strong>{formData.strictness === \'robust\' ? \'Enhanced (with Penalties)\' : \'Standard\'}</strong>.\n                  {formData.includeReturn ? \' A document return clause is included.\' : \'\'}', '                  Protection level is set to <strong>{formData.strictness === \'robust\' ? \'Enhanced (with Penalties)\' : \'Standard\'}</strong>.\n                  {formData.includeReturn ? \' A document return clause is included.\' : \'\'}\n                  {formData.includeNonSolicitation ? \' A non-solicitation clause is included.\' : \'\'}');

fs.writeFileSync('src/components/NDAGeneratorForm.jsx', file);
