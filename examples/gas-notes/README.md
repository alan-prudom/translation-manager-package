# Example: Minimal Notes Integration

This "hello world" example shows the bare minimum required to use the `TranslationManager`.

## Configuration

Crucially, you only need three properties to get started:
1.  **i18nService**: To tell the manager what the target language is.
2.  **gasTranslationFunction**: The server-side entry point.
3.  **selectors**: How to find your content in the DOM.

## Usage

```typescript
const tm = TranslationManager.getInstance();
tm.configure({ ... });

// Later, just pass the ID and content
tm.processBatch([{ id: 'note123', title: 'My Note', description: 'Content here...' }]);
```

The manager handles everything else (finding the element, calling the server, updating the DOM).
