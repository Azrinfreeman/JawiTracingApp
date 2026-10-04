"""Renders the original Taman Jawi background loop (public/audio/music/taman-kawan-v1.mp3).

Every note, envelope and mix level is defined below; there is no sample library, stream or
third-party recording. The render is deterministic (fixed noise seed), so the same script and
encoder version reproduce the same audio. All delays wrap around the loop length, so the end of
the last bar flows into the first beat.

Usage: python scripts/generate-background-music.py [--wav preview.wav]
Requires numpy and lameenc (pip install numpy lameenc).
"""
import argparse, hashlib, pathlib, struct, sys, wave
import numpy as np

RATE = 44100
BPM = 100
BEAT = 60 / BPM
BARS = 24
N = int(round(BARS * 4 * BEAT * RATE))
OUT = pathlib.Path(__file__).resolve().parent.parent / 'public' / 'audio' / 'music' / 'taman-kawan-v1.mp3'

def hz(midi): return 440.0 * 2 ** ((midi - 69) / 12)

# One bar per chord: C, Am, F, G (roots in MIDI for the bass; tones for the arpeggio).
CHORDS = [(48, (60, 64, 67)), (45, (57, 60, 64)), (41, (53, 57, 60)), (43, (55, 59, 62))]
# Melody phrases: eight eighth-note slots per bar, MIDI numbers or None.
A = [[76, None, 79, 76, None, 74, 72, None], [72, None, 76, None, 81, None, 79, None],
     [81, None, 79, None, 77, None, 72, None], [74, None, 79, None, 83, None, 79, None]]
A2 = [[76, None, 79, 76, None, 74, 72, None], [72, 76, None, 81, None, 79, 76, None],
      [81, None, 79, None, 77, 79, 81, None], [83, None, 79, None, 74, None, None, None]]
B = [[84, None, 79, None, 76, 79, 84, None], [81, None, 76, None, 72, 76, 81, None],
     [77, 81, 84, None, 81, 77, None, None], [83, None, 79, None, 74, None, 79, None]]
B2 = [[84, None, 79, None, 76, 79, 84, None], [81, None, 76, None, 72, 76, 81, None],
      [84, None, 81, None, 77, None, 72, None], [79, None, None, None, None, None, None, None]]
FORM = [A, A2, B, A, B2, A2]  # six four-bar phrases = 24 bars

buffer = np.zeros((N, 2))

def place(signal, start, pan=0.0, gain=1.0):
    """Mix a mono signal at a start sample, wrapping at the loop end."""
    left, right = gain * (1 - max(0, pan)), gain * (1 + min(0, pan))
    idx = (start + np.arange(len(signal))) % N
    np.add.at(buffer[:, 0], idx, signal * left)
    np.add.at(buffer[:, 1], idx, signal * right)

def tone(freq, seconds, partials, attack=.006):
    t = np.arange(int(seconds * RATE)) / RATE
    wave_ = sum(amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t / decay) for ratio, amp, decay in partials)
    env = np.minimum(1, t / attack)
    return wave_ * env

MALLET = [(1, 1.0, .55), (2, .28, .22), (4, .12, .08), (5.4, .05, .05)]
PLUCK = [(1, 1.0, .30), (2, .35, .14), (3, .12, .08)]
BASS = [(1, 1.0, .9), (2, .15, .3)]
rng = np.random.RandomState(7)

eighth = BEAT / 2
for bar in range(BARS):
    phrase, step = divmod(bar, 4)
    root, tones = CHORDS[step]
    base = int(round(bar * 4 * BEAT * RATE))
    for slot, note in enumerate(FORM[phrase][step]):
        start = base + int(round(slot * eighth * RATE))
        if note is not None:
            place(tone(hz(note), 1.6, MALLET), start, pan=.25, gain=.30)
        # Plucked accompaniment: root-third-fifth-third, an eighth note at a time.
        arpeggio = tones[[0, 1, 2, 1, 0, 1, 2, 1][slot]]
        place(tone(hz(arpeggio), .8, PLUCK), start, pan=-.3, gain=.13)
        if slot % 2 == 1:  # soft shaker on the off-beats
            n = int(.045 * RATE); noise = rng.randn(n); noise = noise - np.roll(noise, 1)
            place(noise * np.exp(-np.arange(n) / (.012 * RATE)) * .35, start, pan=.1, gain=.045)
    for beat in (0, 2):  # bass and a muted thump on beats one and three
        start = base + int(round(beat * BEAT * RATE))
        place(tone(hz(root), 1.3, BASS, attack=.01), start, gain=.28)
        t = np.arange(int(.18 * RATE)) / RATE
        place(np.sin(2 * np.pi * (60 + 40 * np.exp(-t / .03)) * t) * np.exp(-t / .07), start, gain=.16)

# Gentle room: three wrapped delays warm the sound without changing the loop length.
dry = buffer.copy()
for delay, gain in ((.19, .22), (.31, .15), (.47, .09)):
    shift = int(delay * RATE)
    buffer += np.roll(dry, shift, axis=0) * gain
buffer += np.roll(dry[:, ::-1], int(.083 * RATE), axis=0) * .08

peak = np.max(np.abs(buffer))
buffer *= .7 / peak  # about -3 dBFS; the game plays it at a low player volume
pcm = (buffer * 32767).astype('<i2')

parser = argparse.ArgumentParser(); parser.add_argument('--wav'); args = parser.parse_args()
if args.wav:
    with wave.open(args.wav, 'wb') as out:
        out.setnchannels(2); out.setsampwidth(2); out.setframerate(RATE); out.writeframes(pcm.tobytes())
import lameenc
encoder = lameenc.Encoder(); encoder.set_bit_rate(96); encoder.set_in_sample_rate(RATE); encoder.set_channels(2); encoder.set_quality(2)
data = encoder.encode(pcm.tobytes()) + encoder.flush()
OUT.parent.mkdir(parents=True, exist_ok=True); OUT.write_bytes(data)
print(f'{OUT.name}: {len(data)} bytes, {N / RATE:.2f} s, peak {20 * np.log10(np.max(np.abs(buffer))):.1f} dBFS, sha256 {hashlib.sha256(data).hexdigest()}')
print(f'loop boundary: first sample {np.abs(buffer[0]).max():.4f}, last sample {np.abs(buffer[-1]).max():.4f}')
