import manifest from './component.json' with { type: 'json' };
import { defineComponent, isBuilt, isDisplayed } from '../core/component.js';
import { toLineStyle } from '../core/lineStyle.js';
import { buildBreakoutWatch } from './build.js';

export { buildBreakoutWatch };

/** Price-line options for an open watch, or null when the line is hidden. */
export function buildWatchLine(active, settings = manifest.settings, show = isDisplayed(manifest)) {
	const line = settings.line;
	if (!show || !active || !line || line.display === false) return null;
	return {
		price: active.price,
		color: line.color,
		lineWidth: line.lineWidth ?? 1,
		lineStyle: toLineStyle(line.lineStyle ?? 'dashed'),
		title: (line.title ?? '').replaceAll('{pct}', String(settings.pct))
	};
}

export default defineComponent(manifest, {
	build: (rows, stateByTime) =>
		isBuilt(manifest)
			? buildBreakoutWatch(rows, stateByTime, manifest.settings)
			: { byTime: new Map(), active: null }
});
