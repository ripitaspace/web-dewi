# Ruang Belajar

The public catalog is `/belajar`; modules open at `/belajar/modul/[slug]`.
The first module adapts the supplied PuspitaCore Aset Tetap PLF reference into native React components. Articles still use the existing Notion integration.

## Add or revise a module

1. Add a reviewed PLF v1 JSON file under `content/` and register it in `catalog.ts`.
2. Copy its media to `public/learning/<slug>/media/`. JSON media references use `./media/<filename>`; the player only accepts these local paths. The current adapter handles the 13 component types demonstrated by Aset Tetap, not arbitrary external embeds or raw HTML.
3. Validate against `schemas/plf-module-v1.schema.json`, check unique IDs and competency references, then review the educational content. The tests also verify bundled media paths and exported reports. Add each published module to these checks when expanding the catalog.
4. Increase `revision` when the material or grading changes: storage is isolated by module ID and revision. Preview all activities and mobile layouts before publishing.

## Local sessions and reports

`engine.ts` handles grading, best/first/latest attempt policies, completion, media ranges, session validation, and PLF report serialization. `learning-player.tsx` owns browser storage and lifecycle cleanup. Answers, including unsubmitted drafts, save on each change. The current chapter restores on reload. Time is an estimate: visible, recently active learning pages or playing media count; background pages and reports do not. Playback coverage merges native `played` ranges, so seeking alone does not count as watching.

Sessions use `puspita:learning:<moduleId>@<revision>` in localStorage. They do not sync across devices. Storage failures display a notice and leave the current in-memory session usable. Starting a new session requires confirmation and replaces only that module/revision's session.

Reports conform to the supplied `plf.sessionReport` v1 schema. Reflection answers require manual review and never add automatic points. JSON downloads happen locally; PDF output uses the browser's print dialog. There is no server submission, login, admin editor, import UI, certificate issuance, or cross-device persistence in this implementation. Assessment answers are shipped to the browser for self-study.

## Checks

Use Node 20.9+ (Node 22 recommended):

```sh
npm test -- src/modules/learning/engine.test.ts
npx tsc --noEmit
npm run build
```

UI checklist: open the catalog, start/resume the module, complete each activity type, reload a draft, retry an incorrect answer, play media, inspect and download the report, print-preview it, cancel a reset, and check chapter navigation on a narrow viewport.
