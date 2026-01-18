# API Reference: Translation Manager

## classes

### `TranslationManager` (Singleton)
The main entry point for the translation system.

#### `getInstance(): TranslationManager`
Returns the singleton instance.

#### `configure(config: TranslationManagerConfig): void`
Initializes the manager with your application's settings. Must be called before any other methods.
- **config**: See [Interfaces](#interfaces).

#### `processBatch(entries: TranslatableEntry[]): Promise<void>`
Processes a list of entries. Determines visibility, batches requests, and updates the DOM.
- **entries**: List of items to translate.

#### `restoreOriginals(entries: TranslatableEntry[]): void`
Reverts all translated content in the DOM and entry objects to their original state.
- **entries**: List of items to restore.

#### `isElementViewable(id: string): boolean`
Helper to check if an element is currently in the viewport.

---

## Interfaces

### `TranslationManagerConfig`
| Property                 | Type          | Description                                                    |
| :----------------------- | :------------ | :------------------------------------------------------------- |
| `i18nService`            | `I18nService` | Required. Service for locale management.                       |
| `gasTranslationFunction` | `string`      | Required. Global GAS function name.                            |
| `selectors`              | `object`      | Required. DOM selectors for container, title, and description. |
| `translatedClasses`      | `object`      | Optional. CSS classes for translated state.                    |
| `onBatchComplete`        | `callback`    | Optional. Called after a batch is processed.                   |
| `onError`                | `callback`    | Optional. Called when an individual item fails.                |

### `TranslatableEntry`
| Property       | Type      | Description                        |
| :------------- | :-------- | :--------------------------------- |
| `id`           | `string`  | Required. Unique identifier.       |
| `isTranslated` | `boolean` | Optional. Track translation state. |
| `title`        | `string`  | Required. Source title.            |
| `description`  | `string`  | Required. Source description.      |

### `TranslationResult`
| Property      | Type     | Description                     |
| :------------ | :------- | :------------------------------ |
| `title`       | `string` | Translated title content.       |
| `description` | `string` | Translated description content. |
