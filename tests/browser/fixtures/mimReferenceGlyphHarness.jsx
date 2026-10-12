// Test-only: real card and shared help glyph without forcing model selection.
import React from 'react';
import {createRoot} from 'react-dom/client';
import letters from '../../../src/content/letters.json';
import {mimReferenceReviewCandidates} from '../../../src/content/reviewCandidates.js';
import {LetterCard} from '../../../src/components/LetterCard.jsx';
import {LetterModelGlyph} from '../../../src/components/LetterModelGlyph.jsx';
const {original,candidate}=mimReferenceReviewCandidates(letters)[0],root=document.createElement('div');document.body.replaceChildren(root);
createRoot(root).render(<main style={{padding:24,display:'flex',gap:32,background:'#fff6df',height:'100vh'}}><section style={{width:240}}><h2>Mim · cadangan 6</h2><LetterCard letter={candidate} enabled index={0} onClick={()=>{}}/><div data-help style={{fontSize:140}}><LetterModelGlyph letter={candidate}/></div></section><section data-approved style={{width:240}}><h2>Mim · murid 5</h2><LetterCard letter={original} enabled index={1} onClick={()=>{}}/></section></main>);
