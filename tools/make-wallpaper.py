"""
Make the wallpaper layer from one photo: you, cut out, with a few horizontal
motion-blur streaks. The desktop behind you is a flat colour set in styles.css.

  pip install pillow numpy onnxruntime
  python tools/make-wallpaper.py path/to/photo.jpg            # cut-out with motion blur
  python tools/make-wallpaper.py path/to/photo.jpg --still    # cut-out, no motion blur
  python tools/make-wallpaper.py path/to/photo.jpg --scene    # also keep the blurred scene as assets/wall.webp

Writes assets/wall-person.webp, then prints the `wallpaper` block to paste into
content.js.

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
SOFTEN = 2.0       # overall softness of the cut-out, in photo pixels at 1200 px wide
SCENE_BLUR = 9     # only used with --scene


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


def streak(x, length, shift=0):
    """Horizontal motion blur. A positive shift drags the streak to the right."""
    k = max(1, length // 4)
    y = box1d(box1d(x, k, 1), k, 1)
    if shift:
        y = np.roll(y, shift, axis=1)
        if shift > 0:
            y[:, :shift] = 0
        else:
            y[:, shift:] = 0
    return y


def smoothstep(e0, e1, v):
    t = np.clip((v - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def over(top, bottom):
    """Premultiplied RGBA 'over'."""
    return top + bottom * (1 - top[..., 3:4])


def spread(colors, known):
    """Fill unknown pixels with colours pulled in from the known ones."""
    out = colors.copy()
    todo = known < 0.5
    for r in [3, 6, 12, 24, 48, 96, 200]:
        num = blur(colors * known[..., None], r)
        den = blur(known, r)[..., None]
        ok = (den[..., 0] > 0.02) & todo
        out[ok] = (num / np.maximum(den, 1e-4))[ok]
        todo &= ~ok
    return out


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


def head_box(m):
    on = m > 0.5
    rows = np.where(on.any(1))[0]
    top = int(rows[0])
    probe = min(top + 60, m.shape[0] - 1)
    xs = np.where(on[probe])[0]
    left, right = int(xs.min()), int(xs.max())
    return top, left, right, right - left  # head height ≈ head width


def main(src, still=False, scene=False):
    im = Image.open(src).convert("RGB")
    if im.width != 1200:
        im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
    H = im.height
    a = np.asarray(im, dtype=np.float32) / 255
    m = mask_for(im)
    top, left, right, head_h = head_box(m)
    chin = top + head_h

    # Clean the edge colours: soft edges otherwise carry the old background (a sky fringe).
    core = smoothstep(0.6, 0.95, m)
    rgb = spread(a, (m > 0.95).astype(np.float32))
    rgb = a * core[..., None] + rgb * (1 - core[..., None])

    # If the light source sat right behind the head (a sunset), its glow tints the top of
    # the head. On a plain background that reads as a stain, so take the colour out there.
    ys0 = np.arange(H, dtype=np.float32)[:, None]
    crown = (smoothstep(top - 20, top, ys0) * (1 - smoothstep(top + 45, top + 85, ys0)))
    mx, mn = rgb.max(-1), rgb.min(-1)
    warm = np.clip((rgb[..., 0] - rgb[..., 2]) * 3, 0, 1) * np.clip((mx - mn) * 4, 0, 1)
    w = (crown * warm)[..., None]
    grey = (rgb @ np.array([0.3, 0.55, 0.15], dtype=np.float32))[..., None] * np.array([1.0, 0.97, 0.95], dtype=np.float32) * 0.82
    rgb = rgb * (1 - w) + grey * w

    al = blur(m, SOFTEN)
    L = np.dstack([blur(rgb * m[..., None], SOFTEN), al])  # premultiplied RGBA

    if not still:
        ys = np.arange(H, dtype=np.float32)[:, None]
        # The torso drags sideways, more the lower it goes.
        g = smoothstep(chin + 10, chin + 300, ys)[..., None] * 0.9
        L = L * (1 - g) + streak(L, 120) * g
        # A trail behind the head, as if it just turned, and a short smear off the face.
        band = (smoothstep(top - 30, top + 30, ys) * (1 - smoothstep(chin + 40, chin + 120, ys)))[..., None]
        trail = streak(L * band, 150, shift=70) * 0.42
        forward = streak(L * band, 70, shift=-30) * 0.28
        # A faint ghost of the whole figure.
        ghost = streak(L, 260) * 0.2
        L = over(L, over(trail, over(forward, ghost)))

    alpha = np.clip(L[..., 3], 0, 1)
    out = L[..., :3] / np.maximum(alpha[..., None], 1e-4)
    out = np.clip(out * 0.94 + 0.06, 0, 1)  # lift the shadows a touch, for a high-key look
    rgba = np.dstack([out, alpha])
    Image.fromarray((rgba * 255).astype(np.uint8), "RGBA").save(os.path.join(OUT, "wall-person.webp"), quality=80, method=6)

    if scene:
        hard = (blur((m > 0.08).astype(np.float32), 4) > 0.02).astype(np.float32)
        bg = np.clip(blur(spread(a, 1 - hard), SCENE_BLUR), 0, 1)
        Image.fromarray((bg * 255).astype(np.uint8)).save(os.path.join(OUT, "wall.webp"), quality=72, method=6)

    print("Done. Paste this into content.js:\n")
    print("  wallpaper: {")
    print('    background: "%s",' % ("assets/wall.webp" if scene else ""))
    print('    person: "assets/wall-person.webp",')
    print(f"    size: [{im.width}, {im.height}],")
    print(f"    head: {{ x: {(left + right) // 2}, top: {top}, height: {head_h}, left: {left}, right: {right} }},")
    print("  },")


if __name__ == "__main__":
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    if len(args) != 1:
        sys.exit(__doc__)
    main(args[0], still="--still" in sys.argv, scene="--scene" in sys.argv)
