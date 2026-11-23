const TRADE_EVENTS = new Set(['ENTRY', 'EXIT', 'PENDING', 'GATED']);

export const pnlColorFor = (settings) => (value) =>
	value > 0 ? settings.positiveColor : value < 0 ? settings.negativeColor : settings.zeroColor;

export function markPnl({ state, dollars }, settings) {
	if (TRADE_EVENTS.has(state.event)) return null;
	if (typeof state.pnl !== 'number' || !Number.isFinite(state.pnl)) return null;
	return { text: dollars(state.pnl), color: pnlColorFor(settings)(state.pnl) };
}
