import fs from 'fs';
let file = fs.readFileSync('src/components/NDAGeneratorForm.jsx', 'utf8');

file = file.replace('const NDAGeneratorForm = React.memo(({ formData, setFormData, currentStep = 1, setCurrentStep, onPurchase, isEditing, onUpdate, userSession, onPartnerCheckout }) => {', 'const NDAGeneratorForm = React.memo(({ formData, setFormData, currentStep = 1, setCurrentStep, onPurchase, isEditing, onUpdate, userSession, onPartnerCheckout }) => {\n  const { addToast } = useToast();');

fs.writeFileSync('src/components/NDAGeneratorForm.jsx', file);
