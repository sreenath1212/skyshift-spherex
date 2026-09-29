#!/usr/bin/env python3
"""
SkyShift SPHEREx Real Data Fetcher
===================================
Downloads real SPHEREx cutouts from NASA/IPAC IRSA for 3+ sky patches
and converts them to false-color JPGs for the web.

Requirements:
    pip install astroquery astropy pillow numpy requests

Usage:
    python fetch_spherex_data.py

Output:
    public/data/*.jpg  - False-color JPG cutouts
    public/data/manifest.json (updated with real file paths)

Data credit:
    DOI: 10.26131/IRSA652
    https://irsa.ipac.caltech.edu/Missions/spherex.html
"""

import json
import os
import sys
import time
import warnings
from pathlib import Path
from datetime import datetime

import numpy as np
import requests

try:
    from astroquery.ipac.irsa import Irsa
    from astropy.coordinates import SkyCoord
    from astropy import units as u
    from astropy.io import fits
    ASTROQUERY_AVAILABLE = True
except ImportError:
    ASTROQUERY_AVAILABLE = False
    print("WARNING: astroquery not installed. Falling back to IRSA REST API.")

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("ERROR: Pillow not installed. Run: pip install pillow")
    sys.exit(1)

# ── CONFIG ──────────────────────────────────────────────────────────────────
OUTPUT_DIR = Path("public/data")
MANIFEST_PATH = OUTPUT_DIR / "manifest.json"
IRSA_BASE = "https://irsa.ipac.caltech.edu"

# SPHEREx IRSA table name (QR2 data release)
SPHEREX_TABLE = "spherex_catalog_qr2"

# False-color palette (infrared channels → RGB)
# Channel 1 (shortest λ) → Acid lime
# Channel 2 (mid λ) → Hot magenta
# Channel 3 (longest λ) → Molten orange
FALSE_COLOR_MAP = {
    "short": (180, 242, 36),   # Acid lime  #B4F224
    "mid":   (232, 0, 110),    # Hot magenta #E8006E
    "long":  (255, 107, 26),   # Molten orange #FF6B1A
}

# Sky patches to fetch
PATCHES = [
    {
        "id": "comet_3i_atlas",
        "name": "Comet 3I/ATLAS",
        "ra": 83.8221,
        "dec": 11.6011,
        "size_arcmin": 10,
        "bands": ["ch5", "ch10", "ch18"],
        "description": "Interstellar comet discovered 2025",
    },
    {
        "id": "orion_nebula_region",
        "name": "Orion Nebula Region",
        "ra": 83.8221,
        "dec": -5.3911,
        "size_arcmin": 15,
        "bands": ["ch5", "ch10", "ch18"],
        "description": "Dense star-forming region",
    },
    {
        "id": "galactic_center_region",
        "name": "Galactic Center Region",
        "ra": 266.4168,
        "dec": -29.0078,
        "size_arcmin": 12,
        "bands": ["ch5", "ch10", "ch18"],
        "description": "Core of the Milky Way",
    },
]

# ── HELPERS ──────────────────────────────────────────────────────────────────

def apply_false_color(r_data, g_data, b_data, size=512):
    """Convert 3 grayscale FITS arrays into a false-color RGB image."""
    def normalize(arr):
        arr = np.nan_to_num(arr, nan=0.0)
        plow, phigh = np.percentile(arr[arr > 0], [1, 99]) if arr[arr > 0].size > 0 else (0, 1)
        arr = np.clip(arr, plow, phigh)
        if phigh > plow:
            arr = (arr - plow) / (phigh - plow)
        return arr

    r_norm = normalize(r_data)
    g_norm = normalize(g_data)
    b_norm = normalize(b_data)

    # Apply false-color palette
    R = (FALSE_COLOR_MAP["short"][0] * r_norm +
         FALSE_COLOR_MAP["mid"][0] * g_norm * 0.3 +
         FALSE_COLOR_MAP["long"][0] * b_norm * 0.2)
    G = (FALSE_COLOR_MAP["short"][1] * r_norm * 0.5 +
         FALSE_COLOR_MAP["mid"][1] * g_norm +
         FALSE_COLOR_MAP["long"][1] * b_norm * 0.3)
    B = (FALSE_COLOR_MAP["short"][2] * r_norm * 0.2 +
         FALSE_COLOR_MAP["mid"][2] * g_norm * 0.5 +
         FALSE_COLOR_MAP["long"][2] * b_norm)

    R = np.clip(R, 0, 255).astype(np.uint8)
    G = np.clip(G, 0, 255).astype(np.uint8)
    B = np.clip(B, 0, 255).astype(np.uint8)

    rgb = np.stack([R, G, B], axis=-1)
    img = Image.fromarray(rgb, 'RGB')
    img = img.resize((size, size), Image.LANCZOS)
    return img


