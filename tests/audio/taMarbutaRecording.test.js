import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import letters from '../../src/content/letters.json';
import proposal from '../../src/content/taMarbutaVoice.json';
import originalLetter from '../fixtures/ta-marbuta-voice-original.json';
import { audioNameCandidateFor } from '../../src/content/audioReviewCandidates.js';
import { validateLetter, validateCatalogue } from '../../src/content/validateContent.js';
import { completedBookLetters } from '../../src/game/bookNavigation.js';

const target = letters.find(l => l.id === 'ta-marbuta');
const source = letters.find(l => l.id === 'ta');
const sha = b => createHash('sha256').update(b).digest('hex');

it('activates the exact reviewed Ta-only recording with independent owner approval', () => {
  expect(target).toMatchObject({ contentVersion: 4, labelMs: 'Ta marbutah', geometry: { status: 'approved', review: { revision: 4 } }, audio: { name: { version: 2, transcriptMs: 'Ta', status: 'approved', review: { revision: 2, date: '2026-10-11', kind: 'projectOwner', reference: 'docs/AUDIO_APPROVALS.md#approval-of-ta-marbutah-ta-only-voice-2026-10-11' } } } });
  const restored = structuredClone(target); restored.audio.name = originalLetter.audio.name;
  expect(restored).toEqual(originalLetter);
  const reviewed = structuredClone(target.audio.name); reviewed.status = 'draft'; delete reviewed.review;
  expect(reviewed).toEqual(proposal.recording);
  expect(validateLetter(target)).toMatchObject({ valid: true, ready: true });
  expect(validateCatalogue(letters).results.every(r => r.ready)).toBe(true);
  expect(audioNameCandidateFor(originalLetter)).toMatchObject({ version: 2, transcriptMs: 'Ta', status: 'draft' });
  const preview = structuredClone(target); preview.audio.name = proposal.recording;
  expect(validateLetter(preview)).toMatchObject({ valid: true, ready: false });
  expect(preview.geometry).toEqual(target.geometry);
  expect(proposal.recording.review).toBeUndefined();
});

it('reuses the exact approved supplied Ta bytes and keeps the previous recording', () => {
  const candidate = readFileSync(`public${proposal.recording.src}`), original = readFileSync(`public${source.audio.name.src}`);
  expect(candidate.equals(original)).toBe(true);
  expect(sha(candidate)).toBe('68b6f576c362607bb1f50ceb4a1876f54796b77888b4242ae3f5604cf2d1a12d');
  expect(sha(candidate)).toBe(proposal.recording.origin.recordingSha256);
  expect(proposal.recording.origin.reusedFrom).toMatchObject({ letterId: 'ta', audioVersion: 2, src: source.audio.name.src });
  expect(sha(readFileSync(`public${originalLetter.audio.name.src}`))).toBe('c3d6e0b040ef65215cc3dd52899505ab8e00d1ceb00ebbd44a65a5aec4082773');
});

it('does not offer the candidate for another letter or a superseded recording', () => {
  expect(letters.filter(l => audioNameCandidateFor(l))).toEqual([]);
  const approved = structuredClone(target); approved.audio.name = { ...proposal.recording, status: 'approved' };
  expect(audioNameCandidateFor(approved)).toBeNull();
  const changed = structuredClone(originalLetter); changed.audio.name.src = '/audio/letters/changed.mp3';
  expect(audioNameCandidateFor(changed)).toBeNull();
});

it('requires matching audio approval while retaining saved geometry-revision-4 credit', () => {
  const stale = structuredClone(target); stale.audio.name.review.revision = 1;
  expect(validateLetter(stale)).toMatchObject({ valid: false, ready: false });
  const attempt = { profile: 'Bunga', letterId: target.id, contentVersion: 4, audioVersion: 1, mode: 'play', outcome: 'playComplete', geometryStatus: 'approved', audioStatus: 'approved', preview: false };
  expect(completedBookLetters(letters, { profile: 'Bunga', attempts: [attempt] }, 'play').has(target.id)).toBe(true);
});
