# Drawing proposals from the 23 videos

6 October 2026, Asia/Kuala_Lumpur. **Seven proposals are pending review.** The owner's “proceed” authorised their implementation and preview, not approval of their teaching geometry. The 37 student models, their versions and their approvals remain unchanged. No named teacher assessment has been recorded.

In the game, open **Ruang guru → Huruf → Semakan video · bandingkan cadangan**. Page through the comparisons. **Langkah cadangan** explains each movement. **Semak … asal/cadangan** opens the actual tracing preview; use **Menu → Tunjuk cara** to see the route, pen lifts and dots. Preview attempts retain `preview: true` and the candidate's pending status.

An [independent animated comparison](../output/verification/fix-video-implementation/content-review.html) is also available. It shows the actual vector paths at adjustable speed. The animation draws retraced sections rather than jumping between them. Fourteen original/proposal animations were checked, with no page errors and no horizontal overflow at 320 pixels.

| Letter | Approved → proposed version | Proposed movement | Decision needed |
| --- | --- | --- | --- |
| Mim | 2 → 3 | Start at the head/tail join, rise along the missing left edge, close the head, then continue down the existing tail in one stroke. | Confirm the closed head, new start and continuous order suit the lesson. |
| Ta marbutah | 3 → 4 | One closed loop from its top; remove the initial nub; retain two separate upper dots. | Confirm the loop shape, join and start direction. |
| Ain | 3 → 4 | Upper curve, deliberately retrace its terminal section back to the join, then continue the bowl in one stroke. | Decide between this continuous movement and the currently approved upper stroke/lift/restart method. |
| Ghain | 3 → 4 | Same continuous head/join/bowl method, followed by its one separate dot. | Confirm that the retraced section is appropriate; the dot stays independent. |
| Nga | 3 → 4 | Same continuous method, followed by its three separate dots. | Confirm the join/retracing method and separate dot actions. |
| Hamzah | 3 → 4 | Upper curve, retrace back to the join, then continue the short tail in one stroke. | Decide between the continuous proposal and the approved lift/return method. |
| Jim | 3 → 4 | Head from right to left; lift; restart the bowl at the middle join; finish with the separate dot. | Confirm head direction and the two-stroke method. |

Some pairs have nearly identical silhouettes: their movement changes are visible in playback. These are review alternatives, not assertions that every approved split stroke is wrong. The clips contain pointing gestures and partial traces, so they do not establish an authoritative writing order by themselves.

For a review decision, identify each letter, proposed version, accepted or requested changes, reviewer identity and review date. An owner assessment can be recorded as an owner assessment; it must not be described as a teacher assessment unless that is the actual reviewer. Promotion requires writing the reviewed geometry and its new revision into `src/content/letters.json`, a revision-matched review record, and fresh affected validation. The existing audio revision is preserved unless audio itself changes.

Candidate definitions are in [reviewCandidates.js](../src/content/reviewCandidates.js), isolated from the student catalogue and keyed to the approved source versions. They automatically disappear from the comparison if their source revision changes. All seven passed the catalogue validator and the default-play touch/pen spacing audit. This proves mechanical completion, not pedagogical approval.

Captured comparisons:

| Mim | Ta marbutah | Ain | Ghain | Nga | Hamzah | Jim |
| --- | --- | --- | --- | --- | --- | --- |
| [View](../output/verification/fix-video-implementation/review-mim.png) | [View](../output/verification/fix-video-implementation/review-ta-marbuta.png) | [View](../output/verification/fix-video-implementation/review-ain.png) | [View](../output/verification/fix-video-implementation/review-ghain.png) | [View](../output/verification/fix-video-implementation/review-nga.png) | [View](../output/verification/fix-video-implementation/review-hamzah.png) | [View](../output/verification/fix-video-implementation/review-jim.png) |
