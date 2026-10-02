import { test,expect } from '@playwright/test';
import { dismissSplash, selectPractice } from './helpers/navigation.js';
import letters from '../../src/content/letters.json' with { type: 'json' };

async function preview(page, letter='Alif', mode='guided') {
  await page.goto('/');
  await dismissSplash(page);
  await selectPractice(page, mode);
  await page.getByRole('button',{name:new RegExp(`^${letter},?`) }).first().click();
  await expect(page.locator('.trace-board')).toBeVisible();
  await expect(page.locator('.start-dot')).toBeVisible();
}
async function boardModels(page) {
  await page.locator('.trace-board').scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return page.locator('.trace-board').evaluate(svg=>{
    const matrix=svg.getScreenCTM();
    const screen=p=>{const q=new DOMPoint(p.x,p.y).matrixTransform(matrix);return {x:q.x,y:q.y};};
    return {
      strokes:[...svg.querySelectorAll('.reference-stroke')].map(path=>{
        const length=path.getTotalLength(),steps=Math.ceil(length/7);
        return Array.from({length:steps+1},(_,i)=>screen(path.getPointAtLength(length*i/steps)));
      }),
      dots:[...svg.querySelectorAll('.reference-dot')].map(dot=>screen({x:Number(dot.getAttribute('cx')),y:Number(dot.getAttribute('cy'))})),
    };
  });
}
async function draw(page,points) {
  await page.mouse.move(points[0].x,points[0].y); await page.mouse.down();
  for(const p of points.slice(1)) await page.mouse.move(p.x,p.y);
  await page.mouse.up();
}
async function complete(page) {
  const model=await boardModels(page);
  for(const stroke of model.strokes) await draw(page,stroke);
  for(const dot of model.dots) await page.mouse.click(dot.x,dot.y);
  await expect(page.getByRole('heading',{name:'Bagus, kamu sudah cuba!'})).toBeVisible();
}
function waveFixture() {
  const bytes=Buffer.alloc(44+16000);
  bytes.write('RIFF',0);bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);
  bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);
  bytes.writeUInt32LE(8000,24);bytes.writeUInt32LE(16000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);
  bytes.write('data',36);bytes.writeUInt32LE(16000,40);return bytes;
}

test('welcome, approved student entry, explicit adult preview, full catalogue and unavailable audio',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/'); await dismissSplash(page); await expect(page.getByRole('heading',{level:1})).toContainText('Jom main di');
  await page.getByRole('button',{name:'Jom mula'}).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.letter-card:enabled')).toHaveCount(37);
  await selectPractice(page, 'guided');
  await expect(page.locator('.letter-card')).toHaveCount(12);
  await page.getByRole('button',{name:'Semua huruf',exact:true}).click();await expect(page.locator('.letter-card')).toHaveCount(37);
  await expect(page.locator('.letter-card:disabled')).toHaveCount(letters.filter(letter=>!letter.geometry.strokes.length).length);
  await page.getByRole('button',{name:'Huruf tambahan',exact:true}).click();await expect(page.locator('.letter-card')).toHaveCount(6);
  await page.getByRole('button',{name:'Huruf permulaan',exact:true}).click();
  await page.route(`**${letters.find(letter=>letter.id==='ba').audio.name.src}`,route=>route.fulfill({status:404,body:''}));
  await page.getByRole('button',{name:'Ba',exact:true}).click();
  await page.getByRole('button',{name:'Dengar',exact:true}).click();await expect(page.locator('.audio-notice')).toContainText('Audio tidak dapat dimainkan');
  await page.getByRole('button',{name:'Dengar',exact:true}).click();await expect(page.locator('.audio-notice')).toContainText('cuba semula');
  await page.getByRole('button',{name:'Senyapkan audio'}).click();await expect(page.getByRole('button',{name:'Hidupkan audio'})).toHaveAttribute('aria-pressed','true');
  expect(errors).toEqual([]);
});

