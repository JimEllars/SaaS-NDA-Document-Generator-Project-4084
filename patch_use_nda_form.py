import re

with open('src/hooks/useNDAForm.js', 'r') as f:
    content = f.read()

# Pattern for formData state initialization
pattern1 = r"(const parsed = JSON\.parse\(decrypted\);\s*)(if \(parsed\.formData\) return parsed\.formData;\s*return parsed;)"
replacement1 = r"\1if (parsed.timestamp && Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {\n          localStorage.removeItem(STORAGE_KEY);\n          return getDefaultFormData();\n        }\n        \2"

# Pattern for currentStep state initialization
pattern2 = r"(const parsed = JSON\.parse\(decrypted\);\s*)(if \(parsed\.currentStep !== undefined\) return parsed\.currentStep;)"
replacement2 = r"\1if (parsed.timestamp && Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {\n          localStorage.removeItem(STORAGE_KEY);\n          return 1;\n        }\n        \2"

# Pattern for dataToSave inside useEffect
pattern3 = r"(const dataToSave = JSON\.stringify\(\{)\s*(formData: formDataRef\.current,)\s*(currentStep: currentStepRef\.current,)\s*(\}\);)"
replacement3 = r"\1\n          \2\n          \3\n          timestamp: Date.now(),\n        \4"

content = re.sub(pattern1, replacement1, content)
content = re.sub(pattern2, replacement2, content)
content = re.sub(pattern3, replacement3, content)

with open('src/hooks/useNDAForm.js', 'w') as f:
    f.write(content)
