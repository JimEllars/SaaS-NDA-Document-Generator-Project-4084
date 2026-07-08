import sys

with open('src/components/NDAGeneratorForm.jsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if 'disabled={!isFormValid || isOffline}' in line:
        context = ''.join(lines[max(0, i-5):i])
        if 'onClick={isEditing ? onUpdate : handlePurchaseClick}' in context or 'onClick={onPartnerCheckout}' in context:
            new_lines.append(line.replace('disabled={!isFormValid || isOffline}', 'disabled={!isFormValid || isOffline || !turnstileToken}'))
        else:
            new_lines.append(line)
    else:
        new_lines.append(line)

with open('src/components/NDAGeneratorForm.jsx', 'w') as f:
    f.writelines(new_lines)
