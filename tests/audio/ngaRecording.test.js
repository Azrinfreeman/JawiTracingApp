import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import original from '../fixtures/nga-audio-original.json';
import {validateLetter} from '../../src/content/validateContent.js';

const nga=letters.find(letter=>letter.id==='nga');
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
describe('complete supplied Nga pronunciation',()=>{
 it('replaces the synthetic name independently of approved geometry and preserves identity',()=>{
  const restored=structuredClone(nga);restored.audio.name=original.audio.name;expect(restored).toEqual(original);
  expect(nga.labelMs).toBe('Nga');expect(nga.audio.name.transcriptMs).toBe('Nga');
  expect(nga.audio.name.src).toBe('/audio/letters/alphabet/nga-name-v2.wav');
  expect(nga.audio.name).toMatchObject({version:2,status:'approved',origin:{kind:'userProvided'},review:{revision:2,date:'2026-10-07',kind:'projectOwner'}});
  expect(nga.audio.name.synthesis).toBeUndefined();expect(validateLetter(nga)).toMatchObject({valid:true,ready:true});
 });
 it('rejects stale audio approval while leaving handwriting approval intact',()=>{
  const stale=structuredClone(nga);stale.audio.name.review.revision=1;
  expect(validateLetter(stale)).toMatchObject({valid:false,ready:false});expect(stale.geometry).toEqual(original.geometry);
 });
 it('keeps consonant onset and full vowel decay byte-for-byte, fading only quiet margins',()=>{
  const bytes=readFileSync(`public${nga.audio.name.src}`),source=readFileSync('output/verification/nga-audio/source-user.wav');
  expect(hash(bytes)).toBe(nga.audio.name.origin.recordingSha256);
  expect(bytes.toString('ascii',0,4)).toBe('RIFF');expect(bytes.readUInt16LE(22)).toBe(1);
  const rate=bytes.readUInt32LE(24);expect(rate).toBe(24000);expect(bytes.readUInt16LE(34)).toBe(16);
  expect(bytes.readUInt32LE(40)/(rate*2)).toBe(1);
  const start=.70,fade=Math.round(.005*rate)*2;
  expect(bytes.subarray(44+fade,bytes.length-fade).equals(source.subarray(44+Math.round(start*rate)*2+fade,44+Math.round(1.70*rate)*2-fade))).toBe(true);
  const sourceHash=hash(readFileSync('output/verification/nga-audio/source-user.m4a'));
  expect(sourceHash).toBe(nga.audio.name.origin.sha256);
  let clipped=0;for(let i=44;i<bytes.length;i+=2)if(Math.abs(bytes.readInt16LE(i))>=32760)clipped++;
  expect(clipped).toBe(0);expect(bytes.readInt16LE(44)).toBe(0);expect(bytes.readInt16LE(bytes.length-2)).toBe(0);
 });
});
