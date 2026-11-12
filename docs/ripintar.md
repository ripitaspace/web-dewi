# Ripintar

Ripintar is a browser-local, mastery-based practice layer at `/ripintar`. It deliberately has no account, server progress, import/export, or synchronization.

## Architecture

- `src/modules/ripintar/content.ts` contains the stable, data-driven rank and mission catalog.
- `src/modules/ripintar/engine.ts` is the sole owner of validation, state transitions, stars, and unlock rules.
- `src/modules/ripintar/storage.ts` persists the single journey record in IndexedDB (`puspitacore-ripintar`), using one transaction per save.
- `src/components/ripintar/ripintar-client.tsx` renders the dashboard, roadmap, workspaces, local records, and onboarding.

Only `MASTERED` mission states unlock a successor. Replaying a mastered mission may create a practice assessment record but cannot award a second star. Future ranks are defined in the roadmap yet are not enterable until their interactive content exists.

## Current scope

Rookie includes all nine core assignments and the integrated promotion challenge. Scout through Pinnacle have complete identifiers, divisions, prerequisite relationships, and locked roadmap previews; their workspaces are intentionally not yet implemented.
