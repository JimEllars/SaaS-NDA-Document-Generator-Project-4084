import re

with open('src/components/NDAGeneratorForm.telemetry.test.jsx', 'r') as f:
    content = f.read()

content = content.replace("let let batchCalls_first", "let batchCalls_first")
content = content.replace("let batchCalls_first = global.fetch.mock.calls.filter", "batchCalls_first = global.fetch.mock.calls.filter")
content = content.replace("     batchCalls_first = global.fetch.mock.calls.filter", "     let batchCalls_first = global.fetch.mock.calls.filter", 1)

with open('src/components/NDAGeneratorForm.telemetry.test.jsx', 'w') as f:
    f.write(content)

print("Patch applied to NDAGeneratorForm.telemetry.test.jsx")
