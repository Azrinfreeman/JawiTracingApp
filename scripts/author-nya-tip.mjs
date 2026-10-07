import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='output/verification/nya-tip',letters=JSON.parse(readFileSync('src/content/letters.json','utf8'));
const original=letters.find(l=>l.id==='nya');if(original?.contentVersion!==3)throw Error('Unexpected Nya revision');
mkdirSync(root,{recursive:true});
writeFileSync(`${root}/catalogue-before.json`,JSON.stringify(letters,null,2)+'\n');
writeFileSync('tests/fixtures/nya-tip-original.json',JSON.stringify(original,null,2)+'\n');
const points=[{x:605.8,y:399.7},{x:610,y:453.7},{x:653.6,y:508.3},{x:613,y:558.1}];
const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
function split(t){const [a,b,c,d]=points,ab=mix(a,b,t),bc=mix(b,c,t),cd=mix(c,d,t),abc=mix(ab,bc,t),bcd=mix(bc,cd,t),p=mix(abc,bcd,t);return [p,bcd,cd,d];}
// The marked line corresponds to about y=393. Keep the round 48-unit guide
// cap in view: centre y=417 puts its visible top at y=393.
let lo=0,hi=1;for(let i=0;i<60;i++){const t=(lo+hi)/2;if(split(t)[0].y<417)lo=t;else hi=t;}
const splitFraction=(lo+hi)/2,remainder=split(splitFraction),xy=p=>`${+p.x.toFixed(5)} ${+p.y.toFixed(5)}`;
const retainedBowl=original.geometry.strokes[0].path.slice(original.geometry.strokes[0].path.indexOf(' C 511.3'));
const path=`M ${xy(remainder[0])} C ${remainder.slice(1).map(xy).join(' ')}${retainedBowl}`;
const correction={baseRevision:3,revision:4,path,cutGuideY:393,startY:417,retainedCurveFraction:splitFraction};
writeFileSync('src/content/nyaTip.json',JSON.stringify(correction,null,2)+'\n');
writeFileSync(`${root}/authoring.json`,JSON.stringify({originalPath:original.geometry.strokes[0].path,...correction,sourceImage:'C:/Users/azrin/AppData/Local/Temp/codex-clipboard-03fa36e1-9659-42b0-8b06-5c7b3a7312ee.png',scope:'Remove upper-right tip above the marked green line; preserve remaining curve and three dots.'},null,2)+'\n');
writeFileSync(`${root}/audio-before.json`,JSON.stringify(Object.fromEntries(letters.map(l=>[l.audio.name.src,createHash('sha256').update(readFileSync('public'+l.audio.name.src)).digest('hex')])),null,2)+'\n');
console.log(JSON.stringify(correction));
