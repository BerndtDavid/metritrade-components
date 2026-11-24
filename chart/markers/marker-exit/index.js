import manifest from './component.json' with { type: 'json' };
import { markExit } from './build.js';

// Self-contained so it can be published on its own; the marker set validates it.
export default { id: manifest.id, manifest, mark: markExit };
