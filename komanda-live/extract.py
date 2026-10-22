"""Нарезка кадров из стоковых клипов (Mixkit, Free License) под 9:16. python3 extract.py"""
import os, subprocess
# id, start, dur, focus_x (0..1), size ('full' 1080x1920 | 'half' 540x960)
JOBS = [
  ('24610', 0.5, 3.0, .66, 'full'), ('1805', 1.0, 5.0, .38, 'full'), ('303', 1.5, 3.0, .55, 'full'), ('4637', 1.0, 2.0, .5, 'full'),
  ('7130', 4.0, 6.0, .5, 'half'), ('873', 2.0, 6.0, .55, 'half'), ('40276', 1.0, 6.0, .5, 'half'), ('4420', 6.0, 6.0, .55, 'half'),
  ('7130', 5.0, 2.0, .5, 'full'), ('873', 3.0, 2.0, .55, 'full'), ('40276', 2.0, 2.0, .5, 'full'), ('4420', 8.0, 2.0, .55, 'full'),
]
for cid, ss, d, fx, sz in JOBS:
    W, H = (1080, 1920) if sz == 'full' else (540, 960)
    out = f'frames/{cid}-{sz}'; os.makedirs(out, exist_ok=True)
    vf = f"fps=30,scale=-2:{H}:flags=lanczos,crop={W}:{H}:(iw-{W})*{fx}:0,eq=contrast=1.06:saturation=1.08"
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(ss), '-t', str(d), '-i', f'clips/{cid}.mp4', '-vf', vf, '-q:v', '4', f'{out}/%04d.jpg'], check=True)
    print(out, len(os.listdir(out)))
