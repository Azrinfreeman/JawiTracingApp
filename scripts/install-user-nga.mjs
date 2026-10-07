import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,ok} from 'node:assert';

const root='output/verification/nga-audio',read=path=>JSON.parse(readFileSync(path,'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const source=read(`${root}/source.json`),raw=readFileSync('src/content/letters.json');
strictEqual(hash(raw),source.catalogueSha256);
for(const [src,sha]of Object.entries(source.protectedRecordings))strictEqual(hash(readFileSync(`public${src}`)),sha,src);
const letters=JSON.parse(raw),nga=letters.find(letter=>letter.id==='nga');
strictEqual(nga.audio.name.version,1);
const src='/audio/letters/alphabet/nga-name-v2.wav';
ok(!existsSync(`public${src}`),'Never overwrite a released audio file.');
ok(!existsSync(`${root}/generation.json`),'Preserve existing preparation evidence.');
const master=readFileSync(`${root}/source-user.wav`),rate=master.readUInt32LE(24);
strictEqual(rate,24000);strictEqual(master.readUInt16LE(22),1);strictEqual(master.readUInt16LE(34),16);
// Retain the full first utterance, from before consonant onset through vowel decay.
// Only silence is trimmed; no pitch, timing, filtering or gain changes.
const start=.70,end=1.70,fade=Math.round(.005*rate);
const pcm=Buffer.from(master.subarray(44+Math.round(start*rate)*2,44+Math.round(end*rate)*2));
for(let i=0;i<fade;i++){
 const first=pcm.readInt16LE(i*2),last=pcm.readInt16LE(pcm.length-2-i*2);
 ok(Math.abs(first)<50&&Math.abs(last)<50,'Fade only near-silent edges.');
 pcm.writeInt16LE(Math.round(first*i/(fade-1)),i*2);pcm.writeInt16LE(Math.round(last*i/(fade-1)),pcm.length-2-i*2);
}
const wave=Buffer.concat([master.subarray(0,44),pcm]);wave.writeUInt32LE(wave.length-8,4);wave.writeUInt32LE(pcm.length,40);
writeFileSync(`public${src}`,wave,{flag:'wx'});
writeFileSync('tests/fixtures/nga-audio-original.json',JSON.stringify(nga,null,2)+'\n',{flag:'wx'});
const editing={sourceStartSeconds:start,sourceEndSeconds:end,fadeMs:5,speechRegionStartApprox:.84,speechRegionEndApprox:1.64,
 method:'Complete first supplied utterance, with surrounding silence retained. Pitch, rate, gain and speech samples unchanged; fades affect near-silent edges only.'};
const owner='Project owner (Codex user; name not supplied)';
nga.audio.name={src,transcriptMs:'Nga',version:2,status:'approved',
 review:{revision:2,reviewer:owner,date:'2026-10-07',reference:'docs/AUDIO_APPROVALS.md#selection-of-supplied-nga-recording-2026-10-07',kind:'projectOwner'},
 permission:'Project owner supplied Recording (5).m4a and requested Nga audio match it in Codex on 2026-10-07. Its complete first utterance is used directly for this correction.',
 origin:{kind:'userProvided',reference:'User attachment Recording (5).m4a; docs/NGA_AUDIO_CORRECTION.md',speaker:'User-supplied speaker; identity not assessed',
 sha256:source.sourceSha256,recordingSha256:hash(wave),processing:editing}};
writeFileSync('src/content/letters.json',JSON.stringify(letters,null,2)+'\n');
const generation={date:'2026-10-07',letterId:'nga',version:2,transcriptMs:'Nga',src,bytes:wave.length,sha256:hash(wave),duration:pcm.length/(rate*2),rate,editing,
 sourceSha256:source.sourceSha256,quote:"for this voice alphabet, the spelling is wrong, it's not n-g, it's nga. Like my recording, can you do it?",
 scope:'Direct use of the supplied target pronunciation to replace the Nga synthetic recording. No synthetic pronunciation assessment or named teacher review inferred.',reviewer:owner};
writeFileSync(`${root}/generation.json`,JSON.stringify(generation,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({src,version:2,duration:generation.duration,bytes:wave.length,sha256:generation.sha256}));
