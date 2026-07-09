/**
 * ==========================================================================
 * ENTERPRISE UI INTERACTION & DOM ENGINE v2.0 - domHandlers.js
 * Optimized for USA/International SaaS Standards (Zero-Leak Architecture)
 * ==========================================================================
 */

// Global DOM references cache wrapper for optimization
const DOMRegistry = {
    handlers: new Map(),
    safelyAddListener(element, event, handlerId, handlerFn) {
        if (!element) return;
        // If a handler already exists for this action, remove it first to prevent duplicate memory allocation
        if (this.handlers.has(handlerId)) {
            element.removeEventListener(event, this.handlers.get(handlerId));
        }
        element.addEventListener(event, handlerFn);
        this.handlers.set(handlerId, handlerFn);
    }
};

/**
 * 1. SIDEBAR & MOBILE TAB NAVIGATION ORCHESTRATOR
 * Manages view states seamlessly between input panels and virtual A4 paper preview.
 */
export const initTabSwitching = (validateForm, updatePreview) => {
    // Sidebar Tabs handling
    document.querySelectorAll('.sticker-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetBtn = e.currentTarget;
            const targetId = targetBtn.getAttribute('data-target');
            if (!targetId) return;

            // Batch UI Updates
            document.querySelectorAll('.sticker-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.editor-tab-content').forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });

            targetBtn.classList.add('active');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'block';
            }
        });
    });

    // Mobile Responsive Tab Controller (Editor view activation)
    const tabEditor = document.getElementById('tabEditor');
    if (tabEditor) {
        tabEditor.addEventListener('click', (e) => {
            e.target.classList.add('active');
            document.getElementById('tabPreview')?.classList.remove('active');
            document.querySelector('.editor-section')?.classList.add('active-tab');
            document.querySelector('.preview-section')?.classList.remove('active-tab');
        });
    }

    // Mobile Responsive Tab Controller (Preview view activation)
    const tabPreview = document.getElementById('tabPreview');
    if (tabPreview) {
        tabPreview.addEventListener('click', (e) => {
            // Validate visible inputs visually but prioritize frictionless view switching
            if (typeof validateForm === 'function') validateForm();
            
            e.target.classList.add('active');
            document.getElementById('tabEditor')?.classList.remove('active');
            document.querySelector('.preview-section')?.classList.add('active-tab');
            document.querySelector('.editor-section')?.classList.remove('active-tab');
            
            if (typeof updatePreview === 'function') updatePreview();
        });
    }
};

/**
 * 2. ENTERPRISE SYSTEM THEME ENGINE (DARK / LIGHT CONSOLE)
 * Manages look-and-feel transitions via secure localStorage state tracking.
 */
export const initDarkMode = () => {
    const btnDark = document.getElementById('btnDarkMode');
    if (!btnDark) return;

    const toggleThemeMode = () => {
        const isDarkActive = document.body.classList.toggle('rgp-dark-mode');
        localStorage.setItem('rgp_dark_mode', isDarkActive ? 'true' : 'false');
    };

    DOMRegistry.safelyAddListener(btnDark, 'click', 'CORE_DARK_MODE_TOGGLE', toggleThemeMode);

    // Bootstrap theme state immediately on load sequence
    if (localStorage.getItem('rgp_dark_mode') === 'true') {
        document.body.classList.add('rgp-dark-mode');
    }
};

/**
 * 3. DYNAMIC DROPDOWN GENERATION PLATFORM
 * Renders verified profiles into form drop-down selections with HTML protection.
 */
export const updateDropdowns = (savedClients, savedPayments, sanitizeHTML) => {
    const clientsDropdown = document.getElementById('savedClientsDropdown');
    if (clientsDropdown && Array.isArray(savedClients)) {
        let optionsHtml = '<option value="">-- Manual Entry --</option>';
        savedClients.forEach((client, index) => {
            optionsHtml += `<option value="${index}">${sanitizeHTML(client.custName || 'Unnamed Client')}</option>`;
        });
        clientsDropdown.innerHTML = optionsHtml;
    }

    const paymentsDropdown = document.getElementById('savedPaymentsDropdown');
    if (paymentsDropdown && Array.isArray(savedPayments)) {
        let optionsHtml = '<option value="">-- Manual Entry --</option>';
        savedPayments.forEach((payment, index) => {
            const architecturalLabel = payment.payArch === 'bank' ? 'Bank Transfer' : 'Stripe Link';
            optionsHtml += `<option value="${index}">Profile ${index + 1} (${sanitizeHTML(architecturalLabel)})</option>`;
        });
        paymentsDropdown.innerHTML = optionsHtml;
    }
};

