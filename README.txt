FULL PERMANENT DELETE REVISION

Replace ONLY these two existing files in your GitHub repository:
1. firebase-auth-sync.js
2. premium-delete-modal.js

Do not replace app.js, styles.css, renderers, dashboard files, pickup files, tutorial files, or your ticket data.

What this revision changes:
- Adds premiumTicketTracker.deletedIds.v1 as a Firebase-persisted tombstone list.
- Deleted ticket IDs are saved into the canonical Firebase appState.
- Firebase hydration filters deleted IDs before restoring tickets.
- Stale Firebase snapshots cannot intentionally re-add an ID already marked deleted.
- Existing ticket fields/features are otherwise left untouched.
- Delete modal waits for Firebase persistence before showing permanent-delete success.

After upload:
1. Commit both files.
2. Wait for deployment.
3. Hard refresh with Ctrl+Shift+R.
4. Delete ONE test ticket.
5. Wait several minutes and refresh again to verify it stays deleted.

IMPORTANT:
Back up your current two files before replacing them.
