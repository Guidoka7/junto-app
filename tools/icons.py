"""Gera ícones e splash do Android a partir do motivo 'contagem de película'."""
import glob, os
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES = os.path.join(ROOT, 'android/app/src/main/res')
FONT = os.path.join(ROOT, 'node_modules/@fontsource/unbounded/files/unbounded-latin-700-normal.woff2')
BG = (10, 12, 17); AMBER = (255, 181, 71); PAPER = (236, 230, 218)

def mark(size, scale=1.0, bg=True):
    S = size * 4
    im = Image.new('RGBA', (S, S), BG + (255,) if bg else (0, 0, 0, 0))
    ov = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    o = ImageDraw.Draw(ov)
    c = S / 2; R = S * 0.36 * scale
    o.pieslice([c - R, c - R, c + R, c + R], -90, 30, fill=(255, 181, 71, 60))
    w = max(2, int(S * 0.018 * scale))
    r2 = R * 0.78
    o.ellipse([c - r2, c - r2, c + r2, c + r2], outline=AMBER + (110,), width=max(1, w // 2))
    o.line([c - R, c, c + R, c], fill=AMBER + (80,), width=max(1, w // 2))
    o.line([c, c - R, c, c + R], fill=AMBER + (80,), width=max(1, w // 2))
    im = Image.alpha_composite(im, ov)
    d = ImageDraw.Draw(im)
    d.ellipse([c - R, c - R, c + R, c + R], outline=AMBER, width=w)
    f = ImageFont.truetype(FONT, int(R * 1.15))
    d.text((c, c + R * 0.04), 'C', font=f, fill=PAPER, anchor='mm')
    return im.resize((size, size), Image.LANCZOS)

legacy = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
for k, s in legacy.items():
    m = mark(s, 1.15)
    m.save(f'{RES}/mipmap-{k}/ic_launcher.png')
    rnd = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    mask = Image.new('L', (s * 4, s * 4), 0); ImageDraw.Draw(mask).ellipse([0, 0, s * 4 - 1, s * 4 - 1], fill=255)
    rnd.paste(m, (0, 0), mask.resize((s, s), Image.LANCZOS)); rnd.save(f'{RES}/mipmap-{k}/ic_launcher_round.png')
    fs = int(s * 108 / 48)
    mark(fs, 0.82, bg=False).save(f'{RES}/mipmap-{k}/ic_launcher_foreground.png')
for p in glob.glob(f'{RES}/drawable*/splash.png'):
    w, h = Image.open(p).size
    sp = Image.new('RGB', (w, h), BG)
    s = int(min(w, h) * 0.42)
    m = mark(s, 1.1, bg=False)
    sp.paste(m, ((w - s) // 2, (h - s) // 2), m)
    sp.save(p)
with open(f'{RES}/values/ic_launcher_background.xml', 'w') as fh:
    fh.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0A0C11</color>\n</resources>\n')
mark(512, 1.15).save(os.path.join(ROOT, 'tools/icon-512.png'))
print('ok')
