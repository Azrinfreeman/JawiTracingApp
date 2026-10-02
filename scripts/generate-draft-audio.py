"""Generate user-authorised synthetic name recordings; never approve pronunciation."""
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

VOICE = 'ms-MY-YasminNeural'
RATE = '-15%'
PITCH = '+0Hz'
AUTHORISATION = 'User authorised generation and preview use in Codex chat on 2026-10-02; pronunciation review deferred.'

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--sample', action='store_true', help='Generate Alif only, without editing the catalogue.')
    args = parser.parse_args()
    catalogue = ROOT / 'src' / 'content' / 'letters.json'
    letters = json.loads(catalogue.read_text(encoding='utf-8'))
    selected = letters[:1] if args.sample else letters
    if any(letter['audio']['name']['status'] == 'approved' for letter in selected):
        raise RuntimeError('Refusing to regenerate an approved recording; no files changed.')
    voices = await asyncio.wait_for(edge_tts.list_voices(), timeout=30)
    voice = next((v for v in voices if v['ShortName'] == VOICE and v['Locale'] == 'ms-MY'), None)
    if not voice:
        raise RuntimeError('The selected Malaysian Malay voice is unavailable; no fallback voice used.')
    generated_at = datetime.now(ZoneInfo('Asia/Kuala_Lumpur')).isoformat()
    # Stage a full batch before replacing linked files. Samples never alter the game.
    output = ROOT / ('output/audio-samples' if args.sample else '.tools/audio-staging')
    output.mkdir(parents=True, exist_ok=True)
    report = {'generatedAt': generated_at, 'provider': 'Microsoft Edge online speech synthesis',
              'client': f'edge-tts {edge_tts.__version__}', 'voice': VOICE, 'locale': 'ms-MY',
              'rate': RATE, 'pitch': PITCH, 'authorisation': AUTHORISATION,
              'reviewStatus': 'pendingReview', 'recordings': []}
    for number, letter in enumerate(selected, 1):
        recording = letter['audio']['name']
        # Parenthetical glyphs distinguish table labels; they are not spoken.
        transcript = letter['labelMs'].split(' (', 1)[0].strip()
        filename = f"{letter['id']}-name.mp3"
        target = output / filename
        if recording['status'] == 'approved':
            raise RuntimeError(f"Refusing to overwrite approved audio: {letter['id']}")
        temporary = output / f'{filename}.partial'
        for attempt in range(3):
            try:
                await asyncio.wait_for(edge_tts.Communicate(transcript + '.', VOICE, rate=RATE, pitch=PITCH).save(str(temporary)), timeout=40)
                data = temporary.read_bytes()
                if len(data) < 1000:
                    raise RuntimeError('No usable speech data returned.')
                temporary.replace(target)
                break
            except Exception:
                if attempt == 2:
                    raise
                await asyncio.sleep(1 + attempt)
        src = f'/audio/letters/{filename}'
        if recording.get('src'):
            recording['version'] += 1
        recording.update(src=src, transcriptMs=transcript, status='pendingReview', review=None,
                         permission=AUTHORISATION,
                         synthesis={'provider': report['provider'], 'client': report['client'],
                                    'voice': VOICE, 'locale': 'ms-MY', 'rate': RATE, 'pitch': PITCH,
                                    'generatedAt': generated_at, 'reference': 'docs/AUDIO_DRAFT_REVIEW.md'})
        report['recordings'].append({'id': letter['id'], 'glyph': letter['glyph'], 'label': letter['labelMs'],
                                     'transcript': transcript, 'src': src, 'version': recording['version'],
                                     'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
        print(f"{number}/{len(selected)} generated: {letter['id']} ({len(data)} bytes)", flush=True)
    verification = ROOT / 'output' / 'verification'
    verification.mkdir(parents=True, exist_ok=True)
    if args.sample:
        (verification / 'draft-audio-sample-generation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    else:
        # Integrate only after every requested file was successfully generated.
        destination = ROOT / 'public' / 'audio' / 'letters'
        destination.mkdir(parents=True, exist_ok=True)
        for item in report['recordings']:
            filename = Path(item['src']).name
            (output / filename).replace(destination / filename)
        catalogue.write_text(json.dumps(letters, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        (verification / 'draft-audio-generation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"Finished: {len(selected)} synthetic drafts; zero audio approvals.", flush=True)

asyncio.run(main())
