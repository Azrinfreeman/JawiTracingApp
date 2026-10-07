import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import letters from '../../src/content/letters.json';
import original from '../fixtures/ga-audio-original.json';
import {validateLetter} from '../../src/content/validateContent.js';

const ga=letters.find(letter=>letter.id==='ga');
const candidate=JSON.parse(readFileSync('output/verification/ga-audio-review/user-recording-v7/generation.json'));
const bytes=readFileSync(`public${ga.audio.name.src}`);
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');

describe('authorised complete Ga recording',()=>{
  it('changes audio independently of the approved handwriting revision',()=>{
    const restored=structuredClone(ga);restored.audio.name=structuredClone(original.audio.name);
    expect(restored).toEqual(original);
    expect(validateLetter(ga)).toMatchObject({valid:true,ready:true});
    expect(ga.audio.name.review).toMatchObject({revision:7,kind:'projectOwner',date:'2026-10-06'});
    expect(ga.audio.name.origin.kind).toBe('userProvided');
    expect(ga.audio.name.synthesis).toBeUndefined();
  });

  it('does not reuse approval for the superseded recording',()=>{
    const stale=structuredClone(ga);stale.audio.name.review.revision=original.audio.name.version;
    expect(validateLetter(stale)).toMatchObject({valid:false,ready:false});
  });

  it('packages the complete supplied utterance with speech samples and natural ending intact',()=>{
    expect(hash(bytes)).toBe(candidate.sha256);
    expect(bytes.equals(readFileSync(`public${candidate.src}`))).toBe(true);
    expect(bytes.toString('ascii',0,4)).toBe('RIFF');
    expect(bytes.readUInt16LE(22)).toBe(1);
    const rate=bytes.readUInt32LE(24);expect(rate).toBe(24000);
    expect(bytes.readUInt16LE(34)).toBe(16);
    expect(bytes.readUInt32LE(40)/(rate*2)).toBe(1.05);
    const source=readFileSync('output/verification/ga-audio-review/user-recording-v7/source-user.wav');
    // Include the complete active speech region and its decay, excluding only quiet edge fades.
    const first=.10,last=.90;
    expect(bytes.subarray(44+Math.round(first*rate)*2,44+Math.round(last*rate)*2).equals(
      source.subarray(44+Math.round((1+first)*rate)*2,44+Math.round((1+last)*rate)*2))).toBe(true);
    expect(hash(readFileSync('output/verification/ga-audio-review/user-recording-v7/source-user.m4a'))).toBe(candidate.sourceSha256);
  });
});
