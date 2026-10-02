import { validateLetter } from '../content/validateContent.js';
export const PLAYER_PROFILES = ['Bunga', 'Daun', 'Bintang'];
export function eligiblePool(letters, pool) {
  return letters.filter(letter => validateLetter(letter).ready && (pool === 'ready' || (pool === 'additional' ? letter.additional : letter.pilot)));
}
export function selectSequence(pool, count, random = Math.random) {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count).map(letter => letter.id);
}
export function newMatch(settings, letters, sameSequence) {
  const letterIds = sameSequence || selectSequence(eligiblePool(letters, settings.pool), settings.roundCount);
  return { ...settings, id: crypto.randomUUID(), timestamp: new Date().toISOString(), letterIds,
    revisions: letterIds.map(id => { const letter = letters.find(l => l.id === id); return { letterId: id, contentVersion: letter.contentVersion, audioVersion: letter.audio.name.version }; }) };
}
