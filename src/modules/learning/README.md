# Ruang Belajar

The public catalog is `/belajar`; domain/topic pages use `/belajar/[domain]/[[...topic]]`; modules remain at `/belajar/modul/[slug]`.
The first module adapts the supplied PuspitaCore Aset Tetap PLF reference into native React components. Articles still use the existing Notion integration.

## Catalog registry

`registry.ts` is the single source of truth for catalog metadata. Add a new field by appending a `LearningDomain`; add a topic or subtopic by appending a `LearningTopic` with the same `domainId` and its parent's `id` in `parentId`. The route and breadcrumb are generated automatically from sibling `slug` values, so do not create a page file for a new category.

Add a published module by adding a `LearningModuleRegistration` with a stable `id`, a `primaryTopicId`, a semantic `version`, counts, and `status: "published"`. Use `draft` for prepared metadata that must not appear in a public module list. `relatedTopicIds` can surface the same module in another relevant branch without duplicating its content.

The current PLF pages are adapted as `LearningUnit` nodes by `legacyModuleNodes`. A future micro module can expose one unit; a comprehensive module can nest units below `group` nodes. The existing player intentionally still renders PLF pages while the generic node renderer and per-unit report UI are designed and tested separately.

## Self-learning modules

PLF `1.1.0` adds draft self-learning modules with units, weighted worksheets, advisory prerequisites, hints, remediation links, references, and per-unit reporting. The draft at `content/template-self-learning.plf.json` is deliberately excluded from the public catalog but can be opened directly at `/belajar/modul/template-self-learning`. It uses client-only, in-memory sessions: refreshing starts again.

## Add or revise a module

1. Add a reviewed PLF v1 JSON file under `content/` and register it in `catalog.ts`.
2. Copy its media to `public/learning/<slug>/media/`. JSON media references use `./media/<filename>`; the player only accepts these local paths. The current adapter handles the 13 component types demonstrated by Aset Tetap, not arbitrary external embeds or raw HTML.
3. Validate against `schemas/plf-module-v1.schema.json`, check unique IDs and competency references, then review the educational content. The registry validates duplicate IDs/slugs, invalid parents, circular topics, reserved routes, and missing topic references at startup. The tests also verify bundled media paths and exported reports.
4. Increase `revision` when the material or grading changes. Preview all activities and mobile layouts before publishing.

## Local sessions and reports

`engine.ts` handles grading, best/first/latest attempt policies, completion, media ranges, session validation, and PLF report serialization. `learning-player.tsx` owns the in-memory session and lifecycle cleanup. Answers, including unsubmitted drafts, are kept only while the page remains open. Reloading creates a new session at the first chapter, with active time reset. Time is an estimate: visible, recently active learning pages or playing media count; background pages and reports do not. Playback coverage merges native `played` ranges, so seeking alone does not count as watching.

The player does not save learner activity, answers, progress, or time to browser storage. It removes the legacy session cache for the module when the module opens. Starting a new session requires confirmation and clears only the current in-memory session.

`Audit SME — Praktik Audit Berbasis Risiko` is the exception: its PLF payload sets `experience.allowResume: true`. Its revision-scoped session, including simulated workpapers, is stored only in the same browser's local storage. It is not submitted, synchronized, or audit documentation.

`public/learning-sw.js` is registered only after someone opens Belajar. It caches successful same-origin `/belajar`, `/learning/`, and Next static responses and falls back to those responses while offline. It does not cache API calls, send answers, track activity, or synchronize learner data. First-time visits still require a connection.

Reports conform to the supplied `plf.sessionReport` v1 schema. Reflection answers require manual review and never add automatic points. JSON downloads happen locally; PDF output uses the browser's print dialog. There is no server submission, login, admin editor, import UI, certificate issuance, or cross-device persistence in this implementation. Assessment answers are shipped to the browser for self-study.

## Checks

Use Node 20.9+ (Node 22 recommended):

```sh
npm test -- src/modules/learning/engine.test.ts src/modules/learning/registry.test.ts
npx tsc --noEmit
npm run build
```

UI checklist: open the catalog, start the module, complete each activity type, reload and verify the session resets, retry an incorrect answer, play media, inspect and download the report, print-preview it, cancel a reset, and check chapter navigation on a narrow viewport.
