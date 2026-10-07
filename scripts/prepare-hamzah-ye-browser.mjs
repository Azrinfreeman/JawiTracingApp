import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
const root='tests/browser/';
// Catalogue size expectations follow the requested removal; 375px logo sizes
// and historical reports are deliberately outside this replacement.
for(const file of readdirSync(root).filter(f=>f.endsWith('.spec.js'))){
 const path=root+file,text=readFileSync(path,'utf8'),next=text.replace(/\b37\b/g,'36');
 if(next!==text)writeFileSync(path,next);
}
let source=readFileSync(root+'video-review-approval.spec.js','utf8');
source=source.replace("['mim','ta-marbuta','hamzah','jim']","['hamzah']")
 .replaceAll('output/verification/video-review-approval','output/verification/hamzah-ye')
 .replace("['video','outline','ain-outline','direction','sin-syin-tail']","['video','outline','ain-outline','direction','sin-syin-tail','ta-za-stem','ha-direction']");
writeFileSync(root+'hamzah-ye.spec.js',source);
