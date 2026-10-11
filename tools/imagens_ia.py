#!/usr/bin/env python3
"""CineCode — cenas fotográficas geradas por IA para as aulas (Stable Diffusion XL,
licença CreativeML OpenRAIL++-M: uso comercial permitido). Grátis, roda na CPU do GitHub.
Usa os temas de src/midia.json (2 por aula) e grava media/broll/<aula>-<n>.jpg (4:5).
O app anima a foto com movimento de câmera lento (efeito Ken Burns).
Variáveis: SHARD/SHARDS (divide o trabalho), LARGURA/ALTURA, PASSOS."""
import json, os, sys, time, zlib, torch
from diffusers import StableDiffusionXLPipeline, LCMScheduler

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'media', 'broll')
os.makedirs(OUT, exist_ok=True)
SHARD, SHARDS = int(os.environ.get('SHARD', '0')), int(os.environ.get('SHARDS', '1'))
W, H = int(os.environ.get('LARGURA', '768')), int(os.environ.get('ALTURA', '960'))
PASSOS = int(os.environ.get('PASSOS', '7'))  # LCM-LoRA: poucas etapas, ~5x mais rápido
torch.set_num_threads(os.cpu_count() or 4)

ESTILO = ('cinematic documentary photograph, realistic, natural soft lighting, shallow depth of field, '
          'shot on 35mm, film grain, rich detail, professional color grading')
NEG = ('text, letters, words, watermark, logo, signature, cartoon, illustration, 3d render, anime, '
       'deformed hands, extra fingers, distorted face, blurry, low quality, oversaturated, frame, border')

cfg = json.load(open(os.path.join(ROOT, 'src', 'midia.json'), encoding='utf-8'))
tarefas = []
for aula, temas in cfg['aulas'].items():
    for i, tema in enumerate(temas):
        tarefas.append((f'{aula}-{i + 1}', tema))
meus = [t for k, t in enumerate(tarefas) if k % SHARDS == SHARD and not os.path.exists(os.path.join(OUT, t[0] + '.jpg'))]
print(f'parte {SHARD}/{SHARDS}: {len(meus)} cenas', flush=True)
if not meus:
    sys.exit(0)
t0 = time.time()
pipe = StableDiffusionXLPipeline.from_pretrained('stabilityai/stable-diffusion-xl-base-1.0', torch_dtype=torch.float32, use_safetensors=True)
# LCM-LoRA (licença OpenRAIL++, uso comercial permitido): qualidade do SDXL em ~7 etapas
pipe.load_lora_weights('latent-consistency/lcm-lora-sdxl')
pipe.fuse_lora()
pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
pipe.set_progress_bar_config(disable=True)
print(f'modelo em {time.time() - t0:.0f}s', flush=True)
for nome, tema in meus:
    t1 = time.time()
    g = torch.Generator('cpu').manual_seed(zlib.crc32(nome.encode()) % 100000)
    img = pipe(f'{tema}, {ESTILO}', negative_prompt=NEG, width=W, height=H, num_inference_steps=PASSOS,
               guidance_scale=1.5, generator=g).images[0]
    img = img.resize((480, 600))
    img.save(os.path.join(OUT, nome + '.jpg'), quality=84, optimize=True, progressive=True)
    print(f'{nome}: {time.time() - t1:.0f}s  ({tema})', flush=True)
