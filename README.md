# Metritrade shared components

Components shared across Metritrade apps. Each folder pairs routines with their settings:

- `component.json` — `id`, `name`, `version`, `build`, `display`, and `settings` (colors, line styles, labels, thresholds).
- `build.js` — pure computation; no Svelte or chart-library imports, so Node scripts and tests can use it.
- `index.js` — exports the component (`defineComponent(manifest, { build, ... })`) plus render/helper routines.

Settings are JSON only: edit `component.json` and rebuild the app.

## Flags

- `build: false` — the routine is skipped and nothing is produced.
- `display: false` — still computed (Summary/Status can use it) but not drawn on the chart.

## Components

| id                      | Folder                                 | Purpose                                                                     |
| ----------------------- | -------------------------------------- | --------------------------------------------------------------------------- |
| `chart-markers`         | `chart/markers/`                       | Marker set: shown gates, money format, diagnostics. The app passes `order`. |
| `marker-entry`          | `chart/markers/marker-entry/`          | BUY arrow and price; OVER/RISKY warning (`spike`).                          |
| `marker-exit`           | `chart/markers/marker-exit/`           | SELL arrow.                                                                 |
| `marker-ready`          | `chart/markers/marker-ready/`          | READY square while a signal waits for confirmation.                         |
| `marker-skip`           | `chart/markers/marker-skip/`           | PEAKED / PAUSED / HOURS / LIQUIDITY at suppressed entries.                  |
| `marker-skipped-result` | `chart/markers/marker-skipped-result/` | SKIPPED ±$ receipt at a skipped trade's would-be exit.                      |
| `marker-pnl`            | `chart/markers/marker-pnl/`            | Running ±$ P&L on open-trade candles.                                       |
| `marker-breakout`       | `chart/markers/marker-breakout/`       | BREAK / NO BREAK / BREAK FAIL squares.                                      |
| `breakout-watch`        | `breakout-watch/`                      | Breakout watch logic after ENTRY, plus its dashed price line.               |
| `marker-chime`          | `marker-chime/`                        | Browser tone for the newest closed ENTRY/EXIT.                              |

Each marker folder has `build.js` with one `mark(ctx, settings)` routine: for one candle it returns `{ text, color? }` or `null`. The set builds the marker from that marker's `position`, `shape`, `size` and `color`, in `order`, and draws all markers in one call. Set a marker's `display` (or `build`) to `false` to remove just that marker.

`core/` holds `defineComponent`/`validateManifest`, the registry (`index.js` exports `components`), and `toLineStyle` (`solid`, `dotted`, `dashed`, `largeDashed`, `sparseDotted`).

## Using it from an app

Apps reference this folder directly via an alias, e.g. `$components: '../../shared/components'` in `aliases.js`, plus the folder in Vite `server.fs.allow`. Chart-library functions (e.g. `createSeriesMarkers`) are passed in by the app, so this package has no dependencies.

Tests live in the consuming app (`tests/unit/components/` in the Metritrade ETF app).

## Apps choose what is called

The app holds the instructions; this library holds what is called. For chart markers the app passes its list and overrides:

```js
createChartMarkers({
	order: ['marker-entry', 'marker-exit', 'marker-pnl'],
	overrides: {
		'marker-pnl': { display: false },
		'marker-entry': { settings: { color: '#16a34a' } }
	}
});
```

An override may set `build`, `display` and `settings` (deep-merged over `component.json`; arrays replace). Unknown ids or keys throw, so a typo fails loudly.

## Versions

Releases are annotated git tags (`v1.0.0`, `v2.0.0`, `v2.1.0`, …). Each app names the tag it was tested with (Metritrade: `components.json` in the app root) and its dev server, build and tests warn when this folder is at a different commit or has uncommitted changes.

To release: commit here, `git tag -a vX.Y.Z -m "…"`, then update each app's pin once its tests pass on the new tag.
