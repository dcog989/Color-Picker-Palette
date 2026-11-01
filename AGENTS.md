# Agent Directives

## Project Specifics

- Name: color-picker-palette
- Description: Color picker, palette generator, image extraction, contrast checker SPA
- Tech: Svelte 5 (Runes API), Vite, TypeScript 6 (strict), Tailwind CSS v4, colordx, Biome, Vitest
  - TypeScript pinned at `6.0.3` via overrides — `svelte-check` peer deps don't allow TS 7 yet

### Key Files

- `src/main.ts` — entry point, mounts `App.svelte`
- `src/App.svelte` — shell, theme bootstrap, URL hash color sync
- `src/lib/context.ts` — `getApp()` accessor for the root store
- `src/lib/stores/*.svelte.ts` — runes state: `root` (app facade), `color`, `engine`, `image`, `paintbox` (localStorage), `theme` (localStorage), `toast`
- `src/lib/panels/*.svelte` — picker, palette, image, contrast, paintbox panels
- `src/lib/modals/*.svelte` — export, search, info dialogs
- `src/lib/components/*.svelte` — sliders, swatches, grid, title, toast
- `src/lib/utils/strategies.ts` — export targets and PNG/SVG rendering
- `src/lib/utils/import-strategies.ts` — DTCG JSON and GPL palette import
- `src/lib/utils/formatters.ts` — color parsing and value formatting
- `src/lib/utils/palette.ts`, `image-palette.ts`, `color-clusters.ts`, `text-contrast.ts` — pure logic
- `src/lib/utils/format.test.ts` — tests; every logic util has a colocated `.test.ts`
- `src/lib/workers/color-analysis.ts` — image analysis worker (K-Means)
- `src/lib/workers/color-name-search.ts` — color name search worker
- `src/lib/data/colors.ts` — 30,000+ named colors

### Architecture

- Static SPA: no backend, no router, no API calls. Everything runs in the browser.
- State lives in runes stores; components read it through `getApp()`.
- Heavy work (image K-Means, name search) runs in the two workers; the algorithms live in tested utils, not in the worker.
- The current color mirrors to the URL hash and is restored on load.

### Workflow

| Command                  | Action           |
|--------------------------|------------------|
| `bun install`            | Install deps, installs git hooks |
| `bun run dev`            | Start dev server (<http://localhost:5173>) |
| `bun run build`          | Production build |
| `bun run preview`        | Preview build    |
| `bun run check`          | All checks: Biome + typecheck + test:coverage + build |
| `bun run typecheck`      | svelte-check + `bun --check` |
| `bun run test`           | Vitest           |
| `bun run test:coverage`  | Vitest with coverage (80% floor) |
| `bun run fix`            | All fixes: Biome auto-fix (format/lint/imports) |
| `bun run changelog`      | Print changelog to stdout |

### Common Patterns

- Add feature: pure logic in `src/lib/utils/` with a test, state in the relevant store, UI in a panel.
- New export format: extend `ExportStrategyName` and the strategy map in `src/lib/utils/strategies.ts`; it is picked up by `exportCode`.
- Color parsing/formatting: use `safeColor`/`formatColor` from `formatters.ts`; do not re-implement parsing.
- Heavy computation: export a pure function from `src/lib/utils/`, call it from the worker.
- UI state access: `getApp()` from `src/lib/context.ts`, not direct store imports, where a component is involved.

### Verification

- `bun run check` must pass: Biome, typecheck, tests with coverage, build.
- Coverage floor is 80% (lines, statements, functions, branches). `stores/`, `workers/`, `visual-strategies.ts`, `context.ts`, `constants.ts`, and `data/` are excluded — keep logic in `src/lib/utils/` so it is covered.

### Releasing

- Commits are Conventional Commits; Lefthook `commit-msg` runs `cog verify`, CI runs `cog check`.
- `bun run release` (`cog bump --auto`) runs pre-bump hooks (`bun run check`, `scripts/sync_version.sh`), then pushes, pushes the tag, and creates the GitHub release with `cog changelog --at <tag>` as notes and `CHANGELOG.md` as an asset.
- Never run `bun run release`, `cog bump`, or the push/release hooks unless explicitly instructed.

### File System Access

- Root: `/home/bubba/Projects/Color-Picker-Palette/`
- Allowed: All subdirectories except disallowed
- Read-Only: `.env*`, `.git/`
- Disallowed: `.assets/`, `.context/`, `.docs/`, `.git/`, `.repomix/`, `.repomixignore`, `node_modules/`, `dist/`, `build/`, `.svelte-kit/`, `bun.lock`, `repomix.*.json`
- Require confirmation: adding/removing dependencies, destructive operations, any operation outside project root. Docs and release config (`README.md`, `AGENTS.md`, `cog.toml`, `scripts/`, `.github/`) are editable when the task requires it.

---

## General Guidelines

### Code Changes

- For non-trivial work, propose an approach and confirm before implementing.
- Keep modifications minimal and scoped; prefer incremental improvements over rewrites. Ask before architectural changes.
- Use explicit types and named constants (no magic numbers).
- Return explicit error types; do not suppress exceptions.
- Follow standard repository linting and formatting configs.
- Decompose files over 400 lines if they mix concerns.
- Use clear naming over comments; reserve comments for complex workarounds or non-obvious issues — why, not what.
- Never run git mutations (commit, push, reset, rebase, amend) unless explicitly instructed.
- Do not create documentation files unless explicitly requested.

### Author Environment

- CachyOS, KDE Plasma 6, Wayland, Btrfs.
- fish shell, Ghostty terminal, Fresh TUI editor, yay package manager, bun npm manager, Firefox, and Zed code editor.

### Testing

- Do not create test files for trivial changes, or for behavior that is not reliably unit-testable in the test environment (e.g. UI layout/click mapping). Prefer no new files; only add a test when the logic is genuinely testable and worth guarding.

### Definition of Done

- Logic fully implemented.
- Existing docs updated if public interfaces changed.
- When required by the `Verification` rules, run the corresponding `Workflow` command.

### Commit Messages

- On completion of an update or fix, print a conventional commit message in a fenced code block.
- Add a body only when the "why" isn't obvious.
- Do not wrap lines. One physical line per paragraph however long it gets. Never hard-wrap the subject or the body.

### Communication Style

- Terse: short declarative sentences, one idea per line.
- Fixes and instructions: numbered steps, one action each, exact command/path/code. No prose paragraphs or recap.
- Questions and explanations: direct prose, only the reasoning needed.
- Cut words, never facts — keep every command, flag, path, default and caveat.
- No preamble, restating, hedging, disclaimers, meta-commentary, emotional framing, or closing offers; end when done unless a real decision is needed.
- Ask when requirements are ambiguous; state risks and edge cases.
- End answers to questions with a `TL;DR:` line: one sentence, the whole point. Skip it for acknowledgements, status updates, and completed work.
