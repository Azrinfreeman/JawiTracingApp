import {describe, it, expect} from 'vitest';
import letters from '../../src/content/letters.json';
import videoOriginals from '../fixtures/video-review-originals.json';
import {makeReference, pointAt} from '../../src/tracing/geometry.js';
import {createPlayMatcher} from '../../src/tracing/playMatcher.js';
import {getProfile} from '../../src/tracing/profiles.js';
import {numberedGuidePlan, placeNumberedGuides, visibleGuideIndexes} from '../../src/tracing/numberedGuides.js';
import {stageInstruction, teachingSections, demonstrationPlan} from '../../src/tracing/teachingCues.js';
import {videoReviewCandidates} from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook} from '../../src/game/bookNavigation.js';

// Actual authored absolute Beziers; no browser or independently redrawn fixtures.
function reference(path) {
  const tokens = path.match(/[MCQL]|-?\d+(?:\.\d+)?/g), points = []; let current;
  for (let i=0;i<tokens.length;) {
    const command = tokens[i++], count = {M:1,L:1,Q:2,C:3}[command];
    if (!count) throw new Error(`Unsupported test path command ${command}`);
    const control = Array.from({length:count}, () => ({x:+tokens[i++],y:+tokens[i++]}));
    if (command === 'M') {current=control[0];points.push(current);continue;}
    for (let j=1;j<=200;j++) {
      let values=[current,...control], t=j/200;
      while (values.length>1) values=values.slice(1).map((p,k)=>({x:values[k].x*(1-t)+p.x*t,y:values[k].y*(1-t)+p.y*t}));
      points.push(values[0]);
    }
    current=control.at(-1);
  }
  return makeReference(points);
}
const refsFor = letter => Object.fromEntries(letter.geometry.strokes.map(stroke=>[stroke.id,reference(stroke.path)]));
function offsetPoint(ref,s,offset) {
  const p=pointAt(ref,s),a=pointAt(ref,Math.max(0,s-3)),b=pointAt(ref,Math.min(ref.length,s+3));
  const length=Math.hypot(b.x-a.x,b.y-a.y)||1;
  return {x:p.x-(b.y-a.y)*offset/length,y:p.y+(b.x-a.x)*offset/length};
}

