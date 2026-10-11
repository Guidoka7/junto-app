#!/usr/bin/env python3
"""Anima a instrutora de IA falando a abertura de cada aula (SadTalker, licença Apache-2.0),
com a mesma voz humana da narração (edge-tts). Roda na CPU do GitHub.
Entrada: media/instrutor/rosto.jpg + roteiros (tools/roteiros-instrutor.mjs)
Saída:   media/instrutor/<aula>.webm (+ .jpg capa, .txt fala)
Variáveis: SADTALKER (pasta do SadTalker), SHARD/SHARDS (divide o trabalho), LIMITE, VOZ."""
import asyncio, glob, json, os, shutil, subprocess, sys, tempfile, time
import edge_tts

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'media', 'instrutor')
ROSTO = os.path.join(OUT, 'rosto.jpg')
ST = os.environ.get('SADTALKER', '/tmp/SadTalker')
SHARD, SHARDS = int(os.environ.get('SHARD', '0')), int(os.environ.get('SHARDS', '1'))
LIMITE = int(os.environ.get('LIMITE', '100000'))
VOZ = os.environ.get('VOZ', 'pt-BR-ThalitaMultilingualNeural')
LOG = os.path.join(ROOT, 'media', '_revisao', f'instrutor-{SHARD}.log')
os.makedirs(os.path.dirname(LOG), exist_ok=True)


def log(*a):
    msg = ' '.join(str(x) for x in a)
    print(msg, flush=True)
    with open(LOG, 'a') as f:
        f.write(msg + '\n')


def roteiros():
    out = subprocess.run(['node', os.path.join(ROOT, 'tools', 'roteiros-instrutor.mjs')], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def main():
    todos = roteiros()
    meus = [r for i, r in enumerate(todos) if i % SHARDS == SHARD and not os.path.exists(os.path.join(OUT, r['id'] + '.webm'))][:LIMITE]
    log(f'shard {SHARD}/{SHARDS}: {len(meus)} aberturas para gerar')
    for r in meus:
        t0 = time.time()
        tmp = tempfile.mkdtemp()
        try:
            mp3 = os.path.join(tmp, 'fala.mp3'); wav = os.path.join(tmp, 'fala.wav')
            asyncio.run(edge_tts.Communicate(r['texto'], VOZ, rate='+4%').save(mp3))
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', mp3, '-ar', '16000', '-ac', '1', wav], check=True)
            res = os.path.join(tmp, 'res')
            p = subprocess.run([sys.executable, 'inference.py', '--driven_audio', wav, '--source_image', ROSTO,
                                '--result_dir', res, '--still', '--preprocess', 'full', '--size', '256', '--cpu'],
                               cwd=ST, capture_output=True, text=True)
            vids = glob.glob(os.path.join(res, '**', '*.mp4'), recursive=True)
            if p.returncode or not vids:
                log(f'ERRO {r["id"]}: {p.stderr[-1500:]}')
                continue
            dest = os.path.join(OUT, r['id'] + '.webm')
            # 4:5, rosto em destaque; voz original em alta (mp3) no lugar do áudio de 16 kHz
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', vids[0], '-i', mp3,
                            '-map', '0:v', '-map', '1:a', '-shortest',
                            '-vf', 'scale=400:500:force_original_aspect_ratio=increase,crop=400:500,fps=25',
                            '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '3',
                            '-pix_fmt', 'yuv420p', '-c:a', 'libopus', '-b:a', '40k', '-ac', '1', dest], check=True)
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', dest, '-vframes', '1', '-q:v', '5',
                            os.path.join(OUT, r['id'] + '.jpg')], check=True)
            open(os.path.join(OUT, r['id'] + '.txt'), 'w').write(r['texto'])
            log(f'ok {r["id"]} em {time.time() - t0:.0f}s')
        except Exception as e:
            log(f'ERRO {r["id"]}: {e}')
        finally:
            shutil.rmtree(tmp, ignore_errors=True)


main()
