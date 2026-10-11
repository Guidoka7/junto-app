#!/usr/bin/env python3
"""Gera candidatos a rosto da instrutora de IA com Stable Diffusion XL (licença CreativeML
OpenRAIL++-M, que permite uso comercial). Pessoa sintética: não é ninguém real.
Saída: media/instrutor/_candidatos/rosto-<n>.jpg  (roda na CPU do GitHub, ~10 min por imagem)."""
import os, sys, time, torch
from diffusers import StableDiffusionXLPipeline

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'media', 'instrutor', '_candidatos')
os.makedirs(OUT, exist_ok=True)
N = int(os.environ.get('CANDIDATOS', '4'))
torch.set_num_threads(os.cpu_count() or 4)

PROMPT = os.environ.get('PROMPT', (
    'professional head and shoulders portrait photo of a friendly Brazilian woman in her early 30s, '
    'online programming course teacher, looking straight at the camera, soft confident smile with lips closed, '
    'wearing a dark navy blazer over a white t-shirt, short wavy dark hair, '
    'modern tech studio background with soft warm bokeh lights, softbox key light, '
    'shot on 85mm lens, photorealistic, natural skin texture, sharp focus on eyes, centered composition'))
NEG = ('cartoon, illustration, painting, 3d render, anime, deformed face, asymmetric eyes, open mouth, teeth, '
       'hands, glasses, hat, text, watermark, logo, blurry, low quality, extra people')

t0 = time.time()
pipe = StableDiffusionXLPipeline.from_pretrained('stabilityai/stable-diffusion-xl-base-1.0',
                                                 torch_dtype=torch.float32, use_safetensors=True)
pipe.set_progress_bar_config(disable=True)
print(f'modelo carregado em {time.time() - t0:.0f}s', flush=True)
for i in range(N):
    t1 = time.time()
    g = torch.Generator('cpu').manual_seed(1000 + i * 77)
    img = pipe(PROMPT, negative_prompt=NEG, width=832, height=1024, num_inference_steps=int(os.environ.get('PASSOS', '24')),
               guidance_scale=6.0, generator=g).images[0]
    img.save(os.path.join(OUT, f'rosto-{i + 1}.jpg'), quality=92)
    print(f'rosto {i + 1}: {time.time() - t1:.0f}s', flush=True)
