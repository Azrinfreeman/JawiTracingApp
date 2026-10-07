import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const path='src/content/letters.json',root='output/verification/hamzah-ye';
const letters=JSON.parse(readFileSync(path,'utf8'));
const original=letters.find(l=>l.id==='hamzah'),ye=letters.find(l=>l.id==='ye');
if(original?.contentVersion!==4 || ye?.contentVersion!==3)throw Error('Unexpected catalogue stage');
mkdirSync(root,{recursive:true});
writeFileSync(`${root}/catalogue-before.json`,JSON.stringify(letters,null,2)+'\n');
writeFileSync('tests/fixtures/hamzah-tail-original.json',JSON.stringify(original,null,2)+'\n');
writeFileSync('tests/fixtures/removed-ye.json',JSON.stringify(ye,null,2)+'\n');
writeFileSync(`${root}/audio-before.json`,JSON.stringify(Object.fromEntries(letters.map(l=>[l.audio.name.src,createHash('sha256').update(readFileSync('public'+l.audio.name.src)).digest('hex')])),null,2)+'\n');
// Keep the upper three curves exactly. The outward run remains above the
// single straight return to the tail, so it cannot create a kink underneath.
const stroke=original.geometry.strokes[0];
const upper=stroke.path.split(' C 520 531.8')[0];
if(!upper.endsWith('491 524.3'))throw Error('Unexpected Hamzah upper curve');
stroke.path=upper+' L 621.8 502.1 L 408.4 560.4';
original.geometry.displayPaths=[stroke.path];original.contentVersion=5;
original.geometry.review={revision:5,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-07',reference:'docs/CONTENT_APPROVALS.md#approval-of-hamzah-straight-tail-2026-10-07',kind:'projectOwner'};
writeFileSync(path,JSON.stringify(letters.filter(l=>l.id!=='ye'),null,2)+'\n');
console.log('Hamzah 5: straight lower tail. Ye removed; 36 active letters.');
