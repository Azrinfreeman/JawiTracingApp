"""Prepare a complete user-provided utterance, trimming only surrounding silence."""
import hashlib
import json
import wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
folder = ROOT / 'output/verification/ga-audio-review/user-recording-v7'
report = json.loads((folder / 'source-generation.json').read_text(encoding='utf-8'))
src = '/audio/letters/review/ga-name-v7-user-recording.wav'
target = ROOT / 'public' / src.lstrip('/')
if target.exists():
    raise RuntimeError('Candidate already exists; refusing to overwrite.')
with wave.open(str(folder / 'source-user.wav'), 'rb') as recording:
    rate = recording.getframerate()
    assert recording.getnchannels() == 1 and recording.getsampwidth() == 2
    samples = np.frombuffer(recording.readframes(recording.getnframes()), dtype='<i2').copy()

# The first continuous speech region is about 1.12-1.80 s. Keep silence on
# both sides; no cut, time stretch, filtering or gain adjustment within speech.
start, end = 1.00, 2.05
clip = samples[round(start*rate):round(end*rate)].copy()
fade = round(.005*rate)
assert np.max(np.abs(clip[:fade].astype(float))) < 50
assert np.max(np.abs(clip[-fade:].astype(float))) < 50
clip[:fade] = np.rint(clip[:fade]*np.linspace(0,1,fade)).astype('<i2')
clip[-fade:] = np.rint(clip[-fade:]*np.linspace(1,0,fade)).astype('<i2')
target.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(target), 'wb') as recording:
    recording.setnchannels(1)
    recording.setsampwidth(2)
    recording.setframerate(rate)
    recording.writeframes(clip.astype('<i2').tobytes())
assert hashlib.sha256((ROOT / 'src/content/letters.json').read_bytes()).hexdigest() == report['catalogueSha256']
for preserved_src, sha in report['protectedRecordings'].items():
    assert hashlib.sha256((ROOT / 'public' / preserved_src.lstrip('/')).read_bytes()).hexdigest() == sha
report.update(src=src, bytes=target.stat().st_size, sha256=hashlib.sha256(target.read_bytes()).hexdigest(),
    editing={'sourceStartSeconds':start, 'sourceEndSeconds':end, 'fadeMs':5,
        'speechRegionStartApprox':1.12, 'speechRegionEndApprox':1.80,
        'method':'Whole first utterance with surrounding silence. Pitch, rate, gain and speech samples unmodified; fades affect near-silent edges only.'},
    catalogueAndAllActiveRecordingsPreserved=True)
(folder / 'generation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Prepared complete user utterance: {len(clip)/rate:.2f} seconds; source and all active content/audio preserved.')
