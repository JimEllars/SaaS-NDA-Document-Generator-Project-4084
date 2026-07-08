import sys

with open('src/components/NDAGeneratorForm.jsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if 'data-sitekey="1x00000000000000000000AA"' in line:
        new_lines.append(line.replace('1x00000000000000000000AA', '1x00000000000000000000AA'))
    else:
        new_lines.append(line)

with open('src/components/NDAGeneratorForm.jsx', 'w') as f:
    f.writelines(new_lines)
