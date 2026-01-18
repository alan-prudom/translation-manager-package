# Integration Patterns: Managed DOM vs. Headless State

The `TranslationManager` is designed to be versatile. Depending on your frontend architecture, you can choose between a **Managed DOM** approach (automatic updates) or a **Headless State** approach (data-driven updates).

---

## 1. Managed DOM Mode (Vanilla JS / Calendar App)

This is the default mode used in the Local Calendar app. It is ideal for "Classic" web apps where you want the library to handle the heavy lifting of DOM manipulation.

### How it Works
1.  **Configuration**: You provide CSS selectors for your container, title, and description.
2.  **Processing**: When `processBatch()` is called, the manager finds the elements in the live DOM.
3.  **Update**: The manager directly updates `innerHTML` and applies `translatedClasses`.

### Code Example
```typescript
tm.configure({
    selectors: {
        container: '[data-id="{id}"]',
        title: '.item-title',
        description: '.item-body'
    },
    translatedClasses: {
        title: ['text-success', 'fw-bold']
    }
});
```

### Best For
*   Vanilla JavaScript or jQuery projects.
*   Legacy applications with server-side rendered templates.
*   Quick integrations where you don't want to manage state updates manually.

---

## 2. Headless State Mode (Vue / React / Frameworks)

In modern SPAs like **Vue** or **React**, the framework "owns" the DOM. Direct manipulation by external libraries can lead to "flashing" or lost updates when the framework re-renders.

### How it Works
1.  **Configuration**: You omit the `selectors` property (planned enhancement).
2.  **Orchestration**: The manager still handles **Viewport Visibility** (so you don't translate what the user isn't looking at) and **Batching**.
3.  **Hand-off**: Instead of updating the DOM, the manager fires the `onTranslationComplete` callback.
4.  **Sync**: You update your framework's reactive state inside that callback.

### Code Example (Vue.js + Bootstrap)
```typescript
// configuration
tm.configure({
    gasTranslationFunction: 'performTranslation',
    onTranslationComplete: (id, result) => {
        // Find the reactive object in your Vue state
        const item = vueApp.items.find(i => i.id === id);
        if (item) {
            item.title = result.title;
            item.description = result.description;
            item.isTranslated = true;
        }
    }
});

// Triggering the batch from a Vue observer
watch(viewportItems, (newItems) => {
    tm.processBatch(newItems);
});
```

### Best For
*   Vue, React, Svelte, or Angular projects.
*   Apps where data integrity is the priority.
*   Complex UIs where you need full control over *how* the translation is displayed (e.g., inside an input field or a tooltip).

---

## 3. The "Hybrid" Approach (Vue + Bootstrap Layout)

If you are using **Bootstrap** with Vue, you can use a hybrid approach to get the best of both worlds.

### The Layout (Bootstrap Card)
```html
<div v-for="item in items" :key="item.id" 
     class="card mb-3" 
     :data-id="item.id">
  <div class="card-body">
    <!-- Vue renders the structural data -->
    <h5 class="card-title" :class="{'text-primary': item.isTranslated}">
      {{ item.title }}
    </h5>
    <p class="card-text">{{ item.description }}</p>
    
    <!-- Translation Manager handles the link pills via callback logic -->
    <div v-if="item.links" class="mt-2">
       <span v-for="link in item.links" class="badge bg-light text-dark me-1">
         {{ link.label }}
       </span>
    </div>
  </div>
</div>
```

### Why this works
*   **Bootstrap Utility Classes**: You can use `translatedClasses` to apply Bootstrap classes like `border-info` or `bg-light` dynamically.
*   **Responsive Batches**: Even in a standard Bootstrap "List Group," the manager will only translate the visible rows, keeping the initial load snappy.

---

## 4. Summary Comparison

| Feature              | Managed DOM        | Headless State             |
| :------------------- | :----------------- | :------------------------- |
| **Effort**           | Low (Automatic)    | Medium (Manual state sync) |
| **Control**          | Standard selectors | Full (Logic in callback)   |
| **Framework Safety** | Risk of conflict   | Native/Safe                |
| **Use Case**         | Local Calendar app | Vue/Bootstrap SPA          |

## Implementation Strategy for Frameworks
To implement the **Headless** mode, we are refining the `TranslationManager` to treat `selectors` as an optional dependency. If not provided, the manager functions as a pure **Batching and Prioritization Engine**, ensuring the heavy lifting of interacting with Google Apps Script remains efficient and orderly.
