import {readFileSync,writeFileSync} from 'node:fs';
let source=readFileSync('tests/browser/hamzah-ye.spec.js','utf8');
source=source.replace("['hamzah']","['nya']")
 .replaceAll('output/verification/hamzah-ye','output/verification/nya-approval')
 .replace("['video','outline','ain-outline','direction','sin-syin-tail','ta-za-stem','ha-direction']","['video','outline','ain-outline','direction','sin-syin-tail','ta-za-stem','ha-direction','nya-tip']");
// Preserve the general current-model, demo, teacher and scored-lane cases.
// Removal-of-Ye behaviour is already tested separately; this stage verifies Nya.
const from=source.indexOf("test('Ye is absent"),to=source.indexOf('for(const letter of approved)test(',from);
if(from<0||to<0)throw Error('Unexpected browser helper structure');
source=source.slice(0,from)+source.slice(to);
source+=`
test('Ya opens approved Nya 4 directly and its completion closes the 36-letter book',async({page})=>{
 const ya=letters.find(l=>l.id==='ya'),nya=letters.find(l=>l.id==='nya');
 await page.setViewportSize({width:768,height:1024});await student(page,ya);
 await draw(page,(await boardModels(page)).strokes[0]);await tapDots(page);await expect(page.locator('.book-completed')).toBeVisible();
 await page.getByRole('button',{name:'Huruf seterusnya',exact:true}).click();await expect(page.locator('.stage-badge')).toContainText('Nya');
 await expect(page.locator('.stage-badge')).toContainText('36/36');await expect(page.locator('.reference-stroke')).toHaveAttribute('d',nya.geometry.strokes[0].path);
 await draw(page,(await boardModels(page)).strokes[0]);await tapDots(page);await expect(page.locator('.book-completed')).toBeVisible();
 const attempts=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts);expect(attempts.at(-1)).toMatchObject({letterId:'nya',contentVersion:4,preview:false,geometryStatus:'approved',metrics:{dotCount:3}});
 await page.getByRole('button',{name:'Huruf seterusnya',exact:true}).click();await expect(page.getByRole('heading',{name:'Hebat, sampai halaman terakhir!',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Huruf seterusnya',exact:true})).toBeDisabled();
});
`;
writeFileSync('tests/browser/nya-tip.spec.js',source);
console.log('Prepared approved Nya tracing, all eight review scopes, saves/navigation and Solo/Duo checks.');
