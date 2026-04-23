import fs from 'fs';
let file = fs.readFileSync('src/components/NDAGeneratorForm.jsx', 'utf8');

// The instructions: "Fire an event when the user clicks 'Start NDA' ({ event: 'nda_funnel_started' })"
// And "fire another event when they click the button that launches the Stripe checkout ({ event: 'nda_checkout_initiated' })"
// The fetch request should be to `/api/v1/telemetry/events` (POST).

const telemetryFunc = `
  const fireTelemetry = async (eventName) => {
    try {
      fetch('/api/v1/telemetry/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventName })
      });
    } catch (e) {} // fire and forget
  };
`;

file = file.replace('const handlePreview = async () => {', telemetryFunc + '\n  const handlePreview = async () => {');

// In NDAGeneratorForm.jsx, 'Start NDA' button goes from step 1 to step 2.
// It is handled by `nextStep` function or `startNDAClick` if it exists.
// Let's check `nextStep` or the button for Step 1.
// Let's replace the button onClick for 'Start NDA' or inside `nextStep`.
// I will patch nextStep:

const nextStepUpdate = `
  const nextStep = useCallback(() => {
    if (currentStep === 1) fireTelemetry('nda_funnel_started');
    setCurrentStep((prev) => prev + 1);
  }, [setCurrentStep, currentStep]);
`;

file = file.replace('const nextStep = useCallback(() => setCurrentStep((prev) => prev + 1), [setCurrentStep]);', nextStepUpdate);

// And when they click the purchase button. The prop `onPurchase` is called.
// We can wrap `onPurchase` in a handler or fire it before calling `onPurchase`.
// The button is: onClick={isEditing ? onUpdate : onPurchase}

const onPurchaseUpdate = `
  const handlePurchaseClick = () => {
    fireTelemetry('nda_checkout_initiated');
    onPurchase();
  };
`;

file = file.replace('const handlePreview = async () => {', onPurchaseUpdate + '\n  const handlePreview = async () => {');
file = file.replace('onClick={isEditing ? onUpdate : onPurchase}', 'onClick={isEditing ? onUpdate : handlePurchaseClick}');

fs.writeFileSync('src/components/NDAGeneratorForm.jsx', file);
