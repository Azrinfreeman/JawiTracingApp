export function createAudioManager(createElement = () => new Audio()) {
  let current = null, generation = 0, muted = false, volume = 0.8;
  function stop() { generation++; if (current) { current.pause(); current.removeAttribute?.('src'); current.load?.(); current = null; } }
  async function play(recording, { preview = false } = {}) {
    stop();
    if (!recording?.src || (!preview && recording.status !== 'approved')) return { ok: false, reason: 'missing' };
    const request = generation;
    const audio = createElement(); current = audio;
    audio.src = recording.src; audio.muted = muted; audio.volume = volume;
    try {
      await audio.play();
      if (request !== generation) { audio.pause(); return { ok: false, reason: 'obsolete' }; }
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: request !== generation ? 'obsolete' : error.name === 'NotAllowedError' ? 'blocked' : error.name === 'NotSupportedError' ? 'unsupported' : 'failed' };
    }
  }
  return { play, stop, setMuted(value) { muted = value; if (current) current.muted = value; },
    setVolume(value) { volume = Math.max(0, Math.min(1, value)); if (current) current.volume = volume; } };
}
