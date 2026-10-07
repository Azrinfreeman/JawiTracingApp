"""Generate an isolated Ga pronunciation candidate without changing approved audio."""
import argparse
import asyncio
import hashlib
import json
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.tools' / 'audio-deps'))
import edge_tts

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--variant', choices=['gaa', 'gaar', 'gaaa', 'gah', 'gar-calm'], default='gaa')
    args = parser.parse_args()
    version = {'gaa': 2, 'gaar': 3, 'gaaa': 4, 'gah': 4, 'gar-calm': 5}[args.variant]
    catalogue = ROOT / 'src/content/letters.json'
    original = catalogue.read_bytes()
    letters = json.loads(original)
    ga = next(letter for letter in letters if letter['id'] == 'ga')
    protected = {letter['audio']['name']['src']: hashlib.sha256(
        (ROOT / 'public' / letter['audio']['name']['src'].lstrip('/')).read_bytes()
    ).hexdigest() for letter in letters}
    src = f'/audio/letters/review/ga-name-v{version}-{args.variant}.mp3'
    target = ROOT / 'public' / src.lstrip('/')
    if target.exists():
        raise RuntimeError('Candidate exists; refusing to overwrite reviewed bytes.')
    folder = ROOT / 'output/verification/ga-audio-review'
    if args.variant != 'gaa':
        folder = folder / f'{args.variant}-v{version}'
    folder.mkdir(parents=True, exist_ok=True)
    (folder / 'before-catalogue.json').write_bytes(original)
    target.parent.mkdir(parents=True, exist_ok=True)
    partial = target.with_suffix('.partial')
    text = 'gar.' if args.variant == 'gar-calm' else f'{args.variant}.'
    voice, locale, rate = ('en-GB-SoniaNeural', 'en-GB', '+0%') if args.variant in ['gah', 'gar-calm'] else ('ms-MY-YasminNeural', 'ms-MY', '-15%')
    volume = '+0%'
    if args.variant == 'gar-calm':
        rate, volume = '-5%', '-20%'
    await asyncio.wait_for(edge_tts.Communicate(text, voice, rate=rate, pitch='+0Hz', volume=volume).save(str(partial)), timeout=45)
    data = partial.read_bytes()
    if len(data) < 1000:
        raise RuntimeError('No usable speech data returned.')
    partial.replace(target)
    assert catalogue.read_bytes() == original
    for preserved_src, sha in protected.items():
        assert hashlib.sha256((ROOT / 'public' / preserved_src.lstrip('/')).read_bytes()).hexdigest() == sha
    report = {
        'generatedAt': datetime.now(ZoneInfo('Asia/Kuala_Lumpur')).isoformat(),
        'letterId': 'ga', 'transcriptMs': 'Ga', 'spokenText': text, 'version': version,
        'src': src,
        'status': 'pendingReview', 'review': None,
        'synthesis': {'provider': 'Microsoft Edge online speech synthesis',
                      'client': f'edge-tts {edge_tts.__version__}', 'voice': voice,
                      'locale': locale, 'rate': rate, 'pitch': '+0Hz', 'volume': volume},
        'permission': 'User requested a corrected Ga pronunciation in Codex on 2026-10-06; generation and review authorised.',
        'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
        'previousRecording': ga['audio']['name'],
        'catalogueSha256': hashlib.sha256(original).hexdigest(),
        'protectedRecordings': protected,
        'catalogueAndAllActiveRecordingsPreserved': True,
    }
    (folder / 'generation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(f'Created Ga revision-{version} {args.variant} candidate ({len(data)} bytes); catalogue and 37 active recordings unchanged.')

asyncio.run(main())
