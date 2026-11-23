const finite = (value) => typeof value === 'number' && Number.isFinite(value);

export function markSkippedResult(
	{ state, showDiagnostics, shownGates, dollars, pnlColor, zeroColor },
	settings
) {
	const shownGate = shownGates.has(state.shadowReason);
	if (state.shadowEvent !== 'GATED_EXIT' || (!showDiagnostics && !shownGate)) return null;
	const value = state.shadowResult;
	// Skipped trades show their would-be result in gray; green/red are for real results.
	const prefix = shownGate ? `${settings.skippedLabel} ` : `${settings.label} `;
	const color = shownGate ? settings.skippedColor : pnlColor(value);
	return {
		text: `${prefix}${finite(value) ? dollars(value) : ''}`.trimEnd(),
		color: finite(value) ? color : zeroColor
	};
}
