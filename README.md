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

## Packages

Published to GitHub Packages (`@berndtdavid` scope, registry `https://npm.pkg.github.com`) from npm workspaces in this repo:

| Package                           | Folder           | Depends on                        |
| --------------------------------- | ---------------- | --------------------------------- |
| `@berndtdavid/metritrade-core`    | `core/`          | —                                 |
| `@berndtdavid/metritrade-markers` | `chart/markers/` | `@berndtdavid/metritrade-core` ^1 |

`core` only checks manifests and merges overrides when components are set up; marker routines never call it while drawing. `breakout-watch` and `marker-chime` are not packaged yet: apps use them from this folder via an alias (`$components: '../../shared/components'` plus Vite `server.fs.allow`), and they import `core` by relative path.

The markers package does not run breakout-watch. The app runs it and passes the per-candle result: `chartMarkers.build(rows, stateByTime, { watchByTime })`; without `watchByTime` no BREAK markers are drawn.

Chart-library functions (e.g. `createSeriesMarkers`) are passed in by the app, so the packages have no chart dependency. Tests live in the consuming app (`tests/unit/components/` in metritrade-app).

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

Each package follows semver in its own `package.json`; each `component.json` keeps its own `version` to show which component changed. Apps pin exact versions in their lockfile.

To release: raise the version(s), commit, tag `<package>-vX.Y.Z` (e.g. `markers-v1.1.0`), run `npm publish -w chart/markers` (and/or `-w core`), then `npm install @berndtdavid/metritrade-markers@X.Y.Z` in each app once its tests pass. For an unpublished change, `npm link` the package into the app.
