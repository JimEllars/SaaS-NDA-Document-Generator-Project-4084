const fs = require('fs');
let content = fs.readFileSync('src/components/SuccessPage.jsx', 'utf8');

const injectionPoint = `        <div className="bg-black/30 border border-white/10 rounded-xl p-6 text-left max-w-md mx-auto print:hidden">`;
const emailBannerLogic = `        {/* NEW: Phase 61 Auto-Email Delivery Confirmation Banner */}
        {(documentData?.recipientEmail || documentData?.email) && (
          <div className="bg-axim-teal/10 border border-axim-teal/20 backdrop-blur-md rounded-xl p-4 mb-8 text-center max-w-md mx-auto print:hidden flex items-center justify-center gap-3">
            <SafeIcon icon={FiMail} className="text-axim-teal flex-shrink-0" size={24} />
            <p className="text-sm text-axim-teal/90">
              A secure copy and receipt have been automatically sent to <strong className="text-axim-teal">{documentData.recipientEmail || documentData.email}</strong>.
            </p>
          </div>
        )}

        <div className="bg-black/30 border border-white/10 rounded-xl p-6 text-left max-w-md mx-auto print:hidden">`;

content = content.replace(injectionPoint, emailBannerLogic);
fs.writeFileSync('src/components/SuccessPage.jsx', content, 'utf8');
