"""Musique originale générée par synthèse (§ 7) — aucune œuvre tierce, aucun droit à acquérir.

105 BPM, 36 s. Repères : impact 0:00, pulsation sourde 0–10 s, montée 10–15 s,
« drop » à 15 s (L'OMNIPRATIQUE), plateau énergique jusqu'à 30 s, résolution à 33 s.

    python tools/make_music.py  →  public/assets/audio/music.wav
"""
import os, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 36.0
BPM = 105
BEAT = 60 / BPM
N = int(SR * DUR)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "assets", "audio", "music.wav")
rng = np.random.default_rng(2026)

DROP = 15.0
PLATEAU_END = 30.0
RESOLVE = 33.0


def t_(d):
    return np.arange(int(SR * d)) / SR


def hz(n):
    return 440 * 2 ** ((n - 69) / 12)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def add(buf, x, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    x = x[: N - i] * gain
    buf[0, i:i + len(x)] += x * np.sqrt(0.5 * (1 - pan))
    buf[1, i:i + len(x)] += x * np.sqrt(0.5 * (1 + pan))


def env(n, a, d, s=0.0, r=0.0, hold=None):
    """Enveloppe ADSR simple (durées en s), longueur n échantillons."""
    e = np.zeros(n)
    ia, idd = int(a * SR), int(d * SR)
    ia = max(ia, 1)
    e[:ia] = np.linspace(0, 1, ia)
    end_d = min(n, ia + idd)
    e[ia:end_d] = np.linspace(1, s, end_d - ia) if end_d > ia else []
    e[end_d:] = s
    if r > 0:
        ir = min(n, int(r * SR))
        e[n - ir:] *= np.linspace(1, 0, ir)
    return e


def kick(gain=1.0):
    t = t_(0.45)
    f = 45 + 110 * np.exp(-t * 28)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    x += 0.15 * lp(rng.normal(0, 1, len(t)), 2000) * np.exp(-t * 60)
    return np.tanh(1.6 * x) * gain


def clap():
    t = t_(0.3)
    n = hp(lp(rng.normal(0, 1, len(t)), 6000), 900)
    e = np.exp(-t * 25)
    for k in (0.01, 0.02):
        e += 0.6 * np.exp(-np.maximum(t - k, 0) * 70) * (t > k)
    return n * e * 0.35


def hat(open_=False):
    t = t_(0.25 if open_ else 0.06)
    return hp(rng.normal(0, 1, len(t)), 7000) * np.exp(-t * (14 if open_ else 70)) * 0.18


def saw(f, d, detune=0.0):
    t = t_(d)
    x = 0
    for dt in (-detune, 0, detune):
        ph = (t * f * (1 + dt)) % 1
        x = x + (2 * ph - 1)
    return x / 3


def pad(notes, d, cutoff=1200, a=0.6, r=0.8):
    x = sum(saw(hz(n), d, 0.004) for n in notes) / len(notes)
    x = lp(x, cutoff, 2)
    return x * env(len(x), a, 0.5, 0.85, r)


def pluck(n, d=0.25):
    t = t_(d)
    x = saw(hz(n), d) * np.exp(-t * 14)
    return lp(x, 3500)


def bass(n, d):
    t = t_(d)
    x = np.sin(2 * np.pi * hz(n) * t) + 0.35 * saw(hz(n), d)
    return lp(x, 400) * env(len(t), 0.005, 0.12, 0.7, 0.04)


def main():
    buf = np.zeros((2, N))
    # progression (la mineur → fa → do → sol), un accord par mesure de 4 temps
    prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
    roots = [45, 41, 48, 43]
    bar = 4 * BEAT

    # 0:00 — impact sourd
    t = t_(3.0)
    boom = np.sin(2 * np.pi * np.cumsum(30 + 40 * np.exp(-t * 3)) / SR) * np.exp(-t * 1.4)
    boom += 0.3 * lp(rng.normal(0, 1, len(t)), 300) * np.exp(-t * 3)
    add(buf, np.tanh(2 * boom), 0, 0.9)

    # 0–15 s — nappe sombre, pulsation sourde (un temps sur deux puis chaque temps)
    add(buf, pad([45, 52, 57], DROP + 0.2, 500, a=2.5, r=0.3), 0.5, 0.25)
    b = 0
    while b * BEAT < DROP - 0.05:
        tb = b * BEAT
        if tb >= 2.0 and (tb >= 5.0 or b % 2 == 0):
            add(buf, lp(kick(), 180), tb, 0.55 if tb < 10 else 0.7)
        b += 1

    # 10–15 s — montée : bruit filtré ascendant + roulement accéléré + nappe qui s'ouvre
    d = DROP - 10.0
    t = t_(d)
    noise = rng.normal(0, 1, len(t))
    chunks = np.array_split(noise, 50)
    rise = np.concatenate([hp(c, 300 + 6000 * (i / 50) ** 2) for i, c in enumerate(chunks)])
    add(buf, rise * (t / d) ** 2 * 0.25, 10.0)
    add(buf, pad([57, 60, 64, 69], d, 2500, a=d * 0.9, r=0.05), 10.0, 0.2)
    k = 0.0
    while 10.0 + k < DROP - 0.05:
        step = BEAT / (2 if k < 2.5 else 4 if k < 4 else 8)
        add(buf, clap() * (0.3 + 0.7 * k / d), 10.0 + k, 0.5)
        k += step

    # 15–30 s — plateau énergique
    t0 = DROP
    nbars = int((PLATEAU_END - t0) / bar + 0.5)
    for m in range(nbars):
        tb = t0 + m * bar
        ch = prog[m % 4]
        add(buf, pad(ch + [ch[0] + 12], bar + 0.1, 1800, a=0.05, r=0.15), tb, 0.22)
        for q in range(8):
            add(buf, bass(roots[m % 4], BEAT / 2 * 0.95), tb + q * BEAT / 2, 0.45)
            add(buf, hat(q % 2 == 1), tb + q * BEAT / 2, 0.8, pan=0.3)
        for q in range(4):
            add(buf, kick(), tb + q * BEAT, 0.9)
            if q % 2 == 1:
                add(buf, clap(), tb + q * BEAT, 0.8)
        arp = ch + [ch[1] + 12]
        for s in range(16):
            add(buf, pluck(arp[s % 4] + 12), tb + s * BEAT / 4, 0.12, pan=-0.4 if s % 2 else 0.4)
    add(buf, hat(True), t0, 1.5)
    add(buf, kick(1.2), t0, 1.0)

    # 30–33 s — respiration (sans grosse caisse) puis 33 s — résolution sur accord final (do majeur)
    add(buf, pad([53, 57, 60, 65], RESOLVE - PLATEAU_END + 0.2, 1500, a=0.1, r=0.3), PLATEAU_END, 0.7)
    for s in range(int((RESOLVE - PLATEAU_END) / (BEAT / 2))):
        add(buf, pluck([65, 69, 72, 77][s % 4]), PLATEAU_END + s * BEAT / 2, 0.3)
    add(buf, kick(1.1), RESOLVE, 0.9)
    final = pad([48, 55, 60, 64, 67], DUR - RESOLVE, 2200, a=0.02, r=DUR - RESOLVE - 0.2)
    final += 0.6 * bass(36, DUR - RESOLVE) * np.exp(-t_(DUR - RESOLVE) * 0.8)
    add(buf, final, RESOLVE, 1.0)

    # réverbération courte (échos décroissants), normalisation, fondu de sortie
    wet = np.zeros_like(buf)
    for dly, g in ((0.037, 0.35), (0.071, 0.25), (0.113, 0.18), (0.173, 0.12)):
        i = int(dly * SR)
        wet[0, i:] += buf[1, :-i] * g
        wet[1, i:] += buf[0, :-i] * g
    mix = buf + lp(wet, 4000)
    mix = np.tanh(mix / np.max(np.abs(mix)) * 1.4) * 0.89
    mix[:, -int(0.25 * SR):] *= np.linspace(1, 0, int(0.25 * SR))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    pcm = (mix.T * 32767).astype("<i2")
    with wave.open(OUT, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("ok", OUT)


if __name__ == "__main__":
    main()
