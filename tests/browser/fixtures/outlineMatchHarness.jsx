// Test-only component harness, separately bundled and never imported by the app.
import React from 'react';
import {createRoot} from 'react-dom/client';
import {MatchScreen} from '../../../src/screens/MatchScreen.jsx';
import {ResultScreen} from '../../../src/screens/ResultScreen.jsx';
import letters from '../../../src/content/letters.json';
import originals from '../../fixtures/four-letter-originals.json';
import familyOriginals from '../../fixtures/ain-family-originals.json';
import mimPrevious from '../../fixtures/mim-video-original.json';
import videoOriginals from '../../fixtures/video-review-originals.json';
import {LetterModelGlyph} from '../../../src/components/LetterModelGlyph.jsx';
import {fourLetterReviewCandidates,ainFamilyReviewCandidates,sinSyinTailReviewCandidates,videoReviewCandidates,haDirectionReviewCandidates,nyaTipReviewCandidates,sadDadReviewCandidates} from '../../../src/content/reviewCandidates.js';
const before=letters.map(letter=>originals.find(original=>original.id===letter.id)||letter);
const familyBefore=letters.map(letter=>familyOriginals.find(original=>original.id===letter.id)||letter);
const params=new URL(location.href).searchParams,approved=params.has('approved');
const letter=approved?letters.find(l=>l.id===params.get('letter')):params.has('sad-dad')?sadDadReviewCandidates(letters).find(p=>p.candidate.id===params.get('letter')).candidate:params.has('nya-tip')?nyaTipReviewCandidates(letters)[0].candidate:params.has('ha-direction')?haDirectionReviewCandidates(letters)[0].candidate:params.has('mim-tail-gap')?videoReviewCandidates(letters.map(letter=>videoOriginals.find(original=>original.id===letter.id)||letter)).find(p=>p.candidate.id==='mim').candidate:params.has('ain-family')?ainFamilyReviewCandidates(familyBefore).find(p=>p.candidate.id===params.get('letter')).candidate:
  params.has('sin-syin-tail')?sinSyinTailReviewCandidates(letters).find(p=>p.candidate.id===params.get('letter')).candidate:fourLetterReviewCandidates(before).find(p=>p.candidate.id===params.get('letter')).candidate;
const audio={preload(){},prime(){},stop(){},subscribeResult:()=>()=>{},play:async()=>({status:'played'})};
const mode=params.get('mode')||'duo';
const config={id:'outline-test',mode,profiles:mode==='duo'?['Bunga','Daun']:['Bunga'],letterIds:[letter.id],limitMs:90000,unscored:!approved};
window.outlineAttempts=[];
const root=document.createElement('div');root.style.height='100%';document.body.replaceChildren(root);
createRoot(root).render(params.has('comparison')?<div style={{display:'flex',gap:24,justifyContent:'center',padding:32,background:'#fff6df'}}>{[[mimPrevious.original,'Original opening'],[letter,'Tiny opening']].map(([model,label])=><div key={label} style={{width:300,textAlign:'center'}}><h2>{label} · {model.contentVersion}</h2><LetterModelGlyph letter={model} model/></div>)}</div>:params.has('result')?<ResultScreen letter={letter} result={{outcome:'playComplete'}} audio={audio} preview onNext={()=>{}} onAgain={()=>{}} onCopy={()=>{}} onGarden={()=>{}}/>:
  <MatchScreen config={config} letters={[letter]} audio={audio} sound={{}} music={null} onAttempt={(snapshot,context)=>window.outlineAttempts.push({letterId:context.letter.id,contentVersion:context.letter.contentVersion,geometryStatus:context.letter.geometry.status,unscored:context.config.unscored})} onFinish={value=>{window.outlineResult=value;}} onExit={()=>{}}/>);
