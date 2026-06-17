const fs = require('fs');

// NDAGeneratorForm.jsx
let ndaCode = fs.readFileSync('src/components/NDAGeneratorForm.jsx', 'utf8');

// I need to add an explicit Retry Connection recovery sequence
ndaCode = ndaCode.replace(
  `        if (err.name === 'AbortError' || err.message.includes('timeout')) {
          addToast("Network timeout. Please retry connection.", "error");
        } else {
          addToast(err.message || "Failed to generate preview", "error");
        }`,
  `        if (err.name === 'AbortError' || err.message.includes('timeout')) {
          setNetworkError(true);
          addToast("Network timeout. Please retry connection.", "error");
        } else {
          addToast(err.message || "Failed to generate preview", "error");
        }`
);

// We need to declare `const [networkError, setNetworkError] = useState(false);`
ndaCode = ndaCode.replace(
  `    const [isPreviewLoading, setIsPreviewLoading] = useState(false);`,
  `    const [isPreviewLoading, setIsPreviewLoading] = useState(false);\n    const [networkError, setNetworkError] = useState(false);`
);

// Add Retry Connection button next to handlePreview
ndaCode = ndaCode.replace(
  `              <button
                type="button"
                onClick={handlePreview}
                disabled={isPreviewLoading || isOffline}
                className={\`bg-zinc-800 text-zinc-100 font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow \${isPreviewLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-700'}\`}
              >
                {isPreviewLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-zinc-500 border-t-white" />
                ) : (
                  <SafeIcon icon={FiFileText} size={18} />
                )}
                {isPreviewLoading ? "Generating Preview..." : "View Watermarked PDF"}
              </button>`,
  `              <button
                type="button"
                onClick={() => { setNetworkError(false); handlePreview(); }}
                disabled={isPreviewLoading || isOffline}
                className={\`bg-zinc-800 text-zinc-100 font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow \${isPreviewLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-700'}\`}
              >
                {isPreviewLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-zinc-500 border-t-white" />
                ) : networkError ? (
                  <SafeIcon icon={FiRefreshCw} size={18} />
                ) : (
                  <SafeIcon icon={FiFileText} size={18} />
                )}
                {isPreviewLoading ? "Generating Preview..." : networkError ? "Retry Connection" : "View Watermarked PDF"}
              </button>`
);

fs.writeFileSync('src/components/NDAGeneratorForm.jsx', ndaCode);
