const isPlainObject = (value) =>
	value !== null && typeof value === 'object' && !Array.isArray(value);
const OVERRIDE_KEYS = new Set(['build', 'display', 'settings']);

/** Deep-merge plain objects; arrays and scalars in `override` replace the base value. */
export function mergeSettings(base, override) {
	if (override === undefined) return base;
	if (!isPlainObject(base) || !isPlainObject(override)) return override;
	const merged = { ...base };
	for (const [key, value] of Object.entries(override))
		merged[key] = mergeSettings(base[key], value);
	return merged;
}

/**
 * Apply an app's override ({ build?, display?, settings? }) to a component
 * manifest. Keys starting with "_" are comments and ignored.
 */
export function applyOverride(manifest, override) {
	if (override === undefined) return manifest;
	if (!isPlainObject(override)) throw new Error(`Override for "${manifest.id}" must be an object`);
	const used = Object.keys(override).filter((key) => !key.startsWith('_'));
	const bad = used.find((key) => !OVERRIDE_KEYS.has(key));
	if (bad) {
		throw new Error(
			`Override for "${manifest.id}" can only set build, display or settings (got "${bad}")`
		);
	}
	const result = {
		...manifest,
		settings: mergeSettings(manifest.settings ?? {}, override.settings)
	};
	if ('build' in override) result.build = override.build;
	if ('display' in override) result.display = override.display;
	return result;
}
