export function createAudioManager(createElement = () => new Audio()) {
  let current = null, generation = 0, muted = false, volume = 0.8, prepared = null, priming = false, unlocked = false;
  const listeners = new Set(), resultListeners = new Set(), results = [];
  const report = (result, recording, context = 'name') => {
    const event = { ...result, src:recording?.src || null, version:recording?.version, context, time:Date.now() };
    results.push(event); if (results.length > 32) results.shift();
    if (context === 'name') resultListeners.forEach(listener => listener(event));
    return result;
  };
  const announce = active => listeners.forEach(listener => listener(active));
  function stop() {
    generation++;
    if (priming) { prepared?.pause(); prepared.muted = muted; prepared.__jawiPrime = false; priming = false; }
    if (current) { current.onended = null; current.onerror = null; current.pause(); current.removeAttribute?.('src'); current.load?.(); current = null; }
    announce(false);
  }
  async function play(recording, { preview = false } = {}) {
    stop();
    if (!recording?.src || (!preview && recording.status !== 'approved')) return report({ ok: false, reason: 'missing' }, recording);
    const request = generation;
    const audio = unlocked ? prepared : createElement(); current = audio;
    audio.src = recording.src; audio.muted = muted; audio.volume = volume;
    const settled = () => { if (request === generation && current === audio) { current = null; audio.onended = null; audio.onerror = null; announce(false); } };
    audio.onended = settled; audio.onerror = () => {
      if (request !== generation || current !== audio) return;
      settled(); report({ok:false,reason:audio.error?.code === 4 ? 'unsupported' : 'failed', late:true}, recording);
    }; announce(true);
    try {
      await audio.play();
      if (request !== generation) { if (current !== audio) audio.pause(); return report({ ok: false, reason: 'obsolete' }, recording); }
      return report(muted ? {ok:true,reason:'muted'} : { ok: true }, recording);
    } catch (error) {
      settled();
      return report({ ok: false, reason: request !== generation ? 'obsolete' : error.name === 'NotAllowedError' ? 'blocked' : error.name === 'NotSupportedError' ? 'unsupported' : 'failed' }, recording);
    }
  }
  function preload(recording, {preview = false} = {}) {
    if (current || priming || !recording?.src || (!preview && recording.status !== 'approved')) return;
    prepared ||= createElement(); prepared.preload = 'auto';
    if (prepared.src !== recording.src) { prepared.src = recording.src; prepared.load?.(); }
  }
  async function prime(recording, options) {
    if (unlocked || priming || current || muted) return false;
    preload(recording, options); if (!prepared || !recording?.src || (!options?.preview && recording.status !== 'approved')) return false;
    const player = prepared, request = generation; priming = true;
    player.muted = true; player.__jawiPrime = true;
    try {
      await player.play();
      if (request !== generation) return false;
      player.pause(); player.currentTime = 0; unlocked = true;
      report({ok:true}, recording, 'prime'); return true;
    } catch (error) { if (request === generation) report({ok:false,reason:error.name === 'NotAllowedError' ? 'blocked' : 'failed'}, recording, 'prime'); return false; }
    finally {
      // stop() cleans an obsolete prime. Its eventual promise must not change
      // the same player if a newer gesture is now priming it.
      if (request === generation) {
        priming = false;
        if (current !== player) { player.pause(); player.muted = muted; }
        player.__jawiPrime = false;
      }
    }
  }
  return { play, stop, preload, prime, diagnostic:() => ({muted,volume,unlocked,results:[...results]}),
    subscribeResult(listener) { resultListeners.add(listener); return () => resultListeners.delete(listener); },
    subscribe(listener) { listeners.add(listener); listener(Boolean(current)); return () => listeners.delete(listener); }, setMuted(value) { muted = value; if (current) current.muted = value; },
    setVolume(value) { volume = Math.max(0, Math.min(1, value)); if (current) current.volume = volume; } };
}

export function voiceMessage(result) {
  if (result.reason === 'muted') return 'Audio disenyapkan. Hidupkan audio melalui Menu.';
  if (result.ok || result.reason === 'obsolete') return '';
  if (result.reason === 'missing') return 'Rakaman belum tersedia. Sebut nama huruf bersama guru.';
  if (result.reason === 'unsupported') return 'Rakaman tidak dapat dimainkan pada peranti ini. Sebut bersama guru.';
  return 'Tekan Dengar untuk mendengar nama huruf.';
}
