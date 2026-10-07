import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import letters from '../../src/content/letters.json';
import original from '../fixtures/va-audio-original.json';
import {validateLetter} from '../../src/content/validateContent.js';
const va=letters.find(l=>l.id==='va'),hash=b=>createHash('sha256').update(b).digest('hex');
it('selects the explicitly authorised user Va fallback without changing handwriting or identity',()=>{
 const restored=structuredClone(va);restored.audio.name=original.audio.name;expect(restored).toEqual(original);
 expect(va.audio.name).toMatchObject({src:'/audio/letters/alphabet/va-name-v2.wav',transcriptMs:'Va',version:2,status:'approved',origin:{kind:'userProvided'},review:{revision:2,date:'2026-10-07',kind:'projectOwner'}});
 expect(va.audio.name.synthesis).toBeUndefined();expect(validateLetter(va)).toMatchObject({valid:true,ready:true});expect(va.contentVersion).toBe(3);
});
it('requires independent approval of the current audio version while preserving geometry approval',()=>{
 const stale=structuredClone(va);stale.audio.name.review.revision=1;expect(validateLetter(stale)).toMatchObject({valid:false,ready:false});expect(stale.geometry).toEqual(original.geometry);
});
it('preserves the full first consonant/vowel/decay PCM without clipping, fades or pitch/gain edits',()=>{
 const wave=readFileSync(`public${va.audio.name.src}`),master=readFileSync('output/verification/va-audio/source-user.wav'),rate=wave.readUInt32LE(24);
 expect(rate).toBe(24000);expect(wave.readUInt16LE(22)).toBe(1);expect(wave.readUInt16LE(34)).toBe(16);expect(wave.readUInt32LE(40)/(rate*2)).toBe(1.1);
 expect(wave.subarray(44).equals(master.subarray(44+Math.round(.70*rate)*2,44+Math.round(1.80*rate)*2))).toBe(true);
 expect(hash(wave)).toBe(va.audio.name.origin.recordingSha256);expect(hash(readFileSync('output/verification/va-audio/source-user.m4a'))).toBe(va.audio.name.origin.sha256);
 let clipped=0;for(let i=44;i<wave.length;i+=2)if(Math.abs(wave.readInt16LE(i))>=32760)clipped++;expect(clipped).toBe(0);expect(wave.readInt16LE(44)).toBe(0);expect(wave.readInt16LE(wave.length-2)).toBe(0);
});
