// Test-only: exercise shared glyph selection without forcing model=true.
import React from 'react';
import {createRoot} from 'react-dom/client';
import letters from '../../../src/content/letters.json';
import {wauVaSmallerHeadReviewCandidates} from '../../../src/content/reviewCandidates.js';
import {LetterCard} from '../../../src/components/LetterCard.jsx';
import {LetterModelGlyph} from '../../../src/components/LetterModelGlyph.jsx';
const proposals=wauVaSmallerHeadReviewCandidates(letters),root=document.createElement('div');document.body.replaceChildren(root);
createRoot(root).render(<main style={{padding:24,display:'flex',gap:32,background:'#fff6df',height:'100vh'}}>{proposals.map(({original,candidate},index)=><section key={candidate.id} style={{width:220}}><h2>{candidate.labelMs} · {candidate.contentVersion}</h2><LetterCard letter={candidate} enabled index={index} onClick={()=>{}}/><div data-help={candidate.id} style={{fontSize:120}}><LetterModelGlyph letter={candidate}/></div><p>Current student card</p><div data-approved><LetterCard letter={original} enabled index={index} onClick={()=>{}}/></div></section>)}</main>);
