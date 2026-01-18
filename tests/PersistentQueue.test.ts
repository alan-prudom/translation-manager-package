/**
 * Tests for PersistentQueue logic
 */

describe('PersistentQueue', () => {
    let PersistentQueue: any;

    beforeAll(() => {
        // Mock localStorage
        Object.defineProperty(global, 'localStorage', {
            value: {
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn()
            },
            writable: true
        });

        // Mock global namespace
        (global as any).Shared = {
            TranslationManager: {}
        };

        PersistentQueue = require('../src/PersistentQueue');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should push unique items to the store', () => {
        (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(['1']));

        PersistentQueue.push('2');

        expect(localStorage.setItem).toHaveBeenCalledWith(
            'translationQueue',
            JSON.stringify(['1', '2'])
        );
    });

    it('should not push duplicates', () => {
        (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(['1']));

        PersistentQueue.push('1');

        expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should retrieve the queue', () => {
        (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(['1', '2']));

        const queue = PersistentQueue.get();
        expect(queue).toEqual(['1', '2']);
    });

    it('should remove items correctly', () => {
        (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(['1', '2']));

        PersistentQueue.remove('1');

        expect(localStorage.setItem).toHaveBeenCalledWith(
            'translationQueue',
            JSON.stringify(['2'])
        );
    });

    it('should clear the queue', () => {
        PersistentQueue.clear();
        expect(localStorage.removeItem).toHaveBeenCalledWith('translationQueue');
    });
});