test('native pointer flow requires dots, records progress, then saves actual copying',async({page})=>{
  await preview(page,'Ba'); const model=await boardModels(page);
  await draw(page,model.strokes[0]);
  await expect(page.locator('.board-tip')).toContainText('titik');await expect(page.locator('.trace-board')).toBeVisible();
  await page.mouse.click(model.dots[0].x,model.dots[0].y);
  await expect(page.getByRole('heading',{name:'Bagus, kamu sudah cuba!'})).toBeVisible();
  await page.getByRole('button',{name:/cuba salin sendiri/}).click();
  const box=await page.locator('.trace-board').boundingBox();
  await draw(page,[{x:box.x+box.width*.7,y:box.y+box.height*.3},{x:box.x+box.width*.68,y:box.y+box.height*.6},{x:box.x+box.width*.3,y:box.y+box.height*.65}]);
  await page.getByRole('button',{name:'Simpan untuk guru'}).click();
  await expect(page.getByRole('heading',{name:'Terima kasih kerana mencuba!'})).toBeVisible();
  await page.reload(); await dismissSplash(page); await page.getByRole('button',{name:'Ruang guru'}).click();
  await expect(page.locator('.copy-thumbnail')).toHaveCount(1);
  await expect(page.getByRole('row').filter({hasText:'Bunga · ba'})).toBeVisible();
  const downloadPromise=page.waitForEvent('download'); await page.getByRole('button',{name:'Eksport kemajuan'}).click();
  const download=await downloadPromise;expect(download.suggestedFilename()).toBe('taman-jawi-kemajuan.json');
});

test('teleport, reverse and cancellation do not finish; native tracing recovers',async({page})=>{
  await preview(page);let model=await boardModels(page),stroke=model.strokes[0];
  await draw(page,[stroke[0],stroke.at(-1)]);await expect(page.locator('.trace-board')).toBeVisible();
  await page.getByRole('button',{name:'Cuba lagi'}).click();model=await boardModels(page);stroke=model.strokes[0];await draw(page,stroke.toReversed());
  await expect(page.locator('.trace-board')).toBeVisible();await page.getByRole('button',{name:'Cuba lagi'}).click();
  model=await boardModels(page);stroke=model.strokes[0];
  await page.locator('.trace-board').evaluate(svg=>svg.addEventListener('pointerdown',e=>svg.dataset.testPointerId=e.pointerId,{once:true}));
  await page.mouse.move(stroke[0].x,stroke[0].y);await page.mouse.down();for(const p of stroke.slice(1,21)) await page.mouse.move(p.x,p.y);
  const id=Number(await page.locator('.trace-board').getAttribute('data-test-pointer-id'));
  await page.locator('.trace-board').dispatchEvent('pointercancel',{pointerId:id,pointerType:'mouse',bubbles:true});await page.mouse.up();
  await expect(page.locator('.trace-board')).toBeVisible();await complete(page);
});

test('demo never updates progress; reduced motion and keyboard navigation work',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await preview(page,'Ba');
  await page.getByRole('button',{name:'Lihat cara'}).click();
  await expect(page.getByRole('button',{name:'Lihat cara'})).toBeEnabled({timeout:10000});
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')||'{"attempts":[]}').attempts.length)).toBe(0);
  await page.keyboard.press('Tab');expect(await page.evaluate(()=>document.activeElement.tagName)).toBe('BUTTON');
  await complete(page);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts[0].assistance)).toBe(1);
});

test('second contact, capture loss, dragging outside and orientation interruption recover',async({page})=>{
  await preview(page);let model=await boardModels(page),stroke=model.strokes[0];
  await page.locator('.trace-board').evaluate(svg=>svg.addEventListener('pointerdown',e=>svg.dataset.testPointerId=e.pointerId));
  await page.mouse.move(stroke[0].x,stroke[0].y);await page.mouse.down();for(const p of stroke.slice(1,21)) await page.mouse.move(p.x,p.y);
  const id=Number(await page.locator('.trace-board').getAttribute('data-test-pointer-id'));
  await page.locator('.trace-board').dispatchEvent('pointerdown',{pointerId:id+10,pointerType:'touch',button:0,clientX:stroke.at(-1).x,clientY:stroke.at(-1).y});
  await page.locator('.trace-board').dispatchEvent('pointerup',{pointerId:id+10,pointerType:'touch',clientX:stroke.at(-1).x,clientY:stroke.at(-1).y});
  for(const p of stroke.slice(21)) await page.mouse.move(p.x,p.y);await page.mouse.up();
  await expect(page.getByRole('heading',{name:'Bagus, kamu sudah cuba!'})).toBeVisible();
  await page.getByRole('button',{name:'Ulang huruf'}).click();model=await boardModels(page);stroke=model.strokes[0];
  await page.mouse.move(stroke[0].x,stroke[0].y);await page.mouse.down();for(const p of stroke.slice(1,16)) await page.mouse.move(p.x,p.y);
  await page.setViewportSize({width:768,height:1000});await page.mouse.up();
  await expect(page.locator('.trace-board')).toBeVisible();
  model=await boardModels(page);stroke=model.strokes[0];
  await page.mouse.move(stroke[0].x,stroke[0].y);await page.mouse.down();await page.mouse.move(2,2);await page.mouse.up();
  await expect(page.locator('.trace-board')).toBeVisible();await page.getByRole('button',{name:'Cuba lagi'}).click();
  model=await boardModels(page);stroke=model.strokes[0];
  await page.locator('.trace-board').evaluate(svg=>svg.addEventListener('pointerdown',e=>svg.dataset.testPointerId=e.pointerId,{once:true}));
  await page.mouse.move(stroke[0].x,stroke[0].y);await page.mouse.down();for(const p of stroke.slice(1,10)) await page.mouse.move(p.x,p.y);
  await page.locator('.trace-board').evaluate(svg=>svg.releasePointerCapture(Number(svg.dataset.testPointerId)));await page.mouse.up();
  await expect(page.locator('.trace-board')).toBeVisible();await page.getByRole('button',{name:'Cuba lagi'}).click();await complete(page);
});

