import { describe, expect, test } from 'vitest';
import { createMusicManager, MUSIC_SOURCE } from '../../src/audio/musicManager.js';
import { createAudioManager } from '../../src/audio/audioManager.js';
import { MUSIC_SETTINGS_KEY, readMusicPreferences, saveMusicPreferences } from '../../src/audio/musicPreferences.js';

function fakeElement({ failPlay = null } = {}) {
  const element = { paused: true, volume: 1, muted: false, plays: 0, pauses: 0, loaded: 0,
    async play() { this.plays++; if (failPlay) throw Object.assign(new Error('x'), { name: failPlay }); this.paused = false; },
    pause() { this.pauses++; this.paused = true; }, removeAttribute() {}, load() { this.loaded++; } };
  return element;
}
function fakeScheduler() {
  let tasks = new Map(), id = 0;
  return { setInterval(fn) { tasks.set(++id, fn); return id; }, clearInterval(handle) { tasks.delete(handle); },
    /** Runs every pending fade to completion. */
    settle() { for (let i = 0; i < 12 && tasks.size; i++) for (const fn of [...tasks.values()]) fn(); } };
}
const manager = (options) => {
  const elements = [], scheduler = fakeScheduler();
  const music = createMusicManager(() => { const e = fakeElement(options); elements.push(e); return e; }, scheduler);
  return { music, elements, scheduler };
};

