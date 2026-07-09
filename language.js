/**
 * ==========================================================================
 * ENTERPRISE INTERNATIONALIZATION (i18n) ENGINE - language.js
 * Optimized for UK, USA, Australia Markets (Scalable up to 70+ Languages)
 * ==========================================================================
 */

// Core embedded translations for immediate, ultra-fast boot load
const coreTranslations = {
  en: { nav_home: "Home", tab_editor: "📝 Editor", tab_preview: "👁️ Preview", act_save: "💾 Save To History" },
  ur: { nav_home: "ہوم", tab_editor: "📝 ایڈیٹر", tab_preview: "👁️ پیش نظارہ", act_save: "💾 محفوظ کریں" },
  ar: { nav_home: "الرئيسية", tab_editor: "📝 محرر", tab_preview: "👁️ معاينة", act_save: "💾 حفظ" },
};

// Memory cache subsystem to prevent redundant network requests
const translationCache = { ...coreTranslations };

/**
 * Asynchronously fetches translation bundles.
 * Allows seamless scaling without bloating the main JavaScript bundle size.
 */
async function fetchTranslationBundle(lang) {
  // If language exists in memory cache, return immediately (Zero latency)
  if (translationCache[lang]) {
    return translationCache[lang];
  }
  
  try {
    // Enterprise Path: Dynamically fetch from local/cloud locales folder when scaling to 70+ languages
    const response = await fetch(`./locales/${lang}.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const dynamicData = await response.json();
    translationCache[lang] = dynamicData; // Store in cache for future use
    return dynamicData;
  } catch (error) {
    // Safe degradation: log warning and fallback gracefully to English core dictionary
    console.warn(`[i18n Engine] Translation bundle for '${lang}' not found or inaccessible. Falling back to English core.`, error);
    return translationCache['en'];
  }
}

/**
 * Main Orchestrator: Sets application language, handles typography alignment (RTL/LTR),
 * and dynamically updates UI nodes bound with [data-i18n] attributes.
 * * @connection Preserved 100% compatibility with app.js initialization workflow.
 */
export async function setLanguage(lang) {
  // 1. Persist localization preference globally
  localStorage.setItem('rgp_lang', lang);

  // 2. Execute strict Right-to-Left (RTL) vs Left-to-Right (LTR) structural orientation
  const rtlLanguages = ['ur', 'ar', 'fa', 'he'];
  const isRtl = rtlLanguages.includes(lang);
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);

  // 3. Resolve localization dictionary safely (Async with runtime protection)
  const dict = await fetchTranslationBundle(lang);
  const fallbackDict = translationCache['en'];

  // 4. Batch update DOM Elements bound to translation keys
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    
    // Key-by-key target fallback: if specific language lacks a key, use English variant instead of rendering blank space
    const targetString = (dict && dict[key] !== undefined) ? dict[key] : fallbackDict[key];

    if (targetString !== undefined) {
      // Form fields context processing
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = targetString;
      } else {
        // Optimized Regex: replaces text while keeping inner structures (SVGs, icons, nested spans) intact
        el.innerHTML = el.innerHTML.replace(/^[^\<]+/, targetString + ' ');
      }
    }
  });

  // 5. Broadcast custom event to the application ecosystem (Enterprise event-driven standard)
  // This allows other scripts/components to listen and adjust layout scales dynamically if needed
  const i18nEvent = new CustomEvent('globalLanguageSwitched', { detail: { lang, isRtl } });
  document.dispatchEvent(i18nEvent);
}
