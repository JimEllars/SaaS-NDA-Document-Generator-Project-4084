const fs = require('fs');

const appTestFile = 'src/tests/App.test.jsx';
let appContent = fs.readFileSync(appTestFile, 'utf8');

// I just need to add `vi.useFakeTimers()` to those three tests!

const testsToFake = [
    "handles error when payment verification fails",
    "handles error when document update fails",
    "handles download, start over flow, and closing checkout"
];
for (const test of testsToFake) {
    const testRegex = new RegExp(`it\\('${test}', async \\(\\) => \\{`);
    if (testRegex.test(appContent) && !appContent.includes(`it('${test}', async () => {\n    vi.useFakeTimers();`)) {
        appContent = appContent.replace(testRegex, `it('${test}', async () => {\n    vi.useFakeTimers();`);
    }
}

fs.writeFileSync(appTestFile, appContent);
