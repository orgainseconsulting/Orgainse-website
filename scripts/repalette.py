import os, re

ROOT = "/app/frontend/src"

PREFIXES = ["text","bg","border","from","via","to","ring","ring-offset","shadow","fill","stroke","decoration","outline","divide","placeholder","caret","accent","selection"]

# decorative palettes -> brand palette
COLOR_MAP = {
    "orange": "blue",
    "amber": "blue",
    "yellow": "blue",
    "lime": "blue",
    "green": "blue",
    "emerald": "blue",
    "teal": "blue",
    "cyan": "blue",
    "sky": "blue",
    "indigo": "blue",
    "purple": "violet",
    "fuchsia": "violet",
    "pink": "violet",
    "rose": "violet",
    "gray": "slate",
    "zinc": "slate",
    "neutral": "slate",
    "stone": "slate",
}

HEX_MAP = {
    "#f97316": "#2563eb", "#F97316": "#2563EB",
    "#fb923c": "#3b82f6", "#fdba74": "#93c5fd", "#ea580c": "#1d4ed8",
    "#f59e0b": "#2563eb", "#fbbf24": "#3b82f6", "#fcd34d": "#93c5fd",
    "#10b981": "#7c3aed", "#10B981": "#7C3AED", "#4ade80": "#a78bfa",
    "#06b6d4": "#2563eb", "#8b5cf6": "#7c3aed",
    "#ff6b4a": "#2563eb",
}

color_alt = "|".join(COLOR_MAP.keys())
prefix_alt = "|".join(sorted(PREFIXES, key=len, reverse=True))
CLASS_RE = re.compile(rf"\b({prefix_alt})-({color_alt})-(50|100|200|300|400|500|600|700|800|900|950)\b")
# gradient tokens for red are decorative; keep plain red-* for error states
RED_GRAD_RE = re.compile(r"\b(from|via|to)-red-(50|100|200|300|400|500|600|700|800|900)\b")

def sub_class(m):
    return f"{m.group(1)}-{COLOR_MAP[m.group(2)]}-{m.group(3)}"

changed = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    if "node_modules" in dirpath:
        continue
    for fn in filenames:
        if not fn.endswith((".js", ".jsx", ".ts", ".tsx", ".css")):
            continue
        p = os.path.join(dirpath, fn)
        src = open(p, encoding="utf-8").read()
        out = CLASS_RE.sub(sub_class, src)
        out = RED_GRAD_RE.sub(lambda m: f"{m.group(1)}-blue-{m.group(2)}", out)
        for k, v in HEX_MAP.items():
            out = out.replace(k, v)
        # rgba brand oranges/greens used in inline styles
        out = re.sub(r"rgba\(\s*249,\s*115,\s*22", "rgba(37, 99, 235", out)
        out = re.sub(r"rgba\(\s*16,\s*185,\s*129", "rgba(124, 58, 237", out)
        out = re.sub(r"rgba\(\s*245,\s*158,\s*11", "rgba(37, 99, 235", out)
        if out != src:
            open(p, "w", encoding="utf-8").write(out)
            changed.append(p)

print(len(changed), "files updated")
for c in changed:
    print(" -", c.replace(ROOT + "/", ""))
