# Example: Calendar Application Integration

This example demonstrates how to integrate the `TranslationManager` into a complex Google Apps Script (GAS) calendar application.

## Overview

The Calendar application needs to translate event titles and descriptions on-the-fly when the user switches languages. To maintain UI responsiveness, it uses the `TranslationManager` to:
1.  Prioritize events currently visible in the viewport.
2.  Batch requests to avoid GAS quota limits.
3.  Store originals to allow instant "Reset to English".

## Migration Guide

If you are moving from a hardcoded translation loop to the `TranslationManager` package, follow these steps:

### 1. Installation
Ensure the package is available in your `Shared/` directory.

### 2. Configuration
In your app's initialization (e.g., `Client.ts`), configure the manager once.

```typescript
import { TranslationManager } from '@shared/translation-manager';

const tm = TranslationManager.getInstance();
tm.configure({
    i18nService: MyI18nService,
    gasTranslationFunction: 'performTranslation',
    selectors: {
        container: '[data-event-id="{id}"]',
        title: '.event-summary',
        description: '.event-desc'
    }
});
```

### 3. Integration with Render Loop
Call `processBatch` after your events are rendered in the DOM.

**Before:**
```typescript
events.forEach(async (e) => {
    const result = await google.script.run.translate(e.id);
    document.querySelector(`#${e.id}`).innerText = result;
});
```

**After:**
```typescript
// Managed, prioritized, and throttled
await tm.processBatch(events);
```

### 4. Server-Side Setup
Ensure your GAS project has a global function matching `gasTranslationFunction`.

```javascript
/**
 * Server-side translation proxy
 */
function performTranslation(eventId, targetLang, contextId) {
    const event = CalendarApp.getEventById(eventId);
    return {
        title: LanguageApp.translate(event.getTitle(), 'en', targetLang),
        description: LanguageApp.translate(event.getDescription(), 'en', targetLang)
    };
}
```

## Key Files
- `usage.ts`: Detailed TypeScript configuration example.
