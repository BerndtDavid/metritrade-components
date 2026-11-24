import { createRegistry } from './core/registry.js';
import chartMarkers, { availableMarkers } from './chart/markers/index.js';
import breakoutWatch from './breakout-watch/index.js';
import markerChime from './marker-chime/index.js';

export const components = createRegistry([
	chartMarkers,
	...availableMarkers,
	breakoutWatch,
	markerChime
]);
