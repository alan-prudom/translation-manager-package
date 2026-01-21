import { TranslationManager } from '../src/TranslationManager';

describe('TranslationManager', () => {
    let mockI18n: any;

    beforeEach(() => {
        // Mock DOM
        (global as any).document = {
            querySelector: jest.fn(),
            documentElement: { clientHeight: 800, clientWidth: 1000 }
        };
        (global as any).window = {
            innerHeight: 800,
            innerWidth: 1000,
            google: {
                script: {
                    run: {
                        withSuccessHandler: jest.fn().mockReturnThis(),
                        withFailureHandler: jest.fn().mockReturnThis()
                    }
                }
            },
            setTimeout: (cb: any, ms: number) => cb()
        };
        (global as any).google = (global as any).window.google;

        // Mock localStorage/sessionStorage
        (global as any).localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn()
        };
        (global as any).sessionStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn()
        };

        mockI18n = {
            getCurrentLocale: jest.fn().mockReturnValue('es'),
            subscribe: jest.fn()
        };

        // Reset singleton
        (TranslationManager as any).instance = null;
    });

    it('should throw error if configured Headless without callback', () => {
        const mgr = TranslationManager.getInstance();
        expect(() => {
            mgr.configure({
                i18nService: mockI18n,
                gasTranslationFunction: 'translate'
                // Missing both selectors AND onTranslationComplete
            } as any);
        }).toThrow('[TranslationManager] config.onTranslationComplete is required when using headless mode (no selectors)');
    });

    it('should configure successfully in Headless mode with callback', () => {
        const mgr = TranslationManager.getInstance();
        expect(() => {
            mgr.configure({
                i18nService: mockI18n,
                gasTranslationFunction: 'translate',
                onTranslationComplete: jest.fn()
            });
        }).not.toThrow();
    });

    it('should skip DOM updates in Headless mode', async () => {
        const mgr = TranslationManager.getInstance();
        const onComplete = jest.fn();

        mgr.configure({
            i18nService: mockI18n,
            gasTranslationFunction: 'translate',
            onTranslationComplete: onComplete
        });

        const mockResponse = { title: 'Hola', description: 'Mundo' };

        // Mock the GAS runner
        const runner = (window as any).google.script.run;
        (runner as any).translate = jest.fn();
        runner.withSuccessHandler.mockImplementation((cb: any) => {
            cb(mockResponse);
            return runner;
        });

        await (mgr as any).translateEntry({ id: '1', title: 'Hello', description: 'World' });

        expect(onComplete).toHaveBeenCalledWith('1', mockResponse);
        expect(document.querySelector).not.toHaveBeenCalled();
    });

    it('should perform DOM updates in Managed mode', async () => {
        const mgr = TranslationManager.getInstance();

        // Mock elements
        const mockTitleEl = { innerHTML: '', classList: { add: jest.fn() } };
        const mockDescEl = { innerHTML: '', classList: { add: jest.fn() } };
        const mockContainer = {
            querySelector: jest.fn().mockImplementation((sel) => {
                if (sel === '.title') return mockTitleEl;
                if (sel === '.desc') return mockDescEl;
                return null;
            })
        };
        (document.querySelector as jest.Mock).mockReturnValue(mockContainer);

        mgr.configure({
            i18nService: mockI18n,
            gasTranslationFunction: 'translate',
            selectors: {
                container: '#item-{id}',
                title: '.title',
                description: '.desc'
            }
        });

        const mockResponse = { title: 'Hola', description: 'Mundo' };
        const runner = (window as any).google.script.run;
        (runner as any).translate = jest.fn();
        runner.withSuccessHandler.mockImplementation((cb: any) => {
            cb(mockResponse);
            return runner;
        });

        await (mgr as any).translateEntry({ id: '123', title: 'Hello', description: 'World' });

        expect(document.querySelector).toHaveBeenCalledWith('#item-123');
        expect(mockTitleEl.innerHTML).toBe('Hola');
        expect(mockDescEl.innerHTML).toBe('Mundo');
    });
});
