import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { openLesson, menuAction } from '../tests/browser/helpers/tracing.js';

const output=process.argv[2], baseURL=process.env.JAWI_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch();
const results=[];
try {
  for(const label of ['Sin','Sad','Ha (ه)']) {
    const page=await browser.newPage({baseURL,viewport:{width:1024,height:768}});
    await page.addInitScript(()=>{
      window.prep={calls:0,ms:0,lengths:0};
      for(const name of ['getTotalLength','getPointAtLength']) {
        const original=SVGGeometryElement.prototype[name];
        SVGGeometryElement.prototype[name]=function(...args){
          const start=performance.now(),result=original.apply(this,args);
          if(!this.isConnected){window.prep.ms+=performance.now()-start;window.prep.calls++;if(name==='getTotalLength')window.prep.lengths++;}
          return result;
        };
      }
    });
    await openLesson(page,label,'play');
    const cold=await page.evaluate(()=>({...window.prep}));
    await page.evaluate(()=>{window.prep={calls:0,ms:0,lengths:0};});
    await menuAction(page,'Cuba lagi');
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const restart=await page.evaluate(()=>({...window.prep}));
    const assets=await page.evaluate(()=>[...document.querySelectorAll('script[src],link[rel="stylesheet"]')].map(node=>node.src||node.href));
    const build=Object.fromEntries(await Promise.all(assets.map(async url=>[new URL(url).pathname,createHash('sha256').update(await(await page.request.get(url)).body()).digest('hex')])));
    results.push({label,cold,restart,build});await page.close();
  }
  mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify({date:new Date().toISOString(),browser:browser.version(),baseURL,scope:'Detached SVG sampling only, cold lesson and same-page restart; desktop screening',results},null,2));
} finally {await browser.close();}
