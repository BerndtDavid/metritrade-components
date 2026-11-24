import manifest from './component.json' with { type: 'json' };
import { defineComponent } from '@berndtdavid/metritrade-core/component.js';
import { markBreakout } from './build.js';

export default defineComponent(manifest, { mark: markBreakout });
