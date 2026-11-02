"""
Make the two wallpaper layers from one photo.

  pip install pillow numpy onnxruntime
  python tools/make-wallpaper.py path/to/photo.jpg

Writes assets/wall.webp (the scene with you removed, blurred) and
assets/wall-person.webp (you, cut out), then prints the `wallpaper`
block to paste into content.js.

The first run downloads a 170 MB person-segmentation model (U2-Net, from the
rembg project) to ~/.cache/kos. Portrait photos with the head in the top half
work best.
"""
import os
import sys
import urllib.request

import numpy as np
import onnxruntime as ort
from PIL import Image

MODEL_URL = "https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_human_seg.onnx"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
BG_BLUR = 9      # background blur, in photo pixels at 1200 px wide
PERSON_BLUR = 2.2


def box1d(x, k, axis):
    pad = [(0, 0)] * x.ndim
    pad[axis] = (k + 1, k)
    c = np.cumsum(np.pad(x, pad, mode="edge"), axis=axis, dtype=np.float64)
    n = x.shape[axis]
    hi = np.take(c, np.arange(2 * k + 1, 2 * k + 1 + n), axis=axis)
    lo = np.take(c, np.arange(0, n), axis=axis)
    return ((hi - lo) / (2 * k + 1)).astype(np.float32)


def blur(a, r):
    k = max(1, int(round(np.sqrt(12 * r * r / 3 + 1) / 2)))
    for _ in range(3):
        a = box1d(box1d(a, k, 0), k, 1)
    return a


def mask_for(im):
    path = os.path.expanduser("~/.cache/kos/u2net_human_seg.onnx")
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        print("Downloading the segmentation model (170 MB)…")
        urllib.request.urlretrieve(MODEL_URL, path)
    x = np.asarray(im.resize((320, 320), Image.LANCZOS), dtype=np.float32) / 255
    x = x / max(x.max(), 1e-6)
    x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    x = x.transpose(2, 0, 1)[None].astype(np.float32)
    sess = ort.InferenceSession(path, providers=["CPUExecutionProvider"])
    p = sess.run(None, {sess.get_inputs()[0].name: x})[0][0, 0]
    p = (p - p.min()) / max(p.max() - p.min(), 1e-6)
    return np.asarray(Image.fromarray((p * 255).astype(np.uint8)).resize(im.size, Image.LANCZOS), dtype=np.float32) / 255


def main(src):
    im = Image.open(src).convert("RGB")
    if im.width != 1200:
        im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float32) / 255
    m = mask_for(im)

    # Background: fill the person's area from its surroundings, then blur.
    hard = (m > 0.08).astype(np.float32)
    hard = (blur(hard, 4) > 0.02).astype(np.float32)
    known = 1 - hard
    filled = a.copy()
    todo = hard > 0.5
    for r in [4, 8, 16, 32, 64, 128, 200]:
        num = blur(a * known[..., None], r)
        den = blur(known, r)[..., None]
        ok = (den[..., 0] > 0.02) & todo
        filled[ok] = (num / np.maximum(den, 1e-4))[ok]
        todo &= ~ok
    bg = np.clip(blur(filled, BG_BLUR), 0, 1)
    Image.fromarray((bg * 255).astype(np.uint8)).save(os.path.join(OUT, "wall.webp"), quality=72, method=6)

    # Person: premultiplied blur so the edges stay clean.
    pm = blur(a * m[..., None], PERSON_BLUR)
    al = blur(m, PERSON_BLUR)
    rgba = np.dstack([np.clip(pm / np.maximum(al[..., None], 1e-4), 0, 1), np.clip(al, 0, 1)])
    Image.fromarray((rgba * 255).astype(np.uint8), "RGBA").save(os.path.join(OUT, "wall-person.webp"), quality=78, method=6)

    # Where the head is.
    on = m > 0.5
    rows = np.where(on.any(1))[0]
    top = int(rows[0])
    probe = min(top + 60, im.height - 1)
    xs = np.where(on[probe])[0]
    left, right = int(xs.min()), int(xs.max())
    print("Done. Paste this into content.js:\n")
    print("  wallpaper: {")
    print('    background: "assets/wall.webp",')
    print('    person: "assets/wall-person.webp",')
    print(f"    size: [{im.width}, {im.height}],")
    print(f"    head: {{ x: {(left + right) // 2}, top: {top}, height: {right - left}, left: {left}, right: {right} }},")
    print("  },")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
