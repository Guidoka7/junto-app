#!/usr/bin/env python3
"""CineCode — narração com voz neural humana gratuita (vozes pt-BR do Microsoft Edge).

Sem chave e sem custo. Roda no GitHub Actions (precisa de internet).
Gera audio/<hash>.webm (Opus 24 kbps) + audio/manifest.json; depois rode
`node tools/empacotar-audio.mjs`.

  pip install edge-tts      (e ffmpeg instalado)
  python tools/narrar_edge.py           # só o que falta
  python tools/narrar_edge.py --tudo    # refaz o curso inteiro com esta voz
  VOZ=pt-BR-AntonioNeural python tools/narrar_edge.py --tudo

Observação: o serviço de leitura em voz alta do Edge é gratuito, mas não é
um produto oficial para uso comercial. Para o lançamento comercial, a mesma
voz existe no Azure Speech (plano gratuito de 500 mil caracteres/mês).
"""
import asyncio, json, os, subprocess, sys, time
import edge_tts

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'audio')
VOZES = [os.environ.get('VOZ', 'pt-BR-ThalitaMultilingualNeural'), 'pt-BR-FranciscaNeural']
RATE = os.environ.get('VELOCIDADE', '+4%')
TUDO = '--tudo' in sys.argv
PARALELO = int(os.environ.get('PARALELO', '6'))


def falas():
    out = subprocess.run(['node', os.path.join(ROOT, 'tools', 'listar-falas.mjs')], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


async def sintetizar(texto, mp3):
    erro = None
    for voz in VOZES:
        for t in range(4):
            try:
                await edge_tts.Communicate(texto, voz, rate=RATE).save(mp3)
                if os.path.getsize(mp3) > 800:
                    return voz
            except Exception as e:  # rede instável / limite: espera e tenta de novo
                erro = e
                await asyncio.sleep(2 + 3 * t)
    raise RuntimeError(f'falhou: {erro}')


async def main():
    lista = falas()
    os.makedirs(OUT, exist_ok=True)
    mfp = os.path.join(OUT, 'manifest.json')
    mf = json.load(open(mfp)) if os.path.exists(mfp) else {}
    pk = os.path.join(OUT, 'pack', 'index.json')
    vozpk = os.path.join(OUT, 'pack', 'VOZ.txt')
    mesma_voz = os.path.exists(vozpk) and open(vozpk).read().strip().startswith('edge')
    packed = set(json.load(open(pk))) if (os.path.exists(pk) and mesma_voz and not TUDO) else set()
    todo = [f for f in lista if f['h'] not in packed and not (f['h'] in mf and os.path.exists(os.path.join(OUT, mf[f['h']])))]
    print(f'{len(lista)} falas, faltam {len(todo)} (voz {VOZES[0]})', flush=True)
    fila = asyncio.Queue()
    for f in todo:
        fila.put_nowait(f)
    feito = {'n': 0, 'erros': 0}
    t0 = time.time()

    async def trabalhador(i):
        tmp = os.path.join(OUT, f'_tmp{i}.mp3')
        while not fila.empty():
            f = await fila.get()
            try:
                await sintetizar(f['text'], tmp)
                nome = f['h'] + '.webm'
                p = await asyncio.create_subprocess_exec('ffmpeg', '-loglevel', 'error', '-y', '-i', tmp,
                    '-af', 'adelay=80,apad=pad_dur=0.15,loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '24000', '-ac', '1',
                    '-c:a', 'libopus', '-b:a', '24k', '-application', 'voip', os.path.join(OUT, nome))
                if await p.wait():
                    raise RuntimeError('ffmpeg')
                mf[f['h']] = nome
            except Exception as e:
                feito['erros'] += 1
                print('ERRO', f['h'], e, flush=True)
            feito['n'] += 1
            if feito['n'] % 50 == 0:
                json.dump(mf, open(mfp, 'w'))
                print(f"{feito['n']}/{len(todo)}  {(time.time() - t0) / 60:.1f} min", flush=True)
        if os.path.exists(tmp):
            os.remove(tmp)

    await asyncio.gather(*[trabalhador(i) for i in range(PARALELO)])
    json.dump(mf, open(mfp, 'w'))
    os.makedirs(os.path.join(OUT, 'pack'), exist_ok=True)
    open(vozpk, 'w').write(f'edge {VOZES[0]}\n')
    print(f"Pronto: {feito['n'] - feito['erros']} falas geradas, {feito['erros']} erros", flush=True)


asyncio.run(main())
