import fs from 'fs';
let file = fs.readFileSync('src/hooks/useNDAForm.js', 'utf8');

// The prompt: "Implement a useEffect hook that serializes the current form data into localStorage... on every change."
// Current implementation uses sessionStorage.
// I will change all sessionStorage to localStorage in useNDAForm.js and SuccessPage.jsx.

file = file.replace(/sessionStorage/g, 'localStorage');

fs.writeFileSync('src/hooks/useNDAForm.js', file);
