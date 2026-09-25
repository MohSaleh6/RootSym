"""
Rebuilds the animated RootSym emblem from the source artwork.

    python3 design/logo/build_mark.py        (needs numpy, scipy, Pillow)

Writes one static base, the top gear's fixed disc and outline mask, and one
layer per gear into public/brand/mark/. It prints each gear's box, which is
what src/components/Logo.tsx places them by.

The coordinates here — gear centres, the emblem square, which shape is which —
were measured from this particular artwork. A new logo needs them measured
again; the method is described next to each step.
"""
import json
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "rootsym-logo-source.png")
OUTDIR = os.path.join(HERE, "..", "..", "public", "brand", "mark")
X0, Y0, S = 1562, 107, 2120          # emblem square inside the full artwork
OUT = 640                             # published size of the square
K = OUT / S
BG = np.array([5, 32, 56], np.float32)

im = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float32)
E = im[Y0:Y0 + S, X0:X0 + S]
dist = np.sqrt(((E - BG) ** 2).sum(-1))
lab, _ = ndi.label(dist > 90)                     # every separate shape in the artwork
alpha = np.clip((dist - 25) / (105 - 25), 0, 1)
# Colour with the navy backdrop divided out, so edges look right on any surface.
col = np.clip(BG + (E - BG) / np.maximum(alpha, 0.2)[..., None], 0, 255)

# Every inked pixel — including anti-aliased fringe — belongs to its nearest shape.
sizes = ndi.sum(lab > 0, lab, range(1, lab.max() + 1))
big = np.isin(lab, np.nonzero(sizes >= 2000)[0] + 1)
d, (iy, ix) = ndi.distance_transform_edt(~big, return_indices=True)
owner = np.where(d <= 7, lab[iy, ix], 0)
owner[alpha == 0] = 0

UL, FL, INNER, BIGG, TOP = [11, 14], [20, 21], [15, 16], [13], [4]
GEARS = UL + FL + INNER + BIGG + TOP

def rgba(mask, a=None, c=None):
    a = alpha if a is None else a
    c = col if c is None else c
    out = np.zeros((S, S, 4), np.float32)
    out[..., :3] = c
    out[..., 3] = np.where(mask, a, 0) * 255
    return out

def crop_centered(layer, cx, cy, R):
    """Square of side 2R centred exactly on (cx, cy), sampled bilinearly."""
    n = int(np.ceil(2 * R))
    g = np.arange(n) + 0.5 - n / 2
    yy, xx = np.meshgrid(cy + g, cx + g, indexing="ij")
    ch = [ndi.map_coordinates(layer[..., k], [yy - 0.5, xx - 0.5], order=1, mode="constant") for k in range(4)]
    return np.stack(ch, -1), n

def save(arr, path, size, quality=90):
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA").resize((size, size), Image.LANCZOS)
    img.save(path, "WEBP", quality=quality, method=6)

def polar_tile(src, cx, cy, t0, pitch, R):
    """Every tooth becomes a copy of the tooth centred at t0 — same shape, same texture."""
    n = int(np.ceil(2 * R)); g = np.arange(n) + 0.5 - n / 2
    oy, ox = np.meshgrid(g, g, indexing="ij")
    r = np.hypot(ox, oy); th = np.degrees(np.arctan2(oy, ox)) % 360
    ths = np.radians(t0 + ((th - t0 + pitch / 2) % pitch) - pitch / 2)
    sx, sy = cx + r * np.cos(ths), cy + r * np.sin(ths)
    return np.stack([ndi.map_coordinates(src[..., k], [sy - 0.5, sx - 0.5], order=1, mode="constant") for k in range(4)], -1)

meta = {}
def place(name, cx, cy, R, arr_full_or_crop, spin):
    size = max(8, round(2 * R * K))
    save(arr_full_or_crop, os.path.join(OUTDIR, f"{name}.webp"), size)
    meta[name] = dict(left=round((cx - R) / S * 100, 4), top=round((cy - R) / S * 100, 4),
                      size=round(2 * R / S * 100, 4), **spin)