describe('video tracing regressions', () => {
  it.each(['sad','dad'])('%s completes its real tight turn across coarse spacing and shifted contacts', id => {
    const letter=letters.find(l=>l.id===id), refs=refsFor(letter);
    for (const type of ['touch','pen']) for (const interval of [24,32,40]) for (const shift of [0,8]) for(const offset of [-4,0,4]) {
      const engine=createPlayMatcher(letter,refs,getProfile('play',type));
      for (const part of letter.geometry.validSequences[0]) {
        if (refs[part]) {
          const ref=refs[part];engine.start(offsetPoint(ref,0,offset));
          for(let arc=interval+shift;arc<ref.length;arc+=interval) engine.move(offsetPoint(ref,arc,offset));
          engine.move(offsetPoint(ref,ref.length,offset));engine.end(offsetPoint(ref,ref.length,offset));
        } else {const dot=letter.geometry.dotTargets.find(d=>d.id===part);engine.start(dot);engine.end(dot);}
      }
      const result=engine.snapshot();
      expect(result.phase,`${id} ${type} ${interval} ${shift} offset ${offset}: ${JSON.stringify({completed:result.completed,progress:result.progress,pauses:result.metrics.pauseEpisodes})}`).toBe('complete');
      expect(engine.snapshot().metrics.turnProjectionAllowanceUnits).toBeLessThanOrEqual(letter.geometry.strokes.length*getProfile('play',type).turnAllowance+.001);
    }
  });
  it('Ta marbutah shows one readable start/stop marker without moving either contact anchor', () => {
    const letter=letters.find(l=>l.id==='ta-marbuta'), refs=refsFor(letter), part=numberedGuidePlan(letter,refs)[0];
    for(const scale of [.3,.75,1.8]) {
      const placed=placeNumberedGuides(part,letter,refs,scale);
      expect(visibleGuideIndexes(placed,0)).toEqual([true,true,false]);
      expect(visibleGuideIndexes(placed,.96)).toEqual([false,true,true]);
      expect(placed[0].anchor).toEqual(pointAt(refs[part.id],0));
      expect(placed[2].anchor).toEqual(pointAt(refs[part.id],refs[part.id].length));
    }
  });
  it.each(['sad','dad'])('%s still rejects bowl shortcuts and repeated reversal at the turn',id=>{
    const letter=letters.find(l=>l.id===id),refs=refsFor(letter);
    for(const type of ['touch','pen'])for(const attack of ['shortcut','reversal']) {
      const engine=createPlayMatcher(letter,refs,getProfile('play',type));
      const head=refs['stroke-1'];engine.start(pointAt(head,0));
      for(let s=4;s<head.length;s+=4)engine.move(pointAt(head,s));
      engine.move(pointAt(head,head.length));engine.end(pointAt(head,head.length));
      const tail=refs['stroke-2'];engine.start(pointAt(tail,0));
      for(let s=4;s<=96;s+=4)engine.move(pointAt(tail,s));
      if(attack==='shortcut')engine.move(pointAt(tail,tail.length));
      else for(let cycle=0;cycle<5;cycle++)for(const s of [64,32,64,96])engine.move(pointAt(tail,s));
      engine.end(pointAt(tail,tail.length));
      expect(engine.snapshot().phase,`${id} ${type} ${attack}`).not.toBe('complete');
      expect(engine.snapshot().completed).toEqual(['stroke-1']);
      // Revised catalogue routes are longer: the attack must stop within the
      // first quarter, before the bowl, rather than use the old model's length.
      expect(engine.snapshot().progress['stroke-2']).toBeLessThan(tail.length*.25);
      expect(engine.snapshot().metrics.pauseEpisodes).toBeGreaterThan(0);
    }
  });
  it('lift, recovery and final-dot instructions follow committed progress', () => {
    const letter=letters.find(l=>l.id==='nga'), refs=refsFor(letter), plan=numberedGuidePlan(letter,refs);
    const view={phase:'awaitingStart',completed:['stroke-1'],progress:{'stroke-2':0}};
    expect(stageInstruction(letter,plan[1],view)).toBe('Angkat pen. Mula semula di 4.');
    expect(stageInstruction(letter,plan[1],{...view,phase:'paused',reason:'wrongStart'})).toBe('Mula pada bulatan hijau.');
    expect(stageInstruction(letter,plan[1],{...view,phase:'paused'})).toBe('Sambung dari anak panah.');
    expect(stageInstruction(letter,plan.at(-1),{...view,phase:'awaitingMark',completed:['stroke-1','stroke-2','dot-1','dot-2']})).toContain('Tinggal 1 titik');
    expect(plan.at(-1).points[0].label).toBe('Titik akhir');
    expect(stageInstruction(letter,plan.at(-1),{...view,phase:'complete'})).toBe('');
  });
  it('section demos begin at accepted progress and stale teaching overrides fall back', () => {
    const letter=letters.find(l=>l.id==='ha'), refs=refsFor(letter), length=refs['stroke-1'].length;
    const plan=demonstrationPlan(letter,refs,'stroke-1',{'stroke-1':length*.45},true);
    expect(plan[0].from).toBeCloseTo(length*.45);expect(plan.at(-1).to).toBe(length);
    expect(plan.every(step=>step.pause>0)).toBe(true);
    // Revision 4 now has the separately reviewed outer-first route; 5 has no override.
    expect(teachingSections({...letter,contentVersion:5},'stroke-1')).toEqual([]);
  });
  it('review proposals are valid and independently gated, preserving every original and its audio', () => {
    const before=JSON.stringify(letters), proposals=videoReviewCandidates(letters.map(letter=>videoOriginals.find(original=>original.id===letter.id)||letter));
    expect(proposals.map(p=>p.candidate.id)).toEqual(['mim','ta-marbuta','hamzah','jim']);
    for(const {original,candidate} of proposals) {
      expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});
      expect(candidate.contentVersion).toBe(original.contentVersion+(candidate.id==='mim'?3:1));
      expect(candidate.geometry.review).toBeNull();expect(candidate.audio).toEqual(original.audio);
      expect(eligibleBook([candidate],false)).toHaveLength(0);
      expect(eligibleBook([candidate],true)).toHaveLength(1);
    }
    expect(JSON.stringify(letters)).toBe(before);expect(eligibleBook(letters,false)).toHaveLength(36);
  });
});
