import sys

with open('src/components/NDAGeneratorForm.jsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if '<div className="flex flex-col md:flex-row gap-4">' in line:
        context = ''.join(lines[max(0, i-5):i])
        if '<UpsellCard />' in context:
            new_lines.append('''                    <div className="cf-turnstile mb-4 self-center" data-sitekey="0x4AAAAAAAiN_k4R2k2U0d1b" data-callback="onTurnstileSuccess"></div>
''')
    new_lines.append(line)

with open('src/components/NDAGeneratorForm.jsx', 'w') as f:
    f.writelines(new_lines)
