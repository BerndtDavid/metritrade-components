export function markExit({ state }, settings) {
	return state.event === 'EXIT' ? { text: settings.label } : null;
}
