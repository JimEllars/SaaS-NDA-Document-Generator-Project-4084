import re

with open('src/components/NDAGeneratorForm.jsx', 'r') as f:
    content = f.read()

pattern = r"(canvas\.width = img\.width / 2;\s*canvas\.height = img\.height / 2;\s*)(ctx\.drawImage)"
replacement = r"\1ctx.fillStyle = '#FFFFFF';\n            ctx.fillRect(0, 0, canvas.width, canvas.height);\n            \2"

new_content = re.sub(pattern, replacement, content)

with open('src/components/NDAGeneratorForm.jsx', 'w') as f:
    f.write(new_content)
