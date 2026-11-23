import manifest from './component.json' with { type: 'json' };
import { defineComponent, isDisplayed } from '../../core/component.js';
import { buildDirectionChartMarkers, markerComponents } from './build.js';

export { buildDirectionChartMarkers, markerComponents };

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
	render: renderChartMarkers,
	markers: markerComponents
});