describe('background music channel', () => {
  test('stays silent until the game is entered, then loops one local track at a quiet level', async () => {
    const { music, elements, scheduler } = manager();
    music.setEnabled(true); music.setVolume(.15);
    expect(elements).toHaveLength(0);
    expect(await music.enter()).toBe(true);
    scheduler.settle();
    expect(elements).toHaveLength(1);
    expect(elements[0]).toMatchObject({ src: MUSIC_SOURCE, loop: true, paused: false });
    expect(elements[0].volume).toBeCloseTo(.15, 5);
    expect(MUSIC_SOURCE).toMatch(/^\/audio\/music\//);
    await music.setActive(true); await music.enter();
    expect(elements).toHaveLength(1);
  });
  test('lowers under voice and ready screens, then restores', async () => {
    const { music, elements, scheduler } = manager();
    await music.enter(); scheduler.settle();
    music.setQuiet(true); scheduler.settle(); expect(elements[0].volume).toBeCloseTo(.075, 5);
    music.setVoiceActive(true); scheduler.settle(); expect(elements[0].volume).toBeCloseTo(.15 * .22, 5);
    music.setVoiceActive(false); scheduler.settle(); expect(elements[0].volume).toBeCloseTo(.075, 5);
    music.setQuiet(false); scheduler.settle(); expect(elements[0].volume).toBeCloseTo(.15, 5);
  });
  test('mute, disable and independent suspension reasons silence it; only the last reason restores it', async () => {
    const { music, elements } = manager();
    await music.enter();
    music.setMuted(true); expect(elements[0].paused).toBe(true);
    await music.setMuted(false); expect(elements[0].paused).toBe(false);
    music.setEnabled(false); expect(elements[0].paused).toBe(true);
    await music.setEnabled(true); expect(elements[0].paused).toBe(false);
    music.setSuspended('hidden', true); music.setSuspended('match', true);
    expect(elements[0].paused).toBe(true);
    await music.setSuspended('hidden', false); expect(elements[0].paused).toBe(true);
    await music.setSuspended('match', false); expect(elements[0].paused).toBe(false);
    music.setActive(false); expect(elements[0].paused).toBe(true);
  });
  test('a late play result cannot restart music after it was stopped', async () => {
    let release; const gate = new Promise(resolve => { release = resolve; });
    const element = fakeElement(); element.play = async function () { await gate; this.paused = false; };
    const music = createMusicManager(() => element, fakeScheduler());
    const entering = music.enter(); music.setActive(false); release();
    expect(await entering).toBe(false);
    expect(element.paused).toBe(true);
  });
  test('blocked or failing playback does not repeat; a deliberate retry can recover', async () => {
    const { music, elements } = manager({ failPlay: 'NotAllowedError' });
    expect(await music.enter()).toBe(false);
    expect(music.isFailed()).toBe(true);
    await music.setActive(true); await music.setSuspended('hidden', false);
    expect(elements[0].plays).toBe(1);
    elements[0].play = async function () { this.paused = false; };
    expect(await music.retry()).toBe(true);
    expect(music.isFailed()).toBe(false);
  });
  test('dispose releases the element and a later entry builds a fresh one', async () => {
    const { music, elements } = manager();
    await music.enter(); music.dispose();
    expect(elements[0].loaded).toBe(1);
    await music.enter(); expect(elements).toHaveLength(2);
  });
  test('a disposed pending player cannot resume over a new session', async () => {
    let release; const old = fakeElement(), next = fakeElement();
    old.play = async function () { await new Promise(resolve => { release = resolve; }); this.paused = false; };
    let created = 0;
    const music = createMusicManager(() => created++ ? next : old, fakeScheduler());
    const pending = music.enter(); music.dispose(); await music.enter(); release();
    expect(await pending).toBe(false);
    expect(old.paused).toBe(true); expect(next.paused).toBe(false);
  });
});

describe('music preferences', () => {
  const store = (initial) => { const values = new Map(initial ? [[MUSIC_SETTINGS_KEY, initial]] : []); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; };
  test('defaults to enabled at about fifteen percent', () => {
    expect(readMusicPreferences(store())).toEqual({ version: 1, enabled: true, volume: .15 });
  });
  test('round-trips a valid versioned record', () => {
    const storage = store(); saveMusicPreferences(storage, { version: 1, enabled: false, volume: .3 });
    expect(readMusicPreferences(storage)).toEqual({ version: 1, enabled: false, volume: .3 });
  });
  test.each(['not json', '{"version":2,"enabled":true,"volume":.2}', '{"version":1,"enabled":"yes","volume":.2}', '{"version":1,"enabled":true,"volume":4}', 'null'])('rejects invalid record %s', raw => {
    expect(readMusicPreferences(store(raw))).toEqual({ version: 1, enabled: true, volume: .15 });
  });
  test('unavailable storage falls back safely and never throws on save', () => {
    const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
    expect(readMusicPreferences(broken).enabled).toBe(true);
    expect(() => saveMusicPreferences(broken, { version: 1, enabled: true, volume: .2 })).not.toThrow();
  });
});

describe('voice lifecycle notifications', () => {
  const recording = { src: 'a.mp3', status: 'approved' };
  function audioHarness({ failPlay = null } = {}) {
    const elements = [];
    const audio = createAudioManager(() => {
      const e = { src: '', paused: true, play: async function () { if (failPlay) throw Object.assign(new Error('x'), { name: failPlay }); this.paused = false; },
        pause() { this.paused = true; }, removeAttribute() {}, load() {} }; elements.push(e); return e; });
    const events = []; audio.subscribe(active => events.push(active));
    return { audio, elements, events };
  }
  test('reports start and natural end, and ignores events from replaced recordings', async () => {
    const { audio, elements, events } = audioHarness();
    expect(events).toEqual([false]);
    await audio.play(recording); expect(events.at(-1)).toBe(true);
    const first = elements[0]; await audio.play(recording);
    first.onended?.(); expect(events.at(-1)).toBe(true);
    elements[1].onended(); expect(events.at(-1)).toBe(false);
  });
  test.each(['NotAllowedError', 'NotSupportedError'])('releases the voice state when %s rejects playback', async name => {
    const { audio, events } = audioHarness({ failPlay: name });
    const result = await audio.play(recording);
    expect(result.ok).toBe(false); expect(events.at(-1)).toBe(false);
  });
  test('a decode error and an explicit stop both end the voice state exactly once', async () => {
    const { audio, elements, events } = audioHarness();
    await audio.play(recording); elements[0].onerror(); expect(events.at(-1)).toBe(false);
    await audio.play(recording); const before = events.length; audio.stop();
    expect(events.at(-1)).toBe(false); elements[1].onended?.(); expect(events).toHaveLength(before + 1);
  });
  test('missing or unapproved recordings never start the voice state', async () => {
    const { audio, events } = audioHarness();
    expect((await audio.play({ src: 'a.mp3', status: 'draft' })).reason).toBe('missing');
    expect(events.every(value => value === false)).toBe(true);
    expect((await audio.play({ src: 'a.mp3', status: 'draft' }, { preview: true })).ok).toBe(true);
  });
});
