import fs from 'fs';
let file = fs.readFileSync('src/components/NDAGeneratorForm.jsx', 'utf8');

// The component doesn't have useToast imported or instantiated, it seems.
// Let's check if useToast is used in NDAGeneratorForm.
// `App.jsx` handles addToast and passes down props. Or maybe I should just import it.
if (!file.includes('const { addToast } = useToast();')) {
    if(!file.includes('useToast')) {
        file = file.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport { useToast } from '../context/ToastContext';");
    }
    file = file.replace('const NDAGeneratorForm = memo(({ formData, setFormData, currentStep, setCurrentStep, onPurchase, isEditing, onUpdate, userSession, onPartnerCheckout }) => {', 'const NDAGeneratorForm = memo(({ formData, setFormData, currentStep, setCurrentStep, onPurchase, isEditing, onUpdate, userSession, onPartnerCheckout }) => {\n  const { addToast } = useToast();');
}

fs.writeFileSync('src/components/NDAGeneratorForm.jsx', file);
