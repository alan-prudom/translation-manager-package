import { TranslationCache } from '../src/TranslationCache';

describe('TranslationCache', () => {
    beforeEach(() => {
        // Mock sessionStorage
        const store: Record<string, string> = {};
        (global as any).sessionStorage = {
            getItem: (key: string) => store[key] || null,
            setItem: (key: string, value: string) => { store[key] = value; },
            removeItem: (key: string) => { delete store[key]; },
            key: (index: number) => Object.keys(store)[index],
            get length() { return Object.keys(store).length; },
            clear: () => { for (const key in store) delete store[key]; }
        };
    });

    it('should set and get from cache', () => {
        const entry = { hash: 'h1', title: 'T1', description: 'D1' };
        TranslationCache.set('123', 'es', entry);

        const cached = TranslationCache.get('123', 'es');
        expect(cached).toEqual(entry);
    });

    it('should return null if not in cache', () => {
        const cached = TranslationCache.get('999', 'es');
        expect(cached).toBeNull();
    });

    it('should clear specific entry', () => {
        TranslationCache.set('123', 'es', { hash: 'h1', title: 'T1', description: 'D1' });
        TranslationCache.clear('123', 'es');
        expect(TranslationCache.get('123', 'es')).toBeNull();
    });

    it('should clear all for a locale', () => {
        TranslationCache.set('1', 'es', { hash: 'h1', title: 'T1', description: 'D1' });
        TranslationCache.set('2', 'es', { hash: 'h2', title: 'T2', description: 'D2' });
        TranslationCache.set('1', 'fr', { hash: 'h1', title: 'T1', description: 'D1' });

        TranslationCache.clearAll('es');

        expect(TranslationCache.get('1', 'es')).toBeNull();
        expect(TranslationCache.get('2', 'es')).toBeNull();
        expect(TranslationCache.get('1', 'fr')).not.toBeNull();
    });
});
