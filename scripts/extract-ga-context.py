"""Extract the first garden syllable, preserving source and reviewed sample bytes."""
import hashlib
import json
import wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
folder = ROOT / 'output/verification/ga-audio-review/garden-context-v6'
report = json.loads((folder / 'source-generation.json').read_text(encoding='utf-8'))
src = '/audio/letters/review/ga-name-v6-garden-context.wav'
target = ROOT / 'public' / src.lstrip('/')
if target.exists():
    raise RuntimeError('Candidate exists; refusing to overwrite reviewed bytes.')
decoded = folder / 'source-garden.wav'
with wave.open(str(decoded), 'rb') as recording:
    rate = recording.getframerate()
    assert recording.getnchannels() == 1 and recording.getsampwidth() == 2
    samples = np.frombuffer(recording.readframes(recording.getnframes()), dtype='<i2').astype(float) / 32768

# The source envelope shows garden's initial release near .30 s, sustained
# vowel .32-.51 s, low-energy closure .52-.55 s and following syllable after .56 s.
start, end = .290, .525
syllable = samples[round(start*rate):round(end*rate)].copy()
fade_in, fade_out = round(.003*rate), round(.030*rate)
syllable[:fade_in] *= np.linspace(0, 1, fade_in)
syllable[-fade_out:] *= np.linspace(1, 0, fade_out)
peak = float(np.max(np.abs(syllable)))
gain = min(1.0, .30/peak)
syllable *= gain
output = np.concatenate([np.zeros(round(.08*rate)), syllable, np.zeros(round(.20*rate))])
target.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(target), 'wb') as recording:
    recording.setnchannels(1)
    recording.setsampwidth(2)
    recording.setframerate(rate)
    recording.writeframes(np.rint(output*32767).astype('<i2').tobytes())

assert hashlib.sha256((ROOT / 'src/content/letters.json').read_bytes()).hexdigest() == report['catalogueSha256']
for preserved_src, sha in report['protectedRecordings'].items():
    assert hashlib.sha256((ROOT / 'public' / preserved_src.lstrip('/')).read_bytes()).hexdigest() == sha
report.update(src=src, bytes=target.stat().st_size, sha256=hashlib.sha256(target.read_bytes()).hexdigest(),
    editing={'sourceStartSeconds': start, 'sourceEndSeconds': end, 'fadeInMs': 3, 'fadeOutMs': 30,
        'leadingSilenceMs': 80, 'trailingSilenceMs': 200, 'gain': gain, 'peakCap': .30,
        'decodedSourceSha256': hashlib.sha256(decoded.read_bytes()).hexdigest(),
        'method': 'First syllable extracted before following consonant; no repetition, time stretch, pitch shift or isolated exclamation.'},
    catalogueAndAllActiveRecordingsPreserved=True)
(folder / 'generation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(f'Authored Ga revision 6: {len(output)/rate:.3f} seconds, peak {np.max(np.abs(output)):.3f}; all active audio preserved.')
