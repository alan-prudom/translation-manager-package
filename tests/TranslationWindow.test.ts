/**
 * Tests for TranslationWindow logic
 */

describe('TranslationWindow', () => {
    let TranslationWindow: any;

    beforeAll(() => {
        // Mock global namespace
        (global as any).Shared = {
            TranslationManager: {}
        };

        TranslationWindow = require('../src/TranslationWindow');
    });

    const mockVisibility = (id: string, viewable: boolean, needs: boolean) => ({
        id,
        isViewable: viewable,
        needsTranslation: needs
    });

    it('should prioritize viewable entries', () => {
        const entries = [
            mockVisibility('1', false, true),
            mockVisibility('2', true, true),
            mockVisibility('3', false, true)
        ];

        const batch = TranslationWindow.getBatch(entries);
        expect(batch[0]).toBe('2');
        expect(batch.length).toBe(3);
    });

    it('should limit to MAX_BATCH_SIZE (15) for visibility', () => {
        const entries = Array.from({ length: 20 }, (_, i) =>
            mockVisibility(i.toString(), true, true)
        );

        const batch = TranslationWindow.getBatch(entries as any);
        expect(batch.length).toBe(15);
    });

    it('should include hidden entries if room exists', () => {
        const entries = [
            mockVisibility('1', true, true),
            mockVisibility('2', false, true)
        ];

        const batch = TranslationWindow.getBatch(entries);
        expect(batch).toContain('1');
        expect(batch).toContain('2');
    });

    it('should skip entries that do not need translation', () => {
        const entries = [
            mockVisibility('1', true, false),
            mockVisibility('2', true, true)
        ];

        const batch = TranslationWindow.getBatch(entries);
        expect(batch).toEqual(['2']);
    });
});
