/**
 * Type definitions for Translation Manager Package
 * @packageDocumentation
 */

/**
 * Configuration for TranslationManager
 */
export interface TranslationManagerConfig {
    /** I18n service instance for locale management */
    i18nService: I18nService;

    /** CSS selectors for translatable elements */
    selectors?: {
        container: string;
        title: string;
        description: string;
    };

    /** Optional CSS classes for translated elements */
    translatedClasses?: {
        title?: string[];
        description?: string[];
    };

    /** Success callback */
    onTranslationComplete?: (id: string, result: TranslationResult) => void;

    /** Error callback */
    onTranslationError?: (id: string, error: Error) => void;

    /** The GAS function to call for server-side translation */
    gasTranslationFunction?: string;

    /** HTML Sanitizer function */
    sanitizer?: (html: string) => string;

    /** URL Extractor function */
    urlExtractor?: (text: string, trustedDomains: string[]) => any[];

    /** List of trusted domains for URL extraction */
    trustedDomains?: string[];

    /** Minimum processing delay (ms) */
    delay?: number;
}

/**
 * Translatable data for an entry
 */
export interface TranslatableEntry {
    id: string;
    title: string;
    description: string;
}

/**
 * Result of a translation operation
 */
export interface TranslationResult {
    title: string;
    description: string;
    originalTitle?: string;
    originalDescription?: string;
}

/**
 * Minimal I18n service interface required by TranslationManager
 */
export interface I18nService {
    /** Get current locale code (e.g., 'en', 'es', 'fr') */
    getCurrentLocale(): string;

    /** Subscribe to locale changes */
    subscribe(callback: (locale: string) => void): void;
}

/**
 * Entry visibility data for batching
 */
export interface EntryVisibility {
    /** Entry identifier */
    id: string;

    /** Whether entry is currently viewable in viewport */
    isViewable: boolean;

    /** Whether entry needs translation */
    needsTranslation: boolean;
}
