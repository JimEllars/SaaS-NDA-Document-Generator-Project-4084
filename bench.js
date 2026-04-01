
const generatePlainTextOriginal = (documentData, formData) => {
  if (!documentData) return '';

  let text = '';
  text += `${documentData.title}\n`;
  text += `Effective Date: ${documentData.effectiveDate}\n\n`;
  text += 'RECITALS\n';
  text += `${documentData.intro}\n\n`;
  text += 'NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:\n\n';

  documentData.sections.forEach(section => {
      text += `${section.title.toUpperCase()}\n\n`;
      section.content.forEach(item => {
          if (item.type === 'paragraph') {
              text += `${item.text}\n\n`;
          } else {
              text += `${item.number}. ${item.title}\n`;
              text += `${item.text}\n\n`;
          }
      });
  });

  text += 'EXECUTION\n\n';
  text += 'IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.\n\n';

  const party1Label = formData.type === 'mutual' ? 'PARTY 1' : 'DISCLOSING PARTY';
  const party2Label = formData.type === 'mutual' ? 'PARTY 2' : 'RECEIVING PARTY';

  text += `${party1Label}: ${formData.disclosing || '[Party Name]'}\n`;
  text += 'Print Name: _________________________\n';
  text += 'Title: _______________________________\n';
  text += 'Date: _______________________________\n\n';

  text += `${party2Label}: ${formData.receiving || '[Party Name]'}\n`;
  text += 'Print Name: _________________________\n';
  text += 'Title: _______________________________\n';
  text += 'Date: _______________________________\n';

  return text;
};

const generatePlainTextOptimized = (documentData, formData) => {
    if (!documentData) return '';

    const textParts = [];
    textParts.push(documentData.title, '\n');
    textParts.push('Effective Date: ', documentData.effectiveDate, '\n\n');
    textParts.push('RECITALS\n');
    textParts.push(documentData.intro, '\n\n');
    textParts.push('NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:\n\n');

    for (const section of documentData.sections) {
        textParts.push(section.title.toUpperCase(), '\n\n');
        for (const item of section.content) {
            if (item.type === 'paragraph') {
                textParts.push(item.text, '\n\n');
            } else {
                textParts.push(item.number.toString(), '. ', item.title, '\n');
                textParts.push(item.text, '\n\n');
            }
        }
    }

    textParts.push('EXECUTION\n\n');
    textParts.push('IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.\n\n');

    const party1Label = formData.type === 'mutual' ? 'PARTY 1' : 'DISCLOSING PARTY';
    const party2Label = formData.type === 'mutual' ? 'PARTY 2' : 'RECEIVING PARTY';

    textParts.push(party1Label, ': ', formData.disclosing || '[Party Name]', '\n');
    textParts.push('Print Name: _________________________\n');
    textParts.push('Title: _______________________________\n');
    textParts.push('Date: _______________________________\n\n');

    textParts.push(party2Label, ': ', formData.receiving || '[Party Name]', '\n');
    textParts.push('Print Name: _________________________\n');
    textParts.push('Title: _______________________________\n');
    textParts.push('Date: _______________________________\n');

    return textParts.join('');
};

const largeDocData = {
    title: "NDA",
    effectiveDate: "2023-10-27",
    intro: "Intro content here. ".repeat(100),
    sections: Array(500).fill({
        title: "Section Title",
        content: [
            { type: 'paragraph', text: "Paragraph text. ".repeat(50) },
            { type: 'clause', number: 1, title: "Clause Title", text: "Clause text. ".repeat(50) }
        ]
    })
};

const baseFormData = {
    type: 'mutual',
    disclosing: 'Company A'.repeat(10),
    receiving: 'Company B'.repeat(10)
};

const iterations = 1000;

console.log('Starting benchmark...');

// Warm up
for (let i = 0; i < 100; i++) {
    generatePlainTextOriginal(largeDocData, baseFormData);
    generatePlainTextOptimized(largeDocData, baseFormData);
}

const startOrig = performance.now();
for (let i = 0; i < iterations; i++) {
    generatePlainTextOriginal(largeDocData, baseFormData);
}
const endOrig = performance.now();
console.log(`Original: ${endOrig - startOrig}ms`);

const startOpt = performance.now();
for (let i = 0; i < iterations; i++) {
    generatePlainTextOptimized(largeDocData, baseFormData);
}
const endOpt = performance.now();
console.log(`Optimized: ${endOpt - startOpt}ms`);

const improvement = ((endOrig - startOrig) - (endOpt - startOpt)) / (endOrig - startOrig) * 100;
console.log(`Improvement: ${improvement.toFixed(2)}%`);
