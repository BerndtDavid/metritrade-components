import manifest from './component.json' with { type: 'json' };
import { defineComponent, isDisplayed } from '../../core/component.js';
import { availableMarkers, buildChartMarkers, createMarkerSet } from './build.js';

export { availableMarkers };

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

/**
 * The app's entry point: `createChartMarkers({ order, overrides })` returns
 * the marker set the app asked for, with `build(rows, tradeStateByTime)`,
 * `render(target, markers)` and `marker(id)` for resolved settings.
 */
export function createChartMarkers(instructions) {
	const markerSet = createMarkerSet(instructions);
	return defineComponent(markerSet.manifest, {
		markers: markerSet.markers,
		marker: markerSet.marker,
		build: (rows, tradeStateByTime, options) =>
			buildChartMarkers(markerSet, rows, tradeStateByTime, options),
		render: (target, markers, show = isDisplayed(markerSet.manifest)) =>
			renderChartMarkers(target, markers, show)
	});
}

export default defineComponent(manifest, {
	create: createChartMarkers,
	render: renderChartMarkers,
	markers: availableMarkers
});
