/**
 * PersistentQueue
 * Client-side persistence for the translation retry queue using localStorage.
 * Ensures reliability across browser sessions (FR-020).
 */
namespace Shared {
    export namespace TranslationManager {
        export class PersistentQueue {
            private static readonly KEY = 'translationQueue';

            /**
             * Pushes a new item to the queue.
             */
            public static push(eventId: string): void {
                const queue = this.get();
                if (queue.indexOf(eventId) === -1) {
                    queue.push(eventId);
                    this.save(queue);
                }
            }

            /**
             * Retrieves the current queue.
             */
            public static get(): string[] {
                // Return empty array if not in browser environment
                if (typeof localStorage === 'undefined') {
                    return [];
                }

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
                if (typeof localStorage !== 'undefined') {
                    localStorage.removeItem(this.KEY);
                }
            }

            private static save(queue: string[]): void {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(this.KEY, JSON.stringify(queue));
                }
            }
        }
    }
}
