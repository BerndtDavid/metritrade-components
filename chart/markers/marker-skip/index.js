import manifest from './component.json' with { type: 'json' };
import { defineComponent } from '../../../core/component.js';
import { markSkip } from './build.js';

export default defineComponent(manifest, { mark: markSkip });
