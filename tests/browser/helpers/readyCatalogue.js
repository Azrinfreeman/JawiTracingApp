// Mechanics specs (book, Solo/Duo, layout, endpoint finish ...) assume every authored model is student-ready.
// Unreviewed geometry revisions are now excluded from student lessons, so these specs serve the catalogue with
// every model marked approved for the browser under test only. letters.json, approvals and the readiness gate
// are untouched; gate behaviour is covered by tests/game, glyph-matched.spec.js and the gating specs.
export async function treatAllModelsAsReady(target) {
  await target.route(/\/src\/content\/letters\.json/, async route => {
    const response = await route.fetch();
    const text = await response.text();
    // Raw JSON, or Vite's module form: export default JSON.parse("...") or a plain array literal.
    const quoted = /JSON\.parse\(("(?:[^"\\]|\\.)*")\)/.exec(text);
    const asJson = (response.headers()['content-type'] || '').includes('json');
    const catalogue = JSON.parse(quoted ? JSON.parse(quoted[1]) : asJson ? text : text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
    for (const letter of catalogue) {
      if (letter.geometry.status === 'approved') continue;
      letter.geometry.status = 'approved';
      letter.geometry.review = { revision: letter.contentVersion, reviewer: 'Test fixture (not a review)', date: '2026-10-04', reference: 'tests/browser/helpers/readyCatalogue.js', kind: 'fixture' };
    }
    const json = JSON.stringify(catalogue);
    const body = quoted ? text.replace(quoted[0], () => `JSON.parse(${JSON.stringify(json)})`) : asJson ? json : `${text.slice(0, text.indexOf('['))}${json}${text.slice(text.lastIndexOf(']') + 1)}`;
    await route.fulfill({ response, body });
  });
}
