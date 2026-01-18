/**
 * TranslationWindow
 * Pure logic for calculating the optimal translation batch based on viewport visibility.
 * Enforces the ~12-15 entry limit per event-loop cycle to maintain performance.
 */

namespace Shared.TranslationManager {
    export class TranslationWindow {
        private static readonly MAX_BATCH_SIZE = 15;
        private static readonly RECOMENDED_BATCH_SIZE = 12;

        /**
         * Filters a list of entries to find the ones that should be translated in the current cycle.
         * Priority: Viewable entries that need translation > Non-viewable entries (deferred).
         * @param entries List of all entries with their visibility and translation status.
         * @returns List of entry IDs to process in this batch.
         */
        public static getBatch(entries: EntryVisibility[]): string[] {
            // 1. Filter for entries that actually need translation
            const candidates = entries.filter(e => e.needsTranslation);

            // 2. Separate into viewable and non-viewable
            const viewableCandidates = candidates.filter(e => e.isViewable);
            const hiddenCandidates = candidates.filter(e => !e.isViewable);

            // 3. Take up to MAX_BATCH_SIZE from viewable first
            const batch = viewableCandidates
                .slice(0, this.MAX_BATCH_SIZE)
                .map(e => e.id);

            // 4. If we have room, take from hidden candidates (low priority)
            // However, per FR-014, we should limit to approximately one "screenful" (12-15).
            // If the screenful is full, we don't take hidden ones to preserve UI responsiveness.
            if (batch.length < this.RECOMENDED_BATCH_SIZE) {
                const remainingSlots = this.RECOMENDED_BATCH_SIZE - batch.length;
                const extra = hiddenCandidates
                    .slice(0, remainingSlots)
                    .map(e => e.id);
                batch.push(...extra);
            }

            return batch;
        }
    }
}
