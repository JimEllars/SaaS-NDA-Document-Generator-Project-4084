const fs = require('fs');

const path = 'src/components/NDAGeneratorForm.test.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace setFormData mock testing with a more agnostic approach that uses onChange or setFormData
content = content.replace(/expect\(defaultProps\.setFormData\)/g, 'expect(defaultProps.onChange || defaultProps.setFormData)');
content = content.replace(/let updaterFn = defaultProps\.setFormData\.mock/g, 'let updaterFn = (defaultProps.onChange || defaultProps.setFormData).mock');
content = content.replace(/updaterFn = defaultProps\.setFormData\.mock/g, 'updaterFn = (defaultProps.onChange || defaultProps.setFormData).mock');

fs.writeFileSync(path, content);
console.log('Done');
