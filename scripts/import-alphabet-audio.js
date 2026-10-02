import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCatalogue } from '../src/content/validateContent.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'voices', 'alphabet');
const catalogue = path.join(root, 'src', 'content', 'letters.json');
const letters = JSON.parse(readFileSync(catalogue, 'utf8'));
const mapping = JSON.parse(readFileSync(path.join(root, 'scripts', 'alphabet-audio-map.json'), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const importedAt = new Date().toISOString();
const report = { importedAt, authorisation: 'User requested replacement from voices/alphabet in Codex; review deferred.', replacements: [], unchanged: [], alreadyCurrent: [] };
const copies = [];
// Preflight every mapped asset before changing files or catalogue metadata.
for (const [id, filename] of Object.entries(mapping)) {
  if (!/^[a-z][a-z-]*$/.test(id) || !/^[a-zA-Z0-9_-]+\.(mp3|wav|ogg|m4a)$/.test(filename)) throw new Error(`Unsafe mapping: ${id}`);
  const letter = letters.find(item => item.id === id);
  const source = path.join(sourceRoot, filename);
  if (!letter || !existsSync(source)) throw new Error(`Missing letter or source: ${id} / ${filename}`);
  const bytes = readFileSync(source), sha256 = hash(bytes);
  if (bytes.length < 1000) throw new Error(`Empty/undersized recording: ${filename}`);
  const recording = letter.audio.name;
  if (recording.origin?.source === `voices/alphabet/${filename}` && recording.origin.sha256 === sha256 &&
      existsSync(path.join(root, 'public', recording.src)) && hash(readFileSync(path.join(root, 'public', recording.src))) === sha256) {
    report.alreadyCurrent.push(id); continue;
  }
  const version = recording.version + 1;
  const extension = path.extname(filename);
  const src = `/audio/letters/alphabet/${id}-name-v${version}${extension}`;
  report.replacements.push({ id, glyph: letter.glyph, label: letter.labelMs, source: `voices/alphabet/${filename}`,
    src, version, bytes: bytes.length, sha256, previousSrc: recording.src, previousVersion: recording.version });
  copies.push({ source, destination: path.join(root, 'public', src) });
  delete recording.synthesis;
  Object.assign(recording, { src, version, status: 'pendingReview', review: null,
    permission: 'User authorised using the supplied voices/alphabet files in Codex; pronunciation review remains pending.',
    origin: { kind: 'userProvided', source: `voices/alphabet/${filename}`, sha256, importedAt, reference: 'docs/AUDIO_REPLACEMENT_REVIEW.md' } });
}
report.unchanged = letters.filter(letter => !(letter.id in mapping)).map(letter => letter.id);
report.currentAssets = letters.filter(letter => letter.id in mapping).map(letter => ({ id: letter.id, glyph: letter.glyph,
  label: letter.labelMs, source: letter.audio.name.origin.source, src: letter.audio.name.src,
  version: letter.audio.name.version, sha256: letter.audio.name.origin.sha256,
  bytes: readFileSync(path.join(sourceRoot, mapping[letter.id])).length, importedAt: letter.audio.name.origin.importedAt }));
const validation = validateCatalogue(letters);
if (!validation.valid) throw new Error(validation.errors.join('\n'));
for (const copy of copies) { mkdirSync(path.dirname(copy.destination), { recursive: true }); copyFileSync(copy.source, copy.destination); }
if (copies.length) {
  writeFileSync(catalogue, JSON.stringify(letters, null, 2) + '\n');
  mkdirSync(path.join(root, 'output', 'verification'), { recursive: true });
  writeFileSync(path.join(root, 'output', 'verification', 'alphabet-audio-import.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ replaced: report.replacements.length, unchanged: report.unchanged, alreadyCurrent: report.alreadyCurrent }, null, 2));
