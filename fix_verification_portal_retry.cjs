const fs = require('fs');
let code = fs.readFileSync('src/components/VerificationPortal.jsx', 'utf8');

code = code.replace(
  `          {status === 'timeout' && (
            <div className="bg-amber-900/20 border border-amber-500/30 text-amber-400 p-6 rounded-xl flex flex-col gap-4 mb-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <SafeIcon icon={FiAlertCircle} size={24} />
                <h3 className="text-xl font-bold">Verification Request Timeout</h3>
              </div>
              <p className="text-sm">The secure verification query has timed out. The trace ID connection was interrupted. Please retry your verification.</p>
              <button
                onClick={handleVerify}
                className="self-start px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl transition flex items-center gap-2 border border-amber-500/50"
              >
                <SafeIcon icon={FiRefreshCw} size={18} />
                Retry Verification
              </button>
            </div>
          )}`,
  `          {status === 'timeout' && (
            <div className="bg-amber-900/20 border border-amber-500/30 text-amber-400 p-6 rounded-xl flex flex-col gap-4 mb-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <SafeIcon icon={FiAlertCircle} size={24} />
                <h3 className="text-xl font-bold">Network Connection Interrupted</h3>
              </div>
              <p className="text-sm">The connection timed out during execution. Please check your network and retry.</p>
              <button
                onClick={isSignMode ? submitSignature : handleVerify}
                className="self-start px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl transition flex items-center gap-2 border border-amber-500/50"
              >
                <SafeIcon icon={FiRefreshCw} size={18} />
                Retry Connection
              </button>
            </div>
          )}`
);

fs.writeFileSync('src/components/VerificationPortal.jsx', code);
