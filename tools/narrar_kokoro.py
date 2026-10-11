#!/usr/bin/env python3
"""CineCode — narração com voz neural local (Kokoro), grátis e sem chave de API.

Gera em audio/ um arquivo por fala que ainda não tem áudio (nem em audio/ nem no
pacote audio/pack). Depois rode `node tools/empacotar-audio.mjs`.

  pip install kokoro-onnx soundfile        (e ffmpeg instalado)
  python tools/narrar_kokoro.py            # gera o que falta
  VOZ=pm_alex python tools/narrar_kokoro.py   # vozes pt-BR: pf_dora (padrão), pm_alex, pm_santa

Os modelos (~350 MB) são baixados do GitHub na primeira vez para tools/.kokoro/.
"""
import json, os, re, sys, time, subprocess, urllib.request
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'audio')
MODELS = os.environ.get('KOKORO_DIR', os.path.join(ROOT, 'tools', '.kokoro'))
VOICE = os.environ.get('VOZ', 'pf_dora')
SPEED = float(os.environ.get('VELOCIDADE', '1.05'))
REL = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'

def baixar():
    os.makedirs(MODELS, exist_ok=True)
    for f in ('kokoro-v1.0.onnx', 'voices-v1.0.bin'):
        p = os.path.join(MODELS, f)
        if not os.path.exists(p):
            print('baixando', f, flush=True)
            urllib.request.urlretrieve(REL + f, p + '.part'); os.replace(p + '.part', p)

PRON = [
 (r'\bSQL\b','ésse quê éle'),(r'\bNoSQL\b','nou ésse quê éle'),(r'\bMySQL\b','mai ésse quê éle'),(r'\bPostgreSQL\b','póstgres'),(r'\bSQLite\b','ésse quê laite'),
 (r'\bPython\b','páiton'),(r'\bJavaScript\b','java scrípti'),(r'\bTypeScript\b','taipe scrípti'),(r'\bJava\b','java'),
 (r'\bHTML\b','agá tê ême éle'),(r'\bCSS\b','cê ésse ésse'),(r'\bAPIs\b','a pê ís'),(r'\bAPI\b','a pê í'),(r'\bJSON\b','djêison'),(r'\bURL\b','u érre éle'),
 (r'\bGitHub\b','guit râb'),(r'\bGit\b','guit'),(r'\bLinux\b','línucs'),(r'\bWindows\b','uíndous'),(r'\bmacOS\b','mac ó ésse'),
 (r'\bExcel\b','écsel'),(r'\bWord\b','uórd'),(r'\bPowerPoint\b','páuer póint'),(r'\bPower BI\b','páuer bi ai'),(r'\bPower Query\b','páuer quéri'),(r'\bOffice\b','ófis'),
 (r'\bGoogle\b','gúgol'),(r'\bReact\b','riéct'),(r'\bNode\.js\b','nôud jêi ésse'),(r'\bNode\b','nôud'),(r'\bDocker\b','dóquer'),(r'\bKubernetes\b','cubernétis'),
 (r'\bLLMs?\b','éle éle ême'),(r'\bChatGPT\b','tchat djí pí tí'),(r'\bGPT\b','djí pí tí'),(r'\bprompts?\b','prômpt'),(r'\bdeploy\b','diplói'),(r'\bfront-end\b','front énd'),(r'\bback-end\b','béck énd'),
 (r'\bframework\b','freimuórk'),(r'\bsoftware\b','sóftuer'),(r'\bhardware\b','rárduer'),(r'\bmouse\b','máus'),(r'\bWi-Fi\b','uai fai'),(r'\bdownload\b','dáunloud'),(r'\bupload\b','âploud'),
 (r'\bSELECT\b','select'),(r'\bWHERE\b','uér'),(r'\bJOIN\b','djóin'),(r'\bGROUP BY\b','grúp bai'),(r'\bORDER BY\b','órder bai'),(r'\bINSERT\b','insért'),(r'\bUPDATE\b','âpdeit'),(r'\bDELETE\b','dilít'),
 (r'\bPROCV\b','prôc vê'),(r'\bPROCX\b','prôc xis'),(r'\bVBA\b','vê bê a'),(r'\bDAX\b','dács'),(r'\bCPU\b','cê pê u'),(r'\bRAM\b','rám'),(r'\bSSD\b','ésse ésse dê'),(r'\bIA\b','i a'),
 (r'\bn8n\b','ene oito ene'),(r'\bCRUD\b','crúd'),(r'\bHTTPS?\b','agá tê tê pê'),(r'\bDNS\b','dê ene ésse'),(r'\bIP\b','i pê'),(r'\bOK\b','oquei'),(r'\bemail\b','imeil'),(r'\be-mail\b','imeil'),
]
def falar(s):
    for a, b in PRON: s = re.sub(a, b, s)
    s = s.replace('%', ' por cento').replace(' + ', ' mais ').replace(' = ', ' igual a ').replace('&', ' e ')
    s = re.sub(r'[`*_#<>{}\[\]|\\]', ' ', s)
    return re.sub(r'\s{2,}', ' ', s).strip()
