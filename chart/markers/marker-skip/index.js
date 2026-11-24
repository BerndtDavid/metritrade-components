import manifest from './component.json' with { type: 'json' };
import { defineComponent } from '@berndtdavid/metritrade-core/component.js';
import { markSkip } from './build.js';

export default defineComponent(manifest, { mark: markSkip });
