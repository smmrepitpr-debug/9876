"""Озвучка роликов «Команда» через edge-tts (бесплатно, нужен интернет).

    pip install edge-tts
    python voice.py            # все 4 ролика
    python voice.py 2          # только ролик 2
    VOICE=ru-RU-SvetlanaNeural python voice.py   # женский голос

Берёт out/komanda-N-*.mp4, кладёт рядом komanda-N-*-voice.mp4:
голос по таймкодам сцен, музыка под голосом приглушается (ducking).
"""
import asyncio, json, os, subprocess, sys, glob

VOICE = os.environ.get('VOICE', 'ru-RU-DmitryNeural')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
TMP = os.path.join(OUT, 'vo'); os.makedirs(TMP, exist_ok=True)

# (старт, длина слота, текст) — по сценам из videos.js
LINES = {
    1: [(0.15, 1.85, 'Ваша CRM знает, сколько заплатил клиент.'),
        (2.1, 1.8, 'А как он тренируется?'),
        (4.3, 2.6, 'Абонементы — это только полдела.'),
        (7.3, 4.6, 'В «Команде» — прогресс, отзывы, тренеры и программы. В одном приложении.'),
        (12.3, 3.6, 'И мы работаем вместе с вашей CRM.'),
        (16.3, 3.6, 'Клиент видит результат — и остаётся.'),
        (20.4, 3.3, '«Команда». Покажем за десять минут.')],
    2: [(0.15, 1.85, 'Клиент хочет записаться. Без двадцати двенадцать ночи.'),
        (2.1, 1.8, 'А администратор спит.'),
        (4.3, 3.6, 'С «Командой» запись работает круглосуточно.'),
        (8.3, 3.6, 'За час до тренировки — напоминание.'),
        (12.3, 3.6, 'И неявок становится меньше.'),
        (16.3, 3.6, 'А тренер видит всю неделю в одном месте.'),
        (20.4, 3.3, '«Команда». Подключи свою секцию.')],
    3: [(0.15, 1.85, 'У больших сетей — своё приложение.'),
        (2.1, 1.6, 'А у вас?'),
        (4.3, 4.6, 'Ваш клуб — прямо в телефоне клиента.'),
        (9.3, 3.6, 'Расписание. Тренеры. Отзывы.'),
        (13.3, 3.6, 'Уровень федеральных сетей — теперь в Коми.'),
        (17.3, 2.6, 'Внедрение делаем сами.'),
        (20.4, 3.3, '«Команда». Хочу так же!')],
    4: [(0.3, 2.6, 'Федеральная CRM. Ответ — через три рабочих дня.'),
        (5.3, 3.6, 'А мы — в Ухте.'),
        (9.3, 3.6, 'Приедем и всё настроим.'),
        (13.3, 3.6, 'Перенесём базу и обучим администраторов.'),
        (17.3, 2.6, 'Поддержка — живые люди, а не бот.'),
        (20.4, 3.3, '«Команда». Позвоните нам.')],
}

def dur(f):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).strip())

async def tts(text, path, rate):
    import edge_tts
    await edge_tts.Communicate(text, VOICE, rate=rate, pitch='-2Hz').save(path)

async def make_clip(v, i, text, slot):
    path = os.path.join(TMP, f'v{v}-{i}.mp3')
    rate = 5
    while True:                                   # ускоряем, пока не влезет в слот (максимум +40%)
        await tts(text, path, f'+{rate}%')
        if dur(path) <= slot or rate >= 40: return path
        rate += 7

async def build(v):
    src = [f for f in glob.glob(os.path.join(OUT, f'komanda-{v}-*.mp4')) if '-voice' not in f and 'silent' not in f]
    if not src: print('нет видео для ролика', v); return
    src = src[0]
    clips = [(st, await make_clip(v, i, txt, slot)) for i, (st, slot, txt) in enumerate(LINES[v])]
    args = ['ffmpeg', '-y', '-loglevel', 'error', '-i', src]
    for _, c in clips: args += ['-i', c]
    parts = [f'[{k + 1}:a]aresample=44100,aformat=channel_layouts=stereo,adelay={int(st * 1000)}|{int(st * 1000)},volume=1.6[v{k}]' for k, (st, _) in enumerate(clips)]
    mix = ''.join(f'[v{k}]' for k in range(len(clips)))
    fc = ';'.join(parts) + f';{mix}amix=inputs={len(clips)}:normalize=0[vo];[vo]asplit=2[vo1][vo2];' \
         '[0:a]volume=0.8[bg];[bg][vo1]sidechaincompress=threshold=0.02:ratio=10:attack=20:release=300[duck];' \
         '[duck][vo2]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]'
    dst = src.replace('.mp4', '-voice.mp4')
    subprocess.run(args + ['-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', str(dur(src)), dst], check=True)
    print('готово:', dst)

if __name__ == '__main__':
    vids = [int(a) for a in sys.argv[1:]] or [1, 2, 3, 4]
    for v in vids: asyncio.run(build(v))