def add_grain(img, intensity=8):
    """Add risograph-style grain to image."""
    arr = np.array(img, dtype=np.float32)
    grain = np.random.normal(0, intensity, arr.shape)
    arr = np.clip(arr + grain, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def fetch_spherex_cutout_irsa(patch, date_str, band):
    """
    Attempt to fetch a SPHEREx cutout from IRSA SIA service.
    Returns a PIL Image or None on failure.
    """
    ra, dec = patch["ra"], patch["dec"]
    size_deg = patch["size_arcmin"] / 60.0

    # IRSA Simple Image Access (SIA) endpoint for SPHEREx
    sia_url = f"{IRSA_BASE}/SIA/vohome"
    params = {
        "COLLECTION": "spherex",
        "POS": f"CIRCLE {ra} {dec} {size_deg/2}",
        "BAND": band,
        "FORMAT": "image/fits",
        "MAXREC": 5,
    }

    try:
        resp = requests.get(sia_url, params=params, timeout=30)
        resp.raise_for_status()
        # Parse VOTable response for image URLs
        # (simplified - real implementation would parse XML)
        if "fits" in resp.text.lower():
            # Extract first FITS URL
            import re
            urls = re.findall(r'https?://[^\s"<>]+\.fits[^\s"<>]*', resp.text)
            if urls:
                fits_resp = requests.get(urls[0], timeout=60)
                with fits.open(fits_resp.content, memmap=False) as hdul:
                    data = hdul[0].data
                    if data is not None:
                        return data
    except Exception as e:
        print(f"  SIA fetch failed for {patch['id']} {band}: {e}")

    return None


def create_placeholder_image(patch, date_str, band, size=512):
    """
    Create a clearly-labeled placeholder image when real data is unavailable.
    Returns a PIL Image labeled as 'Sample / illustration'.
    """
    img = Image.new('RGB', (size, size), color=(26, 11, 31))  # plum-black
    arr = np.array(img, dtype=np.float32)

    # Generate synthetic star-field in false-color palette
    rng = np.random.default_rng(hash(f"{patch['id']}{date_str}{band}") % (2**31))
    for _ in range(800):
        x = rng.integers(0, size)
        y = rng.integers(0, size)
        brightness = rng.uniform(0.3, 1.0)
        color_choice = rng.integers(0, 3)
        if color_choice == 0:
            color = [int(c * brightness) for c in FALSE_COLOR_MAP["short"]]
        elif color_choice == 1:
            color = [int(c * brightness) for c in FALSE_COLOR_MAP["mid"]]
        else:
            color = [int(c * brightness) for c in FALSE_COLOR_MAP["long"]]
        radius = rng.integers(1, 4)
        for dy in range(-radius, radius+1):
            for dx in range(-radius, radius+1):
                if dx**2 + dy**2 <= radius**2:
                    nx, ny = x+dx, y+dy
                    if 0 <= nx < size and 0 <= ny < size:
                        arr[ny, nx] = [min(255, arr[ny, nx, i] + color[i]) for i in range(3)]

    # Add nebula-like glow
    from PIL import ImageFilter
    img_arr = np.clip(arr, 0, 255).astype(np.uint8)
    img = Image.fromarray(img_arr)
    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    img = add_grain(img, intensity=6)

    # Watermark with label
    from PIL import ImageDraw, ImageFont
    draw = ImageDraw.Draw(img)
    label = "SAMPLE / ILLUSTRATION"
    sub = f"{patch['name']} · {date_str} · {band}"
    draw.rectangle([0, size-60, size, size], fill=(26, 11, 31, 180))
    try:
        font_large = ImageFont.truetype("arial.ttf", 14)
        font_small = ImageFont.truetype("arial.ttf", 11)
    except Exception:
        font_large = ImageFont.load_default()
        font_small = font_large
    draw.text((10, size-55), label, fill=(232, 0, 110), font=font_large)
    draw.text((10, size-35), sub, fill=(244, 235, 221), font=font_small)
    draw.text((10, size-18), "Real SPHEREx data pending IRSA download", fill=(180, 242, 36), font=font_small)

    return img


def process_patch(patch):
    """Download and process one sky patch for all available dates."""
    print(f"\n{'='*60}")
    print(f"Processing: {patch['name']}")
    observations = []

    # Simulate multiple observation dates (real code would query IRSA for actual obs dates)
    dates = ["2025-05-01", "2025-07-15", "2025-09-01"]

    for i, date_str in enumerate(dates):
        for band in patch["bands"]:
            filename = f"{patch['id']}_{date_str.replace('-','')}_b{band}.jpg"
            filepath = OUTPUT_DIR / filename
            web_path = f"/data/{filename}"

            print(f"  Fetching {date_str} band={band}...", end=" ", flush=True)

            # Attempt real IRSA fetch
            real_data = None
            is_sample = True

            if ASTROQUERY_AVAILABLE:
                try:
                    real_data = fetch_spherex_cutout_irsa(patch, date_str, band)
                except Exception as e:
                    print(f"[IRSA fetch error: {e}]", end=" ")

            if real_data is not None:
                # We got real data - convert to false color
                # Use single channel for now; multi-channel compose requires all 3 bands
                dummy = np.zeros_like(real_data)
                img = apply_false_color(real_data, dummy, dummy)
                img = add_grain(img)
                label_text = "Real SPHEREx data"
                is_sample = False
                print("✓ REAL DATA")
            else:
                img = create_placeholder_image(patch, date_str, band)
                label_text = "Sample / illustration — real SPHEREx cutout"
                print("→ placeholder")

            img.save(filepath, "JPEG", quality=85, optimize=True)

            # Only add one entry per date (use mid band for timeline view)
            if band == "ch10":
                observations.append({
                    "date": date_str,
                    "file": web_path,
                    "band": band,
                    "wavelength": "3.55 µm (mid-infrared)",
                    "sample": is_sample,
                    "label": label_text,
                })

    return observations


# ── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print("SkyShift SPHEREx Data Fetcher")
    print(f"Output: {OUTPUT_DIR.resolve()}")
    print(f"IRSA endpoint: {IRSA_BASE}")

    if not PIL_AVAILABLE:
        print("ERROR: Pillow required. Install: pip install Pillow")
        sys.exit(1)

    manifest = {
        "version": "1.0.0",
        "generated": datetime.utcnow().isoformat() + "Z",
        "patches": [],
        "attribution": {
            "telescope": "SPHEREx (Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer)",
            "doi": "10.26131/IRSA652",
            "irsa_url": "https://irsa.ipac.caltech.edu/Missions/spherex.html",
            "credit": "This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the California Institute of Technology, and is funded by the National Aeronautics and Space Administration."
        }
    }

    for patch in PATCHES:
        observations = process_patch(patch)
        manifest["patches"].append({
            "id": patch["id"],
            "name": patch["name"],
            "description": patch["description"],
            "ra": patch["ra"],
            "dec": patch["dec"],
            "observations": observations,
        })
        time.sleep(1)  # Be polite to IRSA servers

    with open(MANIFEST_PATH, "w") as f:
        json.dump(manifest, f, indent=2)

    real_count = sum(
        1 for p in manifest["patches"]
        for o in p["observations"]
        if not o.get("sample", True)
    )
    total = sum(len(p["observations"]) for p in manifest["patches"])
    print(f"\n{'='*60}")
    print(f"Done! {total} images total ({real_count} real, {total-real_count} placeholders)")
    print(f"Manifest saved to: {MANIFEST_PATH}")
    print("\nDOI: 10.26131/IRSA652")
    print("IRSA: https://irsa.ipac.caltech.edu/Missions/spherex.html")


if __name__ == "__main__":
    main()
