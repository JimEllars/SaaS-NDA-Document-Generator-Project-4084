import sys

with open('src/components/NDAGeneratorForm.jsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    new_lines.append(line)
    if 'const [showSaveIndicator, setShowSaveIndicator] = useState(false);' in line:
        new_lines.append('''    const [turnstileToken, setTurnstileToken] = useState(null);
    useEffect(() => {
      window.onTurnstileSuccess = (token) => {
        setTurnstileToken(token);
        setFormData(prev => ({ ...prev, 'cf-turnstile-response': token }));
      };
      return () => {
        delete window.onTurnstileSuccess;
      };
    }, []);
''')

with open('src/components/NDAGeneratorForm.jsx', 'w') as f:
    f.writelines(new_lines)
