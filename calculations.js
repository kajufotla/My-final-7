/**
 * ==========================================================================
 * ENTERPRISE CALCULATIONS & STORAGE ENGINE - calculations.js
 * Optimized for UK, USA, Australia Markets (Robust Storage & Formatting)
 * ==========================================================================
 */

// 1. ADVANCED ASYNC STORAGE MANAGER (IndexedDB + Legacy Fallback)
// Prevents 5MB localStorage limits and data loss from casual cache clears
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('InvoiceEnterpriseDB', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('backups')) {
        db.createObjectStore('backups', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Executes a dual-layer secure backup. 
 * @connection Fully compatible with app.js synchronous calls (runs non-blocking)
 */
export const executeStorageBackup = async (data) => {
  try {
    // Primary Enterprise Storage: IndexedDB (Supports massive data & base64 images)
    const db = await initDB();
    const tx = db.transaction('backups', 'readwrite');
    tx.objectStore('backups').put({ id: 'rgp_secure_auto_backup', payload: data, timestamp: Date.now() });
    
    // Synchronous Legacy Fallback (Keeps app.js workflow unbroken)
    localStorage.setItem('rgp_secure_auto_backup', JSON.stringify(data));
  } catch(e) {
    console.warn("[Storage Engine] Enterprise backup busy, relying on local storage.", e);
    try {
      localStorage.setItem('rgp_secure_auto_backup', JSON.stringify(data));
    } catch(err) {
      console.error("[Storage Engine] Fatal: LocalStorage limit exceeded. Data too large.", err);
    }
  }
};

/**
 * Smart Sequence Generator with self-healing to prevent duplicate invoice numbers
 */
export const generateAutoNumber = (historyLogs) => {
  const year = new Date().getFullYear();
  let currentSequence = parseInt(localStorage.getItem('rgp_invoice_seq_counter') || '0', 10);
  
  // Self-healing protocol: if storage was cleared but history exists, recover sequence
  if (historyLogs && Array.isArray(historyLogs) && historyLogs.length > currentSequence) {
    currentSequence = historyLogs.length;
  }
  
  const nextSequence = currentSequence + 1;
  localStorage.setItem('rgp_invoice_seq_counter', nextSequence.toString());
  return `INV-${year}-${nextSequence.toString().padStart(5, '0')}`;
};

/**
 * Formats currency strictly using International Standards (Millions/Billions)
 */
export const formatMoney = (amount, currencySelectValue) => {
  const val = currencySelectValue || 'USD|$';
  const parts = val.split('|');
  const code = parts[0] || 'USD';
  const symbol = parts[1] || '';
  
  // Strict International Standard Numbering 
  // Overrides localized systems to guarantee standard grouping (e.g., 100,000.00)
  const formatterOptions = {
    style: 'currency',
    currency: code,
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };

  try {
    // Forcing 'en-US' locale explicitly ensures the Millions/Billions standard is always applied globally
    return new Intl.NumberFormat('en-US', formatterOptions).format(amount || 0);
  } catch(e) {
    // Safe Fallback if browser's Intl engine fails
    return `${symbol} ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0)}`;
  }
};
