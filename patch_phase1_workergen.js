import fs from 'fs';
let file = fs.readFileSync('workerDocumentGenerator.js', 'utf8');

file = file.replace('...(formData.includeReturn ? [CLAUSES.general.return] : [])', '...(formData.includeReturn ? [CLAUSES.general.return] : []),\n        ...(formData.includeNonSolicitation ? [{ title: "Non-Solicitation", text: CLAUSES.general.nonSolicitation }] : [])');

fs.writeFileSync('workerDocumentGenerator.js', file);
