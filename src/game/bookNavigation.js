import { validateLetter } from '../content/validateContent.js';

export function eligibleBook(letters, preview = false) {
  return letters.filter(letter => validateLetter(letter).valid && (preview ? letter.geometry.strokes.length > 0 : validateLetter(letter).ready));
}
export function bookDestination(index, step, length) {
  if (!Number.isInteger(index) || index < 0 || index >= length || ![-1, 1].includes(step)) return null;
  const next = index + step;
  return next < 0 ? null : next >= length ? 'end' : next;
}
export function completedBookLetters(letters, progress, mode, preview = false) {
  if (preview) return new Set();
  const versions = new Map(letters.map(letter => [letter.id, letter.contentVersion]));
  const outcome = { play: 'playComplete', guided: 'guidedComplete', precision: 'precisionComplete' }[mode];
  return new Set(progress.attempts.filter(attempt => attempt.profile === progress.profile && !attempt.preview && !attempt.sessionType
    && attempt.mode === mode && attempt.outcome === outcome && attempt.contentVersion === versions.get(attempt.letterId)
    && attempt.geometryStatus === 'approved' && attempt.audioStatus === 'approved').map(attempt => attempt.letterId));
}
