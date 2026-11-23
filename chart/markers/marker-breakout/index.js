import manifest from './component.json' with { type: 'json' };
import { defineComponent } from '../../../core/component.js';
import { markBreakout } from './build.js';

export default defineComponent(manifest, { mark: (ctx) => markBreakout(ctx, manifest.settings) });
