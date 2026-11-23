import manifest from './component.json' with { type: 'json' };
import { isBuilt } from '../core/component.js';
import breakoutWatch, { buildBreakoutWatch } from '../breakout-watch/index.js';

const markerConfig = manifest.settings;

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
		showDiagnostics = markerConfig.showDiagnostics,
		showSpike = markerConfig.spikeEntry?.build !== false,
		showBreakoutWatch = breakoutWatch.displayed
	} = {}
) {
	const markers = [];
	if (!isBuilt(manifest)) return markers;
	const watchCfg = breakoutWatch.settings;
	const watchByTime =
		showBreakoutWatch && watchCfg
			? buildBreakoutWatch(rows, tradeStateByTime, watchCfg).byTime
			: new Map();
	const { entry, exit, gated, gatedExit, delta, money } = markerConfig;
	const finite = (value) => typeof value === 'number' && Number.isFinite(value);
	const dollars = (value) => {
		const rounded = Number(value.toFixed(money.decimals));
		return `${rounded >= 0 ? '+' : '-'}$${Math.abs(rounded).toFixed(money.decimals)}`;
	};
	const pnlColor = (value) =>
		value > 0 ? delta.positiveColor : value < 0 ? delta.negativeColor : delta.zeroColor;
	const add = (row, cfg, text, color = cfg?.color) => {
		if (!cfg || cfg.display === false) return;
		markers.push({
			time: row.time ?? Math.floor(row.startTimeMs / 1000),
			position: cfg.position,
			shape: cfg.shape,
			color,
			size: cfg.size,
			text
		});
	};

	const spikeWindow = markerConfig.spikeEntry?.windowCandles ?? 10;
	const spikeTail = markerConfig.spikeEntry?.tailCandles ?? 3;
	const spikeShare = markerConfig.spikeEntry?.minShare ?? 0.8;
	const etfMoveOver = (index, n) => {
		const now = rows[index]?.close;
		const then = rows[index - n]?.close;
		if (!finite(now) || !finite(then) || then <= 0) return null;
		return (100 * (now - then)) / then;
	};
	// Warns on the two risky entry shapes: 'over' = entry below the recent
	// peak close (the move already ran — expectation: probably finished);
	// 'risky' = most of the move arrived in the last few candles
	// (vertical push — expectation: high variance, could run or die).
	const spikePeakCandles = markerConfig.spikeEntry?.peakCandles ?? 5;
	const spikeDipPct = markerConfig.spikeEntry?.dipPct ?? 0.1;
	const spikeAt = (index) => {
		if (!showSpike || index < spikeWindow) return null;
		const now = rows[index]?.close;
		let peak = -Infinity;
		for (let j = index - spikePeakCandles; j < index; j += 1) {
			const c = rows[j]?.close;
			if (finite(c) && c > peak) peak = c;
		}
		if (finite(now) && finite(peak) && (100 * (peak - now)) / peak > spikeDipPct) {
			return ' over';
		}
		const total = etfMoveOver(index, spikeWindow);
		const tail = etfMoveOver(index, spikeTail);
		if (total == null || total <= 0 || tail == null || tail <= 0) return null;
		return tail / total >= spikeShare ? ' risky' : null;
	};

	const shownGates = new Set(['late', 'cooldown', 'hours', 'liquidity']);
	for (let i = 0; i < rows.length; i += 1) {
		const row = rows[i];
		const state = tradeStateByTime.get(row.startTimeMs);
		if (!state) continue;
		const hasPnl = finite(state.pnl);
		const shownGate = shownGates.has(state.shadowReason);
		if ((showDiagnostics || shownGate) && state.shadowEvent === 'GATED_EXIT') {
			const value = state.shadowResult;
			// Skipped trades show their would-be result in gray; green/red are for real results.
			const prefix = shownGate ? 'SKIPPED ' : `${gatedExit.label} `;
			const color = shownGate ? gatedExit.skippedColor : pnlColor(value);
			add(
				row,
				gatedExit,
				`${prefix}${finite(value) ? dollars(value) : ''}`.trimEnd(),
				finite(value) ? color : delta.zeroColor
			);
		}
		if (state.event === 'ENTRY') {
			const spike = spikeAt(i);
			const price = finite(row.close) ? ` $${row.close.toFixed(money.priceDecimals)}` : '';
			add(
				row,
				entry,
				spike ? `${spike.trim().toUpperCase()}${price}` : `${entry.label}${price}`,
				spike ? (markerConfig.spikeEntry?.warningColor ?? '#f59e0b') : undefined
			);
		} else if (state.event === 'EXIT') {
			add(row, exit, exit.label);
		} else if (state.event === 'PENDING') {
			add(row, markerConfig.pending, markerConfig.pending.label);
		} else if (state.event === 'GATED') {
			if (showDiagnostics || shownGates.has(state.gateReason)) {
				const labels = {
					range: 'NO-ACT',
					wait: 'NO-WAIT',
					premium: 'NO-CHASE',
					liquidity: 'LIQUIDITY',
					hours: 'HOURS',
					late: 'PEAKED',
					cooldown: 'PAUSED'
				};
				add(
					row,
					gated,
					labels[state.gateReason] ?? gated.label,
					state.gateReason === 'late'
						? (markerConfig.spikeEntry?.warningColor ?? '#f59e0b')
						: undefined
				);
			}
		} else if (hasPnl) {
			add(row, delta, dollars(state.pnl), pnlColor(state.pnl));
		}
		const watch = watchByTime.get(row.startTimeMs);
		if (watch) {
			const labels = {
				BRK: watchCfg.label,
				BRK_FAIL: watchCfg.failLabel,
				NO_BRK: watchCfg.missLabel
			};
			const colors = {
				BRK: watchCfg.color,
				BRK_FAIL: watchCfg.failColor,
				NO_BRK: watchCfg.missColor
			};
			add(row, watchCfg, labels[watch.status], colors[watch.status]);
		}
	}
	return markers;
}
