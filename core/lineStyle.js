/** Lightweight Charts `LineStyle` values by name, so JSON settings stay readable. */
export const LINE_STYLES = Object.freeze({
	solid: 0,
	dotted: 1,
	dashed: 2,
	largeDashed: 3,
	sparseDotted: 4
});

export function toLineStyle(name) {
	if (Number.isInteger(name)) return name;
	const value = LINE_STYLES[name];
	if (value == null) throw new Error(`Unknown lineStyle "${name}"`);
	return value;
}
