import manifest from './component.json' with { type: 'json' };
import { defineComponent, isBuilt } from '@berndtdavid/metritrade-core/component.js';
import { applyOverride } from '@berndtdavid/metritrade-core/overrides.js';
import markerSkippedResult from './marker-skipped-result/index.js';
import markerEntry from './marker-entry/index.js';
import markerExit from './marker-exit/index.js';
import markerReady from './marker-ready/index.js';
import markerSkip from './marker-skip/index.js';
import markerPnl from './marker-pnl/index.js';
import markerBreakout from './marker-breakout/index.js';
import { pnlColorFor } from './marker-pnl/build.js';

const asComponent = (marker) => defineComponent(marker.manifest, { mark: marker.mark });

export const availableMarkers = [
	markerSkippedResult,
	markerEntry,
	markerExit,
	markerReady,
	markerSkip,
	markerPnl,
	markerBreakout
].map(asComponent);

/**
 * Resolve the app's instructions: `order` lists the marker ids to call, in
 * drawing order; `overrides` maps a component id (a marker or
 * "chart-markers") to { build?, display?, settings? } merged over its
 * component.json; `components` are app-supplied marker components (e.g. an
 * npm package) that replace the built-in one with the same id.
 */
export function createMarkerSet({ order, overrides = {}, components = [] } = {}) {
	if (!Array.isArray(order)) {
		throw new Error('chart-markers needs an `order` list of marker ids from the app');
	}
	const sources = new Map(availableMarkers.map((marker) => [marker.id, marker]));
	for (const marker of components) sources.set(marker.id, asComponent(marker));
	const known = new Set([manifest.id, ...sources.keys()]);
	const unknown = Object.keys(overrides).find((id) => !id.startsWith('_') && !known.has(id));
	if (unknown) throw new Error(`Unknown component "${unknown}" in chart-markers overrides`);

	const byId = new Map(
		[...sources.values()].map((marker) => [
			marker.id,
			defineComponent(applyOverride(marker.manifest, overrides[marker.id]), { mark: marker.mark })
		])
	);
	const markers = order.map((id) => {
		const marker = byId.get(id);
		if (!marker) throw new Error(`Unknown marker component "${id}" in chart-markers order`);
		return marker;
	});
	return {
		manifest: applyOverride(manifest, overrides[manifest.id]),
		markers,
		marker: (id) => byId.get(id)
	};
}

/**
 * Build lightweight-charts markers from the direction trade state.
 *
 * @param {ReturnType<typeof createMarkerSet>} markerSet
 * @param {Array<Object>} rows chronological rows from buildDirectionCandleStatusRows
 * @param {Map<number, {pnl:number|null, event:string|null}>} tradeStateByTime
 * @param {{watchByTime?: Map<number, Object>}} options watchByTime: the app's breakout-watch
 *   result per candle (for marker-breakout); omitted means no BREAK markers.
 * @returns {Array<{time:number, position:string, shape:string, color:string, size?:number, text:string}>}
 */
export function buildChartMarkers(
	markerSet,
	rows,
	tradeStateByTime,
	{
		showDiagnostics = markerSet.manifest.settings.showDiagnostics,
		showSpike = markerSet.marker('marker-entry').settings.spike?.build !== false,
		watchByTime = new Map()
	} = {}
) {
	const markers = [];
	if (!isBuilt(markerSet.manifest)) return markers;
	const settings = markerSet.manifest.settings;
	const pnl = markerSet.marker('marker-pnl').settings;
	const { decimals, priceDecimals } = settings.money;
	const dollars = (value) => {
		const rounded = Number(value.toFixed(decimals));
		return `${rounded >= 0 ? '+' : '-'}$${Math.abs(rounded).toFixed(decimals)}`;
	};
	const shown = markerSet.markers.filter((marker) => marker.displayed);
	const base = {
		rows,
		showDiagnostics,
		showSpike,
		watchByTime,
		shownGates: new Set(settings.shownGates),
		dollars,
		pnlColor: pnlColorFor(pnl),
		zeroColor: pnl.zeroColor,
		priceDecimals
	};

	for (let index = 0; index < rows.length; index += 1) {
		const row = rows[index];
		const state = tradeStateByTime.get(row.startTimeMs);
		if (!state) continue;
		const ctx = { ...base, index, row, state };
		for (const marker of shown) {
			const result = marker.mark(ctx, marker.settings);
			if (!result) continue;
			const style = marker.settings;
			markers.push({
				time: row.time ?? Math.floor(row.startTimeMs / 1000),
				position: style.position,
				shape: style.shape,
				color: result.color ?? style.color,
				size: style.size,
				text: result.text
			});
		}
	}
	return markers;
}