/**
 * 4. CLIENT SELECTION DATA MAPPER
 * Auto-injects selected client profile schemas into live sandbox fields.
 */
export const initClientSelection = (savedClients, cache, updatePreview) => {
    const dropdown = document.getElementById('savedClientsDropdown');
    if (!dropdown || !Array.isArray(savedClients)) return;

    const handleClientChange = (e) => {
        const selectedIndex = e.target.value;
        if (selectedIndex === "") return;

        const clientData = savedClients[selectedIndex];
        if (clientData && cache) {
            if (cache.custName) cache.custName.value = clientData.custName || '';
            if (cache.custCompany) cache.custCompany.value = clientData.custCompany || '';
            if (cache.custEmail) cache.custEmail.value = clientData.custEmail || '';
            if (cache.custPhone) cache.custPhone.value = clientData.custPhone || '';
            if (cache.custAddress) cache.custAddress.value = clientData.custAddress || '';
            
            if (typeof updatePreview === 'function') updatePreview();
        }
    };

    DOMRegistry.safelyAddListener(dropdown, 'change', 'CLIENT_DROPDOWN_CHANGE', handleClientChange);
};

/**
 * 5. PAYMENT METADATA FIELD DISPATCHER
 * Maps advanced transactional configurations onto active bank/gateway forms.
 */
export const initPaymentSelection = (savedPayments, cache, updatePreview) => {
    const dropdown = document.getElementById('savedPaymentsDropdown');
    if (!dropdown || !Array.isArray(savedPayments)) return;

    const handlePaymentChange = (e) => {
        const selectedIndex = e.target.value;
        if (selectedIndex === "") return;

        const paymentData = savedPayments[selectedIndex];
        if (paymentData && cache) {
            if (cache.paymentArchType) cache.paymentArchType.value = paymentData.payArch || 'bank';
            if (cache.bankDetails) cache.bankDetails.value = paymentData.bank || '';
            if (cache.payUrl) cache.payUrl.value = paymentData.stripe || '';
            if (cache.payMethod) cache.payMethod.value = paymentData.payMethodText || '';
            
            // Populate sub-grid structured bank components safely
            const bankFieldsMap = {
                'bankAccTitle': paymentData.bTitle,
                'bankName': paymentData.bName,
                'bankAccNo': paymentData.bAcc,
                'bankIban': paymentData.bIban,
                'bankSwift': paymentData.bSwift,
                'bankBranch': paymentData.bBranch,
                'bankCode': paymentData.bCode,
                'bankRef': paymentData.bRef
            };

            Object.keys(bankFieldsMap).forEach(id => {
                const element = document.getElementById(id);
                if (element) element.value = bankFieldsMap[id] || '';
            });

            // Trigger architectural layout shift toggle event sequentially
            if (cache.paymentArchType) {
                cache.paymentArchType.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            if (typeof updatePreview === 'function') updatePreview();
        }
    };

    DOMRegistry.safelyAddListener(dropdown, 'change', 'PAYMENT_DROPDOWN_CHANGE', handlePaymentChange);
};

/**
 * 6. NOTE & TERMS LIBRARY COMPILER
 * Dynamically binds snippet dictionaries into the global operational canvas.
 */
export const renderNotesLibraryDropdown = (notesLibrary, sanitizeHTML) => {
    const librarySelect = document.getElementById('libraryTargetSelect');
    if (!librarySelect || !Array.isArray(notesLibrary)) return;

    let optionsHtml = '<option value="">-- Choose From Notes & Terms Library --</option>';
    notesLibrary.forEach((item, index) => {
        optionsHtml += `<option value="${index}">${sanitizeHTML(item.title)} (${sanitizeHTML(item.type || 'Asset')})</option>`;
    });
    librarySelect.innerHTML = optionsHtml;
};

/**
 * 7. GLOBAL MODAL CONTROLLER CLOSER
 * Sweeps the DOM viewport and safely dismisses open interactive dialogue layers.
 */
export const initModalClosers = () => {
    document.querySelectorAll('.close-modal').forEach((button, idx) => {
        const dismissModalAction = (e) => {
            const overlayContainer = e.target.closest('.modal-overlay');
            if (overlayContainer) {
                overlayContainer.classList.remove('active');
            }
        };
        DOMRegistry.safelyAddListener(button, 'click', `MODAL_CLOSE_TRIGGER_${idx}`, dismissModalAction);
    });
};
