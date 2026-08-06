import os, re

ROOT = "/app frontend".split()[0] + "/frontend/src"

GRAD_TOKEN = re.compile(
    r"^(from|via|to)-(slate|blue|violet|white|black|red)(?:-(50|100|200|300|400|500|600|700|800|900|950))?$"
)

LIGHT = ["from-slate-50", "via-white", "to-blue-50"]
MID2 = ["from-blue-600", "to-violet-600"]
MID3 = ["from-blue-600", "via-blue-500", "to-violet-600"]
DARK2 = ["from-slate-900", "to-blue-950"]
DARK3 = ["from-slate-900", "via-blue-900", "to-slate-900"]

# decorative card tilts only — never touch rotate-180 (chevrons) or rotate-90
TILT = re.compile(r"(?<![\w:-])((?:group-hover:|hover:|focus:)?)-?rotate-(1|2|3|6)(?![\d])")


def normalize_gradients(class_str):
    tokens = class_str.split(" ")
    out = []
    i = 0
    while i < len(tokens):
        if GRAD_TOKEN.match(tokens[i]):
            run = []
            while i < len(tokens) and GRAD_TOKEN.match(tokens[i]):
                run.append(tokens[i])
                i += 1
            shades = []
            for t in run:
                m = GRAD_TOKEN.match(t)
                shades.append(int(m.group(3)) if m.group(3) else 0)
            top = max(shades)
            three = len(run) >= 3
            if top <= 200:
                ramp = LIGHT
            elif top <= 600:
                ramp = MID3 if three else MID2
            else:
                ramp = DARK3 if three else DARK2
            out.extend(ramp)
        else:
            out.append(tokens[i])
            i += 1
    return " ".join(out)


CLASS_ATTR = re.compile(r'className="([^"{}]*)"')
CLASS_TMPL = re.compile(r"className=\{`([^`]*)`\}")


def process(src):
    def attr(m):
        return 'className="' + normalize_gradients(m.group(1)) + '"'

    def tmpl(m):
        body = m.group(1)
        parts = re.split(r"(\$\{[^{}]*\})", body)
        parts = [p if p.startswith("${") else normalize_gradients(p) for p in parts]
        return "className={`" + "".join(parts) + "`}"

    src = CLASS_ATTR.sub(attr, src)
    src = CLASS_TMPL.sub(tmpl, src)
    src = TILT.sub(lambda m: m.group(1) + "rotate-0", src)
    src = src.replace("hover:-translate-y-4", "hover:-translate-y-1")
    src = src.replace("hover:-translate-y-3", "hover:-translate-y-1")
    src = src.replace("hover:-translate-y-2", "hover:-translate-y-1")
    src = src.replace("hover:scale-105", "hover:scale-[1.02]")
    src = src.replace("hover:scale-110", "hover:scale-[1.03]")
    return src


changed = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    if "node_modules" in dirpath or "/components/ui" in dirpath or "/components/brand" in dirpath:
        continue
    for fn in filenames:
        if not fn.endswith((".js", ".jsx")):
            continue
        p = os.path.join(dirpath, fn)
        s = open(p, encoding="utf-8").read()
        o = process(s)
        if o != s:
            open(p, "w", encoding="utf-8").write(o)
            changed.append(p.replace(ROOT + "/", ""))

print(len(changed), "files normalised")
for c in changed:
    print(" -", c)
