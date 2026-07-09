/**
 * ==========================================================================
 * ENTERPRISE SECURITY & SANITIZATION ENGINE - security.js
 * Optimized for High-Security SaaS Environments (UK, USA, Australia)
 * ==========================================================================
 */

/**
 * Advanced XSS Sanitizer
 * Intercepts and neutralizes malicious scripts embedded in text or HTML.
 * @connection 100% compatible with app.js and preview.js calls
 */
export const sanitizeHTML = (str) => {
  if (typeof str !== 'string') return '';
  
  // Enterprise Best Practice: Use DOMPurify if available in the global window
  // (Highly recommended to add DOMPurify CDN in your index.html)
  if (typeof window !== 'undefined' && window.DOMPurify) {
    return window.DOMPurify.sanitize(str);
  }

  // Robust Native Fallback: Multi-layer sanitization (Runs if DOMPurify is missing)
  
  // Layer 1: Convert basic HTML entities to prevent direct tag execution
  let sanitized = str.replace(/[&<>"']/g, (m) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return map[m];
  });
  
  // Layer 2: Strip out dangerous URIs (javascript:, vbscript:, data:)
  sanitized = sanitized.replace(/href=[\'"]?(javascript|vbscript|data):/gi, 'href="#blocked"');
  
  // Layer 3: Remove inline event handlers (onerror, onload, onclick, etc.)
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');
  sanitized = sanitized.replace(/on\w+=\w+/gi, '');

  return sanitized;
};

/**
 * Enterprise JSON Parser with Strict Type Checking
 * Prevents application crashes from malformed storage payloads.
 */
export const safeParseJSON = (jsonStr, fallback) => {
  if (!jsonStr) return fallback;
  try {
    const parsed = JSON.parse(jsonStr);
    // Ensure the result is actually an object or array, preventing primitive injection
    if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
    }
    return fallback;
  } catch (e) {
    console.warn("[Security Engine] Malformed JSON payload intercepted. Fallback triggered.");
    return fallback;
  }
};

/**
 * Strict File Validator for Logos and Signatures
 * Blocks embedded malicious scripts in SVGs and prevents payload overflows.
 */
export const validateUploadedFile = (file) => {
  if (!file) return false;
  
  // Strict MIME type checking - SVG explicitly removed due to XSS vulnerabilities
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']; 
  const maxSize = 2 * 1024 * 1024; // 2MB standard limit
  
  if (!allowedTypes.includes(file.type)) {
    alert("Security Alert: Invalid format. For safety, please upload secure JPG, PNG, or WEBP images only.");
    return false;
  }
  
  if (file.size > maxSize) {
    alert("Optimization Alert: File exceeds 2MB limit. Please compress the image before uploading.");
    return false;
  }
  
  // Layer 3: Detect suspicious double extensions (e.g., logo.png.exe)
  const fileNameParts = file.name.split('.');
  if (fileNameParts.length > 2) {
     console.warn("[Security Engine] Suspicious multi-extension file naming detected.");
  }

  return true;
};
