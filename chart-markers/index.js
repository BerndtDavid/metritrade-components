import manifest from './component.json' with { type: 'json' };
import { defineComponent, isDisplayed } from '../core/component.js';
import { buildDirectionChartMarkers } from './build.js';

export { buildDirectionChartMarkers };

/**
 * Draw markers on a candle series. The chart library's `createSeriesMarkers`
 * is passed in so this folder has no package dependencies. Returns the
 * markers handle to pass back on the next call.
 */
export function renderChartMarkers(
	{ series, createSeriesMarkers, handle = null },
	markers,
	show = isDisplayed(manifest)
) {
	const shown = show ? markers : [];
	if (handle) {
		handle.setMarkers(shown);
		return handle;
	}
	return createSeriesMarkers(series, shown);
}

export default defineComponent(manifest, {
	build: buildDirectionChartMarkers,
	render: renderChartMarkers
});
