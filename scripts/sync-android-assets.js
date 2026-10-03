import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'dist'), target = resolve(root, 'android/app/src/main/assets');
const output = resolve(root, process.argv[2] || 'output/verification/android-release');
if (!output.startsWith(root + sep)) throw new Error('Android asset evidence must stay inside the workspace.');
if (!target.startsWith(root + sep) || !existsSync(resolve(source, 'index.html'))) throw new Error('Build the game before synchronizing Android assets.');
// This directory contains generated copies only, never Android source or keys.
if (existsSync(target)) rmSync(target, { recursive: true });
mkdirSync(target, { recursive: true }); cpSync(source, target, { recursive: true });
const files = {};
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else files[relative(target, path).split(sep).join('/')] = createHash('sha256').update(readFileSync(path)).digest('hex');
  }
}
walk(target);
mkdirSync(output, { recursive: true });
writeFileSync(resolve(output, 'bundled-assets.json'), JSON.stringify({ date: new Date().toISOString(), files }, null, 2));
console.log(`Synchronized ${Object.keys(files).length} offline Android assets.`);
