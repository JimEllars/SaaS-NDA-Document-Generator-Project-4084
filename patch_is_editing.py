import re

with open('src/components/NDAGeneratorForm.jsx', 'r') as f:
    content = f.read()

# Fix the partner conditional to respect isEditing
content = content.replace(
    "{userSession?.is_partner ? (",
    "{userSession?.is_partner && !isEditing ? ("
)

with open('src/components/NDAGeneratorForm.jsx', 'w') as f:
    f.write(content)
