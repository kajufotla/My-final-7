/**
 * ==========================================================================
 * ENTERPRISE PREVIEW ENGINE - preview.js
 * Optimized for High-Performance UI Updates (UK, USA, Australia)
 * ==========================================================================
 */

import { formatMoney } from './calculations.js';

// Global cache to prevent expensive DOM querying on every keystroke
const domCache = new Map();

const getCachedElement = (id) => {
    if (!domCache.has(id)) {
        domCache.set(id, document.getElementById(id));
    }
    return domCache.get(id);
};

export const renderList = (textId, listId, wrapId) => {
  const textEl = getCachedElement(textId);
  const wrap = getCachedElement(wrapId);
  const list = getCachedElement(listId);
  
  if (!textEl || !wrap || !list) return;
  
  const text = textEl.value;
  if (text.trim()) { 
    wrap.style.display = 'block'; 
    list.innerHTML = text.replace(/\n/g, '<br>'); 
  } else { 
    wrap.style.display = 'none'; 
  }
};

/**
 * Enterprise Preview Update Engine
 * @param {Object} cache - UI Element references
 * @param {Object} state - Current invoice state
 * @param {Function} sanitize - The security sanitization function
 */
export const updatePreview = (cache, state, sanitize) => {
  // 1. Bulk Update Bindings
  document.querySelectorAll('[data-bind]').forEach(el => {
    const key = el.getAttribute('data-bind');
    if(['notes', 'terms', 'bankDetails', 'payUrl', 'payMethod'].includes(key)) return;
    
    document.querySelectorAll(`[id^="prev${key.charAt(0).toUpperCase() + key.slice(1)}"]`).forEach(target => {
      // Enterprise Security: Always sanitize input before DOM injection
      if(el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') target.textContent = sanitize(el.value);
      else target.innerHTML = sanitize(el.value);
    });
  });

  // 2. Optimized Currency Calculations (Cross-referenced with calculations.js)
  const subtotal = state.items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  let d = parseFloat(cache.discountVal?.value) || 0, 
      tR = parseFloat(cache.taxRate?.value) || 0, 
      s = parseFloat(cache.shippingCost?.value) || 0;
      
  let taxAmt = (subtotal - d) * (tR / 100); 
  let gTotal = (subtotal - d) + taxAmt + s;

  // 3. Conditional Visibility Engine
  const updateDisplay = (id, val, condition) => {
      const el = getCachedElement(id);
      if(el) el.style.display = condition ? 'flex' : 'none';
  };

  updateDisplay('rowDiscount', d > 0, d > 0);
  updateDisplay('rowTax', taxAmt > 0, taxAmt > 0);
  updateDisplay('rowShipping', s > 0, s > 0);

  if(cache.prevSubtotal) cache.prevSubtotal.textContent = formatMoney(subtotal, cache.currencySelect?.value);
  if(cache.prevTotal) cache.prevTotal.textContent = formatMoney(gTotal, cache.currencySelect?.value);
  
  // 4. Branding & Localization Labels
  if(cache.prevTaxLabel && cache.taxLabelInput) cache.prevTaxLabel.textContent = cache.taxLabelInput.value || 'Tax';
  if(cache.prevBizContact) cache.prevBizContact.innerHTML = [sanitize(cache.bizPhone?.value), sanitize(cache.bizEmail?.value)].filter(Boolean).join(' | ');
};
