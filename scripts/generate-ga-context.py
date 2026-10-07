"""Stage natural sentence speech for extracting Ga; preserve all active recordings."""
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
    variants = parser.add_mutually_exclusive_group()
    variants.add_argument('--guided', action='store_true')
    variants.add_argument('--guided-followup', action='store_true')
    args = parser.parse_args()
    guided = args.guided or args.guided_followup
    variant, version = ('guided-malay-followup', 9) if args.guided_followup else (('guided-malay', 8) if guided else ('garden-context', 6))
    folder = ROOT / f'output/verification/ga-audio-review/{variant}-v{version}'
    source = folder / ('source-guided.mp3' if guided else 'source-garden.mp3')
    if source.exists():
        raise RuntimeError('Source already exists; refusing to overwrite.')
    raw = (ROOT / 'src/content/letters.json').read_bytes()
    letters = json.loads(raw)
    protected = {letter['audio']['name']['src']: hashlib.sha256(
        (ROOT / 'public' / letter['audio']['name']['src'].lstrip('/')).read_bytes()
    ).hexdigest() for letter in letters}
    folder.mkdir(parents=True, exist_ok=True)
    (folder / 'before-catalogue.json').write_bytes(raw)
    text, voice = ('Ini huruf ga.', 'ms-MY-OsmanNeural') if guided else ('The garden looks lovely today.', 'en-GB-LibbyNeural')
    locale, rate, pitch = ('ms-MY', '-45%', '+0Hz') if args.guided_followup else (('ms-MY', '-10%', '-20Hz') if guided else ('en-GB', '+0%', '+0Hz'))
    await asyncio.wait_for(edge_tts.Communicate(
        text, voice, rate=rate, pitch=pitch, volume='-15%', boundary='WordBoundary'
    ).save(str(source), str(folder / 'boundaries.jsonl')), timeout=45)
    assert (ROOT / 'src/content/letters.json').read_bytes() == raw
    for src, sha in protected.items():
        assert hashlib.sha256((ROOT / 'public' / src.lstrip('/')).read_bytes()).hexdigest() == sha
    report = {
        'generatedAt': datetime.now(ZoneInfo('Asia/Kuala_Lumpur')).isoformat(),
        'letterId': 'ga', 'transcriptMs': 'Ga', 'version': version,
        'status': 'pendingReview', 'review': None, 'spokenText': text,
        'sourceFile': str(source.relative_to(ROOT)).replace('\\', '/'),
        'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'synthesis': {'provider': 'Microsoft Edge online speech synthesis',
            'client': f'edge-tts {edge_tts.__version__}', 'voice': voice, 'locale': locale,
            'rate': rate, 'pitch': pitch, 'volume': '-15%'},
        'method': ('Whole Ga word in Malay context; reference-guided pacing and neutral pitch, correcting the preceding attempt\'s short word and excessively low pitch.' if args.guided_followup else 'Whole Ga word in Malay context; lower pitch guided by user recording, without voice cloning.') if guided else 'Extract the initial Ga syllable of garden spoken inside a neutral sentence; no isolated interjection.',
        'permission': 'User requested a Ga pronunciation with normal tone in Codex on 2026-10-06; synthesis and editing authorised.',
        'previousRecording': next(letter for letter in letters if letter['id']=='ga')['audio']['name'],
        'catalogueSha256': hashlib.sha256(raw).hexdigest(), 'protectedRecordings': protected,
    }
    if guided:
        report['guide'] = {
            'src': '/audio/letters/review/ga-name-v7-user-recording.wav',
            'sha256': hashlib.sha256((ROOT / 'public/audio/letters/review/ga-name-v7-user-recording.wav').read_bytes()).hexdigest(),
            'approximatePitchHz': 116 if args.guided_followup else 109,
            'method': 'Autocorrelation of voiced frames of first reference utterance; used for lower-pitch voice/settings selection, not proof of pronunciation.',
            'userInstruction': 'continue if cannot then use mine' if args.guided_followup else 'make it as a guide, if the guide still failed then use mine',
        }
    if args.guided_followup:
        report['priorAttempt'] = {'version': 8, 'approximateMedianPitchHz': 88.24,
            'approximateActiveSeconds': .40, 'referenceApproximateActiveSeconds': .68,
            'settingsReason': 'Remove the -20 Hz pitch offset and slow the synthesis from -10% to -45% to approach the reference word length; no stretching or truncation of speech.'}
    (folder / 'source-generation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(f'Staged contextual speech ({source.stat().st_size} bytes); all active content/audio preserved.')

asyncio.run(main())
