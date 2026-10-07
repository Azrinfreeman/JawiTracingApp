import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import originals from '../fixtures/fa-pa-originals.json';
import {faPaReviewCandidates,videoReviewCandidates} from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
import {stageInstruction,teachingSections,demonstrationPlan} from '../../src/tracing/teachingCues.js';
const before=letters.map(letter=>originals.find(original=>original.id===letter.id)||letter);
const candidates=faPaReviewCandidates(before);
describe('Fa and Pa Qaf direction correction',()=>{
  it('removes the upward starting hook without changing the closed head, tail, dots, sequence or audio',()=>{
    expect(candidates.map(p=>p.candidate.id)).toEqual(['fa','pa']);
    for(const {original,candidate}of candidates){
      const points=candidate.geometry.strokes[0].path.match(/[-\d.]+/g).map(Number);
      // The whole first cubic moves left/down, as Qaf's departure does; no upward detour.
      expect(points[2]).toBeLessThan(points[0]);expect(points[3]).toBeGreaterThan(points[1]);
      for(let i=2;i<=6;i+=2){expect(points[i]).toBeLessThan(points[i-2]);expect(points[i+1]).toBeGreaterThan(points[i-1]);}
      expect(points.slice(-2)).toEqual(points.slice(0,2));
      expect(candidate.geometry.strokes[0].path.split(' C ').slice(2)).toEqual(original.geometry.strokes[0].path.split(' C ').slice(2));
      expect(candidate.geometry.strokes.slice(1)).toEqual(original.geometry.strokes.slice(1));
      expect(candidate.geometry.dotTargets).toEqual(original.geometry.dotTargets);
      expect(candidate.geometry.validSequences).toEqual(original.geometry.validSequences);
      expect(candidate.audio).toEqual(original.audio);
    }
  });
  it('keeps both revised models out of student lessons until their exact revisions are reviewed',()=>{
    const before=JSON.stringify(letters);
    for(const {original,candidate}of candidates){
      expect(candidate.contentVersion).toBe(original.contentVersion+1);
      expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});
      expect(candidate.geometry).toMatchObject({status:'pendingReview',review:null});
      const wrong=structuredClone(candidate);wrong.geometry.status='approved';wrong.geometry.review=original.geometry.review;
      expect(validateLetter(wrong)).toMatchObject({valid:false,ready:false});
    }
    expect(eligibleBook(candidates.map(p=>p.candidate),false)).toHaveLength(0);
    expect(JSON.stringify(letters)).toBe(before);expect(videoReviewCandidates(letters)).toHaveLength(0);
  });
  it('does not offer stale corrections after either base revision changes',()=>{
    const later=letters.map(l=>['fa','pa'].includes(l.id)?{...l,contentVersion:l.contentVersion+1}:l);
    expect(faPaReviewCandidates(later)).toEqual([]);
  });
  it('explains left-first head tracing, lift/restart for the tail, and the remaining dot count',()=>{
    for(const {original,candidate}of candidates){
      const head={kind:'stroke',id:'stroke-1',points:[{number:1}],reference:{length:500}};
      const tail={...head,id:'stroke-2',points:[{number:4}]};
      const start={phase:'awaitingStart',completed:[],progress:{}};
      expect(stageInstruction(candidate,head,start)).toBe('Mula di 1. Ke kiri, kemudian naik mengikut gelung.');
      expect(stageInstruction(candidate,tail,{...start,completed:['stroke-1']})).toBe('Angkat pen. Mula semula di 4. Turun, kemudian ikut ekor ke kiri.');
      expect(stageInstruction(candidate,{kind:'dot',points:[{number:7}]},{...start,completed:['stroke-1','stroke-2']})).toContain(`Tinggal ${candidate.geometry.dotTargets.length} titik`);
      expect(teachingSections(original,'stroke-1')).toEqual([]);
      expect(teachingSections({...candidate,contentVersion:5},'stroke-1')).toEqual([]);
    }
  });
  it('demonstrates the complete head, then tail, then each required dot with pen-up gaps',()=>{
    for(const {candidate}of candidates){
      const references={'stroke-1':{length:500},'stroke-2':{length:600}};
      const plan=demonstrationPlan(candidate,references,null,{});
      expect(plan.map(step=>step.id)).toEqual(candidate.geometry.validSequences[0]);
      expect(plan.slice(0,2).map(step=>[step.from,step.to,step.pause])).toEqual([[0,500,450],[0,600,450]]);
    }
  });
  it('promotes the exact reviewed revisions into student and challenge pools and removes obsolete proposals',()=>{
    expect(faPaReviewCandidates(letters)).toEqual([]);
    for(const {candidate}of candidates){
      const approved=letters.find(letter=>letter.id===candidate.id);
      expect(approved.contentVersion).toBe(4);
      const expected=structuredClone(candidate);expected.geometry.status='approved';expected.geometry.review=approved.geometry.review;
      expect(approved).toEqual(expected);
      expect(approved.geometry.review).toMatchObject({revision:4,date:'2026-10-06',kind:'projectOwner',reference:'docs/CONTENT_APPROVALS.md#approval-of-fa-and-pa-directions-2026-10-06'});
      expect(validateLetter(approved)).toMatchObject({valid:true,ready:true});
      expect(eligibleBook(letters)).toContain(approved);expect(eligiblePool(letters,'ready')).toContain(approved);
    }
  });
  it('retains older attempts and preview records without crediting them as a new student completion',()=>{
    const old=originals.map(letter=>({profile:'Bunga',letterId:letter.id,mode:'play',outcome:'playComplete',preview:false,
      contentVersion:3,geometryStatus:'approved',audioStatus:'approved'}));
    expect(completedBookLetters(letters,{profile:'Bunga',attempts:old},'play').size).toBe(0);
    const current=old.map(attempt=>({...attempt,contentVersion:4}));
    expect(completedBookLetters(letters,{profile:'Bunga',attempts:current},'play').size).toBe(2);
    expect(completedBookLetters(letters,{profile:'Bunga',attempts:current.map(attempt=>({...attempt,preview:true}))},'play').size).toBe(0);
    expect(old.map(attempt=>attempt.contentVersion)).toEqual([3,3]);
  });
});
