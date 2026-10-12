import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = 'output/verification/ta-marbuta-voice-approval';
const hash = p => createHash('sha256').update(readFileSync(p)).digest('hex');
const files = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`]);
const raw = readFileSync('src/content/letters.json', 'utf8'), letters = JSON.parse(raw);
const candidate = JSON.parse(readFileSync('src/content/taMarbutaVoice.json'));
const reviewed = JSON.parse(readFileSync('output/verification/ta-marbuta-endpoint/verification.json'));
assert.equal(hash('src/content/taMarbutaVoice.json'), reviewed.fingerprints['src/content/taMarbutaVoice.json']);
assert.equal(hash(`public${candidate.recording.src}`), '68b6f576c362607bb1f50ceb4a1876f54796b77888b4242ae3f5604cf2d1a12d');
const target = letters.find(l => l.id === candidate.id);
assert.equal(target.audio.name.version, candidate.baseVersion);
assert.equal(target.audio.name.src, candidate.baseSrc);
assert.equal(candidate.recording.transcriptMs, 'Ta');
assert.equal(candidate.recording.version, 2);
assert.equal(candidate.recording.status, 'draft');
mkdirSync(root, { recursive: true });
writeFileSync(`${root}/before-catalogue.json`, raw);
writeFileSync(`${root}/before-audio-hashes.json`, JSON.stringify(Object.fromEntries(files('public/audio').map(p => [p, hash(p)])), null, 2) + '\n');
writeFileSync('tests/fixtures/ta-marbuta-voice-original.json', JSON.stringify(target, null, 2) + '\n');
target.audio.name = { ...structuredClone(candidate.recording), status: 'approved', review: {
  revision: 2, reviewer: 'Project owner (Codex user; name not supplied)', date: '2026-10-11',
  reference: 'docs/AUDIO_APPROVALS.md#approval-of-ta-marbutah-ta-only-voice-2026-10-11', kind: 'projectOwner',
} };
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
writeFileSync('src/content/letters.json', JSON.stringify(letters, null, 2).replaceAll('\n', eol) + eol);
console.log('Promoted reviewed Ta-marbutah name audio 2; geometry and recording bytes unchanged.');
