/**
 * Display-only breakout watch: after each BUY, watch whether a candle's high
 * reaches the entry close plus `pct`% within `candles` candles; a breakout
 * candle that closes back at or below the entry close is BRK_FAIL. Does not affect
 * trades or P/L.
 *
 * @returns {{byTime: Map<number, {status: 'BRK'|'BRK_FAIL'|'NO_BRK', price: number, entryPrice: number, entryMs: number, candle: number}>,
 *   active: {price: number, entryPrice: number, entryMs: number, candlesLeft: number} | null}}
 */
export function buildBreakoutWatch(rows, stateByTime, { pct = 0.1, candles = 3 } = {}) {
	const byTime = new Map();
	const finite = (value) => typeof value === 'number' && Number.isFinite(value);
	let watch = null;
	for (const [index, row] of rows.entries()) {
		const state = stateByTime.get(row.startTimeMs);
		if (state?.event === 'ENTRY') {
			watch =
				finite(row.close) && row.close > 0
					? {
							price: row.close * (1 + pct / 100),
							entryPrice: row.close,
							entryMs: row.startTimeMs,
							index
						}
					: null;
			continue;
		}
		if (!watch) continue;
		if (state?.event === 'EXIT') {
			watch = null;
			continue;
		}
		const candle = index - watch.index;
		const hit = finite(row.high) && row.high >= watch.price;
		const closedBack = finite(row.close) && row.close <= watch.entryPrice;
		const status = hit ? (closedBack ? 'BRK_FAIL' : 'BRK') : candle >= candles ? 'NO_BRK' : null;
		if (status) {
			const { price, entryPrice, entryMs } = watch;
			byTime.set(row.startTimeMs, { status, price, entryPrice, entryMs, candle });
			watch = null;
		}
	}
	const active = watch
		? {
				price: watch.price,
				entryPrice: watch.entryPrice,
				entryMs: watch.entryMs,
				candlesLeft: candles - (rows.length - 1 - watch.index)
			}
		: null;
	return { byTime, active };
}
