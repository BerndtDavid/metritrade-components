/**
 * A component pairs a routine (build/render) with the settings in its
 * `component.json` manifest:
 *
 *   { id, name, version, description, build, display, settings }
 *
 * `build: false` skips computing the component entirely (nothing downstream
 * sees its data). `display: false` still computes it (tables and other
 * components can use the data) but does not draw it.
 */

const ID_PATTERN = /^[a-z][a-z0-9-]*$/;

export const isBuilt = (manifest) => manifest?.build !== false;

export const isDisplayed = (manifest) => isBuilt(manifest) && manifest?.display !== false;

export function validateManifest(manifest) {
	const errors = [];
	if (!manifest || typeof manifest !== 'object') return ['manifest must be an object'];
	if (typeof manifest.id !== 'string' || !ID_PATTERN.test(manifest.id)) {
		errors.push('id must be kebab-case');
	}
	for (const key of ['name', 'version']) {
		if (typeof manifest[key] !== 'string' || !manifest[key]) errors.push(`${key} is required`);
	}
	for (const key of ['build', 'display']) {
		if (key in manifest && typeof manifest[key] !== 'boolean') {
			errors.push(`${key} must be true or false`);
		}
	}
	if ('settings' in manifest && (typeof manifest.settings !== 'object' || !manifest.settings)) {
		errors.push('settings must be an object');
	}
	return errors;
}

export function defineComponent(manifest, api = {}) {
	const errors = validateManifest(manifest);
	if (errors.length) {
		throw new Error(`Invalid component "${manifest?.id}": ${errors.join('; ')}`);
	}
	return Object.freeze({
		id: manifest.id,
		manifest,
		settings: manifest.settings ?? {},
		built: isBuilt(manifest),
		displayed: isDisplayed(manifest),
		...api
	});
}
