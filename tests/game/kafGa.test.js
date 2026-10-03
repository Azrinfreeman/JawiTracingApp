import { describe, expect, it } from 'vitest';
import letters from '../../src/content/letters.json';
import { validateLetter } from '../../src/content/validateContent.js';
import { eligibleBook, completedBookLetters } from '../../src/game/bookNavigation.js';
import { createProgressStore } from '../../src/storage/progressStore.js';
import { eligiblePool } from '../../src/game/matchConfig.js';
import { createMatchStore } from '../../src/storage/matchStore.js';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ResultScreen } from '../../src/screens/ResultScreen.jsx';
import { DraftModelReview } from '../../src/components/DraftModelReview.jsx';

const corrected = letters.filter(letter => ['kaf', 'ga'].includes(letter.id));
describe('reference-matched Kaf/Ga revisions', () => {
  it('uses one identical connected movement, distinguished by a single upper tap dot', () => {
    const [kaf, ga] = corrected;
    expect(kaf.geometry.strokes).toEqual(ga.geometry.strokes);
    expect(kaf.geometry.strokes).toHaveLength(1);
    expect(kaf.geometry.displayPaths).toEqual(kaf.geometry.strokes.map(stroke => stroke.path));
    expect(ga.geometry.displayPaths).toEqual(kaf.geometry.displayPaths);
    expect(kaf.geometry.dotTargets).toEqual([]);
    expect(ga.geometry.dotTargets).toHaveLength(1);
    expect(ga.geometry.dotTargets[0]).toMatchObject({ policy: 'tap', visibleRadius: 19, hitRadius: 48, maxTravel: 30 });
    expect(kaf.geometry.validSequences).toEqual([['stroke-1']]);
    expect(ga.geometry.validSequences).toEqual([['stroke-1', 'dot-1']]);
  });
  it('keeps both revised models in adult review and out of student and challenge pools', () => {
    for (const letter of corrected) {
      expect(validateLetter(letter)).toMatchObject({ valid: true, ready: false });
      expect(letter.geometry.status).toBe('pendingReview');
      expect(letter.geometry.review).toBeUndefined();
      expect(letter.audio.name.status).toBe('approved');
    }
    expect(corrected.map(letter => letter.contentVersion)).toEqual([2, 3]);
    expect(eligibleBook(corrected)).toEqual([]);
    expect(eligibleBook(corrected, true)).toEqual(corrected);
    expect(eligiblePool(letters, 'ready').map(letter => letter.id)).not.toEqual(expect.arrayContaining(['kaf', 'ga']));
    expect(eligiblePool(letters, 'ready')).toHaveLength(35);
  });
  it('retains old attempts and copies with their original revisions without earning new stickers', () => {
    const attempts = corrected.map(letter => ({ id: 'old-' + letter.id, timestamp: '2026-10-02T00:00:00Z',
      profile: 'Bunga', letterId: letter.id, mode: 'play', pointerType: 'mouse', toleranceProfile: 'play-pen-mouse-standard-v1',
      contentVersion: letter.contentVersion - 1, geometryStatus: 'approved', audioStatus: 'approved',
      outcome: 'playComplete', preview: false, metrics: { coverage: 1, meanError: 0, invalidTravel: 0, invalidEvents: 0 }, assistance: 0, retries: 0 }));
    const copies = corrected.map(letter => ({ id: 'copy-' + letter.id, timestamp: '2026-10-02T00:00:00Z', profile: 'Bunga',
      letterId: letter.id, contentVersion: letter.contentVersion - 1, ink: [[{ x: 780, y: 200 }, { x: 780, y: 610 }]] }));
    const historical = { version: 1, profile: 'Bunga', attempts, copies };
    const store = createProgressStore({ getItem: () => JSON.stringify(historical), setItem() {} });
    expect(store.read()).toEqual(historical);
    expect(JSON.parse(store.export())).toEqual(historical);
    expect(completedBookLetters(letters, store.read(), 'play').size).toBe(0);
  });
  it('retains and exports old match revisions independently of current eligibility', () => {
    const match = { id: 'historical-kaf-ga', timestamp: '2026-10-02T00:00:00Z', mode: 'solo', status: 'abandoned',
      rulesVersion: 'speed-v1', profiles: ['Bunga'], letterIds: ['kaf', 'ga', 'alif'], limitMs: 90000, pauseCount: 0, rounds: [],
      revisions: [{ letterId: 'kaf', contentVersion: 1, audioVersion: 1 }, { letterId: 'ga', contentVersion: 2, audioVersion: 1 }] };
    const store = createMatchStore({ getItem: () => JSON.stringify({ version: 1, matches: [match] }), setItem() {} });
    expect(store.read().matches).toEqual([match]); expect(store.export().matches).toEqual([match]);
  });
  it('uses the authored shape for standalone completion and draft review, preserving other draft displays', () => {
    for (const letter of corrected) for (const outcome of ['guidedComplete', 'precisionComplete', 'copySaved']) {
      const markup = renderToStaticMarkup(createElement(ResultScreen, { letter, result: { outcome }, audio: {}, preview: true }));
      const model = markup.match(/<svg class="letter-model-glyph [^"]*"[^>]*>[\s\S]*?<\/svg>/)?.[0];
      expect(model).toBeDefined(); expect(model).toContain(`d="${letter.geometry.strokes[0].path}"`);
      expect((model.match(/<circle /g) || []).length).toBe(letter.geometry.dotTargets.length);
      expect(markup).not.toContain(letter.glyph);
    }
    const review = renderToStaticMarkup(createElement(DraftModelReview, { letters: corrected }));
    for (const letter of corrected) {
      expect(review).toContain(`data-letter-id="${letter.id}"`);
      expect(review).not.toContain(letter.glyph);
    }
    const unrelatedDraft = { ...letters[0], geometry: { ...letters[0].geometry, status: 'draft' } };
    const other = renderToStaticMarkup(createElement(DraftModelReview, { letters: [unrelatedDraft] }));
    expect(other).toContain(`viewBox="${unrelatedDraft.viewBox.join(' ')}"`);
    expect(other).toContain(unrelatedDraft.glyph);
  });
});
