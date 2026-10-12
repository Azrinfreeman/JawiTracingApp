// Authoring only: preserve the active catalogue and shrink only the head cubics.
import {readFileSync,writeFileSync,mkdirSync,readdirSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parsePath,samplePath} from './lib/glyph-geometry.mjs';
import {makeReference} from '../src/tracing/geometry.js';
const root='output/verification/wau-va-smaller-heads';mkdirSync(root,{recursive:true});
const raw=readFileSync('src/content/letters.json','utf8'),letters=JSON.parse(raw),originals=letters.filter(l=>['wau','va'].includes(l.id));
if(JSON.stringify(originals.map(l=>[l.id,l.contentVersion]))!==JSON.stringify([['wau',3],['va',4]]))throw Error('Expected approved Wau 3 / Va 4');
writeFileSync(`${root}/before-catalogue.json`,raw,{flag:'wx'});writeFileSync('tests/fixtures/wau-va-smaller-head-originals.json',JSON.stringify(originals,null,2)+'\n',{flag:'wx'});
const allowed=new Set(['src/content/reviewCandidates.js','src/tracing/teachingCues.js','src/components/VideoModelReview.jsx','src/components/LetterModelGlyph.jsx','src/game/screenLayout.js','src/tracing/numberedGuides.js']);
const protectedFiles={};const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const p=`${dir}/${e.name}`;if(e.isDirectory())walk(p);else if(!allowed.has(p))protectedFiles[p]=sha(p);}}
walk('src');walk('public/audio');writeFileSync(`${root}/protected-inputs.json`,JSON.stringify({files:protectedFiles},null,2)+'\n');
mkdirSync('docs/references',{recursive:true});
copyFileSync('C:/Users/azrin/AppData/Local/Temp/codex-clipboard-b7c36bde-2fc0-4593-b0ea-3e1c7092d2a5.png','docs/references/wau-va-smaller-head-reference.png');
copyFileSync('C:/Users/azrin/AppData/Local/Temp/codex-clipboard-6f5c751c-cb01-49cd-86d1-19a405ee5202.png','docs/references/wau-va-smaller-head-current-cards.png');
const output={},scale=.78,round=n=>+n.toFixed(5);
const bounds=points=>{const xs=points.map(p=>p.x),ys=points.map(p=>p.y),x=Math.min(...xs),y=Math.min(...ys);return{x:round(x),y:round(y),width:round(Math.max(...xs)-x),height:round(Math.max(...ys)-y)};};
for(const letter of originals){
 const path=letter.geometry.strokes[0].path,segments=parsePath(path),anchor=segments[0][0];
 if(segments.length!==6||segments[2].length!==2)throw Error('Expected head cubics, closing line and three tail cubics');
 const head=segments.slice(0,3),suffix=path.slice(path.indexOf(' C ',path.indexOf(' L ')));
 const transform=p=>({x:round(anchor.x+scale*(p.x-anchor.x)),y:round(anchor.y+scale*(p.y-anchor.y))});
 const text=p=>`${p.x} ${p.y}`;
 const headPath=`M ${text(anchor)} ${head.map(seg=>`${seg.length===4?'C':'L'} ${seg.slice(1).map(p=>text(transform(p))).join(' ')}`).join(' ')}`;
 const next=headPath+suffix,originalHead=path.slice(0,path.length-suffix.length);
 const before=bounds(samplePath(originalHead,.1)),after=bounds(samplePath(headPath,.1));
 const ref=makeReference(samplePath(next,.1)),headLength=makeReference(samplePath(headPath,.1)).length;
 const display=letter.geometry.strokes[0].displayWidth;
 const reduction={width:round(1-(after.width+display)/(before.width+display)),height:round(1-(after.height+display)/(before.height+display))};
 output[letter.id]={baseRevision:letter.contentVersion,revision:letter.contentVersion+1,path:next,headPath,headScale:scale,
  fitBounds:bounds(samplePath(path,.1)),headBounds:{before,after},visibleHeadReduction:reduction,
  sections:[[0,'Ke kiri, kemudian naik mengikut gelung.'],[round(headLength/ref.length),'Teruskan ekor ke kiri.']]};
 console.log(`${letter.id}: visible head reduction ${(reduction.width*100).toFixed(1)}% × ${(reduction.height*100).toFixed(1)}%; section ${output[letter.id].sections[1][0]}`);
}
writeFileSync('src/content/wauVaSmallerHeads.json',JSON.stringify(output,null,2)+'\n');
