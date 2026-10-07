/** Replaces media playback with a recorder so lifecycle, ordering and mix levels can be asserted exactly. */
export async function instrument(page, { failVoice = false, voiceMs = 900 } = {}) {
  await page.addInitScript(({ failVoice: fail, voiceMs: duration }) => {
    const media = window.__media = { plays: [], elements: [], fullscreen: 0, voicePauses: 0 };
    Object.defineProperty(HTMLMediaElement.prototype, 'paused', { configurable: true, get() { return !this.__playing; } });
    HTMLMediaElement.prototype.play = function () {
      const src = this.getAttribute('src') || '', music = src.includes('/audio/music/');
      if (fail && !music) return Promise.reject(new DOMException('blocked', 'NotAllowedError'));
      this.__playing = true; media.plays.push({ src, music, prime:Boolean(this.__jawiPrime), volume: this.volume, muted: this.muted });
      if (!music) this.__voiceTimer = setTimeout(() => { if (this.__playing) { this.__playing = false; this.onended?.(); } }, duration);
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () { clearTimeout(this.__voiceTimer); if (this.__playing && !this.__jawiPrime && !(this.getAttribute('src') || '').includes('/audio/music/')) media.voicePauses++; this.__playing = false; };
    HTMLMediaElement.prototype.load = function () {};
    const NativeAudio = window.Audio;
    window.Audio = function () {
      const element = new NativeAudio();
      // Fake lifecycle tests must not also invoke Windows WebKit's unsupported native MP3 decoder.
      // Separate checks below exercise the actual packaged media in a supported runtime.
      let src = '';
      Object.defineProperty(element, 'src', { configurable: true, get: () => src, set: value => { src = value; } });
      const get = element.getAttribute.bind(element), remove = element.removeAttribute.bind(element);
      element.getAttribute = name => name === 'src' ? src : get(name);
      element.removeAttribute = name => { if (name === 'src') src = ''; else remove(name); };
      media.elements.push(element); return element;
    };
    window.Audio.prototype = NativeAudio.prototype;
    Element.prototype.requestFullscreen = function () { media.fullscreen++; return Promise.resolve(); };
  }, { failVoice, voiceMs });
}
export const voices = async page => (await page.evaluate(() => window.__media.plays)).filter(play => !play.music && !play.prime);
