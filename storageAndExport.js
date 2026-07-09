/**
 * ==========================================================================
 * ENTERPRISE EXPORT & PDF ENGINE - storageAndExport.js
 * Optimized for UK, USA, Australia Markets (Cross-Browser Consistency)
 * ==========================================================================
 */

export const handleImageUpload = (file, callback) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      // Retina display optimization (High-DPI support for crisp logos)
      let width = img.width, height = img.height;
      const MAX_WIDTH = 800;
      if (width > MAX_WIDTH) { 
        height = Math.round((height * MAX_WIDTH) / width); 
        width = MAX_WIDTH; 
      }
      canvas.width = width; canvas.height = height;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      // 0.85 quality gives better compression without artifacting for corporate logos
      callback(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

export const executePdfPrint = (cache) => {
  if (!cache || !cache.receiptPaper) return;
  
  const paperElement = cache.receiptPaper;
  
  // ENTERPRISE PDF GENERATION (Using html2pdf.js for pixel-perfect cross-browser rendering)
  if (typeof window !== 'undefined' && window.html2pdf) {
      const opt = {
          margin:       [10, 10, 10, 10], // Standard mm margins
          filename:     `Invoice_${document.getElementById('receiptNumber')?.value || 'Export'}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, letterRendering: true }, // Scale 2 for Retina/High-DPI
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // Save directly without breaking UI
      window.html2pdf().set(opt).from(paperElement).save().catch(err => {
          console.warn("[Export Engine] PDF Engine encountered an error. Falling back to native print.", err);
          fallbackNativePrint();
      });
  } else {
      // Graceful fallback to optimized native print if library isn't available
      console.info("[Export Engine] html2pdf not detected. Using optimized native browser print.");
      fallbackNativePrint();
  }
};

// Optimized Native Print Fallback Engine
const fallbackNativePrint = () => {
  const printStyle = document.createElement('style');
  printStyle.id = 'pdf-runtime-print-css';
  // Enforcing strict webkit print colors to prevent background elements from disappearing
  printStyle.innerHTML = `
    @media print {
      @page { size: A4 portrait; margin: 10mm; }
      body { background: #ffffff !important; color: #000000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      #receiptPaper { box-shadow: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
      .no-print, .editor-section, header, nav, footer, .modal { display: none !important; }
      .preview-section { width: 100% !important; padding: 0 !important; }
    }
  `;
  document.head.appendChild(printStyle);
  window.print();
  setTimeout(() => document.getElementById('pdf-runtime-print-css')?.remove(), 1000);
};

export const exportToCSV = (historyLogs) => {
  if(!historyLogs || historyLogs.length === 0) return alert("No data to export");
  const headers = ['Invoice Number', 'Issue Date', 'Client Name', 'Total Amount', 'Status'];
  
  // Enterprise CSV generation: Handle commas inside fields securely
  const escapeCSV = (str) => `"${(str || '').toString().replace(/"/g, '""')}"`;
  
  const rows = historyLogs.map(h => [
     escapeCSV(h.receiptNumber), 
     escapeCSV(h.issueDate), 
     escapeCSV(h.custName), 
     escapeCSV(h.totalVal || h.amount), 
     escapeCSV(h.invoiceStatus)
  ]);
  
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  
  // Add BOM (\ufeff) for strict MS Excel UTF-8 compatibility (Crucial for international markets)
  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); 
  a.href = url; 
  a.download = 'Enterprise_Invoice_History.csv'; 
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const backupToJSON = (historyLogs) => {
  if(!historyLogs || historyLogs.length === 0) return alert("No data to backup");
  // Wrapping backup in a versioned object for future-proofing database migrations
  const payload = JSON.stringify({ version: '1.0', exportDate: new Date().toISOString(), data: historyLogs }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const a = document.createElement('a'); 
  a.href = URL.createObjectURL(blob); 
  a.download = 'Invoice_Secure_Backup.json'; 
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const restoreFromJSON = (file, callback) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      // Dual-compatibility: Reads both old arrays and new versioned enterprise objects
      const dataToRestore = parsed.data ? parsed.data : (Array.isArray(parsed) ? parsed : null);
      
      if (dataToRestore) {
         callback(dataToRestore);
      } else {
         alert("Security Alert: Invalid or corrupted backup file structure.");
      }
    } catch (err) {
      alert("Error parsing backup file. The file might be corrupted.");
    }
  };
  reader.readAsText(file);
};
