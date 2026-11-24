import manifest from './component.json' with { type: 'json' };
import { defineComponent } from '@berndtdavid/metritrade-core/component.js';
import { markSkippedResult } from './build.js';

export default defineComponent(manifest, {
	mark: (ctx) => markSkippedResult(ctx, manifest.settings)
});
