import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import SignatureCanvas from "react-signature-canvas";
import React, { useRef, useState, useEffect, useCallback } from "react";
import useVectorSearch from "../hooks/useVectorSearch";
// Use named imports from react-icons to enable tree-shaking and reduce bundle size
import {
  FiBriefcase,
  FiFileText,
  FiCpu,
  FiCheck,
  FiLock,
  FiRefreshCw,
  FiRotateCcw,
  FiCalendar,
  FiAlertCircle,
  FiUnlock,
  FiChevronRight,
  FiChevronLeft,
  FiPenTool,
  FiMail,
  FiShield,
  FiUser,
  FiHelpCircle,
  FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../context/ToastContext";
import SafeIcon from "../common/SafeIcon";
import UpsellCard from "./UpsellCard";
import useFormValidation from "../hooks/useFormValidation";
import { JURISDICTIONS, INDUSTRY_OPTIONS } from "../common/documentConstants";

const FIELD_BASE_CLASSES =
  "w-full p-4 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-axim-teal focus:border-axim-teal outline-none text-zinc-100 placeholder-zinc-500";
const INPUT_CLASSES = `${FIELD_BASE_CLASSES} transition`;
const SELECT_CLASSES = FIELD_BASE_CLASSES;
const LABEL_CLASSES = "text-sm font-bold text-zinc-300 mb-2";
const TOGGLE_BUTTON_BASE_CLASSES =
  "flex-1 py-3 text-sm font-bold rounded-lg transition";

const NDAGeneratorForm = React.memo(
  ({
    formData,
    setFormData,
    currentStep = 1,
    setCurrentStep,
    onPurchase,
    isEditing,
    onUpdate,
    userSession,
    onPartnerCheckout,
    isOffline,
  }) => {
    const { addToast, removeToast } = useToast();



    const trackingSessionId = React.useRef(
      `sess_${Math.random().toString(36).substring(2, 9)}`,
    );

    const handleBypass = React.useCallback(() => {
      // Navigate using a dummy session ID to trigger successful state
      window.location.href = "/success?session_id=AXM-BYPASS";
    }, []);

    const handleInputChange = React.useCallback(
      (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        }));
      },
      [setFormData],
    );


    const wasOffline = useRef(isOffline);
    const offlineToastId = useRef(null);
    useEffect(() => {
      if (isOffline && !wasOffline.current) {
        offlineToastId.current = addToast("Connection Lost: Your progress is securely saved locally. Retrying connection...", "warning", 0);
      } else if (!isOffline && wasOffline.current) {
        if (offlineToastId.current) {
          removeToast(offlineToastId.current);
          offlineToastId.current = null;
        }
        addToast("Connection Restored: Sync complete.", "success");
      }
      wasOffline.current = isOffline;
    }, [isOffline, addToast, removeToast]);

    const { isValid: isFormValid, validationMessage } =
      useFormValidation(formData);
    const sigCanvas = useRef(null);

    // Handle window resize for SignatureCanvas
    React.useEffect(() => {
      const handleResize = () => {
        if (sigCanvas.current) {
          // Save current drawn data
          const data = sigCanvas.current.toData();
          // Force re-render of canvas by clearing, but we actually just need to re-apply data after resize
          sigCanvas.current.clear();
          setTimeout(() => {
            if (sigCanvas.current) {
              if (data && data.length > 0) {
                  sigCanvas.current.fromData(data);
                  setIsSigEmpty(false);
              } else {
                  setIsSigEmpty(true);
                  // Trigger a warning if they were drawing and lost it (though empty means nothing lost)
              }
            }
          }, 50);
        }
      };

      let resizeTimer;
      const debouncedHandleResize = () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
             handleResize();
             // Since mobile resize can be jarring, ensure we show a toast if data existed but got corrupted (unlikely with this approach, but good UX to warn)
             // For now just relying on the fromData restoration which should be robust.
          }, 100);
      };

      window.addEventListener("resize", debouncedHandleResize);
      return () => {
         clearTimeout(resizeTimer);
         window.removeEventListener("resize", debouncedHandleResize);
      }
    }, []);

    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isSigEmpty, setIsSigEmpty] = useState(true);
    const [signatureMode, setSignatureMode] = useState('draw'); // 'draw' or 'type'
    const [typedSignature, setTypedSignature] = useState('');

    // AI Advisor
    const {
      search: searchIntelligenceAI,
      results: aiResults,
      isSearching: isAiSearching,
    } = useVectorSearch();
    const [advisorModalOpen, setAdvisorModalOpen] = useState(false);
    const [advisorTopic, setAdvisorTopic] = useState("");

    const [advisorRisk, setAdvisorRisk] = useState(null);

  // Generate AI Summary for Step 2
  const [aiSummary, setAiSummary] = useState([]);


  useEffect(() => {
    if (advisorModalOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setAdvisorModalOpen(false);
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [advisorModalOpen]);

  useEffect(() => {
    if (currentStep === 2) {
      const generateSummary = async () => {
        const query = `Summarize NDA clauses: ${formData.strictness} strictness, ${formData.term} year term, ${formData.includeReturn ? 'includes' : 'no'} return, ${formData.includeNonSolicitation ? 'includes' : 'no'} non-solicit.`;
        await searchIntelligenceAI(query);
      };

      const timeoutId = setTimeout(generateSummary, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [currentStep, formData.strictness, formData.term, formData.includeReturn, formData.includeNonSolicitation, searchIntelligenceAI]);

  useEffect(() => {
    if (aiResults && aiResults.length > 0) {
       // Mock the bullets based on results or form data
       setAiSummary([
         `You are protected for ${formData.term === "Indefinitely" ? "an indefinite period" : formData.term + " years"}.`,
         formData.includeNonSolicitation ? "The counterparty cannot hire your staff." : "No non-solicitation restrictions applied.",
         formData.strictness === "robust" ? "Enhanced protection with enforcement penalties." : "Standard mutual protection rules apply."
       ]);
    } else {
       // Fallback mock
       setAiSummary([
         `You are protected for ${formData.term === "Indefinitely" ? "an indefinite period" : formData.term + " years"}.`,
         formData.includeNonSolicitation ? "The counterparty cannot hire your staff." : "No non-solicitation restrictions applied.",
         formData.strictness === "robust" ? "Enhanced protection with enforcement penalties." : "Standard mutual protection rules apply."
       ]);
    }
  }, [aiResults, formData]);


    const openAdvisor = async (topic, clause) => {
      setAdvisorTopic(topic);
      setAdvisorModalOpen(true);

      // Assess Risk Level locally based on industry & strictness
      const highRiskIndustries = ["tech", "financial", "healthcare"];
      let riskLevel = "Low";
      if (
        highRiskIndustries.includes(formData.industry) &&
        formData.strictness === "standard"
      ) {
        riskLevel = "High";
      } else if (
        highRiskIndustries.includes(formData.industry) &&
        formData.strictness === "robust"
      ) {
        riskLevel = "Low";
      } else if (formData.strictness === "standard") {
        riskLevel = "Medium";
      }

      setAdvisorRisk(riskLevel);

      const query = `Risk Assessment (${riskLevel}): Why is ${clause} critical for the ${formData.industry || "general"} industry?`;
      await searchIntelligenceAI(query);
    };


    const clearSignature = () => {
      setTypedSignature('');
      if (sigCanvas.current) {
        sigCanvas.current.clear();
      }
      setIsSigEmpty(true);
      setFormData((prev) => ({ ...prev, signatureImage: null }));
    };

    const undoSignature = () => {
      if (sigCanvas.current) {
        const data = sigCanvas.current.toData();
        if (data && data.length > 0) {
          data.pop(); // remove the last stroke
          sigCanvas.current.clear();
          sigCanvas.current.fromData(data);

          if (data.length === 0) {
             setIsSigEmpty(true);
          }
        }
      }
    };

    const handleSignatureModeChange = (mode) => {
      setSignatureMode(mode);
      clearSignature();
    };

    const saveSignature = async () => {
      // Helper function to downscale if > 1MB
      const compressSignature = async (dataUrl) => {
        const sizeInBytes = Math.ceil((dataUrl.length * 3) / 4);
        if (sizeInBytes <= 1000000) return dataUrl;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = dataUrl;
        return new Promise(resolve => {
          img.onload = () => {
            canvas.width = img.width / 2;
            canvas.height = img.height / 2;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.5));
          };
        });
      };

      if (signatureMode === 'type') {
        if (typedSignature.trim()) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const dpr = window.devicePixelRatio || 1;
          canvas.width = 400 * dpr;
          canvas.height = 100 * dpr;
          ctx.scale(dpr, dpr);

          // Fill white background for JPEG
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 400, 100);

          try {
            await Promise.race([
              document.fonts.load('italic 36px "Cedarville Cursive"'),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Font load timeout')), 2500))
            ]);
            ctx.font = 'italic 36px "Cedarville Cursive", serif';
          } catch (e) {
            console.warn("Font loading not fully supported or failed", e);
            ctx.font = 'italic 36px serif';
          }

          ctx.fillStyle = 'black';
          ctx.textBaseline = 'middle';
          ctx.fillText(typedSignature, 10, 50);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
          compressSignature(dataUrl).then((compressedDataUrl) => {
            setFormData((prev) => ({
              ...prev,
              signatureImage: compressedDataUrl,
            }));
          });
          setIsSigEmpty(false);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        return;
      }
      if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
        const trimmedCanvas = sigCanvas.current.getTrimmedCanvas();
        // Create a new canvas to put the trimmed signature onto a white background
        const jpegCanvas = document.createElement('canvas');
        jpegCanvas.width = trimmedCanvas.width;
        jpegCanvas.height = trimmedCanvas.height;
        const ctx = jpegCanvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, jpegCanvas.width, jpegCanvas.height);
        ctx.drawImage(trimmedCanvas, 0, 0);

        const dataUrl = jpegCanvas.toDataURL("image/jpeg", 0.75);
        compressSignature(dataUrl).then((compressedDataUrl) => {
          setFormData((prev) => ({
            ...prev,
            signatureImage: compressedDataUrl,
          }));
        });
        setIsSigEmpty(false);
        ctx.clearRect(0, 0, jpegCanvas.width, jpegCanvas.height);
      }
    };


    const telemetryQueue = useRef([]);

    // Helper function to mask email PII
    const maskEmail = (email) => {
      if (!email || typeof email !== 'string' || !email.includes('@')) return email;
      const [localPart, domain] = email.split('@');
      return `${localPart.substring(0, 2)}***@${domain}`;
    };

    const flushTelemetry = useCallback(() => {
      if (telemetryQueue.current.length === 0) return;

      // Compress Telemetry Payload Array
      const compressedEvents = [...telemetryQueue.current].map((current) => {
           // Flatten JSON objects by omitting empty keys to trim footprint
           const flattened = Object.fromEntries(
             Object.entries(current).filter(([_, v]) => v != null && v !== '')
           );

           // Scrub PII from payload
           if (flattened.payload) {
             const newPayload = { ...flattened.payload };
             if (newPayload.email) newPayload.email = maskEmail(newPayload.email);
             if (newPayload.recipientEmail) newPayload.recipientEmail = maskEmail(newPayload.recipientEmail);
             flattened.payload = newPayload;
           }

           return flattened;
      });
      telemetryQueue.current = [];

      try {
        fetchWithTimeout("/api/v1/telemetry/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batch: compressedEvents }),
        });
      } catch (e) {
        // Silently fail telemetry in production
      }
    }, []);

    useEffect(() => {
      const intervalId = setInterval(flushTelemetry, 10000);
      const handleBeforeUnload = () => flushTelemetry();

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener("beforeunload", handleBeforeUnload);
        flushTelemetry();
      };
    }, [flushTelemetry]);

    const queueTelemetry = useCallback((eventName) => {
      telemetryQueue.current.push({
        event: eventName,
        sessionId: trackingSessionId.current,
        timestamp: new Date().toISOString(),
      });
    }, []);

    const nextStep = () => {
      if (isOffline) return;
      queueTelemetry(`nda_step_${currentStep}_completed`);
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    };
    const prevStep = () => {
      if (isOffline) return;
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const progressSteps = [
      { id: 1, label: "1. Details" },
      { id: 2, label: "2. Clauses" },
      { id: 3, label: "3. Sign" },
      { id: 4, label: "4. Preview & Pay" },
    ];

    const renderProgressBar = () => (
      <div className="flex flex-col mb-8 relative px-4">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full z-0"></div>
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-axim-teal rounded-full z-0 transition-all duration-300"
            style={{
              width: `${((currentStep - 1) / (progressSteps.length - 1)) * 100}%`,
            }}
          ></div>
          {progressSteps.map((step) => (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep >= step.id ? "bg-axim-teal text-black shadow-[0_0_10px_rgba(0,229,255,0.5)]" : "bg-zinc-800 text-zinc-500 border border-white/10"}`}
              >
                {step.id}
              </div>
              <div
                className={`absolute top-10 whitespace-nowrap text-xs font-semibold ${currentStep >= step.id ? "text-axim-teal" : "text-zinc-500"}`}
              >
                {step.label}
              </div>
            </div>
          ))}
        </div>
        <div className="h-6"></div> {/* Spacer for labels */}
      </div>
    );

    const slideVariants = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    };



    const handlePurchaseClick = () => {
      if (isOffline) return;
      queueTelemetry("nda_checkout_initiated");
      flushTelemetry(); // Flush immediately before redirect
      onPurchase();
    };

    const handlePreview = async () => {
      if (isPreviewLoading) return;
      try {
        setIsPreviewLoading(true);
        addToast("Generating preview...", "info");
        const response = await fetchWithTimeout("/api/generate-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        if (!response.ok) throw new Error("Preview failed");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } catch (err) {
        console.error(err);
        addToast(err.message || "Failed to generate preview", "error");
      } finally {
        setIsPreviewLoading(false);
      }
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Instructions */}
        <div className="bg-axim-teal/5 border border-axim-teal/20 rounded-xl p-4 text-sm text-zinc-300">
          <p className="flex gap-2">
            <SafeIcon
              icon={FiBriefcase}
              className="text-axim-teal mt-0.5"
              size={16}
            />
            Please fill out the details below to generate your custom
            Non-Disclosure Agreement. Once completed, you can purchase and
            download the legally binding document in PDF format.
          </p>
        </div>

        {renderProgressBar()}

        {advisorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="advisor-title">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-sm w-full p-6 relative shadow-2xl" onKeyDown={(e) => { if (e.key === "Tab") { const focusableElements = e.currentTarget.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"); const firstElement = focusableElements[0]; const lastElement = focusableElements[focusableElements.length - 1]; if (e.shiftKey) { if (document.activeElement === firstElement) { lastElement.focus(); e.preventDefault(); } } else { if (document.activeElement === lastElement) { firstElement.focus(); e.preventDefault(); } } } }} tabIndex="-1">
              <button
                onClick={() => setAdvisorModalOpen(false)}
                disabled={isOffline}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <SafeIcon icon={FiX} size={20} />
              </button>

              <h3 id="advisor-title" className="text-lg font-bold text-white mb-2 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <SafeIcon icon={FiHelpCircle} className="text-axim-teal" /> AI Advisor: {advisorTopic}
                </div>
                {advisorRisk && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    advisorRisk === "High" ? "text-red-400" :
                    advisorRisk === "Medium" ? "text-amber-400" :
                    "text-teal-400"
                  }`}>
                    <SafeIcon icon={FiShield} size={14} /> Risk Level: {advisorRisk}
                  </div>
                )}
              </h3>
              {isAiSearching ? (
                <div className="animate-pulse flex space-x-4 mt-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-2 bg-zinc-700 rounded w-3/4"></div>
                    <div className="h-2 bg-zinc-700 rounded"></div>
                    <div className="h-2 bg-zinc-700 rounded w-5/6"></div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-zinc-300 leading-relaxed">
                  {aiResults && aiResults.length > 0 ? (
                    <p>{aiResults[0].content}</p>
                  ) : (
                    <p>
                      Recommended for {formData.industry || "this"} to ensure
                      optimal protection of sensitive assets and intellectual
                      property.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <SafeIcon
                    icon={FiFileText}
                    size={20}
                    className="text-axim-teal"
                  />
                  The Parties
                </h2>

                <div className="space-y-5">
                  {/* Agreement Type Toggle */}
                  <div className="flex flex-col gap-2 mb-6">
                    <div
                      className="flex p-1 bg-black/50 rounded-xl border border-white/10"
                      role="radiogroup"
                      aria-label="Agreement Type"
                    >
                      <button
                        type="button"
                        disabled={isOffline}
                        role="radio"
                        aria-checked={formData.type === "unilateral"}
                        onClick={() =>
                          setFormData((p) => ({ ...p, type: "unilateral" }))
                        }
                        className={`${TOGGLE_BUTTON_BASE_CLASSES} ${
                          formData.type === "unilateral"
                            ? "bg-axim-teal/20 shadow-sm text-axim-teal"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Unilateral NDA
                      </button>
                      <button
                        type="button"
                        disabled={isOffline}
                        role="radio"
                        aria-checked={formData.type === "mutual"}
                        onClick={() =>
                          setFormData((p) => ({ ...p, type: "mutual" }))
                        }
                        className={`${TOGGLE_BUTTON_BASE_CLASSES} ${
                          formData.type === "mutual"
                            ? "bg-axim-teal/20 shadow-sm text-axim-teal"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Mutual NDA
                      </button>
                    </div>
                    <p className="text-xs text-zinc-400 px-1">
                      {formData.type === "unilateral"
                        ? "One party (Disclosing) shares information with another (Receiving)."
                        : "Both parties share confidential information with each other."}
                    </p>
                  </div>

                  {/* Party Information */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label
                        htmlFor="disclosing"
                        className={`${LABEL_CLASSES} block`}
                      >
                        Disclosing Party{" "}
                        {formData.type === "mutual" ? "(Party 1)" : ""}
                      </label>
                      <div className="relative">
                        <input
                          id="disclosing"
                          aria-invalid={!isFormValid && validationMessage.includes("disclosing") ? "true" : "false"}
                          name="disclosing"
                          value={formData.disclosing}
                          onChange={handleInputChange}
                          placeholder="Company or Individual Name"
                          autoComplete="organization"
                          className={INPUT_CLASSES}
                          required
                          maxLength="255"
                        />
                        {userSession?.name &&
                          formData.disclosing === userSession.name && (
                            <div
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-axim-teal"
                              title="Verified by AXiM Passport"
                            >
                              <SafeIcon icon={FiShield} />
                            </div>
                          )}
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="receiving"
                        className={`${LABEL_CLASSES} block`}
                      >
                        Receiving Party{" "}
                        {formData.type === "mutual" ? "(Party 2)" : ""}
                      </label>
                      <input
                        id="receiving"
                        aria-invalid={!isFormValid && validationMessage.includes("receiving") ? "true" : "false"}
                        name="receiving"
                        value={formData.receiving}
                        onChange={handleInputChange}
                        placeholder="Counterparty Name"
                        autoComplete="organization"
                        className={INPUT_CLASSES}
                        required
                        maxLength="255"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 col-span-1 md:col-span-2 mt-4 border-t border-white/10 pt-4">
                    <h3 className="text-xl font-bold text-axim-teal flex items-center gap-2">
                      <SafeIcon icon={FiMail} size={20} /> Contact Details
                    </h3>
                    <div>
                      <label htmlFor="email" className={LABEL_CLASSES}>
                        Email Address (for document delivery)
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          aria-invalid={!isFormValid && validationMessage.includes("email") ? "true" : "false"}
                          name="email"
                          value={formData.email || ""}
                          onChange={handleInputChange}
                          className={INPUT_CLASSES}
                          placeholder="Enter your email address"
                          autoComplete="email"
                          required
                        />
                        {userSession?.email &&
                          formData.email === userSession.email && (
                            <div
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-axim-teal"
                              title="Verified by AXiM Passport"
                            >
                              <SafeIcon icon={FiShield} />
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="recipientEmail" className={LABEL_CLASSES}>
                        Recipient Email Address (Optional - Send copy to counterparty)
                      </label>
                      <input
                        type="email"
                        id="recipientEmail"
                        name="recipientEmail"
                        value={formData.recipientEmail || ""}
                        onChange={handleInputChange}
                        className={INPUT_CLASSES}
                        placeholder="Enter counterparty email (optional)"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={nextStep}
                      disabled={!formData.disclosing || !formData.receiving || isOffline}
                      className={`bg-axim-teal text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-axim-teal/90 transition transform active:scale-95 ${!formData.disclosing || !formData.receiving ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      Next Step <SafeIcon icon={FiChevronRight} size={18} />
                    </button>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <SafeIcon
                    icon={FiFileText}
                    size={20}
                    className="text-axim-teal"
                  />
                  The Scope
                </h2>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="effectiveDate"
                      className={`${LABEL_CLASSES} flex items-center gap-2`}
                    >
                      <SafeIcon icon={FiCalendar} size={14} />
                      Effective Date
                    </label>
                    <input
                      id="effectiveDate"
                      name="effectiveDate"
                      type="date"
                      value={formData.effectiveDate || ""}
                      onChange={handleInputChange}
                      min="2000-01-01"
                      max="2099-12-31"
                      className={INPUT_CLASSES}
                      required
                    />
                  </div>

                  {/* Industry and Jurisdiction */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="industry"
                        className={`${LABEL_CLASSES} block`}
                      >
                        Industry Sector
                      </label>
                      <select
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className={SELECT_CLASSES}
                      >
                        {INDUSTRY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="jurisdiction"
                        className={`${LABEL_CLASSES} block`}
                      >
                        Governing Law
                      </label>
                      <select
                        id="jurisdiction"
                        name="jurisdiction"
                        value={formData.jurisdiction}
                        onChange={handleInputChange}
                        className={SELECT_CLASSES}
                      >
                        {JURISDICTIONS.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Protection Level and Term */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label
                          htmlFor="strictness"
                          className={`${LABEL_CLASSES} mb-0`}
                        >
                          Protection Level
                        </label>
                        <button
                          type="button"
                          disabled={isOffline}
                          onClick={() =>
                            openAdvisor(
                              "Protection Level",
                              "strict protection level",
                            )
                          }
                          className="text-axim-teal hover:text-teal-300 transition"
                          title="AI Clause Advisor"
                        >
                          <SafeIcon icon={FiHelpCircle} size={16} />
                        </button>
                      </div>
                      <select
                        id="strictness"
                        name="strictness"
                        value={formData.strictness}
                        onChange={handleInputChange}
                        className={SELECT_CLASSES}
                      >
                        <option value="standard">Standard Protection</option>
                        <option value="robust">
                          Enhanced (with Penalties)
                        </option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="term"
                        className={`${LABEL_CLASSES} block`}
                      >
                        Confidentiality Term
                      </label>
                      <select
                        id="term"
                        name="term"
                        value={formData.term}
                        onChange={handleInputChange}
                        className={SELECT_CLASSES}
                      >
                        <option value="1">1 Year</option>
                        <option value="2">2 Years</option>
                        <option value="3">3 Years</option>
                        <option value="5">5 Years</option>
                        <option value="10">10 Years</option>
                        <option value="Indefinitely">Indefinitely</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div className="flex items-center gap-3 p-4 bg-black/50 border border-white/10 rounded-xl">
                    <input
                      id="includeReturn"
                      type="checkbox"
                      name="includeReturn"
                      checked={formData.includeReturn}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-axim-teal border-zinc-600 rounded focus:ring-axim-teal bg-black"
                    />
                    <label
                      htmlFor="includeReturn"
                      className="text-sm font-medium text-zinc-300"
                    >
                      Include document return clause
                    </label>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-black/50 border border-white/10 rounded-xl mt-3">
                    <input
                      id="includeNonSolicitation"
                      type="checkbox"
                      name="includeNonSolicitation"
                      checked={formData.includeNonSolicitation || false}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-axim-teal border-zinc-600 rounded focus:ring-axim-teal bg-black"
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <label
                        htmlFor="includeNonSolicitation"
                        className="text-sm font-medium text-zinc-300"
                      >
                        Include Non-Solicitation Clause
                      </label>
                      <button
                          type="button"
                          disabled={isOffline}
                          onClick={() =>
                            openAdvisor(
                            "Non-Solicitation",
                            "non-solicitation clause",
                          )
                        }
                        className="text-axim-teal hover:text-teal-300 transition"
                        title="AI Clause Advisor"
                      >
                        <SafeIcon icon={FiHelpCircle} size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Document Theme */}
                  <div className="mt-4">
                    <label htmlFor="theme" className={`${LABEL_CLASSES} block`}>
                      Document Theme
                    </label>
                    <select
                      id="theme"
                      name="theme"
                      value={formData.theme || "classic"}
                      onChange={handleInputChange}
                      className={SELECT_CLASSES}
                    >
                      <option value="classic">Classic (Serif)</option>
                      <option value="modern">Modern (Sans)</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>


                  {/* Proactive AI Clarity Layer */}
                  <div className="mt-8 bg-black/40 border border-axim-teal/30 rounded-xl p-5 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                       <SafeIcon icon={FiCpu} size={64} />
                     </div>
                     <h3 className="text-sm font-bold text-axim-teal flex items-center gap-2 mb-3">
                       <SafeIcon icon={FiCpu} size={16} /> AI Review Summary
                     </h3>
                     {isAiSearching ? (
                        <div className="flex items-center gap-2 text-zinc-400 text-sm animate-pulse">
                           <div className="w-4 h-4 border-2 border-axim-teal border-t-transparent rounded-full animate-spin"></div>
                           Generating Plain English Summary...
                        </div>
                     ) : (
                        <ul className="space-y-2">
                           {aiSummary.map((bullet, idx) => (
                             <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                               <span className="text-axim-teal mt-0.5">•</span> {bullet}
                             </li>
                           ))}
                        </ul>
                     )}
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={prevStep}
                      disabled={isOffline}
                      className="bg-transparent border border-white/20 text-zinc-200 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition"
                    >
                      <SafeIcon icon={FiChevronLeft} size={18} /> Back
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={!formData.effectiveDate || isOffline}
                      className={`bg-axim-teal text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-axim-teal/90 transition transform active:scale-95 ${!formData.effectiveDate ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      Review <SafeIcon icon={FiChevronRight} size={18} />
                    </button>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-end mb-4">
                <button
                  onClick={handlePreview}
                  disabled={isPreviewLoading || isOffline}
                  className={`bg-zinc-800 text-zinc-100 font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow ${isPreviewLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-700'}`}
                >
                  {isPreviewLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-zinc-100 border-t-transparent" />
                  ) : (
                    <SafeIcon icon={FiFileText} size={16} />
                  )}
                  {isPreviewLoading ? "Generating Preview..." : "View Watermarked PDF"}
                </button>
              </div>
              {/* Live Draft Preview Pane */}
              <section
                className="bg-white border border-zinc-200 rounded-lg p-8 shadow-[0_0_20px_rgba(0,0,0,0.5)] mb-6 text-black relative overflow-hidden"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='rgba(0,0,0,0.05)' font-family='sans-serif' font-weight='bold' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 100 100)'%3ESAMPLE DRAFT%3C/text%3E%3C/svg%3E")`,
                  backgroundRepeat: "repeat",
                }}
              >
                {isPreviewLoading && (
                  <div className="absolute inset-0 z-30 bg-zinc-200/90 backdrop-blur-sm animate-pulse flex flex-col items-center justify-center pointer-events-none">
                     <div className="flex items-center gap-3 text-zinc-600 font-bold text-lg mb-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-600 border-t-transparent" />
                        Generating PDF Preview...
                     </div>
                     <div className="w-3/4 h-8 bg-zinc-300 rounded mb-6"></div>
                     <div className="w-5/6 h-4 bg-zinc-300 rounded mb-3"></div>
                     <div className="w-4/5 h-4 bg-zinc-300 rounded mb-3"></div>
                     <div className="w-full h-4 bg-zinc-300 rounded mb-8"></div>
                     <div className="w-2/3 h-4 bg-zinc-300 rounded mb-3"></div>
                     <div className="w-3/4 h-4 bg-zinc-300 rounded mb-3"></div>
                  </div>
                )}
                <h2 className="text-2xl font-serif font-bold mb-6 text-center border-b pb-4 border-zinc-300">
                  Non-Disclosure Agreement
                </h2>
                <div className="text-zinc-800 text-base leading-loose space-y-6 font-serif">
                  <p>
                    This{" "}
                    <strong>
                      {formData.type === "mutual" ? "Mutual" : "Unilateral"}
                    </strong>{" "}
                    agreement protects information shared between{" "}
                    <strong>{formData.disclosing || "[Party A]"}</strong> and{" "}
                    <strong>{formData.receiving || "[Party B]"}</strong>.
                  </p>
                  <p>
                    The agreement will become effective on{" "}
                    <strong>{formData.effectiveDate || "[Date]"}</strong> and
                    will remain in effect{" "}
                    {formData.term === "Indefinitely" ? (
                      <strong>indefinitely</strong>
                    ) : (
                      <>
                        for a duration of{" "}
                        <strong>
                          {formData.term}{" "}
                          {formData.term === "1" ? "year" : "years"}
                        </strong>
                      </>
                    )}
                    .
                  </p>
                  <p>
                    This agreement focuses on the{" "}
                    <strong>
                      {INDUSTRY_OPTIONS.find(
                        (o) => o.value === formData.industry,
                      )?.label || formData.industry}
                    </strong>{" "}
                    sector and will be governed under the laws of{" "}
                    <strong>{formData.jurisdiction}</strong>.
                  </p>
                  <p>
                    Protection level is set to{" "}
                    <strong>
                      {formData.strictness === "robust"
                        ? "Enhanced (with Penalties)"
                        : "Standard"}
                    </strong>
                    .
                    {formData.includeReturn
                      ? " A document return clause is included."
                      : ""}
                    {formData.includeNonSolicitation
                      ? " A non-solicitation clause is included."
                      : ""}
                  </p>
                </div>
                {/* Signature Block */}
                <div className="mt-8 border-t border-zinc-300 pt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <SafeIcon icon={FiPenTool} size={20} /> E-Signature
                    </h3>
                    <div className="flex bg-zinc-800 rounded-lg p-1">
                      <button
                        type="button"
                        disabled={isOffline}
                        onClick={() => handleSignatureModeChange('draw')}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSignatureModeChange('draw'); } }}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${signatureMode === 'draw' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                      >
                        Draw
                      </button>
                      <button
                        type="button"
                        disabled={isOffline}
                        onClick={() => handleSignatureModeChange('type')}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSignatureModeChange('type'); } }}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${signatureMode === 'type' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                      >
                        Type
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-600 mb-4">
                    Please sign below to certify this document.
                  </p>
                  {signatureMode === 'draw' ? (
                  <div
                    className="border border-zinc-400 bg-zinc-50 rounded-lg p-2 max-w-md w-full signature-canvas-wrapper"
                    style={{ touchAction: "none" }}
                  >
                    <SignatureCanvas
                      ref={sigCanvas}
                      penColor="black"
                      canvasProps={{
                        className: "w-full h-32 cursor-crosshair",
                        width: 500 * (window.devicePixelRatio || 1),
                        height: 200 * (window.devicePixelRatio || 1),
                        style: { width: '100%', height: '100%', touchAction: 'none' } // CSS dimensions
                      }}
                      onEnd={() => {
                        setIsSigEmpty(false);
                        saveSignature();
                      }}
                    />
                  </div>
                  ) : (
                    <div className="max-w-md w-full">
                      <input
                        type="text"
                        placeholder="Type your full name"
                        autoComplete="name"
                        value={typedSignature}
                        onChange={(e) => {
                          setTypedSignature(e.target.value);
                          if (e.target.value.trim() === '') {
                            setIsSigEmpty(true);
                            setFormData((prev) => ({ ...prev, signatureImage: null }));
                          } else {
                            setIsSigEmpty(false);
                          }
                        }}
                        onBlur={saveSignature}
                        className="w-full p-4 bg-zinc-50 border border-zinc-400 rounded-lg text-black font-serif italic text-2xl outline-none focus:ring-2 focus:ring-axim-teal"
                        style={{ fontFamily: '"Cedarville Cursive", serif' }}
                      />
                    </div>
                  )}
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={undoSignature}
                      disabled={isOffline || isSigEmpty}
                      className="px-4 py-2 bg-zinc-800 text-zinc-300 border border-zinc-600 hover:bg-zinc-700 hover:text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SafeIcon icon={FiRotateCcw} size={14} /> Undo Last Stroke
                    </button>
                    <button
                      onClick={clearSignature}
                      disabled={isOffline}
                      className="px-4 py-2 bg-zinc-800 text-zinc-300 border border-zinc-600 hover:bg-zinc-700 hover:text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2 shadow-sm"
                    >
                      <SafeIcon icon={FiRefreshCw} size={14} /> Clear Signature
                    </button>
                  </div>
                </div>
              </section>

              {/* Download/Purchase Section */}
              <section className="bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  {!isEditing && (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold">
                          Generate Professional PDF
                        </h3>
                        <span className="bg-axim-teal/20 text-axim-teal border border-axim-teal/30 text-xs font-bold px-3 py-1 rounded-full">
                          $4.00
                        </span>
                      </div>
                      <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
                        Get a watermark-free, legally formatted document ready
                        for digital signatures and immediate use.
                      </p>

                      <ul className="text-zinc-300 text-sm mb-6 space-y-2">
                        <li className="flex items-center gap-2 text-axim-teal">
                          <SafeIcon icon={FiCheck} size={16} />
                          <span className="text-zinc-300">
                            Professional formatting
                          </span>
                        </li>
                        <li className="flex items-center gap-2 text-axim-teal">
                          <SafeIcon icon={FiCheck} size={16} />
                          <span className="text-zinc-300">
                            Industry-specific clauses
                          </span>
                        </li>
                        <li className="flex items-center gap-2 text-axim-teal">
                          <SafeIcon icon={FiCheck} size={16} />
                          <span className="text-zinc-300">
                            Instant download
                          </span>
                        </li>
                      </ul>
                    </>
                  )}

                  <div className="flex flex-col gap-4">
                    {formData.strictness === "robust" && <UpsellCard />}

                    <div className="flex flex-col md:flex-row gap-4">
                      <button
                      onClick={prevStep}
                      disabled={isOffline}
                        className="bg-transparent border border-white/20 text-zinc-200 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition"
                      >
                        <SafeIcon icon={FiChevronLeft} size={18} /> Back
                      </button>
                      {userSession?.is_partner && !isEditing ? (
                        <button
                          onClick={onPartnerCheckout}
                          disabled={!isFormValid || isOffline}
                          className={`flex-1 bg-amber-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition transform active:scale-95 shadow-lg ${!isFormValid ? "opacity-50 cursor-not-allowed hover:shadow-none" : ""}`}
                        >
                          <SafeIcon icon={FiUnlock} size={20} />
                          Generate with Partner Credit
                        </button>
                      ) : (
                        <button
                          onClick={isEditing ? onUpdate : handlePurchaseClick}
                          disabled={!isFormValid || isOffline}
                          className={`flex-1 bg-axim-teal text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-axim-teal/90 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition transform active:scale-95 shadow-lg ${!isFormValid ? "opacity-50 cursor-not-allowed hover:shadow-none" : ""}`}
                        >
                          <SafeIcon
                            icon={isEditing ? FiRefreshCw : FiLock}
                            size={20}
                          />
                          {isEditing
                            ? "Update Document"
                            : isFormValid
                              ? "Purchase & Generate"
                              : "Complete Form"}
                        </button>
                      )}
                    </div>
                  </div>

                  {!isFormValid && (
                    <p className="text-sm text-red-400 mt-4 font-medium flex items-center justify-center gap-2 animate-pulse">
                      <SafeIcon icon={FiAlertCircle} size={16} />
                      {validationMessage}
                    </p>
                  )}
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-axim-teal rounded-full opacity-10 blur-3xl pointer-events-none"></div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

export default NDAGeneratorForm;
