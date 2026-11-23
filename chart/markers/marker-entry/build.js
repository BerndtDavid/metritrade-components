const finite = (value) => typeof value === 'number' && Number.isFinite(value);

const moveOver = (rows, index, n) => {
	const now = rows[index]?.close;
	const then = rows[index - n]?.close;
	if (!finite(now) || !finite(then) || then <= 0) return null;
	return (100 * (now - then)) / then;
};

// 'over' = entry below the recent peak close (the move already ran);
// 'risky' = most of the move arrived in the last few candles (vertical push).
function spikeAt(rows, index, spike) {
	const windowCandles = spike.windowCandles ?? 10;
	if (index < windowCandles) return null;
	const peakCandles = spike.peakCandles ?? 5;
	const now = rows[index]?.close;
	let peak = -Infinity;
	for (let j = index - peakCandles; j < index; j += 1) {
		const c = rows[j]?.close;
		if (finite(c) && c > peak) peak = c;
	}
	if (finite(now) && finite(peak) && (100 * (peak - now)) / peak > (spike.dipPct ?? 0.1)) {
		return 'over';
	}
	const total = moveOver(rows, index, windowCandles);
	const tail = moveOver(rows, index, spike.tailCandles ?? 3);
	if (total == null || total <= 0 || tail == null || tail <= 0) return null;
	return tail / total >= (spike.minShare ?? 0.8) ? 'risky' : null;
}

export function markEntry({ rows, index, row, state, showSpike, priceDecimals }, settings) {
	if (state.event !== 'ENTRY') return null;
	const spike = showSpike ? spikeAt(rows, index, settings.spike ?? {}) : null;
	const price = finite(row.close) ? ` $${row.close.toFixed(priceDecimals)}` : '';
	if (!spike) return { text: `${settings.label}${price}` };
	return {
		text: `${spike.toUpperCase()}${price}`,
		color: settings.spike?.warningColor ?? '#f59e0b'
	};
}
