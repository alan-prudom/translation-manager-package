/**
 * TranslationCache
 * Simple client-side cache for translations using sessionStorage.
 */

export interface CacheEntry {
    hash: string;
    title: string;
    description: string;
}

export class TranslationCache {
    private static readonly PREFIX = 'tm_cache_';

    /**
     * Get a cached translation
     */
    public static get(id: string, locale: string): CacheEntry | null {
        try {
            const key = this.getKey(id, locale);
            const data = sessionStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Set a cached translation
     */
    public static set(id: string, locale: string, entry: CacheEntry): void {
        try {
            const key = this.getKey(id, locale);
            sessionStorage.setItem(key, JSON.stringify(entry));
        } catch (e) {
            // Silently fail if session storage is full
        }
    }

    /**
     * Clear cache for a specific entry and locale
     */
    public static clear(id: string, locale: string): void {
        sessionStorage.removeItem(this.getKey(id, locale));
    }

    /**
     * Clear all cache for a specific locale
     */
    public static clearAll(locale: string): void {
        const prefix = `${this.PREFIX}${locale}_`;
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(prefix)) {
                sessionStorage.removeItem(key);
                i--; // Adjust index after removal
            }
        }
    }

    private static getKey(id: string, locale: string): string {
        return `${this.PREFIX}${locale}_${id}`;
    }
}
