/**
 * Example: GAS Tasks Client-Side
 *
 * Demonstrates a simple integration for a task list.
 */

import { TranslationManager } from '@shared/translation-manager';

// 1. Mock implementation of I18nService
const MockI18nService = {
    getCurrentLocale: () => 'fr', // In a real app, bind to your language switcher
    subscribe: (callback: (locale: string) => void) => {
        // Handle locale changes
    }
};

// 2. Setup the manager
const tm = TranslationManager.getInstance();

tm.configure({
    i18nService: MockI18nService as any,
    gasTranslationFunction: 'translateTask',
    selectors: {
        container: '.task-item[data-id="{id}"]',
        title: '.task-title',
        description: '.task-notes'
    }
});

// 3. Simulated render function
function renderTasks(tasks: any[]) {
    const list = document.getElementById('task-list')!;
    list.innerHTML = tasks.map(t => `
        <div class="task-item" data-id="${t.id}">
            <h3 class="task-title">${t.title}</h3>
            <p class="task-notes">${t.notes}</p>
        </div>
    `).join('');

    // Convert tasks to TranslatableEntry format
    const entries = tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.notes
    }));

    // Trigger background translation
    tm.processBatch(entries)
        .then(() => console.log('Tasks translated!'))
        .catch(err => console.error('Translation failed', err));
}

// Initial render
renderTasks([
    { id: '1', title: 'Buy milk', notes: 'Go to the grocery store' },
    { id: '2', title: 'Call recruiter', notes: 'Schedule follow up' }
]);
