/**
 * Example: Minimal Notes App Integration
 *
 * Shows the absolute minimum configuration required.
 */

import { TranslationManager } from '@shared/translation-manager';

// Setup
const tm = TranslationManager.getInstance();

tm.configure({
    i18nService: { getCurrentLocale: () => 'es' } as any, // Simple mock
    gasTranslationFunction: 'translate',
    selectors: {
        container: '#note-{id}',
        title: 'h1',
        description: 'section'
    }
});

// Implementation
async function translateCurrentNote(id: string, title: string, text: string) {
    await tm.processBatch([{ id, title, description: text }]);
}
