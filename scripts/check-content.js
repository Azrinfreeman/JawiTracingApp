import { readFileSync, existsSync } from 'node:fs';
import { validateCatalogue } from '../src/content/validateContent.js';
const letters = JSON.parse(readFileSync(new URL('../src/content/letters.json', import.meta.url), 'utf8'));
const result = validateCatalogue(letters);
for (const letter of letters) {
  for (const audio of [letter.audio.name, ...letter.audio.pronunciationExamples]) {
    if (audio.src && !existsSync(`public${audio.src}`)) result.errors.push(`${letter.id}: missing file ${audio.src}`);
  }
}
if (result.errors.length) { console.error(result.errors.join('\n')); process.exitCode = 1; }
else console.log(`Content valid: ${letters.length} letters; ${letters.filter(l => l.geometry.strokes.length).length} models; ${result.results.filter(r => r.ready).length} student-ready lessons.`);
