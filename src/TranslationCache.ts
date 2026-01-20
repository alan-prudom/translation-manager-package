/**
 * TranslationCache
 * Pure logic for managing partitioned translation caches.
 * Each language pair (e.g., en-es) is stored in a separate partition to optimize GAS 9KB limits.
 */

namespace Shared {
    export namespace TranslationManager {
        export interface CacheEntry {
            hash: string;
            sourceText: string;
            translatedText: string;
        }

        export class TranslationCache {
            private static readonly MAX_PARTITION_SIZE_BYTES = 8500; // Safety margin under 9KB

            /**
             * Generates a partition key based on source and target languages.
             */
            public static getPartitionKey(sourceLang: string, targetLang: string): string {
                return `translate_cache_${sourceLang.toLowerCase()}_${targetLang.toLowerCase()}`;
            }

            /**
             * Simple hash for text content.
             */
            public static hashText(text: string): string {
                let hash = 0;
                for (let i = 0; i < text.length; i++) {
                    const char = text.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash; // Convert to 32bit integer
                }
                return Math.abs(hash).toString(36);
            }

            /**
             * Updates a partition map with a new translation, enforcing the 9KB limit via LRU logic.
             * @param currentPartition The existing Record<hash, translatedText>
             * @param hash The unique hash for the source text
             * @param translatedText The result to cache
             * @returns Updated partition map and a flag indicating if it changed
             */
            public static updatePartition(
                currentPartition: Record<string, string>,
                hash: string,
                translatedText: string
            ): { nextPartition: Record<string, string>; changed: boolean } {
                if (currentPartition[hash] === translatedText) {
                    return { nextPartition: currentPartition, changed: false };
                }

                const nextPartition = { ...currentPartition };
                nextPartition[hash] = translatedText;

                // Prune if over limit
                let serialized = JSON.stringify(nextPartition);
                const keys = Object.keys(nextPartition);

                // Simple LRU: Delete oldest keys (first in object) if size exceeded
                while (serialized.length > this.MAX_PARTITION_SIZE_BYTES && keys.length > 0) {
                    const oldestKey = keys.shift();
                    if (oldestKey) {
                        delete nextPartition[oldestKey];
                        serialized = JSON.stringify(nextPartition);
                    }
                }

                return { nextPartition, changed: true };
            }
        }
    }
}

