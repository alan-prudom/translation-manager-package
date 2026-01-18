/// <reference path="Types.ts" />
/// <reference path="TranslationCache.ts" />
/// <reference path="TranslationWindow.ts" />
/// <reference path="PersistentQueue.ts" />

namespace Shared.TranslationManager {
    /**
     * TranslationManager
     * Coordinates background translation tasks with configurable behavior.
     *
     * @example
     * const mgr = TranslationManager.getInstance();
     * mgr.configure({
     *   i18nService: Shared.I18n.i18n,
     *   gasTranslationFunction: 'performTranslation',
     *   selectors: {
     *     container: '[data-event-id="{id}"]',
     *     title: '.entry-title',
     *     description: '.entry-description'
     *   }
     * });
     * await mgr.processBatch(entries);
     */
    export class TranslationManager {
        private static instance: TranslationManager;
        private config: TranslationManagerConfig | null = null;
        private isProcessing: boolean = false;
        private queuedEntries: TranslatableEntry[] | null = null;
        private currentProcessingLocale: string | null = null;

        private constructor() { }

        /**
         * Get singleton instance
         */
        public static getInstance(): TranslationManager {
            if (!TranslationManager.instance) {
                TranslationManager.instance = new TranslationManager();
            }
            return TranslationManager.instance;
        }

        /**
         * Configure the translation manager
         * Must be called before processBatch()
         *
         * @param config - Configuration object
         * @throws {Error} If required fields are missing or invalid
         */
        public configure(config: TranslationManagerConfig): void {
            // Validate required fields
            if (!config.i18nService) {
                throw new Error('[TranslationManager] config.i18nService is required');
            }
            if (!config.gasTranslationFunction) {
                throw new Error('[TranslationManager] config.gasTranslationFunction is required');
            }
            if (config.selectors) {
                if (!config.selectors.container) {
                    throw new Error('[TranslationManager] config.selectors.container is required if selectors provided');
                }
                if (config.selectors.container.indexOf('{id}') === -1) {
                    throw new Error('[TranslationManager] config.selectors.container must include {id} placeholder');
                }
                if (!config.selectors.title) {
                    throw new Error('[TranslationManager] config.selectors.title is required if selectors provided');
                }
                if (!config.selectors.description) {
                    throw new Error('[TranslationManager] config.selectors.description is required if selectors provided');
                }
            } else if (!config.onTranslationComplete) {
                // If no selectors, we MUST have a callback to deliver results
                throw new Error('[TranslationManager] config.onTranslationComplete is required when using headless mode (no selectors)');
            }

            // Validate batch sizes if provided
            if (config.maxBatchSize !== undefined && config.maxBatchSize < 1) {
                throw new Error('[TranslationManager] config.maxBatchSize must be >= 1');
            }
            if (config.recommendedBatchSize !== undefined && config.recommendedBatchSize < 1) {
                throw new Error('[TranslationManager] config.recommendedBatchSize must be >= 1');
            }

            this.config = config;
            console.log('[TranslationManager] Configured successfully');
        }

