"""Create explicitly unreviewed development models; never educational approval."""
import json
from pathlib import Path

if Path('src/content/letters.json').exists():
 raise SystemExit('Catalogue already exists. Preserved it; edit the manifest rather than regenerating it.')

bank = [
 ('alif','ا','Alif'),('ba','ب','Ba'),('ta','ت','Ta'),('ta-marbuta','ة','Ta marbutah'),
 ('sa','ث','Sa'),('jim','ج','Jim'),('ca','چ','Ca'),('ha-pedat','ح','Ha (ح)'),
 ('kha','خ','Kha'),('dal','د','Dal'),('zal','ذ','Zal'),('ra','ر','Ra'),('zai','ز','Zai'),
 ('sin','س','Sin'),('syin','ش','Syin'),('sad','ص','Sad'),('dad','ض','Dad'),
 ('tho','ط','Ta (ط)'),('za','ظ','Za'),('ain','ع','Ain'),('ghain','غ','Ghain'),
 ('nga','ڠ','Nga'),('fa','ف','Fa'),('pa','ڤ','Pa'),('qaf','ق','Qaf'),('kaf','ک','Kaf'),
 ('ga','ڬ','Ga'),('lam','ل','Lam'),('mim','م','Mim'),('nun','ن','Nun'),('wau','و','Wau'),
 ('va','ۏ','Va'),('ha','ه','Ha (ه)'),('hamzah','ء','Hamzah'),('ya','ي','Ya'),
 ('ye','ى','Ye'),('nya','ڽ','Nya')
]
bowl = 'M 790 405 C 790 640 700 700 495 700 C 300 700 190 650 195 445'
models = {
 'alif': (['M 510 175 Q 498 445 520 795'], []),
 'ba': ([bowl], [(500,810)]),
 'ta': ([bowl], [(430,300),(570,300)]),
 'dal': (['M 460 285 Q 645 350 720 560 Q 550 635 300 595'], []),
 'ra': (['M 690 355 Q 790 655 330 780'], []),
 'sin': (['M 825 360 Q 820 520 750 520 Q 680 520 685 390 Q 685 530 605 535 Q 530 535 535 415 Q 550 735 330 735 Q 165 735 185 550'], []),
 'kaf': (['M 780 200 L 780 610 Q 660 710 400 710 Q 190 710 205 535','M 565 365 L 460 430 L 560 485'], []),
 'lam': (['M 700 175 L 700 635 Q 610 785 365 745 Q 210 715 220 545'], []),
 'mim': (['M 660 440 C 740 390 760 565 650 555 C 545 545 575 410 660 440','M 650 555 Q 470 545 380 615 L 370 815'], []),
 'nun': ([bowl], [(500,355)]),
 'wau': (['M 625 440 C 730 335 830 565 650 575 C 515 580 535 400 625 440 C 845 575 570 770 275 765'], []),
 'ya': (['M 785 375 C 620 320 565 475 745 530 C 820 630 660 695 450 695 C 255 695 180 625 205 465'], [(400,805),(540,805)])
}
letters = []
for ident,glyph,label in bank:
 paths, dot_positions = models.get(ident, ([], []))
 strokes = [dict(id=f'stroke-{i+1}',path=p,width=44,penLiftPolicy='continuous',checkpoints=[.25,.5,.75,.95]) for i,p in enumerate(paths)]
 dots = [dict(id=f'dot-{i+1}',x=x,y=y,visibleRadius=19,hitRadius=48,maxTravel=30,policy='tap') for i,(x,y) in enumerate(dot_positions)]
 letters.append(dict(
  id=ident,glyph=glyph,labelMs=label,contentVersion=1,viewBox=[0,0,1000,1000],pilot=ident in models,
  additional=ident in ['ca','nga','pa','ga','nya','va'],
  geometry=dict(status='draft' if paths else 'pendingReview',review=None,displayPaths=paths,strokes=strokes,dotTargets=dots,validSequences=[[s['id'] for s in strokes]+[d['id'] for d in dots]] if paths else []),
  audio=dict(name=dict(src=None,transcriptMs=label,version=1,status='pendingReview',review=None,permission=None),pronunciationExamples=[])
 ))
Path('src/content').mkdir(parents=True,exist_ok=True)
Path('src/content/letters.json').write_text(json.dumps(letters,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Generated {len(letters)} catalogue entries, {len(models)} draft models, zero approvals.')
