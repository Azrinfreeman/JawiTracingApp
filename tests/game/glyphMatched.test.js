import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import letters from '../../src/content/letters.json';
import baseline from '../fixtures/glyph-baseline.json';
import outlineOriginals from '../fixtures/four-letter-originals.json';
import directionOriginals from '../fixtures/fa-pa-originals.json';
import familyOriginals from '../fixtures/ain-family-originals.json';
import gaAudioOriginal from '../fixtures/ga-audio-original.json';
import ngaAudioOriginal from '../fixtures/nga-audio-original.json';
import nunOriginal from '../fixtures/nun-outline-original.json';
import haOriginal from '../fixtures/ha-direction-original.json';
import vaAudioOriginal from '../fixtures/va-audio-original.json';
import removedYe from '../fixtures/removed-ye.json';
import nyaTipOriginal from '../fixtures/nya-tip-original.json';
import sadDadOriginals from '../fixtures/sad-dad-originals.json';
import tailOriginals from '../fixtures/sin-syin-tail-originals.json';
import videoOriginals from '../fixtures/video-review-originals.json';
import stemOriginals from '../fixtures/ta-za-originals.json';
import { GLYPH_MATCHED_DOTS, GLYPH_MATCHED_IDS } from '../fixtures/glyphMatched.js';
import { validateLetter } from '../../src/content/validateContent.js';
import { completedBookLetters, eligibleBook } from '../../src/game/bookNavigation.js';
import { eligiblePool } from '../../src/game/matchConfig.js';
import { playFillWidth, playGuideWidth } from '../../src/content/displayWidth.js';

const sha = value => createHash('sha256').update(value).digest('hex');
// Ye remains in the historical redraw fixture, but no longer in the live book.
const byId = id => letters.find(letter => letter.id === id) || (id==='ye'?removedYe:undefined);
const changed = new Set(GLYPH_MATCHED_IDS);

