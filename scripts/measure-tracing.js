import { chromium } from '@playwright/test';
import { cpus,release } from 'node:os';
import { mkdirSync,writeFileSync } from 'node:fs';
import { dismissSplash, selectPractice } from '../tests/browser/helpers/navigation.js';
const mode=process.argv[3]||'guided';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:1000}});
await page.goto('http://127.0.0.1:5173');await dismissSplash(page);await page.getByRole('button',{name:'Jom mula'}).click();
await page.getByRole('button',{name:'Buka pratonton dewasa'}).click();if(mode!=='play')await selectPractice(page,mode);await page.getByRole('button',{name:'Sin',exact:true}).click();
await page.locator('.trace-board').evaluate(svg=>{
  window.frameObservations=[];
  svg.addEventListener('pointermove',event=>{
    if(!event.buttons)return;
    const start=performance.now();
    requestAnimationFrame(()=>{
      const ink=svg.querySelector('.play-fill,.pupil-ink');
      if(ink?.getAttribute('d'))window.frameObservations.push(performance.now()-start);
    });
  });
});
const model=await page.locator('.reference-stroke').evaluate(path=>{
  const matrix=path.getScreenCTM(),n=Math.ceil(path.getTotalLength()/5);
  return Array.from({length:n+1},(_,i)=>{const p=path.getPointAtLength(path.getTotalLength()*i/n),q=new DOMPoint(p.x,p.y).matrixTransform(matrix);return {x:q.x,y:q.y};});
});
await page.mouse.move(model[0].x,model[0].y);await page.mouse.down();for(const p of model.slice(1))await page.mouse.move(p.x,p.y);await page.mouse.up();
await page.getByRole('heading',{name:mode==='play'?'Kamu sudah ikut huruf Sin!':'Bagus, kamu sudah cuba!'}).waitFor();
const frames=await page.evaluate(()=>window.frameObservations);
await page.getByRole('button',{name:'Ruang guru'}).click();const downloadPromise=page.waitForEvent('download');
await page.getByRole('button',{name:'Eksport jejak sesi ini'}).click();const download=await downloadPromise;
const stream=await download.createReadStream();let data='';for await(const chunk of stream)data+=chunk.toString();
const diagnostic=JSON.parse(data);const sorted=frames.toSorted((a,b)=>a-b);
const percentile=p=>sorted[Math.min(sorted.length-1,Math.floor(sorted.length*p))]||0;
const result={date:new Date().toISOString(),platform:process.platform,osRelease:release(),cpu:cpus()[0]?.model,node:process.version,browser:browser.version(),viewport:{width:1280,height:1000,dpr:1},letter:'sin',geometryVersion:1,interactionPolicy:diagnostic.interactionPolicy,toleranceProfile:diagnostic.profile.id,input:'native mouse',handler:{samples:diagnostic.timing.samples,meanMs:diagnostic.timing.totalMs/diagnostic.timing.samples,maxMs:diagnostic.timing.maxMs},animationFrameObservation:{samples:sorted.length,medianMs:percentile(.5),p95Ms:percentile(.95),maxMs:sorted.at(-1)||0},bounds:{maxInputSamples:18000,maxGestures:100},scope:'Handler and DOM route-fill/ink availability on animation frames in a Windows headless Chromium session; excludes physical screen, stylus and finger latency.'};
mkdirSync('output/verification',{recursive:true});writeFileSync(process.argv[2]||'output/verification/tracing-performance.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();
