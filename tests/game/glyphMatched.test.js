import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import letters from '../../src/content/letters.json';
import baseline from '../fixtures/glyph-baseline.json';
import { GLYPH_MATCHED_DOTS, GLYPH_MATCHED_IDS } from '../fixtures/glyphMatched.js';
import { validateLetter } from '../../src/content/validateContent.js';
import { completedBookLetters, eligibleBook } from '../../src/game/bookNavigation.js';
import { eligiblePool } from '../../src/game/matchConfig.js';
import { playFillWidth, playGuideWidth } from '../../src/content/displayWidth.js';

const sha = value => createHash('sha256').update(value).digest('hex');
const byId = id => letters.find(letter => letter.id === id);
const changed = new Set(GLYPH_MATCHED_IDS);

describe('glyph-matched tracing models', () => {
  it('leaves every other catalogue entry byte-identical', () => {
    // Kaf and Ga were redrawn earlier; their only change since the baseline is the owner's approval record.
    const beforeApproval = letter => { const copy = structuredClone(letter); copy.geometry.status = 'pendingReview'; delete copy.geometry.review; return copy; };
    for (const letter of letters.filter(item => !changed.has(item.id))) {
      const entry = ['kaf', 'ga'].includes(letter.id) && letter.geometry.status === 'approved' ? beforeApproval(letter) : letter;
      expect(sha(JSON.stringify(entry)), letter.id).toBe(baseline.entries[letter.id].sha256);
    }
  });

  it('revises only the redrawn letters, one content revision each, with recordings untouched', () => {
    expect(GLYPH_MATCHED_IDS).toHaveLength(27);
    for (const id of GLYPH_MATCHED_IDS) {
      const letter = byId(id), before = baseline.entries[id];
      expect(letter.contentVersion, id).toBe(before.contentVersion + 1);
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
    expect(completedBookLetters(revised, fresh, 'play').size).toBe(GLYPH_MATCHED_IDS.length);
  });
});
