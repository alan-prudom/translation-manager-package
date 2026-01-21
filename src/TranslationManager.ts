/**
 * TranslationManager.ts
 * Core logic for the background translation system.
 */

import {
    TranslationManagerConfig,
    TranslationResult,
    EntryVisibility
} from './Types';
import { PersistentQueue } from './PersistentQueue';
import { TranslationWindow } from './TranslationWindow';
import { TranslationCache } from './TranslationCache';

export class TranslationManager {
    private static instance: TranslationManager;
    private config!: TranslationManagerConfig;
    private isProcessing = false;
    private localeSubscriptionSet = false;

    private constructor() { }

    public static getInstance(): TranslationManager {
        if (!TranslationManager.instance) {
            TranslationManager.instance = new TranslationManager();
        }
        return TranslationManager.instance;
    }

    /**
     * Configure the manager with application-specific settings
     */
    public configure(config: TranslationManagerConfig): void {
        this.config = {
            delay: 100, // Default 100ms delay
            gasTranslationFunction: 'performTranslation',
            ...config
        };

        if (!this.config.selectors && !this.config.onTranslationComplete) {
            throw new Error('[TranslationManager] config.onTranslationComplete is required when using headless mode (no selectors)');
        }

        if (!this.localeSubscriptionSet) {
            this.config.i18nService.subscribe(() => {
                // Clear state when language changes?
                // Usually we just let the next batch handle it.
            });
            this.localeSubscriptionSet = true;
        }

        console.log('[TranslationManager] Configured');
    }

    /**
     * Process a batch of entries and determine what needs translation based on viewport
     */
    public async processBatch(entries: any[]): Promise<void> {
        if (!this.config || this.isProcessing) return;

        const currentLocale = this.config.i18nService.getCurrentLocale();
        if (currentLocale === 'en') return; // Don't translate English

        // 1. Map entries to EntryVisibility using selectors
        const visibilityData: EntryVisibility[] = entries.map(entry => {
            let isViewable = false;

            if (this.config.selectors) {
                const container = document.querySelector(this.config.selectors.container.replace('{id}', entry.id));
                isViewable = container ? this.isInViewport(container as HTMLElement) : false;
            }

            // Check if already translated or being translated
            const isTranslated = (entry as any).isTranslated;

            return {
                id: entry.id,
                isViewable,
                needsTranslation: !isTranslated
            };
        });

        // 2. Get optimal batch from TranslationWindow
        const batchIds = TranslationWindow.getBatch(visibilityData);

        if (batchIds.length === 0) {
            // Check Persistent Queue for background tasks if no visible priorities
            const queuedId = PersistentQueue.pop();
            if (queuedId) {
                batchIds.push(queuedId);
            }
        }

        if (batchIds.length > 0) {
            await this.processBatchIds(batchIds, entries);
        }
    }

    /**
     * Restore original English text for all entries
     */
    public restoreOriginals(entries: any[]): void {
        entries.forEach(entry => {
            if (entry.isTranslated) {
                entry.title = entry.originalTitle || entry.title;
                entry.description = entry.originalDescription || entry.description;
                entry.isTranslated = false;
                entry.originalTitle = undefined;
                entry.originalDescription = undefined;
            }
        });
    }

    private async processBatchIds(ids: string[], allEntries: any[]): Promise<void> {
        this.isProcessing = true;

        for (const id of ids) {
            const entry = allEntries.find(e => e.id === id);
            if (!entry) continue;

            try {
                await this.translateEntry(entry);
                // Artificial delay to prevent overlapping GAS calls
                await new Promise(resolve => setTimeout(resolve, this.config.delay || 100));
            } catch (err) {
                console.warn(`[TranslationManager] Failed to translate ${id}:`, err);
            }
        }

        this.isProcessing = false;
    }

    private async translateEntry(entry: any): Promise<void> {
        const locale = this.config.i18nService.getCurrentLocale();

        // 1. Check Cache
        const cached = TranslationCache.get(entry.id, locale);
        if (cached) {
            this.applyTranslation(entry, cached);
            return;
        }

        // 2. Call GAS
        return new Promise((resolve, reject) => {
            const gasFunction = this.config.gasTranslationFunction || 'performTranslation';

            // @ts-ignore
            google.script.run
                .withSuccessHandler((result: TranslationResult) => {
                    // Cache it
                    TranslationCache.set(entry.id, locale, {
                        hash: 'fixed', // Could use content hash later
                        title: result.title,
                        description: result.description
                    });

                    this.applyTranslation(entry, result);
                    PersistentQueue.remove(entry.id);

                    if (this.config.onTranslationComplete) {
                        this.config.onTranslationComplete(entry.id, result);
                    }
                    resolve();
                })
                .withFailureHandler((err: Error) => {
                    PersistentQueue.push(entry.id);
                    if (this.config.onTranslationError) {
                        this.config.onTranslationError(entry.id, err);
                    }
                    reject(err);
                })
            [gasFunction]({
                id: entry.id,
                locale: locale,
                context: (entry as any).calendarId
            });
        });
    }

    private applyTranslation(entry: any, result: TranslationResult): void {
        if (!entry.isTranslated) {
            entry.originalTitle = entry.title;
            entry.originalDescription = entry.description;
        }

        entry.title = result.title;
        entry.description = result.description;
        entry.isTranslated = true;

        // Apply to DOM if selectors are configured
        if (this.config.selectors) {
            const container = document.querySelector(this.config.selectors.container.replace('{id}', entry.id));
            if (container) {
                const titleEl = container.querySelector(this.config.selectors.title);
                const descEl = container.querySelector(this.config.selectors.description);

                if (titleEl) {
                    titleEl.innerHTML = result.title;
                    if (this.config.translatedClasses?.title) {
                        titleEl.classList.add(...this.config.translatedClasses.title);
                    }
                }
                if (descEl) {
                    descEl.innerHTML = result.description;
                    if (this.config.translatedClasses?.description) {
                        descEl.classList.add(...this.config.translatedClasses.description);
                    }
                }
            }
        }
    }

    private isInViewport(element: HTMLElement): boolean {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}
