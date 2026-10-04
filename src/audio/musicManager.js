export const MUSIC_SOURCE = '/audio/music/taman-kawan-v1.mp3';

/** A single independent loop. Nothing here runs in the drawing input path. */
export function createMusicManager(createElement = () => new Audio(), scheduler = globalThis) {
  let element, active = false, enabled = true, muted = false, voice = false, quiet = false;
  let volume = .15, generation = 0, fade, failure = false;
  const suspended = new Set();
  const allowed = () => active && suspended.size === 0 && enabled && !muted;
  const level = () => allowed() ? volume * (voice ? .22 : quiet ? .5 : 1) : 0;
  function cancelFade() { if (fade !== undefined) scheduler.clearInterval(fade); fade = undefined; }
  function mix() {
    cancelFade(); if (!element) return;
    const target = level(), from = element.volume;
    let step = 0;
    fade = scheduler.setInterval(() => {
      element.volume = Math.max(0, Math.min(1, from + (target - from) * (++step / 8)));
      if (step === 8) cancelFade();
    }, 25);
  }
  function pause() { generation++; cancelFade(); if (element) { element.pause(); element.volume = 0; } }
  async function play(retry = false) {
    if (!allowed() || (failure && !retry)) return false;
    if (!element) {
      element = createElement(); element.src = MUSIC_SOURCE; element.loop = true; element.preload = 'auto'; element.volume = 0;
      element.onerror = () => { failure = true; pause(); };
    }
    if (!element.paused && !retry) { mix(); return true; }
    const request = ++generation, player = element; failure = false;
    try {
      await player.play();
      if (request !== generation || !allowed() || player !== element) { if (!allowed() || player !== element) player.pause(); return false; }
      mix(); return true;
    } catch { if (request === generation) { failure = true; pause(); } return false; }
  }
  const settle = retry => allowed() ? play(retry) : (pause(), false);
  return {
    enter() { active = true; return settle(true); },
    setActive(value) { active = Boolean(value); return settle(false); },
    /** Independent reasons (hidden, paused, backgrounded) cannot restore each other's silence. */
    setSuspended(reason, value) { if (value) suspended.add(reason); else suspended.delete(reason); return settle(false); },
    setEnabled(value) { enabled = Boolean(value); return settle(true); },
    setMuted(value) { muted = Boolean(value); return settle(true); },
    setVolume(value) { volume = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : .15; mix(); },
    setQuiet(value) { quiet = Boolean(value); mix(); },
    setVoiceActive(value) { voice = Boolean(value); mix(); },
    retry() { return settle(true); },
    isFailed() { return failure; },
    dispose() { active = false; suspended.clear(); pause(); if (element) { element.onerror = null; element.removeAttribute?.('src'); element.load?.(); element = null; } },
  };
}
