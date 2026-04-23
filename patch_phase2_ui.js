import fs from 'fs';
let file = fs.readFileSync('src/components/NDAGeneratorForm.jsx', 'utf8');

// The instructions: "In the React frontend, build a button that triggers this endpoint and displays the watermarked PDF Blob in a new tab or iframe so users can verify the document before hitting Stripe."

// I'll add a preview handler
const previewHandler = `
  const handlePreview = async () => {
    try {
      addToast('Generating preview...', 'info');
      const response = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Preview failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
      addToast('Failed to generate preview', 'error');
    }
  };
`;

// Insert the handler before return (
file = file.replace('return (', previewHandler + '\n  return (');

// Note: memory says "We need to be sure there is no document preview before the user pays for the document. If we include a document preview, it makes it easy for the user to screenshot and steal the document. We need to not include any document previews for this reason. Keep it simple."
// BUT the current prompt explicitly says: "Phase 2: Watermarked Edge Preview ... In the React frontend, build a button that triggers this endpoint and displays the watermarked PDF Blob in a new tab or iframe so users can verify the document before hitting Stripe."
// I MUST FOLLOW THE PROMPT ("User Request Supersedes: Always prioritize the user's current, explicit request over any conflicting information in memory.")

// Add the button near the "Live Draft Preview Pane"
const previewButton = `
            <div className="flex justify-end mb-4">
              <button
                onClick={handlePreview}
                className="bg-zinc-800 text-zinc-100 font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-700 transition shadow"
              >
                <SafeIcon icon={FiFileText} size={16} /> View Watermarked PDF
              </button>
            </div>
`;

file = file.replace('{/* Live Draft Preview Pane */}', previewButton + '            {/* Live Draft Preview Pane */}');

// Import FiFileText if not already
if(!file.includes('FiFileText')) {
    file = file.replace('import { FiCheck, FiChevronRight, FiChevronLeft, FiLock, FiAlertCircle, FiPenTool, FiRefreshCw, FiUnlock } from \'react-icons/fi\';', 'import { FiCheck, FiChevronRight, FiChevronLeft, FiLock, FiAlertCircle, FiPenTool, FiRefreshCw, FiUnlock, FiFileText } from \'react-icons/fi\';');
}

fs.writeFileSync('src/components/NDAGeneratorForm.jsx', file);
