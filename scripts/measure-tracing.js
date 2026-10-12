import { chromium, expect } from '@playwright/test';
import { cpus, release } from 'node:os';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { openLesson, openTeacher } from '../tests/browser/helpers/tracing.js';
import { dismissSplash } from '../tests/browser/helpers/navigation.js';

const output = process.argv[2] || 'output/verification/tracing-performance.json';
const mode = process.argv[3] || 'guided';
const baseURL = process.env.JAWI_BASE_URL || 'http://127.0.0.1:5173';
const presentation = process.argv[4] || 'full';
const viewports = process.env.JAWI_MEASURE_VIEWPORTS ? JSON.parse(process.env.JAWI_MEASURE_VIEWPORTS) : [{ width: 1024, height: 768 }, { width: 768, height: 1024 }, { width: 3840, height: 2160 }];
const labels = process.env.JAWI_MEASURE_LABELS ? process.env.JAWI_MEASURE_LABELS.split(',') : mode === 'duo' ? ['Duo'] : mode === 'play' ? ['Alif', 'Sin', 'Mim', 'Nya'] : ['Sin'];
const browser = await chromium.launch();
const results = [];
const repeats = Number(process.env.JAWI_MEASURE_REPEATS || 1);
const cpuRate = Number(process.env.JAWI_CPU_RATE || 1);
const traceDirectory = process.env.JAWI_MEASURE_TRACE_DIR;
let servedBuild;
const summary = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const at = p => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] || 0;
  return { count: sorted.length, p50: at(.5), p95: at(.95), max: sorted.at(-1) || 0 };
};
try {
  for (const viewport of viewports) {
    for (const label of labels) {
      for (let repetition = 1; repetition <= repeats; repetition++) {
      const page = await browser.newPage({ viewport, deviceScaleFactor: 1, baseURL });
      // Wrap board handlers before attachment; timing excludes protocol overhead.
      await page.addInitScript(preset => {
        localStorage.setItem('taman-jawi.presentation.v1', preset);
        window.traceMeasure = { batches: [], frames: [], rafWork: [], longTasks: [], active: false,
          attributeWrites: 0, matrixReads: 0, pathVertices: 0, largestPathRewrite: 0, counters: {}, trustedQueueDelay: [] };
        window.__JAWI_TRACE_PERF__ = type => { const m = window.traceMeasure; if (m.active) m.counters[type] = (m.counters[type] || 0) + 1; };
        const raf = window.requestAnimationFrame;
        window.requestAnimationFrame = callback => raf.call(window, timestamp => {
          const m = window.traceMeasure, active = m.active, start = performance.now();
          callback(timestamp); if (active) m.rafWork.push(performance.now() - start);
        });
        const matrix = SVGGraphicsElement.prototype.getScreenCTM;
        SVGGraphicsElement.prototype.getScreenCTM = function() { if (window.traceMeasure.active) window.traceMeasure.matrixReads++; return matrix.call(this); };
        const attribute = Element.prototype.setAttribute;
        Element.prototype.setAttribute = function(name, value) {
          const m = window.traceMeasure;
          if (m.active && this instanceof SVGElement && this.closest('.trace-board')) {
            m.attributeWrites++;
            if (name === 'd' && this.classList.contains('pupil-ink')) {
              const vertices = String(value).match(/[ML]/g)?.length || 0;
              m.pathVertices += vertices; m.largestPathRewrite = Math.max(m.largestPathRewrite, vertices);
            }
          }
          return attribute.call(this, name, value);
        };
        const add = EventTarget.prototype.addEventListener;
        const remove = EventTarget.prototype.removeEventListener;
        const wrappers = new WeakMap();
        EventTarget.prototype.removeEventListener = function(type, handler, options) {
          return remove.call(this, type, wrappers.get(this)?.get(handler) || handler, options);
        };
        EventTarget.prototype.addEventListener = function(type, handler, options) {
          if (this instanceof SVGSVGElement && this.classList.contains('trace-board') && /^pointer(down|move|up)$/.test(type)) {
            const original = handler;
            handler = function(event) {
              const started = performance.now();
              const value = original.call(this, event);
              if (window.traceMeasure.active) {
                window.traceMeasure.batches.push(performance.now() - started);
                if (event.isTrusted && event.timeStamp <= started) window.traceMeasure.trustedQueueDelay.push(started - event.timeStamp);
              }
              return value;
            };
            if (!wrappers.has(this)) wrappers.set(this, new WeakMap());
            wrappers.get(this).set(original, handler);
          }
          return add.call(this, type, handler, options);
        };
        if (PerformanceObserver.supportedEntryTypes.includes('longtask')) new PerformanceObserver(list => {
          if (window.traceMeasure.active) window.traceMeasure.longTasks.push(...list.getEntries().map(e => e.duration));
        }).observe({ type: 'longtask', buffered: false });
      }, presentation);
      if (mode === 'duo') await page.addInitScript(() => { Math.random = () => .99999; });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      if (mode === 'duo') {
        await page.goto('/'); await dismissSplash(page);
        await page.getByRole('button', { name: 'Duo 1v1', exact: true }).click(); await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
        await page.getByRole('button', { name: 'Seterusnya', exact: true }).click(); await page.getByRole('button', { name: 'Uji dua sentuhan' }).click();
        await page.getByRole('button', { name: /Pratonton susun atur dewasa/ }).click();
        for (let slot = 0; slot < 2; slot++) await page.locator(`[data-player-slot="${slot}"]`).getByRole('button', { name: 'Saya sedia!', exact: true }).click();
        await expect(page.locator('.countdown-overlay')).toHaveCount(0);
      } else await openLesson(page, label, mode);
      if (!servedBuild) {
        const urls = await page.evaluate(() => [...document.querySelectorAll('script[src],link[rel="stylesheet"]')].map(node => node.src || node.href));
        servedBuild = Object.fromEntries(await Promise.all(urls.map(async url => [new URL(url).pathname, createHash('sha256').update(await (await page.request.get(url)).body()).digest('hex')])));
      }
      if (cpuRate !== 1) {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpuRate});
      }
      if (traceDirectory) await browser.startTracing(page,{categories:['devtools.timeline','disabled-by-default-devtools.timeline','cc']});
      const data = await page.locator('.trace-board').first().evaluate(async (svg, duo) => {
        const m = window.traceMeasure;
        const boards = duo ? [...document.querySelectorAll('.trace-board')] : [svg];
        for (const board of boards) {
        // Mutation-to-last-dispatch age is not a causal input-to-visible measure.
        // Keep handler and frame timing separate; no synthetic latency claim.
        }
        let previous;
        const frame = t => {
          if (!m.active) return;
          if (previous !== undefined) m.frames.push(t - previous);
          previous = t; requestAnimationFrame(frame);
        };
        const pathsByBoard = boards.map(board => {
        const matrix = board.getScreenCTM();
        return [...board.querySelectorAll('.reference-stroke')].map(path => {
          const length = path.getTotalLength(), count = Math.ceil(length / 5);
          return Array.from({ length: count + 1 }, (_, i) => {
            const p = path.getPointAtLength(length * i / count);
            const q = new DOMPoint(p.x + 2 * Math.sin(i * .37), p.y).matrixTransform(matrix);
            return { clientX: q.x, clientY: q.y };
          });
        });
        });
        let samples = 0;
        const dispatch = (type, p, coalesced = [], slot = 0) => {
          const e = new PointerEvent(type, { ...p, pointerId: 71 + slot, pointerType: 'touch', bubbles: true, buttons: type === 'pointerup' ? 0 : 1 });
          if (coalesced.length) Object.defineProperty(e, 'getCoalescedEvents', { value: () => coalesced.map(q => new PointerEvent('pointermove', { ...q, pointerType: 'touch' })) });
          samples += coalesced.length || 1; boards[slot].dispatchEvent(e);
        };
        // Synthetic events cannot own native capture. Only this harness stubs it.
        boards.forEach(board => { board.setPointerCapture = () => {}; board.hasPointerCapture = () => false; });
        m.active = true; requestAnimationFrame(frame);
        for (let stroke = 0; stroke < pathsByBoard[0].length; stroke++) {
          boards.forEach((_, slot) => dispatch('pointerdown', pathsByBoard[slot][stroke][0], [], slot));
          for (let i = 1; i < pathsByBoard[0][stroke].length; i += 4) {
            await new Promise(requestAnimationFrame);
            boards.forEach((_, slot) => { const batch = pathsByBoard[slot][stroke].slice(i, i + 4); dispatch('pointermove', batch.at(-1), batch, slot); });
          }
          boards.forEach((_, slot) => dispatch('pointerup', pathsByBoard[slot][stroke].at(-1), [], slot));
          await new Promise(requestAnimationFrame);
        }
        // Authored dots follow body strokes, including simultaneous Duo taps.
        const dots = boards.map(board => {
          const matrix = board.getScreenCTM();
          return [...board.querySelectorAll('.reference-dot')].map(dot => {
            const q = new DOMPoint(+dot.getAttribute('cx'), +dot.getAttribute('cy')).matrixTransform(matrix);
            return { clientX:q.x, clientY:q.y };
          });
        });
        for (let i = 0; i < dots[0].length; i++) {
          boards.forEach((_, slot) => { dispatch('pointerdown',dots[slot][i],[],slot); dispatch('pointerup',dots[slot][i],[],slot); });
          await new Promise(requestAnimationFrame);
        }
        await new Promise(requestAnimationFrame); m.active = false;
        return { ...m, samples, foreground: document.visibilityState, phases: boards.map(board => board.dataset.phase), dpr: devicePixelRatio };
      }, mode === 'duo');
      let timeline;
      if (traceDirectory) {
        const trace = await browser.stopTracing(), parsed=JSON.parse(trace.toString());
        const events=Array.isArray(parsed)?parsed:parsed.traceEvents,totals={};
        for(const e of events)if(e.ph==='X'&&e.dur)totals[e.name]=(totals[e.name]||0)+e.dur/1000;
        timeline=Object.fromEntries(['Paint','Layout','UpdateLayoutTree','RasterTask','FunctionCall','EventDispatch','RunTask','Commit'].map(name=>[name,totals[name]||0]));
        mkdirSync(traceDirectory,{recursive:true});
        writeFileSync(`${traceDirectory}/${label.replace(/[^a-z0-9]/gi,'-')}-${presentation}-${viewport.width}-${repetition}.json`,trace);
      }
      let diagnostic;
      if (mode === 'duo') {
        await expect(page.locator('.round-result')).toBeVisible();
        diagnostic = { contentVersion: null, profile: { id: await page.locator('.trace-board').first().getAttribute('data-tolerance-profile') }, timing: null, metrics: { coverage: null }, outcome: 'two independently validated play completions' };
      } else {
      await expect(page.getByRole('heading', { name: mode === 'play' ? `Kamu sudah ikut huruf ${label}!` : 'Bagus, kamu sudah cuba!' })).toBeVisible();
      await openTeacher(page);
      await page.getByRole('tab', { name: 'Diagnostik', exact: true }).click();
      const pending = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Eksport jejak sesi ini' }).click();
      let json = ''; for await (const chunk of await (await pending).createReadStream()) json += chunk;
      diagnostic = JSON.parse(json);
      }
      if (!data.phases.every(phase => phase === 'complete')) throw Error(`Incomplete trace: ${label}: ${data.phases}`);
      results.push({ label, repetition, revision: diagnostic.contentVersion, viewport, dpr: data.dpr, foreground: data.foreground, timelineInclusiveMs:timeline,
        samples: data.samples, profile: diagnostic.profile.id, sampleHandler: diagnostic.timing,
        batchMs: summary(data.batches), frameIntervalMs: summary(data.frames), inputToVisibleMs: null, longTaskMs: data.longTasks,
        rafWorkMs: summary(data.rafWork), attributeWrites: data.attributeWrites, matrixReads: data.matrixReads,
        pathVertices: data.pathVertices, largestPathRewrite: data.largestPathRewrite,
        renderCount: data.counters.render ?? null, diagnosticCount: data.counters.diagnostic ?? null,
        trustedQueueDelayMs: data.trustedQueueDelay.length ? summary(data.trustedQueueDelay) : null,
        allocationGc: 'unavailable in this headless run', phases: data.phases, coverage: diagnostic.metrics.coverage, outcome: diagnostic.outcome,
        replay: mode === 'duo' ? null : { progress:diagnostic.progress, completed:diagnostic.completed, metrics:diagnostic.metrics,
          rawInkHash:createHash('sha256').update(JSON.stringify(diagnostic.rawInk.map(line => line.map(({x,y}) => ({x,y}))))).digest('hex') } });
      console.log(`${label} ${viewport.width}x${viewport.height}: batch p95 ${summary(data.batches).p95.toFixed(2)} ms`);
      await page.close();
      }
    }
  }
  const inputs = ['src/tracing/geometry.js', 'src/tracing/playMatcher.js', 'src/tracing/inputController.js', 'src/components/TraceBoard.jsx', 'src/content/letters.json', 'package-lock.json', 'scripts/measure-tracing.js'];
  const result = { date: new Date().toISOString(), baseURL, platform: process.platform, os: release(), cpu: cpus()[0]?.model,
    node: process.version, browser: browser.version(), mode, presentation, cpuRate, input: 'frame-paced synthetic touch, four ordered coalesced samples per move, 5 logical-unit spacing, fixed sine jitter',
    scope: 'Headless desktop software pipeline screening; no physical device latency or causal input-to-visible measurement. Optional CPU throttling does not model a device GPU, thermal behaviour or touch stack. Timeline totals are inclusive and overlapping, not additive CPU percentages.',
    servedBuild, inputsScope: 'Local files at measurement time; servedBuild identifies the executed production bundle.',
    inputs: Object.fromEntries(inputs.map(p => [p, createHash('sha256').update(readFileSync(p)).digest('hex')])), results };
  mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, JSON.stringify(result, null, 2));
} finally { await browser.close(); }
