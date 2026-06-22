/**
 * Simple synchronous encryption/decryption utility for client-side storage.
 * Note: This is intended for obfuscation and preventing casual exposure of PII in localStorage.
 * For high-security requirements, server-side encryption or more robust browser-based
 * cryptographic solutions should be considered.
 */

const SECRET_KEY = 'axim-core-security-key'; // This should ideally be environment-specific

/**
 * Encrypts a string using a simple XOR + Base64 approach.
 * @param {string} text - The plaintext to encrypt.
 * @returns {string} The encrypted (obfuscated) string.
 */
export const encrypt = (text) => {
  if (!text) return text;

  try {
    // Convert to UTF-8 and XOR with key
    const result = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      result.push(String.fromCharCode(charCode));
    }

    // Convert to Base64
    return btoa(unescape(encodeURIComponent(result.join(''))));
  } catch (err) {
    console.error("Encryption failed:", err);
    return text;
  }
};

/**
 * Decrypts a string using a simple XOR + Base64 approach.
 * @param {string} encoded - The encrypted string to decrypt.
 * @returns {string} The decrypted plaintext.
 */
export const decrypt = (encoded) => {
  if (!encoded) return encoded;

  try {
    // Decode Base64
    const text = decodeURIComponent(escape(atob(encoded)));

    // XOR with key
    const result = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      result.push(String.fromCharCode(charCode));
    }

    return result.join('');
  } catch (err) {
    console.error("Decryption failed:", err);
    return encoded;
  }
};

export const hashFormData = async (formData) => {
    // Generate a simple SHA-256 hash of the form data to ensure integrity
    // Exclude sessionId before hashing if it exists
    const dataToHash = { ...formData };
    delete dataToHash.sessionId;
    const message = JSON.stringify(dataToHash, Object.keys(dataToHash).sort());
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