test('corrupt or unavailable storage stays usable; reset requires a deliberate action',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('taman-jawi.progress.v1','{broken'));
  await preview(page);await complete(page);await page.getByRole('button',{name:'Ruang guru'}).click();
  await page.getByRole('button',{name:'Padam rekod',exact:true}).click();await expect(page.getByRole('group',{name:'Sahkan pemadaman'})).toBeVisible();
  await page.getByRole('button',{name:'Batal',exact:true}).click();await expect(page.getByRole('row').filter({hasText:'Bunga · alif'})).toBeVisible();
  await page.getByRole('button',{name:'Padam rekod',exact:true}).click();await page.getByRole('button',{name:'Ya, padam rekod'}).click();
  await expect(page.getByText('Cubaan yang selesai akan dipaparkan di sini.')).toBeVisible();
  await page.addInitScript(()=>{Storage.prototype.getItem=function(){throw new Error('blocked');};Storage.prototype.setItem=function(){throw new Error('blocked');};});
  await preview(page);await complete(page);await page.getByRole('button',{name:'Ruang guru'}).click();
  await expect(page.getByText(/Storan pelayar tidak tersedia/)).toBeVisible();
});

test('teacher audition uses an actual local WAV; unsupported and denied playback are reported',async({page,browserName})=>{
  await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Ruang guru'}).click();
  await page.locator('input[type=file]').setInputFiles({name:'engineering-fixture.wav',mimeType:'audio/wav',buffer:waveFixture()});
  await page.getByRole('button',{name:'Mainkan rakaman dipilih'}).click();
  if(browserName === 'webkit' && process.platform === 'win32') {
    await expect(page.locator('.audio-notice')).toContainText('Pelayar ini tidak menyokong');
    test.info().annotations.push({type:'runtime limitation',description:'Windows WebKit rejects the actual WAV fixture with NotSupportedError; successful codec playback needs a supported runtime/device.'});
  } else await expect(page.locator('.audio-notice')).toContainText('pratonton dimainkan');
  await page.evaluate(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('blocked','NotAllowedError'));};});
  await page.locator('input[type=file]').setInputFiles({name:'denied-fixture.wav',mimeType:'audio/wav',buffer:waveFixture()});
  await page.getByRole('button',{name:'Mainkan rakaman dipilih'}).click();
  await expect(page.locator('.audio-notice')).toContainText('tidak dapat dimainkan');
});

test('responsive layouts, scrolling and SVG transforms remain accurate',async({page})=>{
  for(const width of [320,768,1280]) {
    await page.setViewportSize({width,height:1000});await preview(page);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.locator('.trace-board').scrollIntoViewIfNeeded();await complete(page);
  }
});

test('coalesced-event fallback and lighter-guided precision use actual input',async({page})=>{
  await page.addInitScript(()=>{try{delete PointerEvent.prototype.getCoalescedEvents;}catch{}});
  await preview(page,'Alif','precision');
  await complete(page);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts[0].outcome)).toBe('precisionComplete');
});

test('quota errors preserve newly completed work in the current session',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('taman-jawi.progress.v1',JSON.stringify({version:1,profile:'Bunga',attempts:[],copies:[]}));
    Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError');};
  });
  await preview(page);await complete(page);await page.getByRole('button',{name:'Ruang guru'}).click();
  await expect(page.getByRole('row').filter({hasText:'Bunga · alif'})).toBeVisible();
  await expect(page.getByText(/Storan pelayar tidak tersedia/)).toBeVisible();
});
