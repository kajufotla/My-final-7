/**
 * ==========================================================================
 * ENTERPRISE PREVIEW ENGINE v2.0 - preview.js
 * Optimized for McKinsey/BCG Grade Aesthetic & Performance
 * ==========================================================================
 */

import { formatMoney } from './calculations.js';

// 1. HIGH-PERFORMANCE DOM CACHE
// Prevents redundant DOM lookups to ensure 60FPS UI updates
const PreviewCache = {
    elements: new Map(),
    get(id) {
        if (!this.elements.has(id)) {
            const el = document.getElementById(id);
            if (el) this.elements.set(id, el);
        }
        return this.elements.get(id);
    }
};

/**
 * Enterprise List Renderer
 * Transforms raw text into structured HTML blocks with professional spacing.
 */
const renderProfessionalList = (rawText, targetId, wrapperId) => {
    const listEl = PreviewCache.get(targetId);
    const wrapEl = PreviewCache.get(wrapperId);
    
    if (!listEl || !wrapEl) return;

    const cleanText = rawText ? rawText.trim() : "";
    if (cleanText) {
        wrapEl.style.display = 'flex'; // Use flex to maintain vertical alignment in cards
        // Split by newlines and wrap in spans for better CSS control
        listEl.innerHTML = cleanText.split('\n')
            .map(line => `<div style="margin-bottom: 4px;">${line}</div>`)
            .join('');
    } else {
        wrapEl.style.display = 'none';
    }
};

/**
 * Main Enterprise Preview Orchestrator
 * Maps application state to the A4 Virtual DOM with extreme precision.
 */
export const updatePreview = (cache, state, sanitize) => {
    if (!state || !cache) return;

    // 1. SMART BINDING: Synchronize all [data-bind] fields
    document.querySelectorAll('[data-bind]').forEach(sourceEl => {
        const key = sourceEl.getAttribute('data-bind');
        // Skip specialized blocks handled separately
        if(['notes', 'terms', 'bankDetails', 'payUrl', 'payMethod'].includes(key)) return;

        const targetId = `prev${key.charAt(0).toUpperCase() + key.slice(1)}`;
        const targetEl = PreviewCache.get(targetId);
        
        if (targetEl) {
            const val = sourceEl.value || "";
            // Handle different element types for multi-target binding
            if (sourceEl.tagName === 'TEXTAREA') {
                targetEl.style.whiteSpace = 'pre-wrap';
                targetEl.textContent = sanitize(val);
            } else {
                targetEl.textContent = sanitize(val);
            }
        }
    });

    // 2. DYNAMIC ITEM TABLE RENDERING
    const itemsBody = PreviewCache.get('prevItemsBody');
    if (itemsBody && state.items) {
        itemsBody.innerHTML = state.items.map((item, idx) => `
            <tr>
                <td style="text-align:center; font-weight: 500; color: #94a3b8;">${idx + 1}</td>
                <td style="font-weight: 600; color: #1e293b;">${sanitize(item.desc || 'New Item')}</td>
                <td style="text-align:center;">${item.qty || 0}</td>
                <td style="text-align:right;">${formatMoney(item.price || 0, cache.currencySelect?.value)}</td>
                <td style="text-align:right; font-weight: 700; color: var(--receipt-theme-color);">
                    ${formatMoney((item.price || 0) * (item.qty || 0), cache.currencySelect?.value)}
                </td>
            </tr>
        `).join('');
    }

    // 3. FINANCIAL CALCULATIONS ENGINE
    const subtotal = state.items.reduce((acc, i) => acc + (parseFloat(i.price || 0) * parseFloat(i.qty || 0)), 0);
    const disc = parseFloat(cache.discountVal?.value) || 0;
    const tRate = parseFloat(cache.taxRate?.value) || 0;
    const ship = parseFloat(cache.shippingCost?.value) || 0;
    
    const taxAmt = (subtotal - disc) * (tRate / 100);
    const grandTotal = (subtotal - disc) + taxAmt + ship;

    // Batch Update Totals
    const updateFinancial = (id, value, condition = true) => {
        const el = PreviewCache.get(id);
        const row = el?.closest('.preview-totals-row');
        if (el) el.textContent = formatMoney(value, cache.currencySelect?.value);
        if (row) row.style.display = condition ? 'flex' : 'none';
    };

    updateFinancial('prevSubtotal', subtotal);
    updateFinancial('prevDiscount', disc, disc > 0);
    updateFinancial('prevTax', taxAmt, taxAmt > 0);
    updateFinancial('prevShipping', ship, ship > 0);
    updateFinancial('prevTotal', grandTotal);

    // Update Tax Label dynamically
    const taxLabel = PreviewCache.get('prevTaxLabel');
    if (taxLabel && cache.taxLabelInput) taxLabel.textContent = cache.taxLabelInput.value || 'Tax';

    // 4. BENTO-GRID BOTTOM SECTION LOGIC
    // Conditional visibility for specialized enterprise modules
    renderProfessionalList(cache.notes?.value, 'prevNotesList', 'wrapNotes');
    renderProfessionalList(cache.terms?.value, 'prevTermsList', 'wrapTerms');
    
    // Bank Details & Payment Link
    const bankWrap = PreviewCache.get('wrapPayment');
    const bankText = PreviewCache.get('prevBankDetails');
    const payUrl = PreviewCache.get('prevPayUrl');
    
    const hasBank = !!cache.bankDetails?.value.trim();
    const hasPayUrl = !!cache.payUrl?.value.trim();

    if (bankWrap) bankWrap.style.display = (hasBank || hasPayUrl) ? 'flex' : 'none';
    if (bankText) bankText.textContent = sanitize(cache.bankDetails?.value || "");
    if (payUrl) {
        payUrl.textContent = hasPayUrl ? sanitize(cache.payUrl.value) : "";
        payUrl.href = hasPayUrl ? cache.payUrl.value : "#";
        payUrl.style.display = hasPayUrl ? 'block' : 'none';
    }

    // QR Code Logic
    const qrWrap = PreviewCache.get('wrapQr');
    if (qrWrap) qrWrap.style.display = state.qrData ? 'flex' : 'none';
    if (cache.prevQr && state.qrData) cache.prevQr.src = state.qrData;

    // 5. BRANDING & VISUAL IDENTITY
    if (cache.prevBizContact) {
        const phone = sanitize(cache.bizPhone?.value || "");
        const email = sanitize(cache.bizEmail?.value || "");
        cache.prevBizContact.innerHTML = [phone, email].filter(Boolean).join(' <span style="color:#cbd5e1; margin:0 8px;">|</span> ');
    }

    // Logo & Signature Handling
    if (cache.prevLogo) {
        const logoPlaceholder = document.getElementById('logoPlaceholder');
        if (state.logoData) {
            cache.prevLogo.src = state.logoData;
            cache.prevLogo.style.display = 'block';
            if (logoPlaceholder) logoPlaceholder.style.display = 'none';
        } else {
            cache.prevLogo.style.display = 'none';
            if (logoPlaceholder) logoPlaceholder.style.display = 'flex';
        }
    }

    if (cache.prevSig) {
        cache.prevSig.src = state.sigData || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'></svg>";
        cache.prevSig.style.opacity = state.sigData ? '1' : '0';
    }

    // Final Sync: Broadcase render completion for PDF engine
    document.dispatchEvent(new CustomEvent('previewRenderComplete'));
};
