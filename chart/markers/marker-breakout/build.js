export function markBreakout({ row, watchByTime }, settings) {
	const watch = watchByTime.get(row.startTimeMs);
	if (!watch) return null;
	const labels = { BRK: settings.label, BRK_FAIL: settings.failLabel, NO_BRK: settings.missLabel };
	const colors = { BRK: settings.color, BRK_FAIL: settings.failColor, NO_BRK: settings.missColor };
	return { text: labels[watch.status], color: colors[watch.status] };
}
