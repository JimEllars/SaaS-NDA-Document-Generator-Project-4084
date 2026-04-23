import fs from 'fs';
let file = fs.readFileSync('workerNdaData.js', 'utf8');

file = file.replace('includeReturn: true,', 'includeReturn: true,\n  includeNonSolicitation: false,');
file = file.replace('term: (years) => `The obligations of confidentiality shall survive for a period of ${years || 3} years from the date of disclosure of the respective Confidential Information, or until such information becomes publicly available through no fault of the Receiving Party.`,', 'term: (years) => years === "Indefinitely" ? `The obligations of confidentiality shall survive indefinitely from the date of disclosure of the respective Confidential Information, or until such information becomes publicly available through no fault of the Receiving Party.` : `The obligations of confidentiality shall survive for a period of ${years || 3} years from the date of disclosure of the respective Confidential Information, or until such information becomes publicly available through no fault of the Receiving Party.`,');

if(!file.includes('nonSolicitation: "For a period of')) {
    file = file.replace('return: "Upon termination of discussions or upon written request, the Receiving Party shall promptly return or destroy all documents, materials, and other tangible manifestations of Confidential Information and all copies thereof."', 'return: "Upon termination of discussions or upon written request, the Receiving Party shall promptly return or destroy all documents, materials, and other tangible manifestations of Confidential Information and all copies thereof.",\n    nonSolicitation: "For a period of two (2) years following the Effective Date, the Receiving Party shall not, directly or indirectly, solicit or attempt to solicit for employment or engagement any employee or contractor of the Disclosing Party."');
}

fs.writeFileSync('workerNdaData.js', file);