def falar(s):
    for a, b in PRON: s = re.sub(a, b, s)
    s = s.replace('%', ' por cento').replace(' + ', ' mais ').replace(' = ', ' igual a ').replace('&', ' e ')
    s = re.sub(r'[`*_#<>{}\[\]|\\]', ' ', s)
    return re.sub(r'\s{2,}', ' ', s).strip()

def main():
    falas = json.loads(subprocess.run(['node', os.path.join(ROOT, 'tools', 'listar-falas.mjs')], capture_output=True, text=True, check=True).stdout)
    os.makedirs(OUT, exist_ok=True)
    mfp = os.path.join(OUT, 'manifest.json')
    mf = json.load(open(mfp)) if os.path.exists(mfp) else {}
    pk = os.path.join(OUT, 'pack', 'index.json')
    packed = set(json.load(open(pk))) if os.path.exists(pk) else set()
    todo = [f for f in falas if f['h'] not in packed and not (f['h'] in mf and os.path.exists(os.path.join(OUT, mf[f['h']])))]
    print(f'{len(falas)} falas no curso, faltam {len(todo)}', flush=True)
    if not todo: return
    baixar()
    from kokoro_onnx import Kokoro
    k = Kokoro(os.path.join(MODELS, 'kokoro-v1.0.onnx'), os.path.join(MODELS, 'voices-v1.0.bin'))
    t0 = time.time(); audio_s = 0
    for i, f in enumerate(todo):
        try:
            s, sr = k.create(falar(f['text']), voice=VOICE, speed=SPEED, lang='pt-br')
            s = np.concatenate([np.zeros(int(sr * 0.08), np.float32), s.astype(np.float32), np.zeros(int(sr * 0.15), np.float32)])
            name = f['h'] + '.webm'
            p = subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(sr), '-ac', '1', '-i', '-',
                                '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '24000', '-c:a', 'libopus', '-b:a', '24k',
                                '-application', 'voip', os.path.join(OUT, name)], input=s.tobytes())
            if p.returncode: raise RuntimeError('ffmpeg falhou')
            mf[f['h']] = name; audio_s += len(s) / sr
        except Exception as e:
            print('ERRO', f['h'], e, flush=True)
        if i % 20 == 19 or i == len(todo) - 1:
            json.dump(mf, open(mfp + '.tmp', 'w')); os.replace(mfp + '.tmp', mfp)
            el = time.time() - t0
            print(f'{i + 1}/{len(todo)}  {el / 60:.1f} min  áudio {audio_s / 60:.1f} min  resta ~{el / (i + 1) * (len(todo) - i - 1) / 60:.0f} min', flush=True)

if __name__ == '__main__':
    main()
