"""Женская озвучка для роликов komanda3d (edge-tts, бесплатно, нужен интернет).
    pip install edge-tts
    python voice.py        # все 4 → out/komanda3d-N-…-voice.mp4
Голос ставится по таймкодам субтитров; музыка под голосом ~0.1 от голоса."""
import asyncio, glob, os, subprocess, sys
VOICE = os.environ.get('VOICE', 'ru-RU-SvetlanaNeural')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out'); TMP = os.path.join(OUT, 'vo'); os.makedirs(TMP, exist_ok=True)
SUBS = {
 1: [(.4, 3.3, 'Тетрадь, чаты, заметки: клиенты теряются.'), (4.1, 2.9, 'В «Команде» всё в одном месте:'), (7.5, 5.1, 'расписание, клиенты и журнал.'),
     (13.4, 4.2, 'Для тренеров подключение бесплатное.'), (18.4, 3.3, 'Заявка по ссылке.')],
 2: [(.4, 2.5, 'Утром открыл приложение:'), (3.3, 3.3, 'три занятия на экране.'), (9.4, 3.2, 'Днём провёл тренировку,'), (15.4, 3.4, 'клиентка отметила, как себя чувствует.'),
     (19.0, 1.9, 'Вечером всё на месте.'), (21.4, 4.2, '«Команда»: удобно тренеру, понятно клиенту.')],
 3: [(.4, 3.5, 'Клиенты уходят, когда не видят результата.'), (4.4, 5.8, 'В «Команде» клиент видит свой прогресс'), (11.4, 4.6, 'и получает награды за занятия.'), (17.4, 3.6, 'Так проще остаться с вами.')],
 4: [(.4, 2.1, 'Хотите, чтобы вас находили?'), (2.7, 4.7, 'В «Команде» есть каталог тренеров и клубов вашего города.'), (11.5, 3.7, 'Приложение клубу бесплатно,'), (15.4, 2.4, 'внедрение по желанию.'), (19.6, 4.8, 'Заявка за минуту.')],
}
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).strip())
async def clip(v, i, text, slot):
    import edge_tts
    p = os.path.join(TMP, f'v{v}-{i}.mp3'); rate = 0
    while True:
        await edge_tts.Communicate(text, VOICE, rate=f'+{rate}%').save(p)
        if dur(p) <= slot + .3 or rate >= 35: return p
        rate += 7
async def build(v):
    src = [f for f in glob.glob(os.path.join(OUT, f'komanda3d-{v}-*.mp4')) if '-voice' not in f][0]
    cl = [(st, await clip(v, i, tx, sl)) for i, (st, sl, tx) in enumerate(SUBS[v])]
    a = ['ffmpeg', '-y', '-loglevel', 'error', '-i', src] + sum([['-i', c] for _, c in cl], [])
    parts = [f'[{k+1}:a]aresample=44100,aformat=channel_layouts=stereo,adelay={int(s*1000)}|{int(s*1000)},volume=1.8[v{k}]' for k, (s, _) in enumerate(cl)]
    fc = ';'.join(parts) + ';' + ''.join(f'[v{k}]' for k in range(len(cl))) + f'amix=inputs={len(cl)}:normalize=0[vo];[vo]asplit=2[a1][a2];' \
         '[0:a]volume=0.35[bg];[bg][a1]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=350[d];[d][a2]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]'
    dst = src.replace('.mp4', '-voice.mp4')
    subprocess.run(a + ['-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', str(dur(src)), dst], check=True); print('готово:', dst)
for v in ([int(x) for x in sys.argv[1:]] or [1, 2, 3, 4]): asyncio.run(build(v))
