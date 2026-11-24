import manifest from './component.json' with { type: 'json' };
import { defineComponent } from '../../../core/component.js';
import { markEntry } from './build.js';

export default defineComponent(manifest, { mark: markEntry });
