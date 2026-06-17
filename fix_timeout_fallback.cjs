const fs = require('fs');

// VerificationPortal.jsx
let vpCode = fs.readFileSync('src/components/VerificationPortal.jsx', 'utf8');

vpCode = vpCode.replace(
  `    } catch (err) {
      console.error('Execution error:', err);
      setErrorMsg(err.message || 'Failed to execute document');
    } finally {
      setIsSigning(false);
    }`,
  `    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Execution error:', err);

      if (err.name === 'AbortError' || err.message.includes('timeout')) {
        setErrorMsg('Network timeout. Please check your connection and try again.');
        setStatus('timeout');
      } else {
        setErrorMsg(err.message || 'Failed to execute document');
        setStatus('error');
      }
    } finally {
      setIsSigning(false);
    }`
);

// We need to add the timeout state handler in UI if it doesn't exist already.
// Wait, is there a 'timeout' status in VerificationPortal? Let's check earlier grep:
// Yes! {status === 'timeout' && (
// Let's also check handleVerify function in VerificationPortal
fs.writeFileSync('src/components/VerificationPortal.jsx', vpCode);

// NDAGeneratorForm.jsx
let ndaCode = fs.readFileSync('src/components/NDAGeneratorForm.jsx', 'utf8');

// I need to find handlePreview and other network functions.
ndaCode = ndaCode.replace(
  `      } catch (err) {
        console.error(err);
        addToast(err.message || "Failed to generate preview", "error");
      } finally {`,
  `      } catch (err) {
        console.error(err);

        if (err.name === 'AbortError' || err.message.includes('timeout')) {
          addToast("Network timeout. Please retry connection.", "error");
        } else {
          addToast(err.message || "Failed to generate preview", "error");
        }
      } finally {`
);

fs.writeFileSync('src/components/NDAGeneratorForm.jsx', ndaCode);
