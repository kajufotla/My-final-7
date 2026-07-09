/**
 * ==========================================================================
 * ENTERPRISE INVOICE CORE ENGINE - invoiceCore.js
 * Optimized for UK, USA, Australia Markets (Memory Efficient & Robust)
 * ==========================================================================
 */

// 1. ADVANCED UNDO / REDO HISTORY ENGINE (Memory-Leak Protected)
export const UndoRedoEngine = {
  history: [],
  index: -1,
  maxStates: 15, // Enterprise Standard: Reduced from 50 to 15 to prevent browser RAM crashes with base64 images
  isProcessing: false,

  pushState(stateData) {
    if (this.isProcessing) return;
    
    const serializedState = JSON.stringify(stateData);
    
    // Memory Optimization: Prevent pushing exact duplicate states
    if (this.index >= 0 && this.history[this.index] === serializedState) {
        return; 
    }

    if (this.index < this.history.length - 1) {
      this.history = this.history.slice(0, this.index + 1);
    }
    
    this.history.push(serializedState);
    
    if (this.history.length > this.maxStates) {
      this.history.shift();
    } 
    
    // Maintain correct index pointer
    this.index = this.history.length - 1;
  },

  undo(callback) {
    if (this.index > 0) {
      this.isProcessing = true;
      this.index--;
      const state = JSON.parse(this.history[this.index]);
      callback(state);
      this.isProcessing = false;
    }
  },

  redo(callback) {
    if (this.index < this.history.length - 1) {
      this.isProcessing = true;
      this.index++;
      const state = JSON.parse(this.history[this.index]);
      callback(state);
      this.isProcessing = false;
    }
  }
};

// 2. ENTERPRISE SMART FIELD VALIDATION ENGINE
export const runSmartFieldValidation = (field, validationType, cacheRefs) => {
  if(!field) return true;
  const value = field.value.trim();
  let isFieldValid = true;

  if (value === "") {
    isFieldValid = false;
  } else {
    if (validationType === 'email') {
      // RFC 5322 Standard Email Regex for International Clients
      isFieldValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value);
    } else if (validationType === 'phone') {
      // E.164 International Phone Number Standard (Crucial for USA/UK/AUS)
      isFieldValid = /^\+?[1-9]\d{1,14}$/.test(value.replace(/[\s\-\(\)]/g, ''));
    } else if (validationType === 'numeric-positive') {
      const num = parseFloat(value);
      isFieldValid = !isNaN(num) && num >= 0;
    } else if (validationType === 'date-order') {
      if (cacheRefs?.issueDate?.value && cacheRefs?.dueDate?.value) {
        // Timezone bug fix: Strip time to ensure exact day-to-day comparison
        const issueD = new Date(cacheRefs.issueDate.value).setHours(0,0,0,0);
        const dueD = new Date(cacheRefs.dueDate.value).setHours(0,0,0,0);
        isFieldValid = dueD >= issueD;
      }
    }
  }

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

// 3. GLOBAL ITEM MUTATIONS BRIDGE (Deep Clone Protected)
export const itemActions = {
  duplicate(items, id) {
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      // Enterprise Fix: Deep clone prevents nested object reference collisions
      const itemClone = JSON.parse(JSON.stringify(items[idx])); 
      itemClone.id = Date.now();
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

// 4. ENTERPRISE DEBOUNCE UTILITY FOR AUTOSAVE
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};
