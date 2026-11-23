import manifest from './component.json' with { type: 'json' };
import { defineComponent } from '../../../core/component.js';
import { markPnl } from './build.js';

export default defineComponent(manifest, { mark: (ctx) => markPnl(ctx, manifest.settings) });
