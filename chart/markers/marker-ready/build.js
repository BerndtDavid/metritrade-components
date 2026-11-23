export function markReady({ state }, settings) {
	return state.event === 'PENDING' ? { text: settings.label } : null;
}
