/**
 * PersistentQueue
 * Client-side persistence for the translation retry queue using localStorage.
 * Ensures reliability across browser sessions (FR-020).
 */
export class PersistentQueue {
    private static readonly KEY = 'translationQueue';

    /**
     * Pushes a new item to the queue.
     */
    public static push(eventId: string): void {
        const queue = this.get();
        if (!queue.includes(eventId)) {
            queue.push(eventId);
            this.save(queue);
        }
    }

    /**
     * Retrieves the current queue.
     */
    public static get(): string[] {
        const data = localStorage.getItem(this.KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('[PersistentQueue] Failed to parse queue:', e);
            return [];
        }
    }

    /**
     * Removes an item from the queue if exists.
     */
    public static remove(eventId: string): void {
        const queue = this.get();
        const index = queue.indexOf(eventId);
        if (index > -1) {
            queue.splice(index, 1);
            this.save(queue);
        }
    }

    /**
     * Clears the entire queue.
     */
    public static clear(): void {
        localStorage.removeItem(this.KEY);
    }

    private static save(queue: string[]): void {
        localStorage.setItem(this.KEY, JSON.stringify(queue));
    }
}