describe('glyph-matched tracing models', () => {
  it('leaves every other catalogue entry byte-identical', () => {
    // Compare the historical geometry stage; Ga's later audio replacement has its own preservation checks.
    const beforeApproval = letter => { const copy = structuredClone(letter); copy.geometry.status = 'pendingReview'; delete copy.geometry.review;
      if (letter.id === 'ga') copy.audio = structuredClone(gaAudioOriginal.audio); return copy; };
    for (const letter of letters.filter(item => !changed.has(item.id))) {
      // Later Sin/Syin tail revisions have their own exact reviewed-model checks.
      const entry = sadDadOriginals.find(original=>original.id===letter.id) || tailOriginals.find(original=>original.id===letter.id) || (['kaf', 'ga'].includes(letter.id) && letter.geometry.status === 'approved' ? beforeApproval(letter) : letter);
      expect(sha(JSON.stringify(entry)), letter.id).toBe(baseline.entries[letter.id].sha256);
    }
  });

  it('tracks the redrawn revisions and subsequent outline/direction revisions with recordings untouched', () => {
    expect(GLYPH_MATCHED_IDS).toHaveLength(27);
    for (const id of GLYPH_MATCHED_IDS) {
      // Later video approvals are verified separately against these preserved source revisions.
      const letter = stemOriginals.find(original=>original.id===id) || videoOriginals.find(original=>original.id===id) || (id==='nya'?nyaTipOriginal:id==='va'?vaAudioOriginal:id==='ha'?haOriginal:id==='nun'?nunOriginal:id==='nga'?ngaAudioOriginal:byId(id)), before = baseline.entries[id];
      const outlineOriginal=outlineOriginals.find(original=>original.id===id);
      const directionOriginal=directionOriginals.find(original=>original.id===id);
      const familyOriginal=familyOriginals.find(original=>original.id===id);
      if(familyOriginal)expect(familyOriginal.contentVersion,id).toBe(before.contentVersion+1);
      if(outlineOriginal)expect(outlineOriginal.contentVersion,id).toBe(before.contentVersion+1);
      if(directionOriginal)expect(directionOriginal.contentVersion,id).toBe(before.contentVersion+1);
      expect(letter.contentVersion, id).toBe(before.contentVersion + (outlineOriginal || directionOriginal || familyOriginal ? 2 : 1));
      expect(sha(JSON.stringify(letter.audio)), id).toBe(before.audioSha256);
      expect(validateLetter(letter).valid, id).toBe(true);
      expect(letter.geometry.displayPaths, id).toEqual(letter.geometry.strokes.map(stroke => stroke.path));
      expect(letter.geometry.dotTargets, id).toHaveLength(GLYPH_MATCHED_DOTS[id]);
      expect(letter.geometry.dotTargets.map(dot => dot.policy), id).toEqual(Array(GLYPH_MATCHED_DOTS[id]).fill('tap'));
      expect(letter.geometry.validSequences, id).toHaveLength(1);
      // Awaiting review, or approved with a review for exactly this revision; never a stale approval.
      if (letter.geometry.status === 'approved') {
        expect(letter.geometry.review.revision, id).toBe(letter.contentVersion);
        expect(letter.geometry.review.kind, id).toBe('projectOwner');
        expect(letter.geometry.review.reference, id).toMatch(/^docs\/CONTENT_APPROVALS\.md#/);
      }
      else { expect(letter.geometry.status, id).toBe('pendingReview'); expect(letter.geometry.review, id).toBeUndefined(); }
    }
  });

  it('authors a bounded guide width for every redrawn letter and leaves other letters on the default', () => {
    for (const id of GLYPH_MATCHED_IDS) for (const stroke of byId(id).geometry.strokes) {
      expect(stroke.displayWidth, id).toBeGreaterThanOrEqual(44); expect(stroke.displayWidth, id).toBeLessThanOrEqual(76);
      expect(playGuideWidth(stroke), id).toBe(stroke.displayWidth);
      expect(playFillWidth(stroke), id).toBeLessThan(playGuideWidth(stroke));
    }
    for (const letter of letters.filter(item => !changed.has(item.id))) for (const stroke of letter.geometry.strokes) {
      expect(stroke.displayWidth, letter.id).toBeUndefined(); expect(playGuideWidth(stroke)).toBe(76); expect(playFillWidth(stroke)).toBe(60);
    }
  });

  it('validates displayWidth and keeps a letter valid without one', () => {
    const letter = structuredClone(byId('qaf'));
    expect(validateLetter(letter).valid).toBe(true);
    for (const bad of [29, 77, Number.NaN, '50']) { letter.geometry.strokes[0].displayWidth = bad; expect(validateLetter(letter).valid, String(bad)).toBe(false); }
    delete letter.geometry.strokes[0].displayWidth; expect(validateLetter(letter).valid).toBe(true);
    letter.geometry.strokes[0].displayWidth = 30; expect(validateLetter(letter).valid).toBe(true);
    letter.geometry.strokes[0].displayWidth = 76; expect(validateLetter(letter).valid).toBe(true);
  });

  it('keeps every letter recording file byte-identical', () => {
    for (const [file, hash] of Object.entries(baseline.audioFiles)) expect(sha(readFileSync(file)), file).toBe(hash);
  });

  it('keeps unreviewed revisions out of student and challenge pools but in adult preview', () => {
    const pending = GLYPH_MATCHED_IDS.filter(id => byId(id).geometry.status !== 'approved');
    const student = eligibleBook(letters).map(letter => letter.id), preview = eligibleBook(letters, true).map(letter => letter.id);
    for (const id of pending) {
      expect(student).not.toContain(id);
      expect(preview).toContain(id);
      expect(eligiblePool(letters, 'ready').map(letter => letter.id)).not.toContain(id);
    }
  });

  it('does not let an earlier completion complete a revised letter', () => {
    const revised = structuredClone(letters).map(letter => changed.has(letter.id) ? { ...letter, geometry: { ...letter.geometry, status: 'approved',
      review: { revision: letter.contentVersion, reviewer: 'fixture', date: '2026-10-04', reference: 'fixture', kind: 'projectOwner' } } } : letter);
    const attempt = (letter, contentVersion) => ({ profile: 'Bunga', letterId: letter.id, mode: 'play', outcome: 'playComplete', preview: false,
      contentVersion, geometryStatus: 'approved', audioStatus: 'approved' });
    const old = { profile: 'Bunga', attempts: GLYPH_MATCHED_IDS.map(id => attempt(byId(id), byId(id).contentVersion - 1)) };
    expect(completedBookLetters(revised, old, 'play').size).toBe(0);
    const fresh = { profile: 'Bunga', attempts: GLYPH_MATCHED_IDS.map(id => attempt(byId(id), byId(id).contentVersion)) };
    expect(completedBookLetters(revised, fresh, 'play').size).toBe(GLYPH_MATCHED_IDS.filter(id=>letters.some(l=>l.id===id)).length);
  });
});
