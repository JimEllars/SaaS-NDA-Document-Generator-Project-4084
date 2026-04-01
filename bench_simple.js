
const iterations = 10000;
const sections = Array(100).fill({
    title: "Section Title",
    content: [
        { type: 'paragraph', text: "Paragraph text. ".repeat(10) },
        { type: 'clause', number: 1, title: "Clause Title", text: "Clause text. ".repeat(10) }
    ]
});

console.time('+=');
for (let i = 0; i < iterations; i++) {
    let text = '';
    sections.forEach(section => {
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
}
console.timeEnd('+=');

console.time('join');
for (let i = 0; i < iterations; i++) {
    const parts = [];
    for (const section of sections) {
        parts.push(`${section.title.toUpperCase()}\n\n`);
        for (const item of section.content) {
            if (item.type === 'paragraph') {
                parts.push(`${item.text}\n\n`);
            } else {
                parts.push(`${item.number}. ${item.title}\n`, `${item.text}\n\n`);
            }
        }
    }
    const text = parts.join('');
}
console.timeEnd('join');
