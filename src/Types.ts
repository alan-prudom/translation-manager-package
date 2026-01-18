/**
 * Type definitions for Translation Manager Package
 * @packageDocumentation
 */

namespace Shared.TranslationManager {
    /**
     * Configuration for TranslationManager
     */
    export interface TranslationManagerConfig {
        // ===== REQUIRED =====

        /** i18n service instance (e.g., Shared.I18n.i18n) */
        i18nService: I18nService;

        /** Name of GAS server function to call for translation */
        gasTranslationFunction: string;

        /** DOM selectors for finding elements */
        selectors: {
            /** Container element selector (use {id} placeholder) */
            container: string;
            /** Title element selector (relative to container) */
            title: string;
            /** Description element selector (relative to container) */
            description: string;
        };

        // ===== OPTIONAL =====

        /** CSS classes to add to translated elements */
        translatedClasses?: {
            title?: string[];
            description?: string[];
        };

        /** Callback when a single item is translated */
        onTranslationComplete?: (id: string, result: TranslationResult) => void;

        /** Callback when a batch completes */
        onBatchComplete?: (batchSize: number, locale: string) => void;

        /** Callback when translation fails */
        onError?: (id: string, error: any) => void;

        /** HTML sanitizer function (security) */
        sanitizer?: (html: string) => string;

        /** URL extractor function (for link pills) */
        urlExtractor?: (text: string, trustedDomains: string[]) => ExtractedUrl[];

        /** List of trusted domains for URL extraction */
        trustedDomains?: string[];

        /** Maximum batch size (default: 15) */
        maxBatchSize?: number;

        /** Recommended batch size (default: 12) */
        recommendedBatchSize?: number;
    }

    /**
     * Entry that can be translated
     */
    export interface TranslatableEntry {
        /** Unique identifier */
        id: string;

        /** Whether this entry has been translated */
        isTranslated?: boolean;

        /** Original title (before translation) */
        originalTitle?: string;

        /** Original description (before translation) */
        originalDescription?: string;

        /** Allow additional properties for app-specific data */
        [key: string]: any;
    }

    /**
     * Result from GAS translation function
     */
    export interface TranslationResult {
        /** Translated title */
        title: string;

        /** Translated description */
        description: string;
    }

    /**
     * Extracted URL from text
     */
    export interface ExtractedUrl {
        /** Full URL */
        url: string;

        /** Display label for the link */
        label: string;

        /** Whether the domain is trusted */
        isTrusted: boolean;
    }

    /**
     * i18n Service interface (minimal contract)
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
}
