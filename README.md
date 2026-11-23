# Metritrade shared components

Components shared across Metritrade apps. Each folder pairs routines with their settings:

- `component.json` — `id`, `name`, `version`, `build`, `display`, and `settings` (colors, line styles, labels, thresholds).
- `build.js` — pure computation; no Svelte or chart-library imports, so Node scripts and tests can use it.
- `index.js` — exports the component (`defineComponent(manifest, { build, ... })`) plus render/helper routines.

Settings are JSON only: edit `component.json` and rebuild the app.

## Flags

- `build: false` — the routine is skipped and nothing is produced.
- `display: false` — still computed (Summary/Status can use it) but not drawn on the chart.
- Individual marker types also accept `display: false` inside `settings`.

## Components

| id               | Purpose                                                                   |
| ---------------- | ------------------------------------------------------------------------- |
| `chart-markers`  | ENTRY/SELL/READY/GATED/P&L/SKIPPED markers for direction-score trades.    |
| `breakout-watch` | BREAK / NO BREAK / BREAK FAIL watch after ENTRY, plus its dashed price line. |
| `marker-chime`   | Browser tone for the newest closed ENTRY/EXIT.                            |

`core/` holds `defineComponent`/`validateManifest`, the registry (`index.js` exports `components`), and `toLineStyle` (`solid`, `dotted`, `dashed`, `largeDashed`, `sparseDotted`).

## Using it from an app

Apps reference this folder directly via an alias, e.g. `$components: '../../shared/components'` in `aliases.js`, plus the folder in Vite `server.fs.allow`. Chart-library functions (e.g. `createSeriesMarkers`) are passed in by the app, so this package has no dependencies.

Tests live in the consuming app (`tests/unit/components/` in the Metritrade ETF app).
