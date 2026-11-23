import manifest from './component.json' with { type: 'json' };
import { defineComponent, isBuilt } from '../core/component.js';

/**
 * The ENTRY/EXIT event to chime for, or null. Uses the newest closed candle:
 * when `newestIsClosed` is false the last row is still forming, and its
 * score/close flicker can mint events that the final close revokes.
 */
export function pickChimeEvent(
	rows,
	stateByTime,
	{
		newestIsClosed = false,
		now = Date.now(),
		settings = manifest.settings,
		built = isBuilt(manifest)
	} = {}
) {
	if (!built || rows.length < 3) return null;
	const row = rows[rows.length - (newestIsClosed ? 1 : 2)];
	if (now - row.startTimeMs > (settings.maxAgeSeconds ?? 120) * 1000) return null;
	const event = stateByTime.get(row.startTimeMs)?.event;
	if (event !== 'ENTRY' && event !== 'EXIT') return null;
	if (!row.close || row.close <= 0) return null;
	return { row, event, tone: event === 'ENTRY' ? settings.entry : settings.exit };
}

/**
 * Browser tone player. Autoplay rules need a user gesture before audio can
 * play, so call `prime()` from a pointer/key handler.
 */
export function createChimePlayer(settings = manifest.settings) {
	let audioCtx = null;
	const prime = () => {
		if (typeof window === 'undefined') return null;
		try {
			audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
			if (audioCtx.state === 'suspended') audioCtx.resume();
			return audioCtx;
		} catch {
			return null;
		}
	};
	const play = ({ frequency = 880, duration = 0.2 } = {}) => {
		const ctx = prime();
		if (!ctx) return;
		try {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = settings.waveform ?? 'sine';
			osc.frequency.value = frequency;
			gain.gain.setValueAtTime(settings.gain ?? 0.15, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
			osc.connect(gain).connect(ctx.destination);
			osc.start();
			osc.stop(ctx.currentTime + duration);
		} catch {
			/* audio unavailable */
		}
	};
	return { prime, play };
}

export default defineComponent(manifest, { pick: pickChimeEvent, createPlayer: createChimePlayer });
