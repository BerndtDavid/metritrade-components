import manifest from './component.json' with { type: 'json' };
import { defineComponent } from '@berndtdavid/metritrade-core/component.js';
import { markReady } from './build.js';

export default defineComponent(manifest, { mark: markReady });
