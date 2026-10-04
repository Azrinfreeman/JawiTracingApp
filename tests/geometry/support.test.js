import { describe,it,expect,vi } from 'vitest';
import letters from '../../src/content/letters.json';
import { validateCatalogue,validateLetter } from '../../src/content/validateContent.js';
import { GLYPH_MATCHED_IDS } from '../fixtures/glyphMatched.js';
import { createProgressStore,STORAGE_KEY } from '../../src/storage/progressStore.js';
import { createAudioManager } from '../../src/audio/audioManager.js';
import { traceReducer,initialTraceState } from '../../src/tracing/traceReducer.js';
import { screenToLogical } from '../../src/tracing/geometry.js';

describe('content readiness',()=>{
  it('includes 37 models with revised models gated for fresh geometry review',()=>{
    const result=validateCatalogue(letters); expect(result.errors).toEqual([]);
    expect(letters).toHaveLength(37); expect(letters.filter(l=>l.pilot)).toHaveLength(12);
    expect(letters.filter(l=>l.geometry.strokes.length)).toHaveLength(37);
    // Kaf/Ga and the glyph-matched redraws may await review; nothing else may leave the approved pool.
    const pending=letters.filter(l=>l.geometry.status!=='approved').map(l=>l.id);
    expect(pending.every(id=>['kaf','ga',...GLYPH_MATCHED_IDS].includes(id))).toBe(true);
    expect(result.results.filter(r=>r.ready)).toHaveLength(37-pending.length);
    expect(result.results.filter(r=>!r.ready).map(r=>r.id)).toEqual(pending);
    expect(letters.filter(l=>l.additional)).toHaveLength(6);
  });
  it('rejects fake approval, empty approved models and missing recordings',()=>{
    const letter=structuredClone(letters[0]); letter.geometry.status='approved'; letter.geometry.review=null;
    letter.audio.name.status='pendingReview'; letter.audio.name.review=null;
    expect(validateLetter(letter).valid).toBe(false);
    letter.geometry.review={revision:1,reviewer:'Fixture reviewer',date:'2026-10-02',reference:'Synthetic test only'};
    expect(validateLetter(letter).ready).toBe(false);
    letter.audio.name.status='approved'; expect(validateLetter(letter).valid).toBe(false);
    letter.geometry.strokes=[]; expect(validateLetter(letter).valid).toBe(false);
  });
  it('rejects malformed paths, NaN dots, duplicate IDs and sequence omissions',()=>{
    for(const path of ['<svg onload="evil()"/>','M 0 0 M 20 20','M 0 0 Q 1','M 0 0 L 1e999 2']) {
      const l=structuredClone(letters[0]); l.geometry.strokes[0].path=path; expect(validateLetter(l).valid).toBe(false);
    }
    const l=structuredClone(letters[1]); l.geometry.dotTargets[0].x=NaN; expect(validateLetter(l).valid).toBe(false);
    const b=structuredClone(letters[1]); b.geometry.dotTargets[0].id=b.geometry.strokes[0].id; expect(validateLetter(b).valid).toBe(false);
    const s=structuredClone(letters[1]); s.geometry.validSequences=[['stroke-1']]; expect(validateLetter(s).valid).toBe(false);
    expect(validateCatalogue([letters[0],letters[0]]).valid).toBe(false);
  });
});
describe('storage and state',()=>{
  it('falls back to memory with unavailable storage and recovers corrupt/versioned data',()=>{
    const unavailable={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}};
    const store=createProgressStore(unavailable); expect(store.read().version).toBe(1);
    store.setProfile('Bintang'); expect(store.read().profile).toBe('Bintang'); expect(store.isAvailable()).toBe(false);
    for(const raw of ['{broken',JSON.stringify({version:99}),JSON.stringify({version:1,profile:'Bunga',attempts:[{}],copies:[{}]})]) {
      const s=createProgressStore({getItem:()=>raw,setItem(){}}); expect(s.read().attempts).toEqual([]);
    }
  });
  it('round-trips local profiles, export and deliberate reset',()=>{
    const map=new Map(); const storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
    const s=createProgressStore(storage); s.setProfile('Daun');
    expect(createProgressStore(storage).read().profile).toBe('Daun');
    expect(JSON.parse(s.export()).profile).toBe('Daun');
    s.reset(); expect(JSON.parse(map.get(STORAGE_KEY)).profile).toBe('Bunga');
  });
  it('keeps current work in memory after a quota error instead of loading stale stored data',()=>{
    let raw=JSON.stringify({version:1,profile:'Daun',attempts:[],copies:[]});
    const store=createProgressStore({getItem:()=>raw,setItem(){throw new Error('QuotaExceededError');}});
    expect(store.read().profile).toBe('Daun');store.setProfile('Bintang');
    expect(store.read().profile).toBe('Bintang');expect(store.isAvailable()).toBe(false);
    expect(JSON.parse(store.export()).profile).toBe('Bintang');
  });
  it('demo state records assistance without a completion action',()=>{
    let s=traceReducer(initialTraceState,{type:'DEMO'});
    expect(s.assistance).toBe(1); expect(s.demo).toBe(true); expect(s.outcome).toBeUndefined();
    expect(s.attempt).toBe(initialTraceState.attempt);
    s=traceReducer(s,{type:'DEMO_END'}); expect(s.demo).toBe(false);
    s=traceReducer(s,{type:'RETRY'}); expect(s.retries).toBe(1);
  });
  it('round-trips legacy and strict summaries together without relabelling old work',()=>{
    const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
    const legacy={id:'legacy-fixture',timestamp:'2026-10-02T00:00:00Z',profile:'Daun',letterId:'ta',mode:'guided',pointerType:'mouse',toleranceProfile:'guided-pen-mouse-standard-v1',metrics:{coverage:1,meanError:0,invalidTravel:10,invalidEvents:1},assistance:0,retries:0};
    const strict={...legacy,id:'strict-fixture',toleranceProfile:'guided-pen-mouse-standard-v2',interactionPolicy:'strict-v2',inkPolicy:'validatedSegments',dotInputPolicy:'validatedTapStamp',metrics:{...legacy.metrics,blockedGestures:1,wrongStartGestures:0,rejectedDotGestures:1,rollbackCount:0}};
    const play={...legacy,id:'play-fixture',mode:'play',outcome:'playComplete',toleranceProfile:'play-pen-mouse-standard-v1',interactionPolicy:'play-guided-v1',inkPolicy:'assistedRouteFill',dotInputPolicy:'validatedTapOrEquivalentPad',displayAssistance:'routeFill',metrics:{...legacy.metrics,pauseEpisodes:1,resumeCount:1,equivalentDotActions:2,terminalDisplayFillUnits:5,diagnosticRotations:0}};
    const current={...play,id:'play-v2-fixture',toleranceProfile:'play-pen-mouse-standard-v2',interactionPolicy:'play-guided-v2',metrics:{...play.metrics,endpointConfirmations:1,releaseAssistances:1}};
    const store=createProgressStore(storage);store.addAttempt(legacy);store.addAttempt(strict);store.addAttempt(play);store.addAttempt(current);
    const records=createProgressStore(storage).read().attempts;
    expect(records).toEqual([legacy,strict,play,current]);expect(records[0].interactionPolicy).toBeUndefined();
    expect(JSON.parse(store.export()).attempts[1].dotInputPolicy).toBe('validatedTapStamp');
    storage.setItem(STORAGE_KEY,JSON.stringify({version:1,profile:'Daun',attempts:[legacy,{...strict,metrics:{...strict.metrics,blockedGestures:'bad'}},{...current,metrics:{...current.metrics,endpointConfirmations:-1}},{...current,metrics:{...current.metrics,releaseAssistances:'bad'}}],copies:[]}));
    expect(createProgressStore(storage).read().attempts).toEqual([legacy]);
  });
  it('maps equivalent screen coordinates to stable logical positions without DPR scaling',()=>{
    for(const [scale,left,top] of [[.32,10,70],[.768,30,120],[1.28,70,20]]) {
      const svg={getScreenCTM:()=>({inverse:()=>({scale,left,top})}),createSVGPoint:()=>({matrixTransform(m){return {x:(this.x-m.left)/m.scale,y:(this.y-m.top)/m.scale};}})};
      const logical=screenToLogical(svg,500*scale+left,600*scale+top);
      expect(logical.x).toBeCloseTo(500,10); expect(logical.y).toBeCloseTo(600,10);
    }
  });
});
describe('audio lifecycle',()=>{
  const fake = () => ({play:vi.fn().mockResolvedValue(undefined),pause:vi.fn(),load:vi.fn(),removeAttribute:vi.fn()});
  it('missing or unapproved audio never plays another letter',async()=>{
    const element=fake(),manager=createAudioManager(()=>element);
    expect(await manager.play({src:null,status:'approved'})).toEqual({ok:false,reason:'missing'});
    expect(await manager.play({src:'/audio/draft.mp3',status:'draft'})).toEqual({ok:false,reason:'missing'});
    expect(element.play).not.toHaveBeenCalled();
  });
  it('handles autoplay rejection, replay, mute and volume',async()=>{
    const element=fake(); element.play.mockRejectedValueOnce(Object.assign(new Error('denied'),{name:'NotAllowedError'}));
    const manager=createAudioManager(()=>element); const recording={src:'/audio/alif.mp3',status:'approved'};
    expect((await manager.play(recording)).reason).toBe('blocked');
    manager.setMuted(true); manager.setVolume(.3);
    expect(await manager.play(recording)).toEqual({ok:true}); expect(element.muted).toBe(true); expect(element.volume).toBe(.3);
    manager.stop(); expect(element.pause).toHaveBeenCalled();
  });
  it('allows a pending synthetic recording only in adult preview without approving it',async()=>{
    const element=fake(),manager=createAudioManager(()=>element);
    const recording={src:'/audio/letters/alif-name.mp3',status:'pendingReview',review:null};
    expect((await manager.play(recording)).reason).toBe('missing');
    expect(element.play).not.toHaveBeenCalled();
    expect(await manager.play(recording,{preview:true})).toEqual({ok:true});
    expect(recording.status).toBe('pendingReview');expect(recording.review).toBeNull();
  });
  it('stops stale narration after switching letters during a pending play',async()=>{
    let resolve; const first=fake(),second=fake(); first.play.mockImplementation(()=>new Promise(r=>resolve=r));
    const manager=createAudioManager(vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second));
    const pending=manager.play({src:'/audio/alif.mp3',status:'approved'});
    await manager.play({src:'/audio/ba.mp3',status:'approved'}); resolve();
    expect((await pending).reason).toBe('obsolete'); expect(first.pause).toHaveBeenCalled();
  });
  it('distinguishes a codec failure from a denied user gesture',async()=>{
    const element=fake();element.play.mockRejectedValueOnce(Object.assign(new Error('codec unavailable'),{name:'NotSupportedError'}));
    const manager=createAudioManager(()=>element);
    expect((await manager.play({src:'/audio/fixture.wav',status:'approved'})).reason).toBe('unsupported');
  });
});
