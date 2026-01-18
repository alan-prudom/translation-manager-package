/**
 * Example: TranslationManager Integration for a Calendar Application
 *
 * This file demonstrates how to configure and use the TranslationManager
 * in a real-world Google Apps Script environment.
 *
 * Part of the @shared/translation-manager package.
 */

// 1. Initialize the singleton
const translationMgr = Shared.TranslationManager.TranslationManager.getInstance();

// 2. Configure for your application
translationMgr.configure({
    // Required: Provide your i18n service (must implement I18nService interface)
    i18nService: (window as any).Shared.I18n.i18n,

    // Required: The name of the server-side GAS function to call for translations
    gasTranslationFunction: 'performTranslation',

    // Required: Selectors for your DOM structure
    selectors: {
        // Container must include {id} placeholder which matches your entry IDs
        container: '[data-event-id="{id}"]',
        title: '.entry-title',
        description: '.entry-description'
    },

    // Optional: Classes to add when an element is successfully translated
    translatedClasses: {
        title: ['text-indigo-800', 'font-semibold'],
        description: ['text-indigo-600', 'italic']
    },

    // Optional: Logic to extract and display URLs found in translated text
    urlExtractor: (text, domains) => {
        // Logic to find URLs in 'text' and verify against 'domains'
        // Returns Array<{url, label, isTrusted}>
        return [];
    },
    trustedDomains: ['github.com', 'google.com'],

    // Optional: Lifecycle callbacks
    onBatchComplete: (size, locale) => {
        console.log(`[App] Translation batch finished. Size: ${size}, Locale: ${locale}`);
    },
    onTranslationComplete: (id, result) => {
        console.log(`[App] Element ${id} translated.`);
    },
    onError: (id, error) => {
        console.warn(`[App] Failed to translate ${id}:`, error);
    }
});

/**
 * 3. Usage: Processing a batch of entries
 *
 * In your render loop or data fetch completion, pass the list of entries
 * to the manager. It will handle viewport prioritization and background processing.
 */
async function onEventsRendered(events: any[]) {
    // Convert your app events to the expected TranslatableEntry format
    const entries = events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        isTranslated: false,      // Track if already translated
        calendarId: event.calendarId // Additional context for the GAS function
    }));

    try {
        await translationMgr.processBatch(entries);
    } catch (e) {
        console.error('Translation failed:', e);
    }
}

/**
 * 4. Usage: Restoring originals
 *
 * When the user switches back to the primary language (e.g., English),
 * call restoreOriginals to revert all DOM changes.
 */
function onLocaleReset(entries: any[]) {
    translationMgr.restoreOriginals(entries);
}
