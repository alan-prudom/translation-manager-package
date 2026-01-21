/**
 * TranslationWindow
 * Pure logic for calculating the optimal translation batch based on viewport visibility.
 * Enforces the ~12-15 entry limit per event-loop cycle to maintain performance.
 */

import { EntryVisibility } from './Types';

export class TranslationWindow {
    private static readonly MAX_BATCH_SIZE = 15;
    private static readonly RECOMENDED_BATCH_SIZE = 12;

    /**
     * Calculates the best batch of entries to translate next.
     * Prioritizes visible entries, then older queued entries.
     * @param entries List of all entries with their visibility and translation status.
     * @returns List of entry IDs to process in this batch.
     */
    public static getBatch(entries: EntryVisibility[]): string[] {
        // 1. Filter for entries that actually need translation
        const candidates = entries.filter(e => e.needsTranslation);

        if (candidates.length === 0) return [];

        // 2. Separate into visible and non-visible
        const visible = candidates.filter(e => e.isViewable);
        const nonVisible = candidates.filter(e => !e.isViewable);

        // 3. Construct batch (up to MAX_BATCH_SIZE)
        const batch: string[] = [];

        // Always prioritize visible entries first
        visible.slice(0, this.MAX_BATCH_SIZE).forEach(e => batch.push(e.id));

        // If we still have room, add non-visible entries from the queue
        if (batch.length < this.RECOMENDED_BATCH_SIZE) {
            const remainingSpace = this.RECOMENDED_BATCH_SIZE - batch.length;
            nonVisible.slice(0, remainingSpace).forEach(e => batch.push(e.id));
        }

        return batch;
    }
}
