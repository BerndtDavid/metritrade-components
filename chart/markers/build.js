import manifest from './component.json' with { type: 'json' };
import { isBuilt } from '../../core/component.js';
import breakoutWatch, { buildBreakoutWatch } from '../../breakout-watch/index.js';
import markerSkippedResult from './marker-skipped-result/index.js';
import markerEntry from './marker-entry/index.js';
import markerExit from './marker-exit/index.js';
import markerReady from './marker-ready/index.js';
import markerSkip from './marker-skip/index.js';
import markerPnl from './marker-pnl/index.js';
import markerBreakout from './marker-breakout/index.js';
import { pnlColorFor } from './marker-pnl/build.js';

const settings = manifest.settings;
const available = new Map(
	[
		markerSkippedResult,
		markerEntry,
		markerExit,
		markerReady,
		markerSkip,
		markerPnl,
		markerBreakout
	].map((marker) => [marker.id, marker])
);

export const markerComponents = settings.order.map((id) => {
	const marker = available.get(id);
	if (!marker) throw new Error(`Unknown marker component "${id}" in chart-markers order`);
	return marker;
});

/**
 * Build lightweight-charts markers from the direction trade state.
 *
 * @param {Array<Object>} rows chronological rows from buildDirectionCandleStatusRows
 * @param {Map<number, {pnl:number|null, event:string|null}>} tradeStateByTime
 * @returns {Array<{time:number, position:string, shape:string, color:string, size?:number, text:string}>}
 */
export function buildDirectionChartMarkers(
	rows,
	tradeStateByTime,
	{
		showDiagnostics = settings.showDiagnostics,
		showSpike = markerEntry.settings.spike?.build !== false,
		showBreakoutWatch = breakoutWatch.displayed
	} = {}
) {
	const markers = [];
	if (!isBuilt(manifest)) return markers;
	const watchByTime = showBreakoutWatch
		? buildBreakoutWatch(rows, tradeStateByTime, breakoutWatch.settings).byTime
		: new Map();
	const { decimals, priceDecimals } = settings.money;
	const dollars = (value) => {
		const rounded = Number(value.toFixed(decimals));
		return `${rounded >= 0 ? '+' : '-'}$${Math.abs(rounded).toFixed(decimals)}`;
	};
	const shown = markerComponents.filter((marker) => marker.displayed);
	const base = {
		rows,
		showDiagnostics,
		showSpike,
		watchByTime,
		shownGates: new Set(settings.shownGates),
		dollars,
		pnlColor: pnlColorFor(markerPnl.settings),
		zeroColor: markerPnl.settings.zeroColor,
		priceDecimals
	};

	for (let index = 0; index < rows.length; index += 1) {
		const row = rows[index];
		const state = tradeStateByTime.get(row.startTimeMs);
		if (!state) continue;
		const ctx = { ...base, index, row, state };
		for (const marker of shown) {
			const result = marker.mark(ctx);
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
