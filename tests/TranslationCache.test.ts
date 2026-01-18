/**
 * Tests for TranslationCache logic
 */

describe('TranslationCache', () => {
    let TranslationCache: any;

    beforeAll(() => {
        // Mock global namespace
        (global as any).Shared = {
            TranslationManager: {}
        };

        TranslationCache = require('../src/TranslationCache');
    });
    it('should generate consistent partition keys', () => {
        const key = TranslationCache.getPartitionKey('en', 'es');
        expect(key).toBe('translate_cache_en_es');
    });

    it('should update partition and mark as changed', () => {
        const cache = {};
        const { nextPartition, changed } = TranslationCache.updatePartition(cache, 'hash1', 'translated1');

        expect(changed).toBe(true);
        expect(nextPartition['hash1']).toBe('translated1');
    });

    it('should not mark as changed if already cached', () => {
        const cache = { 'hash1': 'translated1' };
        const { changed } = TranslationCache.updatePartition(cache, 'hash1', 'translated1');

        expect(changed).toBe(false);
    });

    it('should enforce size limits (LRU)', () => {
        const cache: Record<string, string> = {};
        const longString = 'a'.repeat(5000);

        // Add first
        const step1 = TranslationCache.updatePartition(cache, 'h1', longString);
        // Add second (will exceed 8500)
        const step2 = TranslationCache.updatePartition(step1.nextPartition, 'h2', longString);

        expect(Object.keys(step2.nextPartition).length).toBe(1);
        expect(step2.nextPartition['h2']).toBeDefined();
        expect(step2.nextPartition['h1']).toBeUndefined();
    });
});
