import manifest from './component.json' with { type: 'json' };
import { defineComponent } from '../../../core/component.js';
import { markReady } from './build.js';

export default defineComponent(manifest, { mark: markReady });
