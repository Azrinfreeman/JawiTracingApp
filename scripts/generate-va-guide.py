"""Stage one reference-guided Va attempt; never overwrite active audio."""
import asyncio, hashlib, json, sys
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.tools/audio-deps'))
import edge_tts

async def main():
    folder = ROOT / 'output/verification/va-audio/guided'
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / 'source-guided.mp3'
    if target.exists():
        raise RuntimeError('Preserve the existing guided attempt.')
    reference = json.loads((ROOT / 'output/verification/va-audio/source.json').read_text())
    raw = (ROOT / 'src/content/letters.json').read_bytes()
    text, voice, rate, pitch = 'Va.', 'ms-MY-OsmanNeural', '-20%', '+0Hz'
    await asyncio.wait_for(edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, volume='+0%', boundary='WordBoundary').save(str(target), str(folder / 'boundaries.jsonl')), timeout=45)
    assert (ROOT / 'src/content/letters.json').read_bytes() == raw
    report = {'generatedAt': datetime.now(ZoneInfo('Asia/Kuala_Lumpur')).isoformat(),
              'letterId': 'va', 'transcriptMs': 'Va', 'spokenText': text,
              'status': 'pendingReview', 'review': None,
              'synthesis': {'provider': 'Microsoft Edge online speech synthesis', 'client': f'edge-tts {edge_tts.__version__}', 'voice': voice, 'rate': rate, 'pitch': pitch, 'volume': '+0%', 'locale': 'ms-MY'},
              'guide': {'sourceSha256': reference['sourceSha256'], 'medianPitchApproxHz': reference['medianPitchApproxHz'], 'firstActiveDurationApproxSeconds': .62,
                        'method': 'Lower male Malay voice and moderate pacing guided by reference pitch/envelope; no voice cloning or reference audio upload.'},
              'sourceSha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'sourceBytes': target.stat().st_size,
              'catalogueSha256': hashlib.sha256(raw).hexdigest(), 'authorisation': 'try to compare with mine if cannot then use mine', 'pronunciationAssessment': None}
    (folder / 'source-generation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'bytes': target.stat().st_size, 'voice': voice, 'rate': rate, 'activeCatalogueUnchanged': True}))
asyncio.run(main())
