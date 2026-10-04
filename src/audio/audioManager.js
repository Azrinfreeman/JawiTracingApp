export function createAudioManager(createElement = () => new Audio()) {
  let current = null, generation = 0, muted = false, volume = 0.8;
  const listeners = new Set();
  const announce = active => listeners.forEach(listener => listener(active));
  function stop() {
    generation++;
    if (current) { current.onended = null; current.onerror = null; current.pause(); current.removeAttribute?.('src'); current.load?.(); current = null; }
    announce(false);
  }
  async function play(recording, { preview = false } = {}) {
    stop();
    if (!recording?.src || (!preview && recording.status !== 'approved')) return { ok: false, reason: 'missing' };
    const request = generation;
    const audio = createElement(); current = audio;
    audio.src = recording.src; audio.muted = muted; audio.volume = volume;
    const settled = () => { if (request === generation && current === audio) { current = null; audio.onended = null; audio.onerror = null; announce(false); } };
    audio.onended = settled; audio.onerror = settled; announce(true);
    try {
      await audio.play();
      if (request !== generation) { audio.pause(); return { ok: false, reason: 'obsolete' }; }
      return { ok: true };
    } catch (error) {
      settled();
      return { ok: false, reason: request !== generation ? 'obsolete' : error.name === 'NotAllowedError' ? 'blocked' : error.name === 'NotSupportedError' ? 'unsupported' : 'failed' };
    }
  }
  return { play, stop, subscribe(listener) { listeners.add(listener); listener(Boolean(current)); return () => listeners.delete(listener); }, setMuted(value) { muted = value; if (current) current.muted = value; },
    setVolume(value) { volume = Math.max(0, Math.min(1, value)); if (current) current.volume = volume; } };
}
