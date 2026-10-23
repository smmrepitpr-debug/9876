"""Тихая спокойная музыка без вокала + мягкие «попы» и шорох бумаги. python3 audio.py events.json out.wav"""
import json, sys, wave
import numpy as np
SR = 44100; ev = json.load(open(sys.argv[1])); D = ev['d']; N = int(SR * D); t = np.arange(N) / SR
out = np.zeros((N, 2)); rng = np.random.default_rng(5)
def add(sig, s, g=1.0, pan=0.0):
    i = int(s * SR); j = min(N, i + len(sig))
    if j <= i or i < 0: return
    x = sig[:j - i] * g; out[i:j, 0] += x * (1 - pan); out[i:j, 1] += x * (1 + pan)
def env(L, a, r): tt = np.arange(int(L * SR)) / SR; return np.minimum(1, tt / a) * np.exp(-tt / r)
def tone(f, L, a=.01, r=.4, h=(1, .25, .08)):
    tt = np.arange(int(L * SR)) / SR; return sum(k * np.sin(2 * np.pi * f * (n + 1) * tt) for n, k in enumerate(h)) * env(L, a, r)
beat = 60 / 84
prog = [[261.63, 329.63, 392, 493.88], [220, 261.63, 329.63, 392], [174.61, 220, 261.63, 329.63], [196, 246.94, 293.66, 392]]
for b in range(int(D / (beat * 4)) + 1):
    ch = prog[b % 4]; st = b * beat * 4
    add(sum(tone(f, beat * 4 + .5, .6, 3.5, (1, .1)) for f in ch) * .04, st)
    for q, k in enumerate([0, 2, 1, 3, 2, 1, 3, 2]):
        add(tone(ch[k] * 2, 1.2, .004, .5, (1, .35, .1)) * .045, st + q * beat / 2, pan=(-.35 if q % 2 else .35))
    add(tone(ch[0] / 2, beat * 3.8, .05, 1.6, (1, .15)) * .12, st)
def lp(x, k): return np.convolve(x, np.ones(k) / k, 'same')
for e in ev['events']:
    if e['type'] == 'pop': add(tone(880, .15, .002, .04, (1, .2)) * .1, e['t'])
    elif e['type'] == 'paper': add(lp(rng.standard_normal(int(.5 * SR)), 5) * env(.5, .01, .15) * .12, e['t'] - .1)
out /= max(1e-9, np.abs(out).max()) * 1.6
out *= np.minimum(1, np.minimum(t / .3, (D - t) / .8))[:, None]
w = wave.open(sys.argv[2], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32000).astype(np.int16).tobytes()); w.close()
