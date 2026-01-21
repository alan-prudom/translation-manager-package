import { PersistentQueue } from '../src/PersistentQueue';

describe('PersistentQueue', () => {
    beforeEach(() => {
        // Mock localStorage
        const store: Record<string, string> = {};
        (global as any).localStorage = {
            getItem: jest.fn((key: string) => store[key] || null),
            setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
            removeItem: jest.fn((key: string) => { delete store[key]; }),
            clear: jest.fn(() => { for (const key in store) delete store[key]; })
        };
        jest.clearAllMocks();
    });

    it('should push unique items to the store', () => {
        PersistentQueue.push('1');
        PersistentQueue.push('2');

        expect(localStorage.setItem).toHaveBeenCalledWith(
            'translationQueue',
            JSON.stringify(['1', '2'])
        );
    });

    it('should not push duplicates', () => {
        PersistentQueue.push('1');
        jest.clearAllMocks();
        PersistentQueue.push('1');

        expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should retrieve the queue', () => {
        PersistentQueue.push('1');
        PersistentQueue.push('2');

        const queue = PersistentQueue.get();
        expect(queue).toEqual(['1', '2']);
    });

    it('should remove items correctly', () => {
        PersistentQueue.push('1');
        PersistentQueue.push('2');
        PersistentQueue.remove('1');

        expect(localStorage.setItem).toHaveBeenLastCalledWith(
            'translationQueue',
            JSON.stringify(['2'])
        );
    });

    it('should clear the queue', () => {
        PersistentQueue.clear();
        expect(localStorage.removeItem).toHaveBeenCalledWith('translationQueue');
    });

    it('should pop items correctly', () => {
        PersistentQueue.push('1');
        PersistentQueue.push('2');

        const item = PersistentQueue.pop();
        expect(item).toBe('1');
        expect(PersistentQueue.get()).toEqual(['2']);
    });
});
