# Translation Manager Package (@shared/translation-manager)

A portable, background translation system designed for Single Page Applications (SPAs) built on Google Apps Script (GAS).

## Overview

Translating large amounts of dynamic content (like calendar events or task lists) in Google Apps Script can be slow and brittle. Calling `LanguageApp.translate` for 50 items simultaneously can hit execution time limits or rate quotas.

`TranslationManager` solves this by:
- **Viewport Prioritization**: It detects which items are visible to the user and translates them first.
- **Background Batching**: Requests are throttled and batched to maintain UI responsiveness and respect GAS limits.
- **Original Restoration**: Easily toggle back to the primary language without reloading data.
- **Persistent Retries**: Failed translations are queued in `localStorage` for automatic retries.

## Table of Contents
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Examples](#examples)

## Installation

This package is distributed as part of the monorepo. To use it in a new project:

1.  Copy the `Shared/TranslationManager/dist/TranslationManager.js` to your project's client-side build.
2. (Recommended) Use Git Subtree to track updates (see [Distribution & Subtree](#distribution--subtree)).

## Distribution & Subtree

If you are maintaining this package within a monorepo, use the following PowerShell scripts in the `scripts/` folder to sync with the standalone repository:

- **Push Changes**: `.\scripts\push-standalone.ps1`
  - Pushes the local `Shared/TranslationManager` folder to the `main` branch of the standalone repository.
- **Pull Changes**: `.\scripts\pull-standalone.ps1`
  - Pulls updates from the standalone repository back into the monorepo.

**Standalone Repo**: `https://github.com/alan-prudom/translation-manager-package.git`

## Quick Start

### DOM Mode (Direct DOM Updates)
For traditional server-rendered apps where TranslationManager updates the DOM directly:

```typescript
import { TranslationManager } from '@shared/translation-manager';

const tm = TranslationManager.getInstance();

tm.configure({
  i18nService: MyI18nService, // Object implementing I18nService interface
  gasTranslationFunction: 'performTranslation',
  selectors: {
    container: '#item-{id}',
    title: '.title',
    description: '.desc'
  }
});
```

### Headless Mode (For Vue, React, etc.)
**Recommended for modern reactive frameworks**. TranslationManager calls your callback instead of updating the DOM:

```typescript
const tm = TranslationManager.getInstance();

tm.configure({
  i18nService: {
    getCurrentLocale: () => currentLocale.value,
    subscribe: (cb) => { /* optional */ }
  },
  gasTranslationFunction: 'performTranslation',
  
  // Callback receives translation results
  onTranslationComplete: (id, result) => {
    const item = items.value.find(i => i.id === id);
    if (item) {
      item.title = result.title;
      item.description = result.description;
      item.isTranslated = true;
    }
  },
  onError: (id, err) => {
    console.error(`Translation failed for ${id}:`, err);
  }
});
```

**Important**: Do NOT provide both `selectors` and `onTranslationComplete`. Use one or the other:
- **DOM Mode**: Provide `selectors` (TranslationManager updates DOM)
- **Headless Mode**: Provide `onTranslationComplete` (you update your data model)

### 2. Process a Batch
```typescript
const entries = [
  { id: '1', title: 'Hello', description: 'World', isTranslated: false },
  { id: '2', title: 'Foo', description: 'Bar', isTranslated: false }
];

await tm.processBatch(entries);
```

### 3. Server-Side Function
```javascript
function performTranslation(options) {
  const { id, locale, context } = options;
  // Your logic here
  return { 
    title: LanguageApp.translate(originalTitle, 'en', locale),
    description: LanguageApp.translate(originalDesc, 'en', locale)
  };
}
```

## Configuration

| Option                   | Type          | Required | Description                                                            |
| :----------------------- | :------------ | :------- | :--------------------------------------------------------------------- |
| `i18nService`            | `I18nService` | Yes      | Service to get current locale.                                         |
| `gasTranslationFunction` | `string`      | Yes      | Name of global GAS function.                                           |
| `selectors`              | `object`      | No*      | DOM selectors (`container`, `title`, `description`). Use for DOM mode. |
| `onTranslationComplete`  | `function`    | No*      | Callback for headless mode. Receives `(id, result)`.                   |
| `onError`                | `function`    | No       | Error callback. Receives `(id, error)`.                                |
| `translatedClasses`      | `object`      | No       | CSS classes to add to translated elements (DOM mode only).             |
| `delay`                  | `number`      | No       | Delay between translations (default: 100ms).                           |

**\*Note**: Provide either `selectors` (DOM mode) OR `onTranslationComplete` (headless mode), not both.

## Examples

- [Calendar App Migration](./examples/gas-calendar/)
- [Standalone Task List](./examples/gas-tasks/)
- [Minimal Note Integration](./examples/gas-notes/)
- [Vue + Bootstrap SPA (Template Repository)](https://github.com/alan-prudom/vue-gas-spa-standalone.git)

## License
MIT
