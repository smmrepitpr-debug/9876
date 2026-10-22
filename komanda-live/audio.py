"""Музыка + SFX по событиям ролика. python3 audio.py events.json out.wav
Музыка — мягкий синт-поп 100 BPM (свой синтез, без лицензий), тихая: под голос оставлено место.
SFX: click (клик курсора), whoosh (склейка), pop (появление), chime (успех), paper (листы), tick (часы)."""
import json, sys, wave
import numpy as np
SR = 44100
ev = json.load(open(sys.argv[1])); D = ev['d']; N = int(SR * D); t = np.arange(N) / SR
out = np.zeros((N, 2)); rng = np.random.default_rng(3)
def add(sig, start, g=1.0, pan=0.0):
    i = int(start * SR); j = min(N, i + len(sig))
    if j <= i or i < 0: return
    s = sig[:j - i] * g; out[i:j, 0] += s * (1 - pan); out[i:j, 1] += s * (1 + pan)
def env(L, a=.01, r=.3):
    tt = np.arange(int(L * SR)) / SR; return np.minimum(1, tt / a) * np.exp(-tt / r)
def tone(f, L, a=.01, r=.3, harm=(1, .3, .1)):
    tt = np.arange(int(L * SR)) / SR; s = sum(h * np.sin(2 * np.pi * f * (k + 1) * tt) for k, h in enumerate(harm)); return s * env(L, a, r)
def lp(x, k=30): return np.convolve(x, np.ones(k) / k, 'same')
bpm = 100; beat = 60 / bpm; bar = beat * 4
# Fmaj7 – Am7 – Dm7 – Bbmaj7 (тёплая пастельная гармония)
prog = [[174.61, 220, 261.63, 329.63], [220, 261.63, 329.63, 392], [146.83, 174.61, 220, 261.63], [116.54, 146.83, 174.61, 220]]
nb = int(D / bar) + 1
for b in range(nb):
    ch = prog[b % 4]; st = b * bar
    pad = sum(tone(f, bar + .3, a=.5, r=3, harm=(1, .15)) for f in ch) * .05; add(lp(pad, 20), st)
    add(tone(ch[0] / 2, bar * .95, a=.02, r=1.2, harm=(1, .2)) * .22, st)
    for q in range(8):                                     # мягкий арпеджиатор восьмыми
        f = ch[[0, 2, 1, 3, 2, 1, 3, 2][q]] * 2
        add(tone(f, .35, a=.005, r=.18, harm=(1, .4)) * .05, st + q * beat / 2, pan=(-.4 if q % 2 else .4))
    if b >= 1:
        for q in range(4):
            k = np.sin(2 * np.pi * np.cumsum(55 + 70 * np.exp(-np.arange(int(.3 * SR)) / SR * 30)) / SR) * env(.3, .002, .12)
            add(k * .35, st + q * beat)
            hh = lp(rng.standard_normal(int(.06 * SR)), 2) * env(.06, .001, .02); add(hh * .05, st + q * beat + beat / 2, pan=.3)
# SFX
def noise(L, r, k=3): return lp(rng.standard_normal(int(L * SR)), k) * env(L, .005, r)
for e in ev['events']:
    ty, s = e['type'], e['t']
    if ty == 'click': add(tone(1800, .05, .001, .012, (1,)) * .35, s); add(noise(.04, .01, 2) * .15, s)
    elif ty == 'whoosh':
        L = .5; tt = np.arange(int(L * SR)) / SR; w = lp(rng.standard_normal(len(tt)), 8) * np.sin(np.pi * tt / L) ** 2 * .25; add(w, s - .25, pan=-.2)
    elif ty == 'pop': add(tone(660, .18, .002, .05, (1, .2)) * .18, s)
    elif ty == 'chime':
        for k, f in enumerate([784, 988, 1175]): add(tone(f, .8, .003, .35, (1, .3)) * .12, s + k * .07)
    elif ty == 'paper': add(noise(.7, .25, 4) * .3, s)
    elif ty == 'tick': add(tone(2400, .03, .001, .008, (1,)) * .25, s)
out /= max(1e-9, np.max(np.abs(out))) * 1.25
fade = np.minimum(1, np.minimum(t / .4, (D - t) / 1.2))[:, None]; out *= fade
w = wave.open(sys.argv[2], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32000).astype(np.int16).tobytes()); w.close()
