/**
 * PersistentQueue
 * Client-side persistence for the translation retry queue using localStorage.
 * Ensures reliability across browser sessions (FR-020).
 */
export class PersistentQueue {
    private static readonly KEY = 'translationQueue';

    /**
     * Push an ID to the queue if not already present
     */
    public static push(id: string): void {
        const queue = this.get();
        if (!queue.includes(id)) {
            queue.push(id);
            this.save(queue);
        }
    }

    /**
     * Remove an ID from the queue
     */
    public static remove(id: string): void {
        const queue = this.get().filter(item => item !== id);
        this.save(queue);
    }

    /**
     * Get all IDs in the queue
     */
    public static get(): string[] {
        try {
            const data = localStorage.getItem(this.KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.warn('[PersistentQueue] Read failed:', e);
            return [];
        }
    }

    /**
     * Pop the next ID from the queue
     */
    public static pop(): string | null {
        const queue = this.get();
        if (queue.length === 0) return null;
        const next = queue.shift();
        this.save(queue);
        return next || null;
    }

    /**
     * Clear the queue
     */
    public static clear(): void {
        localStorage.removeItem(this.KEY);
    }

    private static save(queue: string[]): void {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(queue));
        } catch (e) {
            console.warn('[PersistentQueue] Save failed:', e);
        }
    }
}
