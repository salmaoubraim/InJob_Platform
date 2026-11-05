"""Rend transparent le fond blanc extérieur de public/images/hero.png."""
from collections import deque
from pathlib import Path

from PIL import Image

HERO = Path(__file__).resolve().parents[1] / "frontend" / "public" / "images" / "hero.png"
TOLERANCE = 28


def is_background(r: int, g: int, b: int, a: int) -> bool:
    """Blanc + gris clair (damier « transparence » des PNG téléchargés)."""
    if a == 0:
        return False
    t = 255 - TOLERANCE
    if r >= t and g >= t and b >= t:
        return True
    if abs(r - g) <= 12 and abs(g - b) <= 12 and abs(r - b) <= 12:
        avg = (r + g + b) / 3
        return 155 <= avg <= 252
    return False


def remove_outer_white(path: Path) -> None:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    px = img.load()
    visited: set[tuple[int, int]] = set()
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        for y in (0, h - 1):
            if is_background(*px[x, y]):
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_background(*px[x, y]):
                q.append((x, y))

    while q:
        x, y = q.popleft()
        if (x, y) in visited or not (0 <= x < w and 0 <= y < h):
            continue
        r, g, b, a = px[x, y]
        if not is_background(r, g, b, a):
            continue
        visited.add((x, y))
        px[x, y] = (r, g, b, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if (nx, ny) not in visited:
                q.append((nx, ny))

    img.save(path, optimize=True)
    print(f"OK: {path} ({w}x{h}), {len(visited)} px rendus transparents")


if __name__ == "__main__":
    remove_outer_white(HERO)
