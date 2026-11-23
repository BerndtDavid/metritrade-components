import { createRegistry } from './core/registry.js';
import chartMarkers, { markerComponents } from './chart/markers/index.js';
import breakoutWatch from './breakout-watch/index.js';
import markerChime from './marker-chime/index.js';

export const components = createRegistry([
	chartMarkers,
	...markerComponents,
	breakoutWatch,
	markerChime
]);