os.makedirs(OUTDIR, exist_ok=True)
L = 0.299 * E[..., 0] + 0.587 * E[..., 1] + 0.114 * E[..., 2]
yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)

# --- simple gears: exactly their own pixels ---------------------------------
UL_START = 17.0   # degrees clockwise: the angle that keeps its teeth out of the big gear's
for name, ids, (cx, cy), R, spin in [
    ("gear-upper-left", UL, (2227.8 - X0, 628.7 - Y0), 190, dict(kind="spin", seconds=16, reverse=True)),
    ("gear-far-left",   FL, (1992.5 - X0, 1060.0 - Y0), 165, dict(kind="spin", seconds=20, reverse=False)),
    ("gear-inner",   INNER, (2641.0 - X0, 804.0 - Y0), 170, dict(kind="rock", seconds=9)),
]:
    crop, _ = crop_centered(rgba(np.isin(owner, ids)), cx, cy, R)
    if name == "gear-upper-left":
        rot = Image.fromarray(np.clip(crop, 0, 255).astype(np.uint8), "RGBA").rotate(-UL_START, resample=Image.BICUBIC)
        crop = np.asarray(rot).astype(np.float32)
    place(name, cx, cy, R, crop, spin)

# --- top gear: light gear turning on a fixed dark disc ----------------------
tcx, tcy = 2631.0 - X0, 377.4 - Y0
top = np.isin(owner, TOP)
r_top = np.hypot(xx - tcx, yy - tcy)
Lum = 0.299 * E[..., 0] + 0.587 * E[..., 1] + 0.114 * E[..., 2]
_light = ndi.binary_opening((lab == 4) & (Lum > 162) & (np.hypot(*np.mgrid[0:S, 0:S][::-1] - np.array([2631.0 - X0, 377.4 - Y0])[:, None, None]) <= 138), np.ones((7, 7)))
_l, _n = ndi.label(_light)
_gear = _l == (np.argmax(ndi.sum(_light, _l, range(1, _n + 1))) + 1)
body = ndi.binary_dilation(_gear, iterations=3)   # soft edge back
light_a = np.clip((L - 148) / (176 - 148), 0, 1) * alpha * body
crop = polar_tile(rgba(top, light_a, E), tcx, tcy, 269.8, 45.0, 140)
place("gear-top", tcx, tcy, 140, crop, dict(kind="spin", seconds=16, reverse=True))
# The turning gear may only show where the disc exists — never through its notch.
outline = np.zeros((S, S, 4), np.float32); outline[..., :3] = 255
outline[..., 3] = np.where(top, np.clip(alpha * 1.6, 0, 1), 0) * 255
mask_crop, _ = crop_centered(outline, tcx, tcy, 140)
save(mask_crop, os.path.join(OUTDIR, "gear-top-mask.webp"), max(8, round(280 * K)))
dark_rim = top & (L < 160)
dark_col = np.median(E[dark_rim], axis=0)
disc_c = np.where((r_top <= 138)[..., None], dark_col, col)       # fill under the light gear
disc = rgba(top, alpha, disc_c)
meta_disc_full = disc

# --- big gear: 16-tooth ring rebuilt from its own top tooth -----------------
bcx, bcy = 2643.0 - X0, 801.0 - Y0
T0, PITCH, RB = 270.4, 22.5, 330
ring = polar_tile(rgba(np.isin(owner, BIGG)), bcx, bcy, T0, PITCH, RB)
place("gear-big", bcx, bcy, RB, ring, dict(kind="spin", seconds=32, reverse=False))
cut_y = 818 - Y0                                  # where the drawn half-gear's ends stop
meta["gear-big"]["clipBottom"] = round((RB - (cut_y - bcy)) / (2 * RB) * 100, 4)

# --- static layers -------------------------------------------------------------
base = rgba((owner > 0) & ~np.isin(owner, GEARS))
save(base, os.path.join(OUTDIR, "base.webp"), OUT, quality=82)
save(disc, os.path.join(OUTDIR, "disc.webp"), OUT)
print(json.dumps(meta, indent=1))
