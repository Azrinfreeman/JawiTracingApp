import {describe,it,expect,vi} from 'vitest';
import {createAudioManager,voiceMessage} from '../../src/audio/audioManager.js';
const recording={src:'/audio/test.mp3',status:'approved',version:1};
function harness() {
  const elements=[];
  const manager=createAudioManager(()=>{const el={play:vi.fn().mockResolvedValue(),pause:vi.fn(),load:vi.fn(),removeAttribute:vi.fn()};elements.push(el);return el;});
  const results=[];manager.subscribeResult(event=>results.push(event));
  return {manager,elements,results};
}
describe('voice recovery',()=>{
  it('primes silently from a gesture and reuses that player for narration',async()=>{
    const {manager,elements,results}=harness();manager.preload(recording);
    expect(await manager.prime(recording)).toBe(true);expect(elements[0].play).toHaveBeenCalledTimes(1);
    expect(results).toEqual([]);expect(elements[0].pause).toHaveBeenCalled();
    expect(await manager.play(recording)).toEqual({ok:true});expect(elements).toHaveLength(1);
    expect(elements[0].muted).toBe(false);expect(results.at(-1).src).toBe(recording.src);
  });
  it('reports a late decode failure, clears it on replay, and ignores stale callbacks',async()=>{
    const {manager,elements,results}=harness();await manager.play(recording);
    const oldError=elements[0].onerror;elements[0].error={code:4};oldError();
    expect(results.at(-1)).toMatchObject({ok:false,reason:'unsupported',late:true});
    await manager.play(recording);expect(voiceMessage(results.at(-1))).toBe('');
    const length=results.length;oldError();expect(results).toHaveLength(length);
  });
  it('a cancelled prime cannot pause or mute a newer name request',async()=>{
    const {manager,elements}=harness();manager.preload(recording);
    let release;elements[0].play.mockImplementationOnce(()=>new Promise(resolve=>{release=resolve;}));
    const prime=manager.prime(recording);await manager.play(recording);release();
    expect(await prime).toBe(false);expect(elements[1].muted).toBe(false);
  });
  it('an obsolete prime cannot interrupt a newer prime on the reused player',async()=>{
    const {manager,elements}=harness();manager.preload(recording);
    let releaseFirst,releaseSecond;
    elements[0].play.mockImplementationOnce(()=>new Promise(resolve=>{releaseFirst=resolve;}))
      .mockImplementationOnce(()=>new Promise(resolve=>{releaseSecond=resolve;}));
    const first=manager.prime(recording);manager.stop();const second=manager.prime(recording);
    const pauses=elements[0].pause.mock.calls.length;releaseFirst();expect(await first).toBe(false);
    expect(elements[0].pause).toHaveBeenCalledTimes(pauses);
    expect(elements[0].muted).toBe(true);expect(elements[0].__jawiPrime).toBe(true);
    releaseSecond();expect(await second).toBe(true);expect(elements[0].muted).toBe(false);
  });
  it('keeps bounded failure evidence and distinguishes muted, unavailable and obsolete states',async()=>{
    const {manager}=harness();for(let n=0;n<40;n++)await manager.play(null);
    expect(manager.diagnostic().results).toHaveLength(32);
    expect(voiceMessage({ok:true,reason:'muted'})).toContain('disenyapkan');
    expect(voiceMessage({ok:false,reason:'missing'})).toContain('belum tersedia');
    expect(voiceMessage({ok:false,reason:'obsolete'})).toBe('');
  });
});
