import {readFileSync,writeFileSync} from 'node:fs';
const edit=(path,fn)=>writeFileSync(path,fn(readFileSync(path,'utf8')));
edit('docs/CONTENT_APPROVALS.md',text=>text.replace(/^(# .+\r?\n)/,'$1\n## Approval of Hamzah straight tail — 2026-10-07\n\nThe project owner (Codex user; name not supplied) marked the lower dent in\nHamzah 4 and approved the described straight diagonal correction with\n“approve and pplease remove remove ye, it\'s should not exist”.\nApproval scope: **Hamzah geometry 5**, straight lower run from 2 to 3,\nupper curves retained, and removal of Ye from the active catalogue. Audio\nremains revision 2. This records the owner\'s approval of the specified edit;\nno later owner audition or teacher assessment is claimed.\n\nSee [implementation and verification](HAMZAH_STRAIGHT_TAIL_AND_YE_REMOVAL.md).\n\n'));
edit('docs/PROJECT_STATE.md',text=>text.replace('37 letters and authored models; **all 37 are owner-approved and student-ready**.','36 letters and authored models; **all 36 are owner-approved and student-ready**.')
 .replace('All 37 name recordings\n  are approved: 30 supplied files and 7 retained synthetic recordings.','All 36 active name recordings\n  are approved: 30 supplied files and 6 retained synthetic recordings. Ye\n  was removed on 7 October; its historical entry, recordings and saves remain.')
 .replace('- **Ha photo order approved', '- **Hamzah straight tail / Ye removal (7 October):** the owner approved the\n  pictured correction and requested removal of Ye. Hamzah 5 now has a straight\n  lower diagonal without the dent; its upper curves and audio remain intact.\n  Ya turns directly to Nya. See [implementation and verification](HAMZAH_STRAIGHT_TAIL_AND_YE_REMOVAL.md).\n- **Ha photo order approved'));
edit('docs/CONTENT_REVIEW.md',text=>text.replace('**37 student-ready lessons as of 2026-10-07**','**36 student-ready lessons as of 2026-10-07**')
 .replace('**Ha 4 photo order', '**Hamzah 5 straight tail is approved:** the owner approved a straight lower\ndiagonal from 2 to 3 on 7 October. Ye is removed from the active catalogue;\nYa and Nya remain. See [verification](HAMZAH_STRAIGHT_TAIL_AND_YE_REMOVAL.md).\n\n**Ha 4 photo order')
 .replace('| Jawi catalogue entries | 37 | Labels/glyphs from the existing research bank |','| Jawi catalogue entries | 36 | Ye removed by the owner; Ya and Nya retained |')
 .replace('| Final handwriting batch | 15 |','| Final handwriting batch | 14 |')
 .replace('| Letter-name recordings | 37 | 29 supplied MP3/WAV recordings and 8 retained synthetic MP3s; owner selections include Ga revision-7 fallback and Nga revision-2 supplied pronunciation |','| Letter-name recordings | 36 | 30 supplied files and 6 retained synthetic MP3s; Ga 7, Nga 2 and Va 2 owner selections retained |')
 .replace('| Current geometry approvals | 37 |','| Current geometry approvals | 36 |')
 .replace('| Audio approvals | 37 |','| Audio approvals | 36 |')
 .replace('| Student-ready lessons | 37 |','| Student-ready lessons | 36 |')
 .replace('| Numbered tracing guidance | All 37 authored models |','| Numbered tracing guidance | All 36 active models |')
 .replace('All 37 models are approved at their current revisions.','All 36 active models are approved at their current revisions.')
 .replace('All 37 current name recordings were subsequently approved','The original 37 name recordings were subsequently approved'));
edit('docs/AUDIO_RECORDING.md',text=>text.replace('37 letter-name recordings are connected:','36 letter-name recordings are connected:')
 .replace('and 7 retained\nsynthetic MP3s.','and 6 retained\nsynthetic MP3s. Ye was removed from the game on 7 October; its old MP3\nand historical approval remain preserved.'));
edit('README.md',text=>text.replace(/the 37 approved lessons/g,'the 36 approved lessons')
 .replace('**Teaching readiness:** 37 catalogue entries and tracing models, all 37 owner-approved and','**Teaching readiness:** 36 active catalogue entries and tracing models, all 36 owner-approved and')
 .replace('listen to all 37','listen to all 36 active')
 .replace('Adult preview includes all 37 models.','Adult preview includes all 36 active models.')
 .replace("The final 15 models—Ta marbutah, Ta (ط), Za, Ain, Ghain, Nga, Fa, Pa, Qaf, Ga,\nVa, Ha (ه), Hamzah, Ye and Nya—were approved at revision 2. Ga's corrected\nrevision 3 now awaits fresh review.","The final batch now contains 14 active models—Ta marbutah, Ta (ط), Za, Ain,\nGhain, Nga, Fa, Pa, Qaf, Ga, Va, Ha (ه), Hamzah and Nya. Ye was removed by\nthe owner on 7 October. All current revisions are owner-approved; Hamzah 5\nuses the straight lower tail. See [the latest checks](docs/HAMZAH_STRAIGHT_TAIL_AND_YE_REMOVAL.md)."));
console.log('Current inventory and approval documentation updated; dated prior records preserved.');
