import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {parsePath,samplePath} from './lib/glyph-geometry.mjs';
import {makeReference} from '../src/tracing/geometry.js';
const root='output/verification/ha-direction';mkdirSync(root,{recursive:true});
const letters=JSON.parse(readFileSync('src/content/letters.json','utf8'));
const original=letters.find(letter=>letter.id==='ha');
if(original.contentVersion!==3)throw Error('Ha 3 is required');
writeFileSync(`${root}/catalogue-before.json`,JSON.stringify(letters,null,2)+'\n');
const segments=parsePath(original.geometry.strokes[0].path);
const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
function split([a,b,c,d],t){const ab=mix(a,b,t),bc=mix(b,c,t),cd=mix(c,d,t),abc=mix(ab,bc,t),bcd=mix(bc,cd,t),p=mix(abc,bcd,t);return [[a,ab,abc,p],[p,bcd,cd,d]];}
// Keep both halves of every split cubic. Crossing bridges stay inside existing ink.
const [upper,outer]=split(segments[6],.29527),[innerEnd,leftStart]=split(segments[3],.13961);
const B=segments[0].at(-1),V=outer[0],J=segments[8].at(-1),W=leftStart[0];
const phases=[
 [segments[0]],
 [[B,V],outer,segments[7],segments[8]],
 [[J,W],leftStart,segments[4],segments[5],upper,[V,B]],
 [segments[1],segments[2],innerEnd,[W,J]],
 [segments[9]],
];
const pair=p=>`${+p.x.toFixed(6)} ${+p.y.toFixed(6)}`;
const commands=segs=>segs.map(s=>`${s.length===2?'L':'C'} ${s.slice(1).map(pair).join(' ')}`).join(' ');
const phasePaths=phases.map(s=>`M ${pair(s[0][0])} ${commands(s)}`);
const path=`M ${pair(phases[0][0][0])} ${phases.map(commands).join(' ')}`;
const lengths=phasePaths.map(p=>makeReference(samplePath(p,.1)).length),total=lengths.reduce((a,b)=>a+b,0);
const texts=['Turun dari hujung atas.','Ikut gelung luar kanan hingga ke sambungan bawah.','Naik mengikut gelung kiri hingga ke sambungan atas.','Turun mengikut garisan dalam.','Teruskan ekor ke kiri.'];
let walked=0;const sections=lengths.map((length,i)=>{const value=[+(walked/total).toFixed(8),texts[i]];walked+=length;return value;});
const correction={baseRevision:3,revision:4,path,sections};
writeFileSync('src/content/haDirection.json',JSON.stringify(correction,null,2)+'\n');
writeFileSync(`${root}/authoring.json`,JSON.stringify({originalPath:original.geometry.strokes[0].path,path,phasePaths,lengths,total,sections,bridges:[Math.hypot(B.x-V.x,B.y-V.y),Math.hypot(J.x-W.x,J.y-W.y)]},null,2)+'\n');
console.log(JSON.stringify({revision:4,phases:5,continuousStrokes:1,length:total,bridges:correction.sections}));
