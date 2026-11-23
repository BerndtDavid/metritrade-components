export function markSkip({ state, showDiagnostics, shownGates }, settings) {
	if (state.event !== 'GATED') return null;
	if (!showDiagnostics && !shownGates.has(state.gateReason)) return null;
	return {
		text: settings.labels?.[state.gateReason] ?? settings.label,
		color: state.gateReason === 'late' ? settings.lateColor : undefined
	};
}
