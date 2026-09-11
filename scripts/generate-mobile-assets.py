"""Generate branded native icons and splash screens from the CredMais PWA icon."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "pwa-512.png"


def fit_icon(size: int) -> Image.Image:
    icon = Image.open(SOURCE).convert("RGBA")
    icon.thumbnail((size, size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (8, 17, 29, 255))
    canvas.alpha_composite(icon, ((size - icon.width) // 2, (size - icon.height) // 2))
    return canvas


def splash(size: tuple[int, int]) -> Image.Image:
    width, height = size
    canvas = Image.new("RGBA", size, (8, 17, 29, 255))
    glow = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    radius = max(48, min(width, height) // 3)
    center = (width // 2, height // 2)
    draw.ellipse(
        (center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius),
        fill=(233, 170, 60, 90),
    )
    canvas = Image.alpha_composite(canvas, glow.filter(ImageFilter.GaussianBlur(radius // 2)))
    icon_size = max(96, int(min(width, height) * 0.32))
    icon = fit_icon(icon_size)
    canvas.alpha_composite(icon, ((width - icon.width) // 2, (height - icon.height) // 2))
    return canvas.convert("RGB")


android_sizes = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}
for density, pixels in android_sizes.items():
    folder = ROOT / "android" / "app" / "src" / "main" / "res" / f"mipmap-{density}"
    for name in ("ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png"):
        fit_icon(pixels).save(folder / name, optimize=True)

for path in (ROOT / "android" / "app" / "src" / "main" / "res").glob("drawable*/splash.png"):
    with Image.open(path) as current:
        splash(current.size).save(path, optimize=True)

for path in (ROOT / "ios" / "App" / "App" / "Assets.xcassets" / "Splash.imageset").glob("*.png"):
    with Image.open(path) as current:
        splash(current.size).save(path, optimize=True)

