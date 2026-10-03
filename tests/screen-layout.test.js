import { describe, it, expect } from 'vitest';
import { fitTraceViewport, gridCapacity } from '../src/game/screenLayout.js';
const letter={geometry:{dotTargets:[{x:700,y:150,visibleRadius:20}]}};
const reference={body:{vertices:[{x:300,y:250},{x:650,y:800}]}};
describe('screen layout',()=>{
 for(const [width,height] of [[1920,800],[700,700],[360,540]])it(`uniform fit contains the whole letter and dots at ${width}x${height}`,()=>{
  const box=fitTraceViewport(letter,reference,width,height);
  expect(box.width/box.height).toBeCloseTo(width/height,8);
  expect(box.x+box.width/2).toBe(510);expect(box.y+box.height/2).toBe(465);
  expect(box.x).toBeLessThanOrEqual(188);expect(box.x+box.width).toBeGreaterThanOrEqual(832);
  expect(box.y).toBeLessThanOrEqual(18);expect(box.y+box.height).toBeGreaterThanOrEqual(912);
 });
 it('copying preserves the original coordinate frame',()=>expect(fitTraceViewport(letter,reference,1200,700,true)).toEqual({x:0,y:0,width:1000,height:1000}));
 it('fits are independent of live progress',()=>{const before=fitTraceViewport(letter,reference,1000,600);expect(fitTraceViewport({...letter,progress:{body:300},phase:'complete'},reference,1000,600)).toEqual(before);});
 it('pagination assigns only cards that can fit their measured rows',()=>{const grid=gridCapacity(720,420,150,146);expect(grid).toEqual({columns:4,rows:2,capacity:8});expect(gridCapacity(360,100,150,146).capacity).toBe(2);});
});
