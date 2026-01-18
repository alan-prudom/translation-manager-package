# Example: Tasks Application

A complete standalone example of using `TranslationManager` for a task list app in Google Apps Script.

## Features Shown
- Manual DOM structure binding.
- Mock `I18nService` implementation.
- Handling of multiple items in a batch.
- Server-side `Code.gs` proxy.

## How to Run it

1.  Create a new Apps Script project at [script.google.com](https://script.google.com).
2.  Copy `Code.gs` to the editor.
3.  Create an `Index.html` file (template).
4.  Compile `Client.ts` using TypeScript and include the output in your `Index.html`.
5.  Deploy as a Web App.

## Technical Details

The Tasks app uses a class-based selector system:
-   **Container**: `.task-item[data-id="{id}"]`
-   **Title**: `.task-title`
-   **Notes/Description**: `.task-notes`

When `tm.processBatch(entries)` is called, the manager will:
1.  Verify which tasks are visible to the user.
2.  Request translations for those tasks first.
3.  Queue the remaining tasks.
4.  Update the `innerHTML` of the matched elements.
