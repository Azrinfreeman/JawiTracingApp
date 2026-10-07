import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual} from 'node:assert';
const root='output/verification/sin-syin-tails';
if(existsSync(`${root}/before-catalogue.json`))throw new Error('Never overwrite the authoring baseline.');
mkdirSync(root,{recursive:true});
const bytes=readFileSync('src/content/letters.json'),letters=JSON.parse(bytes);
writeFileSync(`${root}/before-catalogue.json`,bytes);
const originals=letters.filter(letter=>['sin','syin'].includes(letter.id));strictEqual(originals.length,2);
writeFileSync('tests/fixtures/sin-syin-tail-originals.json',JSON.stringify(originals,null,2)+'\n',{flag:'wx'});
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(`${folder}/${entry.name}`):[`${folder}/${entry.name}`]);
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const files=[...walk('src'),...letters.map(letter=>`public${letter.audio.name.src}`),'package.json','package-lock.json'];
writeFileSync(`${root}/before-inputs.json`,JSON.stringify({date:'2026-10-06',timezone:'Asia/Kuala_Lumpur',
 scope:'Raise the left tail of Sin and Syin slightly, retaining a clear height gap below the other peaks.',
 request:'can you make the tail for each of the alphabet to be a bit more higher but not too high or equal to the 2nd tail. Can you fix it',
 sourceRevisions:Object.fromEntries(originals.map(letter=>[letter.id,letter.contentVersion])),
 hashes:Object.fromEntries(files.map(path=>[path,hash(path)]))},null,2)+'\n');
console.log('Saved Sin 1/Syin 2, complete catalogue, application sources and all 37 recording hashes.');
