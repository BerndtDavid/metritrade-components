export function createRegistry(components) {
	const byId = new Map();
	for (const component of components) {
		if (byId.has(component.id)) throw new Error(`Duplicate component id "${component.id}"`);
		byId.set(component.id, component);
	}
	const list = () => [...byId.values()];
	return Object.freeze({
		get: (id) => byId.get(id) ?? null,
		list,
		built: () => list().filter((component) => component.built),
		displayed: () => list().filter((component) => component.displayed)
	});
}