        /**
         * Process a batch of entries for translation
         *
         * @param entries - Array of translatable entries
         * @throws {Error} If not configured
         */
        public async processBatch(entries: TranslatableEntry[]): Promise<void> {
            if (!this.config) {
                throw new Error('[TranslationManager] Not configured. Call configure() first.');
            }

            const currentLocale = this.config.i18nService.getCurrentLocale();

            // Skip background translation for English (original content)
            if (currentLocale === 'en') {
                console.log('[TranslationManager] Skipping background translation for English locale');
                return;
            }

            if (this.isProcessing) {
                console.log('[TranslationManager] Already processing. Queuing next batch.');
                this.queuedEntries = entries;
                return;
            }

            this.isProcessing = true;
            this.currentProcessingLocale = currentLocale;

            try {
                // 1. Calculate the optimal batch using core logic
                const visibilityData: EntryVisibility[] = entries.map(e => ({
                    id: e.id,
                    isViewable: this.isElementViewable(e.id),
                    needsTranslation: !e.isTranslated
                }));

                const batchIds = TranslationWindow.getBatch(visibilityData);
                console.log(`[TranslationManager] Batch size: ${batchIds.length} for locale ${currentLocale}`);

                if (batchIds.length === 0) {
                    // Check if we need to continue with queued entries
                    this.checkQueue();
                    return;
                }

                // 2. Process each in batch (Sequential to avoid GAS quota collisions)
                for (const id of batchIds) {
                    // Stop if locale changed mid-batch
                    if (this.config.i18nService.getCurrentLocale() !== this.currentProcessingLocale) {
                        console.warn('[TranslationManager] Locale changed during batch. Aborting.');
                        break;
                    }
                    const entry = entries.find(e => e.id === id);
                    await this.translateEntry(id, currentLocale, entry);
                }

                // Fire batch complete callback
                if (this.config.onBatchComplete) {
                    try {
                        this.config.onBatchComplete(batchIds.length, currentLocale);
                    } catch (e) {
                        console.warn('[TranslationManager] onBatchComplete callback error:', e);
                    }
                }
            } finally {
                this.isProcessing = false;
                this.checkQueue();
            }
        }

        /**
         * Restore all entries to their original language
         *
         * @param entries - Array of entries to restore
         */
        public restoreOriginals(entries: TranslatableEntry[]): void {
            if (!this.config) {
                console.warn('[TranslationManager] Not configured. Cannot restore originals.');
                return;
            }

            console.log(`[TranslationManager] Restoring ${entries.length} entries to originals`);
            entries.forEach(entry => {
                if (entry.isTranslated) {
                    entry.title = entry.originalTitle || entry.title;
                    entry.description = entry.originalDescription || entry.description;
                    entry.isTranslated = false;

                    // Update UI directly if elements exist
                    if (this.config!.selectors) {
                        const containerSelector = this.config!.selectors.container.replace('{id}', entry.id);
                        const entryEl = document.querySelector(containerSelector);
                        if (entryEl) {
                            const titleEl = entryEl.querySelector(this.config!.selectors.title);
                            if (titleEl && this.config!.translatedClasses?.title) {
                                this.config!.translatedClasses.title.forEach(cls => titleEl.classList.remove(cls));
                            }
                            const descEl = entryEl.querySelector(this.config!.selectors.description);
                            if (descEl && this.config!.translatedClasses?.description) {
                                this.config!.translatedClasses.description.forEach(cls => descEl.classList.remove(cls));
                            }
                        }
                    }
                }
            });
        }

        /**
         * Check if an element is currently visible in the viewport
         *
         * @param id - Element identifier
         * @returns True if element is viewable
         */
        public isElementViewable(id: string): boolean {
            if (!this.config || !this.config.selectors) return false;

            const containerSelector = this.config.selectors.container.replace('{id}', id);
            const el = document.querySelector(containerSelector);
            if (!el) return false;

            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }

        private checkQueue(): void {
            if (this.queuedEntries) {
                const nextBatch = this.queuedEntries;
                this.queuedEntries = null;
                this.processBatch(nextBatch);
            }
        }

