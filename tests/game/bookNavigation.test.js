import { describe, expect, it } from 'vitest';
import letters from '../../src/content/letters.json';
import { bookDestination, completedBookLetters, eligibleBook } from '../../src/game/bookNavigation.js';

describe('alphabet book navigation and completion', () => {
  it('does not wrap or navigate outside a selected sequence', () => {
    expect(bookDestination(0, -1, 3)).toBeNull(); expect(bookDestination(0, 1, 3)).toBe(1);
    expect(bookDestination(2, 1, 3)).toBe('end'); expect(bookDestination(-1, 1, 3)).toBeNull();
    expect(bookDestination(0, 2, 3)).toBeNull(); expect(bookDestination(0, 1, 0)).toBeNull();
  });
  it('preserves authored order and student eligibility in filtered books', () => {
    const subset = letters.filter(letter => letter.pilot); expect(eligibleBook(subset).map(letter => letter.id)).toEqual(subset.map(letter => letter.id));
    const draft = { ...letters[0], geometry: { ...letters[0].geometry, status: 'draft' } };
    expect(eligibleBook([draft])).toHaveLength(0); expect(eligibleBook([draft], true)).toHaveLength(1);
  });
  it('requires a matching validated practice outcome, revision and profile', () => {
    const letter = letters[0], base = { profile: 'Bunga', preview: false, letterId: letter.id, mode: 'play', outcome: 'playComplete', contentVersion: letter.contentVersion, geometryStatus: 'approved', audioStatus: 'approved' };
    const progress = { profile: 'Bunga', attempts: [{ ...base, profile: 'Daun' }, { ...base, preview: true }, { ...base, contentVersion: 0 }, { ...base, outcome: 'copySaved' }, { ...base, sessionType: 'duo' }, { ...base, mode: 'guided' }] };
    expect(completedBookLetters(letters, progress, 'play').size).toBe(0);
    progress.attempts.push(base); expect([...completedBookLetters(letters, progress, 'play')]).toEqual([letter.id]);
    expect(completedBookLetters(letters, progress, 'play', true).size).toBe(0);
    expect(completedBookLetters(letters, progress, 'precision').size).toBe(0);
  });
});
