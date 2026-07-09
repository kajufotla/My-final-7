/**
 * ==========================================================================
 * ENTERPRISE INVOICE CORE ENGINE v2.0 - invoiceCore.js
 * Optimized for US/UK/AUS SaaS Platforms (Memory Safe & Immutable State)
 * ==========================================================================
 */

// 1. ADVANCED IMMUTABLE UNDO/REDO STATE MANAGER
// Prevents memory leaks and browser crashes during extensive invoice editing
export const UndoRedoEngine = {
    history: [],
    index: -1,
    maxStates: 20, // Enterprise Standard buffer increased for complex workflows
    isProcessing: false,

    pushState(stateData) {
        if (this.isProcessing) return;

        // Enterprise Fix: Fast serialization to prevent object reference mutations
        const serializedState = JSON.stringify(stateData);

        // Memory Optimization: Prevent pushing duplicate sequential states
        if (this.index >= 0 && this.history[this.index] === serializedState) {
            return;
        }

        // Prune alternate timeline if pushing a new state after an undo action
        if (this.index < this.history.length - 1) {
            this.history = this.history.slice(0, this.index + 1);
        }

        this.history.push(serializedState);

        // Strict Garbage Collection mechanism for history bloat
        if (this.history.length > this.maxStates) {
            this.history.shift();
        } else {
            this.index++;
        }
    },

    undo(callback) {
        if (this.index > 0) {
            this.isProcessing = true;
            this.index--;
            // Safe parsing with error boundary to protect the application thread
            try {
                const state = JSON.parse(this.history[this.index]);
                callback(state);
            } catch (e) {
                console.error("[State Engine] Corrupted history state detected on Undo.", e);
            } finally {
                this.isProcessing = false;
            }
        }
    },

    redo(callback) {
        if (this.index < this.history.length - 1) {
            this.isProcessing = true;
            this.index++;
            try {
                const state = JSON.parse(this.history[this.index]);
                callback(state);
            } catch (e) {
                console.error("[State Engine] Corrupted history state detected on Redo.", e);
            } finally {
                this.isProcessing = false;
            }
        }
    }
};

// 2. ENTERPRISE SMART FIELD VALIDATION ENGINE (Global Standards)
// Strictly enforces data integrity before state commits
export const runSmartFieldValidation = (field, validationType, cacheRefs) => {
    if (!field) return true;
    const value = field.value.trim();
    let isFieldValid = true;

    if (value === "") {
        isFieldValid = false;
    } else {
        switch (validationType) {
            case 'email':
                // RFC 5322 Standard Email Regex (Enterprise strict mode)
                isFieldValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
                break;
            case 'phone':
                // E.164 International Phone Number Standard (Crucial for USA/UK/AUS compliance)
                isFieldValid = /^\+?[1-9]\d{1,14}$/.test(value.replace(/[\s\-\(\)\.]/g, ''));
                break;
            case 'numeric-positive':
                // Strict numeric boundary checks
                const num = parseFloat(value);
                isFieldValid = !isNaN(num) && isFinite(num) && num >= 0;
                break;
            case 'date-order':
                // Temporal logic check: Due date cannot precede issue date
                if (cacheRefs?.issueDate?.value && cacheRefs?.dueDate?.value) {
                    const issueD = new Date(cacheRefs.issueDate.value).setHours(0, 0, 0, 0);
                    const dueD = new Date(cacheRefs.dueDate.value).setHours(0, 0, 0, 0);
                    isFieldValid = dueD >= issueD;
                }
                break;
            case 'string':
            default:
                // General string check (preventing just blank spaces)
                isFieldValid = value.length > 0;
                break;
        }
    }

    // Visually flag structural errors via pure CSS class toggling (No inline JS styling)
    if (!isFieldValid) {
        field.classList.add('error');
        if (field.nextElementSibling?.classList.contains('error-msg')) {
            field.nextElementSibling.style.display = 'block';
        }
    } else {
        field.classList.remove('error');
        if (field.nextElementSibling?.classList.contains('error-msg')) {
            field.nextElementSibling.style.display = 'none';
        }
    }
    return isFieldValid;
};

// 3. SECURE ITEM MUTATION BRIDGE (Deep Clone Architecture)
// Prevents nested object reference collisions when duplicating items
export const itemActions = {
    duplicate(items, id) {
        const idx = items.findIndex(i => i.id === id);
        if (idx !== -1) {
            // Enterprise Fix: Native structuredClone replaces slow JSON parsing where available
            const itemClone = typeof structuredClone === "function" 
                ? structuredClone(items[idx]) 
                : JSON.parse(JSON.stringify(items[idx]));
            
            itemClone.id = Date.now(); // Generate immutable unqiue ID
            items.splice(idx + 1, 0, itemClone);
        }
        return items;
    },
    moveUp(items, id) {
        const idx = items.findIndex(i => i.id === id);
        if (idx > 0) {
            const target = items[idx];
            items[idx] = items[idx - 1];
            items[idx - 1] = target;
        }
        return items;
    },
    moveDown(items, id) {
        const idx = items.findIndex(i => i.id === id);
        if (idx !== -1 && idx < items.length - 1) {
            const target = items[idx];
            items[idx] = items[idx + 1];
            items[idx + 1] = target;
        }
        return items;
    }
};

// 4. ENTERPRISE DEBOUNCE UTILITY (Memory Safe)
// Prevents I/O blocking during aggressive auto-saving
export const debounce = (func, delay, immediate = false) => {
    let timeoutId;
    return function (...args) {
        const context = this;
        const callNow = immediate && !timeoutId;
        
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
            timeoutId = null;
            if (!immediate) func.apply(context, args);
        }, delay);
        
        if (callNow) func.apply(context, args);
    };
};