        private async translateEntry(id: string, locale: string, entry?: TranslatableEntry): Promise<void> {
            if (!this.config) return;

            try {
                // Check if already translated
                if (entry?.isTranslated) {
                    console.log(`[TranslationManager] ${id} already translated. Skipping.`);
                    return;
                }

                console.log(`[TranslationManager] Requesting translation for ${id} into ${locale}`);

                // Call GAS translation function dynamically
                const translationResult = await new Promise<TranslationResult>((resolve, reject) => {
                    const runner = (window as any).google.script.run
                        .withSuccessHandler(resolve)
                        .withFailureHandler(reject);

                    const gasFunction = runner[this.config!.gasTranslationFunction];

                    if (!gasFunction) {
                        reject(new Error(`GAS function '${this.config!.gasTranslationFunction}' not found`));
                        return;
                    }

                    gasFunction(id, locale, (entry as any)?.calendarId || (entry as any)?.contextId);
                });

                // Fire translation complete callback
                if (this.config.onTranslationComplete) {
                    try {
                        this.config.onTranslationComplete(id, translationResult);
                    } catch (e) {
                        console.warn('[TranslationManager] onTranslationComplete callback error:', e);
                    }
                }

                // Update DOM (Only if selectors provided)
                if (this.config.selectors) {
                    const containerSelector = this.config.selectors.container.replace('{id}', id);
                    const entryEl = document.querySelector(containerSelector);
                    if (entryEl) {
                        // Translate title
                        if (translationResult.title) {
                            const titleEl = entryEl.querySelector(this.config.selectors.title);
                            if (titleEl) {
                                const sanitizedTitle = this.config.sanitizer
                                    ? this.config.sanitizer(translationResult.title)
                                    : translationResult.title;
                                titleEl.innerHTML = sanitizedTitle;

                                // Add translated classes
                                const titleClasses = this.config.translatedClasses?.title || ['text-indigo-800'];
                                titleClasses.forEach(cls => titleEl.classList.add(cls));
                            }
                        }

                        // Translate description
                        if (translationResult.description) {
                            const descEl = entryEl.querySelector(this.config.selectors.description);
                            if (descEl) {
                                const sanitizedDesc = this.config.sanitizer
                                    ? this.config.sanitizer(translationResult.description)
                                    : translationResult.description;
                                descEl.innerHTML = sanitizedDesc;

                                // Add translated classes
                                const descClasses = this.config.translatedClasses?.description || ['text-indigo-600', 'font-medium'];
                                descClasses.forEach(cls => descEl.classList.add(cls));

                                // Extract URLs if extractor provided
                                if (this.config.urlExtractor && this.config.trustedDomains) {
                                    const extractedUrls = this.config.urlExtractor(
                                        translationResult.description,
                                        this.config.trustedDomains
                                    );

                                    if (extractedUrls.length > 0) {
                                        let urlsEl = entryEl.querySelector('.entry-urls') as HTMLElement;
                                        if (!urlsEl) {
                                            urlsEl = document.createElement('div');
                                            urlsEl.className = 'entry-urls flex flex-wrap gap-2 mt-2';
                                            const parent = descEl.parentElement;
                                            if (parent) parent.appendChild(urlsEl);
                                        }
                                        urlsEl.innerHTML = extractedUrls.map(link => `
                                            <a href="${link.url}"
                                               target="_blank"
                                               rel="noopener noreferrer"
                                               class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ${link.isTrusted ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-red-50 text-red-700 hover:bg-red-100'} transition-colors border ${link.isTrusted ? 'border-blue-100' : 'border-red-100'}"
                                               title="${link.isTrusted ? 'Verified Link' : 'Untrusted Domain'}">
                                                <span class="mr-1">${link.isTrusted ? '🔗' : '⚠️'}</span>
                                                ${this.config && this.config.sanitizer ? this.config.sanitizer(link.label) : link.label}
                                            </a>
                                        `).join(' ');
                                    }
                                }
                            }
                        }
                    }
                }

                PersistentQueue.remove(id);
            } catch (e) {
                console.warn(`[TranslationManager] Translation failed for ${id}:`, e);
                PersistentQueue.push(id); // Ensure it stays in queue for retry

                // Fire error callback
                if (this.config.onError) {
                    try {
                        this.config.onError(id, e);
                    } catch (callbackError) {
                        console.warn('[TranslationManager] onError callback error:', callbackError);
                    }
                }
            }
        }
    }
}

// Enable Unit Testing in Node environment
if (typeof module !== 'undefined') {
    module.exports = Shared.TranslationManager.TranslationManager;
}
