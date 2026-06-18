with open("src/components/Toast.test.jsx", "r") as f:
    content = f.read()

content = content.replace("'bg-black/80', 'text-blue-400', 'border-blue-500/50'", "'bg-black/80', 'text-zinc-300', 'border-white/10'")

with open("src/components/Toast.test.jsx", "w") as f:
    f.write(content)

with open("src/tests/ConfirmModal.test.jsx", "r") as f:
    content = f.read()

content = content.replace("'bg-blue-600'", "'bg-axim-teal'")
content = content.replace("'bg-red-600'", "'bg-red-500'")

with open("src/tests/ConfirmModal.test.jsx", "w") as f:
    f.write(content)
