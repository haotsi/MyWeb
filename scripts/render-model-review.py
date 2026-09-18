"""Offline orthographic geometry checks; numpy and Pillow, no browser required.

First run: node scripts/build-north-building.mjs --inspection
Then: python scripts/render-model-review.py
This z-buffer render checks exported geometry, not browser lighting/performance.
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

OUT = Path('.work/model-review')
parts = json.loads((OUT / 'geometry.json').read_text())


def render(name, eye, width=1440, height=900):
    target = np.array([0., 3.45, 0.])
    forward = np.array(eye, dtype=float) - target
    forward /= np.linalg.norm(forward)
    right = np.cross([0, 1, 0], forward)
    right /= np.linalg.norm(right)
    up = np.cross(forward, right)
    basis = np.array([right, up, forward]).T
    scale = 75 if name == 'east' else 78
    pixels = np.empty((height, width, 3), dtype=np.uint8)
    pixels[:] = [233, 239, 236]
    depth = np.full((height, width), -np.inf)
    light = np.array([-.45, .82, .65])
    light /= np.linalg.norm(light)
    count = 0
    for part in parts:
        positions = np.asarray(part['positions']).reshape(-1, 3)
        indices = np.asarray(part['indices']).reshape(-1, 3)
        normals = np.asarray(part['normals']).reshape(-1, 3)
        points = (positions - target) @ basis
        points[:, 0] = width / 2 + points[:, 0] * scale
        points[:, 1] = height / 2 - points[:, 1] * scale
        base = np.asarray(part['color'])
        colors = np.asarray(part['colors']).reshape(-1, 3) if part['colors'] else None
        for ids in indices:
            n = normals[ids].mean(axis=0)
            if n @ forward < -.01 and part['name'] != 'leaf':
                continue
            p = points[ids]
            xmin = max(0, int(np.floor(p[:, 0].min())))
            xmax = min(width - 1, int(np.ceil(p[:, 0].max())))
            ymin = max(0, int(np.floor(p[:, 1].min())))
            ymax = min(height - 1, int(np.ceil(p[:, 1].max())))
            if xmax < xmin or ymax < ymin:
                continue
            x0, y0, z0 = p[0]
            x1, y1, z1 = p[1]
            x2, y2, z2 = p[2]
            den = (y1-y2)*(x0-x2)+(x2-x1)*(y0-y2)
            if abs(den) < 1e-8:
                continue
            yy, xx = np.mgrid[ymin:ymax+1, xmin:xmax+1]
            xx = xx + .5
            yy = yy + .5
            a = ((y1-y2)*(xx-x2)+(x2-x1)*(yy-y2))/den
            b = ((y2-y0)*(xx-x2)+(x0-x2)*(yy-y2))/den
            c = 1-a-b
            z = a*z0+b*z1+c*z2
            patch = depth[ymin:ymax+1, xmin:xmax+1]
            mask = (a >= -1e-5) & (b >= -1e-5) & (c >= -1e-5) & (z > patch)
            if not mask.any():
                continue
            patch[mask] = z[mask]
            shade = .64 + .6 * max(0., float(n @ light))
            linear = base * (colors[ids].mean(axis=0) if colors is not None else 1) * shade
            rgb = np.where(linear <= .0031308, linear*12.92, 1.055*np.maximum(linear,0)**(1/2.4)-.055)
            pixels[ymin:ymax+1, xmin:xmax+1][mask] = np.clip(rgb*255, 0, 255).astype(np.uint8)
            count += 1
    im = Image.fromarray(pixels)
    label = ImageDraw.Draw(im)
    label.text((28, 26), f'NORTH BUILDING / {name.upper()} / GEOMETRY REVIEW', fill=(54,77,70))
    im.save(OUT / f'{name}.png')
    print(f'{name}: {count} visible triangles', flush=True)


if __name__ == '__main__':
    render('front', [0, 3.45, 40])
    render('perspective', [14, 13, 25])
    render('east', [40, 3.45, 0])
    render('rear', [-15, 12, -25])
