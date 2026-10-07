"""Preserve the complete guided synthesis attempt and compare it with its guide."""
import hashlib
import json
import argparse
import wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--followup', action='store_true')
followup = parser.parse_args().followup
variant, version = ('guided-malay-followup', 9) if followup else ('guided-malay', 8)
folder = ROOT / f'output/verification/ga-audio-review/{variant}-v{version}'
report = json.loads((folder / 'source-generation.json').read_text(encoding='utf-8'))
src = f'/audio/letters/review/ga-name-v{version}-{variant}.wav'
target = ROOT / 'public' / src.lstrip('/')
assert not target.exists(), 'Never overwrite a reviewed candidate.'

def samples(path):
    with wave.open(str(path), 'rb') as audio:
        assert audio.getnchannels() == 1 and audio.getsampwidth() == 2
        return audio.getframerate(), np.frombuffer(audio.readframes(audio.getnframes()), dtype='<i2').copy()

rate, source = samples(folder / 'source-guided.wav')
start, end = (1.355, 2.20) if followup else (.835, 1.43)
leading = .120 if followup else .080
# Keep g prevoicing, consonant release, vowel and natural decay. Add quiet lead-in;
# do not truncate the vowel or time-stretch/pitch-shift the output to force a match.
speech = source[round(start*rate):round(end*rate)].copy()
if followup:
    fade = round(.005*rate)
    assert np.max(np.abs(speech[:fade].astype(float))) < 150
    speech[:fade] = np.rint(speech[:fade]*np.linspace(0,1,fade)).astype('<i2')
clip = np.concatenate([np.zeros(round(leading*rate), dtype='<i2'), speech])
assert np.max(np.abs(clip[-round(.02*rate):].astype(float))) < 50
target.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(target), 'wb') as audio:
    audio.setnchannels(1)
    audio.setsampwidth(2)
    audio.setframerate(rate)
    audio.writeframes(clip.astype('<i2').tobytes())

def pitch_frames(raw, sample_rate, beginning, finish):
    values = []
    for position in np.arange(beginning, finish, .04):
        frame = raw[round(position*sample_rate):round((position+.04)*sample_rate)].astype(float)
        frame -= frame.mean()
        corr = np.correlate(frame, frame, mode='full')[len(frame)-1:]
        lo, hi = round(sample_rate/220), round(sample_rate/65)
        lag = lo + np.argmax(corr[lo:hi+1])
        values.append(sample_rate/lag)
    return [round(value, 2) for value in values]

guide_rate, guide = samples(ROOT / 'public' / report['guide']['src'].lstrip('/'))
guide_pitch = pitch_frames(guide, guide_rate, .32, .68)
synth_pitch = pitch_frames(source, rate, 1.60, 1.94) if followup else pitch_frames(source, rate, .96, 1.12)
comparison = {
    'method': '40-ms autocorrelation frames, 65-220 Hz search; approximate engineering measurements, not a pronunciation assessment.',
    'referencePitchFramesHz': guide_pitch,
    'guidedPitchFramesHz': synth_pitch,
    'referenceMedianPitchHz': round(float(np.median(guide_pitch)), 2),
    'guidedMedianPitchHz': round(float(np.median(synth_pitch)), 2),
    'referenceActiveRegionApproxSeconds': [1.12, 1.80],
    'guidedActiveRegionApproxSeconds': [1.37, 2.01] if followup else [.84, 1.24],
    'pronunciationReviewed': False,
    'ownerRejectedThisAttempt': False,
    'selection': ('Keep the authorised original recording active. Word length is closer, but sampled synthetic pitch falls from about 123 Hz to 79 Hz, while the reference rises to about 135 Hz then falls to 93 Hz. These estimates cannot establish faithful pronunciation/tone.' if followup else 'Use the conditionally authorised original recording. Guided output remains materially different in approximate pitch and word length; faithful pronunciation/tone cannot be established by these measurements.'),
    'authorisation': 'Project owner: continue if cannot then use mine' if followup else 'Project owner: make it as a guide, if the guide still failed then use mine',
    'fallbackRevision': 7,
}
assert hashlib.sha256((ROOT / 'src/content/letters.json').read_bytes()).hexdigest() == report['catalogueSha256']
for preserved_src, sha in report['protectedRecordings'].items():
    assert hashlib.sha256((ROOT / 'public' / preserved_src.lstrip('/')).read_bytes()).hexdigest() == sha
report.update(src=src, bytes=target.stat().st_size, sha256=hashlib.sha256(target.read_bytes()).hexdigest(),
    editing={'sourceStartSeconds': start, 'sourceEndSeconds': end, 'leadingSilenceSeconds': leading,
        'nearSilentLeadingFadeMs': 5 if followup else 0,
        'method': 'Whole final word from Malay context; retains consonant onset and vowel decay.'},
    referenceComparison=comparison, catalogueAndAllActiveRecordingsPreserved=True)
(folder / 'generation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'duration': len(clip)/rate, 'referencePitchApprox': comparison['referenceMedianPitchHz'],
    'guidedPitchApprox': comparison['guidedMedianPitchHz'], 'selectedFallbackRevision': 7}))
