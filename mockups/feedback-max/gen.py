import math, random, json
random.seed(7)
HEAD = open('../feedback-v2/Reading.dc.html').read().split('<div style="width: 390px')[0]
C = dict(bg="#FBF6EE", ink="#1E2620", muted="#59645C", green="#2E5B3E", tint="#F1F6F2", line="#EDE4D6", peach="#FCE3CF", peachInk="#7A3A10", orange="#C26A2C", grey="#B9C4BB", purple="#3D3A8C", purpleBg="#EDEBFA", gold="#6B5410", goldBg="#F3E9C9", red="#8A1F14", redBg="#F8D4D0")
DUR = 96
PLAY = '<span class="pb" style="width:26px;height:26px"><svg width="9" height="10" viewBox="0 0 11 12" aria-hidden="true"><path d="M1 1 L10 6 L1 11 Z" fill="#FFFFFF"></path></svg></span>'
def chip(t, bg, ink): return f'<span style="padding:2px 8px;border-radius:999px;background:{bg};color:{ink};font-size:11px;font-weight:700;white-space:nowrap">{t}</span>'
EV = {"strong": chip("Strong evidence", "#E6EDE7", C["green"]), "moderate": chip("Moderate", C["goldBg"], C["gold"]), "weak": chip("Weak evidence", "#EEE", "#666")}
SRC = {"audio": chip("From the audio", C["tint"], C["green"]), "words": chip("From the transcript", C["tint"], C["green"]), "coach": chip("Coach's read", C["purpleBg"], C["purple"]), "model": chip("Voice model", "#EEE", "#666")}
def section(title, ev, src, body, shown=False, note=""):
    keep = f'<span style="display:flex;align-items:center;gap:5px;font-size:11px;color:{C["muted"]};font-weight:700"><span style="width:14px;height:14px;border:1.5px solid {C["grey"]};border-radius:4px;display:inline-block"></span>keep?</span>'
    shown_t = chip("Shown today", C["peach"], C["peachInk"]) if shown else chip("Hidden today", "#EEE", "#888")
    n = f'<span style="font-size:12px;color:{C["muted"]};line-height:1.4;font-style:italic">{note}</span>' if note else ""
    return f'''<div style="background:#FFF;border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:10px;box-shadow:0 1px 2px rgba(30,38,32,0.06)">
<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:16px">{title}</b>{keep}</div>
<div style="display:flex;gap:5px;flex-wrap:wrap">{EV[ev]}{SRC[src]}{shown_t}</div>
{body}{n}</div>'''
def stat(label, value, sub="", tone=None):
    col = {"good": C["green"], "warn": C["orange"]}.get(tone, C["muted"])
    return f'<div style="background:{C["bg"]};border-radius:12px;padding:8px 10px;display:flex;flex-direction:column;gap:1px"><span style="font-size:11px;color:{C["muted"]}">{label}</span><b style="font-size:16px">{value}</b><span style="font-size:11px;color:{col}">{sub}</span></div>'
def grid(*cells, cols=3): return f'<div style="display:grid;grid-template-columns:repeat({cols},1fr);gap:6px">{"".join(cells)}</div>'
def moment(t, what, tag, tone="warn"):
    col = C["orange"] if tone == "warn" else C["green"] if tone == "good" else C["muted"]
    return f'<div style="display:flex;gap:10px;align-items:center;padding:8px 10px;border-radius:12px;background:{C["bg"]};border-left:4px solid {col}">{PLAY}<div style="display:flex;flex-direction:column;gap:1px;flex:1"><span style="font-size:13px;line-height:1.35"><b>{t}</b> · {what}</span><span style="font-size:11px;color:{C["muted"]}">{tag}</span></div></div>'
def x(t, w=326): return t / DUR * w
def board(name, title, h, inner):
    tail = f'''</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":390,"height":{h}}}}}'>
class Component extends DCLogic {{ renderVals() {{ return {{}}; }} }}
</script>
</body>
</html>
'''
    page = HEAD.replace('<title>Feedback: reading result</title>', f'<title>{title}</title>') + f'<div style="width:390px;min-height:{h}px;box-sizing:border-box;background:{C["bg"]};color:{C["ink"]};font-family:\'Atkinson Hyperlegible Next\',system-ui,sans-serif;padding:22px 16px 40px;display:flex;flex-direction:column;gap:12px">\n' + inner + tail
    open(f'{name}.dc.html', 'w').write(page)

# ---------- data for one 1:36 Table Topic ----------
levels = []
for i in range(320):
    t = i * 0.3
    silent = any(a <= t < b for a, b in [(0, 0.6), (4.1, 4.9), (6.3, 8.2), (12.5, 13.3), (21.0, 21.7), (29.8, 30.4), (39.5, 40.2), (46.6, 47.8), (56.0, 56.6), (66.0, 66.8), (75.5, 76.1), (88.0, 88.9)])
    base = 0 if silent else 0.35 + 0.35 * abs(math.sin(i * 0.7)) + random.random() * 0.25
    if t > 89: base *= max(0.25, 1 - (t - 89) / 7)
    levels.append(base)
MOMENTS = [(1, "Strong start", "good"), (6.3, "Long stop + um", "warn"), (16, "Pitch jumped high", "info"), (21, "Rose at the end", "warn"), (31, "Rushed stretch", "warn"), (46.6, "Pause before the point", "good"), (58, "Flat stretch", "warn"), (90, "Faded out", "warn")]

def scrubber(sel=2):
    bars = "".join(f'<rect x="{i*326/320:.1f}" y="{30 - v*26:.1f}" width="0.8" height="{max(0.5, v*52):.1f}" fill="{C["grey"]}"></rect>' for i, v in enumerate(levels))
    pins = ""
    for k, (t, lab, tone) in enumerate(MOMENTS):
        col = {"good": C["green"], "warn": C["orange"], "info": C["purple"]}[tone]
        r = 7 if k == sel else 5
        pins += f'<line x1="{x(t):.1f}" y1="60" x2="{x(t):.1f}" y2="68" stroke="{col}" stroke-width="2"></line><circle cx="{x(t):.1f}" cy="{74}" r="{r}" fill="{col}" stroke="#FFF" stroke-width="2"></circle>'
    head = f'<line x1="{x(16):.1f}" y1="0" x2="{x(16):.1f}" y2="60" stroke="{C["ink"]}" stroke-width="1.5"></line>'
    ticks = "".join(f'<text x="{x(s):.1f}" y="94" font-size="9" fill="{C["muted"]}" text-anchor="middle">{s//60}:{s%60:02d}</text>' for s in [0, 30, 60, 90])
    return f'<svg width="326" height="98" viewBox="0 0 326 98" role="img" aria-label="Your recording with moments marked">{bars}{head}{pins}{ticks}</svg>'

# ---------- Board A: overview and moments ----------
A = f'''
<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:15px;color:{C["muted"]}">✕</span><span style="font-size:13px;color:{C["muted"]}">Table Topic · “A risk worth taking?” · 1:36</span></div>
<span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:{C["purple"]}">Maximal mock · everything we could show · A of C</span>
<h1 style="margin:0;font-family:Fraunces,Georgia,serif;font-size:27px;line-height:1.15;font-weight:600">A clear story with good flow. It faded at the end.</h1>

{section("How it felt vs what we measured", "moderate", "audio", f'''<div style="display:flex;flex-direction:column;gap:6px;font-size:14px;line-height:1.45"><span><b>You said:</b> “A bit rushed” · 3 of 5</span><span>Your pace was <b>normal for you</b>. What felt rushed: the 30–40 s stretch, where you sped up by about a fifth.</span></div>''', True, "Trains people to hear themselves; needs self-rating first.")}

{section("Moments: tap to hear", "moderate", "audio", f'''{scrubber()}
<div style="background:{C["purpleBg"]};border-radius:12px;padding:10px 12px;display:flex;gap:10px;align-items:center">{PLAY}<span style="font-size:14px;line-height:1.4;color:{C["ink"]}"><b>0:16 · Your pitch jumped high on “throwing”.</b> It sounds surprised. Good if you meant it; it’s the highest point of the answer. <span style="color:{C["muted"]}">Plays 0:14–0:19</span></span></div>
<div style="display:flex;flex-direction:column;gap:6px">
{moment("0:01", "Went straight into the story, no “so, um”", "Opening · reliable", "good")}
{moment("0:06", "Stopped for 1.9 s mid-sentence, with “um”", "Pauses · reliable with the deeper check")}
{moment("0:16", "Pitch jumped high on “throwing”", "Pitch · fairly sure", "info")}
{moment("0:21", "“…right?” A statement that rose like a question", "Endings + tag question · fairly sure")}
{moment("0:31", "Sped up: about 190 a minute for 9 s", "Pace · reliable")}
{moment("0:47", "1.2 s pause right before your point", "Pauses · reliable", "good")}
{moment("0:58", "12 s with almost no pitch movement", "Pitch · fairly sure")}
{moment("1:30", "Last sentence got quieter and trailed off", "Volume · reliable")}
</div>''', False, "The scrubber is the backbone: every finding is a moment you can hear.")}

{section("Best moment", "moderate", "audio", f'''<div style="display:flex;gap:10px;align-items:center">{PLAY}<span style="font-size:14px;line-height:1.45">0:47 · a 1.2 s pause right before <b>“and that changed everything.”</b></span></div>''', True)}

{section("Personal bests and firsts", "strong", "audio", grid(stat("Longest flow", "14 s", "best yet", "good"), stat("No pause words", "first 40 s", "a first", "good"), stat("Pause before a point", "3rd take running", "", "good")), False, "Only from measures we trust.")}

{section("At a glance", "strong", "audio", grid(stat("Spoke for", "1:31"), stat("Pace", "146 / min", "your usual", None), stat("Pace while talking", "171 / min", "+4% on usual"), stat("Words per run", "9.2", "+2.1 on usual", "good"), stat("Time speaking", "84%", "usual 81%"), stat("Time to first word", "0.6 s", "quick", "good")), True, "Overall pace and words per run are shown today; the rest are hidden.")}

{section("Take fingerprint", "moderate", "audio", f'''<svg width="326" height="40" viewBox="0 0 326 40" aria-hidden="true">{"".join(f'<rect x="{i*326/60:.1f}" y="{20-v*16:.1f}" width="{326/60-1:.1f}" height="{max(1,v*32):.1f}" rx="2" fill="{C["green"] if v>0.2 else C["line"]}"></rect>' for i,v in enumerate([sum(levels[j*5:(j+1)*5])/5 for j in range(60)]))}<circle cx="{x(6.3):.1f}" cy="36" r="3" fill="{C["orange"]}"></circle><circle cx="{x(46.6):.1f}" cy="36" r="3" fill="{C["green"]}"></circle></svg>
<span style="font-size:13px;color:{C["muted"]}">One strip per take: flow, stops and ums. It also shows in History.</span>''', True)}
'''
board("A-Overview", "Maximal feedback A: overview and moments", 1680, A)

# ---------- Board B: how it sounded ----------
def pace_ribbon():
    pts = [(0,150),(10,148),(20,152),(30,188),(38,192),(42,160),(55,150),(70,146),(85,140),(96,132)]
    d = "M" + " L".join(f"{x(t):.1f} {70-(v-110)*0.6:.1f}" for t,v in pts)
    band = f'<rect x="0" y="{70-(160-110)*0.6:.1f}" width="326" height="{(160-138)*0.6:.1f}" fill="{C["tint"]}"></rect>'
    return f'<svg width="326" height="78" viewBox="0 0 326 78" aria-hidden="true">{band}<path d="{d}" stroke="{C["ink"]}" stroke-width="2.5" fill="none"></path><rect x="{x(30):.1f}" y="4" width="{x(10):.1f}" height="70" fill="{C["peach"]}" opacity="0.5"></rect><text x="{x(35):.1f}" y="12" font-size="9" text-anchor="middle" fill="{C["peachInk"]}">fast</text><text x="320" y="{70-(150-110)*0.6-2:.1f}" font-size="9" text-anchor="end" fill="{C["green"]}">your usual</text></svg>'
def pause_hist():
    pauses = [0.3,0.3,0.4,0.4,0.5,0.6,0.7,0.8,0.8,0.9,1.2,1.9]
    mid = {0.4:1, 1.9:1}
    out = ""
    for i,p in enumerate(pauses):
        col = C["orange"] if p in mid and (p==1.9 or i==2) else C["green"]
        out += f'<rect x="{i*27+2}" y="{60-p*28:.1f}" width="22" height="{p*28:.1f}" rx="3" fill="{col}" opacity="{0.45 if p<1 else 1}"></rect><text x="{i*27+13}" y="72" font-size="8" text-anchor="middle" fill="{C["muted"]}">{p}</text>'
    return f'<svg width="326" height="76" viewBox="0 0 326 76" aria-hidden="true"><line x1="0" y1="{60-28}" x2="326" y2="{60-28}" stroke="{C["line"]}" stroke-dasharray="3 3"></line><text x="324" y="{60-30}" font-size="8" text-anchor="end" fill="{C["muted"]}">1 s</text>{out}</svg>'
def flow_strip():
    runs = [4.1,1.4,4.3,7.7,8.3,9.3,6.8,9.4,9.4,9.4,12.1,7.1]
    xx=0; out=""
    for r in runs:
        w = r/96*326*0.9; out += f'<rect x="{xx:.1f}" y="6" width="{w:.1f}" height="14" rx="4" fill="{C["green"] if r>8 else C["grey"]}"></rect>'; xx += w + 3
    return f'<svg width="326" height="26" viewBox="0 0 326 26" aria-hidden="true">{out}</svg>'
def phrase(words, d, end):
    col = C["orange"] if end=="rose" else C["green"]
    return f'<div style="display:flex;flex-direction:column;gap:0"><svg width="326" height="34" viewBox="0 0 326 34" aria-hidden="true"><path d="{d}" stroke="{C["green"]}" stroke-width="2.5" fill="none" stroke-linecap="round"></path></svg><div style="display:flex;justify-content:space-between;font-size:13px"><span>{words}</span><b style="color:{col};font-size:12px">{"↗ rose" if end=="rose" else "↘ fell"}</b></div></div>'
def range_band():
    return f'''<svg width="326" height="44" viewBox="0 0 326 44" aria-hidden="true"><rect x="0" y="18" width="326" height="8" rx="4" fill="{C["line"]}"></rect><rect x="90" y="14" width="120" height="16" rx="8" fill="{C["grey"]}" opacity="0.5"></rect><rect x="70" y="18" width="170" height="8" rx="4" fill="{C["green"]}"></rect><text x="150" y="10" font-size="9" text-anchor="middle" fill="{C["muted"]}">your usual range</text><text x="70" y="40" font-size="9" fill="{C["green"]}">today: 9 semitones, wider than usual</text></svg>'''
def loud_line():
    pts = [(i*0.3, v) for i,v in enumerate(levels)][::6]
    d = "M" + " L".join(f"{x(t):.1f} {40-v*30:.1f}" for t,v in pts)
    return f'<svg width="326" height="46" viewBox="0 0 326 46" aria-hidden="true"><path d="{d}" stroke="{C["ink"]}" stroke-width="1.5" fill="none" opacity="0.7"></path><rect x="{x(89):.1f}" y="0" width="{x(7):.1f}" height="44" fill="{C["peach"]}" opacity="0.55"></rect><text x="{x(92.5):.1f}" y="10" font-size="9" text-anchor="middle" fill="{C["peachInk"]}">faded</text></svg>'
def endings():
    seq = ["fell","fell","rose","rose","fell","fell","fell","fell","rose"]
    return '<div style="display:flex;gap:7px;font-size:20px;font-weight:700">' + "".join(f'<span style="color:{C["orange"] if s=="rose" else C["green"]}">{"↗" if s=="rose" else "↘"}</span>' for s in seq) + f'<span style="font-size:12px;color:{C["muted"]};font-weight:400;align-self:center;margin-left:4px">3 of 9 rose · usual 1 of 9</span></div>'

B = f'''
<span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:{C["purple"]}">Maximal mock · B of C · how it sounded</span>
<h2 style="margin:0;font-family:Fraunces,Georgia,serif;font-size:24px;font-weight:600">How it sounded</h2>

{section("Pace over time", "strong", "audio", pace_ribbon() + grid(stat("Articulation", "5.1 syll/s", "usual 4.9"), stat("Opening pace", "×0.97", "even start", "good"), stat("Pace at the end", "×0.88", "slowed down")), False, "Answers “where did I rush?” Shown today only as one number.")}

{section("Pauses: how long, and where", "strong", "audio", pause_hist() + f'<div style="display:flex;gap:12px;font-size:11px;color:{C["muted"]}"><span><b style="color:{C["green"]}">■</b> at a sentence end</span><span><b style="color:{C["orange"]}">■</b> mid-sentence</span><span>faint = under 1 s</span></div>' + grid(stat("Pauses a minute", "8.1"), stat("Typical pause", "0.6 s"), stat("Long pause", "1.3 s", "90th percentile"), stat("Long pauses", "17%"), stat("Mid-sentence", "2 of 12", "1 is long", "warn"), stat("Before key points", "1.1 s", "", "good")), False, "Mid-sentence share is shown today; everything else is hidden.")}

{section("Flow: stretches between pauses", "strong", "audio", flow_strip() + f'<span style="font-size:13px">Longest: <b>12 s</b> · average 9.2 words per run. Green = a long, smooth stretch.</span>', True)}

{section("Pitch, phrase by phrase", "moderate", "audio", phrase("My manager said you’re throwing it away", "M4 24 C 60 22, 100 6, 140 6 C 180 8, 230 20, 322 22", "fell") + phrase("And honestly I sort of believed him, right?", "M4 22 C 80 22, 160 24, 240 20 C 280 16, 300 8, 322 4", "rose") + f'<span style="font-size:12px;color:{C["muted"]}">Tap a phrase to hear it.</span>', True)}

{section("Pitch range vs your usual", "strong", "audio", range_band() + grid(stat("Pitch spread", "2.8 st", "+0.4", "good"), stat("Usual pitch", "118 Hz"), stat("Flat stretches", "1", "0:58, 12 s", "warn")), False, "Pitch range is shown today; spread and flat stretches are hidden.")}

{section("Endings: every sentence", "moderate", "audio", endings(), False)}

{section("Volume", "strong", "audio", loud_line() + grid(stat("Volume variety", "0.31", "usual 0.27", "good"), stat("End vs start", "−4.2 dB", "quieter", "warn"), stat("Fading endings", "2 of 9")), False, "Only meaningful with the phone’s auto gain off (it is).")}

{section("Energy across the answer", "weak", "audio", f'<svg width="326" height="40" viewBox="0 0 326 40" aria-hidden="true"><path d="M10 26 C 60 20, 110 12, 163 14 C 220 16, 270 22, 316 32" stroke="{C["purple"]}" stroke-width="3" fill="none"></path><text x="10" y="38" font-size="9" fill="{C["muted"]}">start</text><text x="163" y="38" font-size="9" text-anchor="middle" fill="{C["muted"]}">middle</text><text x="316" y="38" font-size="9" text-anchor="end" fill="{C["muted"]}">end</text></svg><span style="font-size:13px">Built up, then dropped at the close.</span>', True)}

{section("Voice quality", "weak", "audio", grid(stat("Projection", "−11 dB", "alpha ratio"), stat("Creak (fry)", "4%", "low"), stat("Clarity (HNR)", "14 dB"), stat("Jitter", "1.1%"), stat("Shimmer", "6%"), stat("Clear words", "0.93", "transcription")), False, "Interesting, but hard to act on and noisy on phones.")}

{section("How the voice came across (model)", "moderate", "model", grid(stat("Energy", "0.62"), stat("Dominance", "0.48"), stat("Pleasantness", "0.55")), False, "Optional open model; guesses at impressions, never facts.")}
'''
board("B-Sound", "Maximal feedback B: how it sounded", 2620, B)

# ---------- Board C: what was said ----------
def hl(t, bg, tip=""): return f'<span style="background:{bg};border-radius:4px;padding:0 2px" title="{tip}">{t}</span>'
transcript = " ".join([
 "Two years ago I left a job I liked.",
 f"Everyone told me {hl('um','#FCE3CF')} it was a mistake.",
 f"My manager said, {hl('you know','#EDEBFA')}, you're {hl('kind of','#F3E9C9')} throwing it away.",
 f"And honestly I {hl('sort of','#F3E9C9')} believed him, {hl('right?','#EDEBFA')}",
 f"But I'd been thinking about it for a {hl('really','#E6EDE7')} long time.",
 f"I moved cities, I {hl('I','#F8D4D0')} started over, and that changed everything.",
 "Now I run my own team of six.",
 f"So yeah, {hl('I guess','#F3E9C9')} that's {hl('it','#EEE')}."])
legend = '<div style="display:flex;gap:8px;flex-wrap:wrap;font-size:11px">' + "".join(f'<span style="background:{b};border-radius:4px;padding:1px 6px">{t}</span>' for t,b in [("pause words","#FCE3CF"),("hedges","#F3E9C9"),("tag questions / “you know”","#EDEBFA"),("intensifiers","#E6EDE7"),("repeats","#F8D4D0"),("vague words","#EEE")]) + '</div>'
def bar(label, v, usual, mx, unit=""):
    return f'<div style="display:flex;flex-direction:column;gap:2px"><div style="display:flex;justify-content:space-between;font-size:12px"><span>{label}</span><b>{v}{unit}</b></div><svg width="326" height="10" viewBox="0 0 326 10" aria-hidden="true"><rect width="326" height="6" y="2" rx="3" fill="{C["line"]}"></rect><rect width="{v/mx*326:.1f}" height="6" y="2" rx="3" fill="{C["green"]}"></rect><line x1="{usual/mx*326:.1f}" y1="0" x2="{usual/mx*326:.1f}" y2="10" stroke="{C["ink"]}" stroke-width="2"></line></svg></div>'
def score(label, n, quote):
    dots = "".join(f'<span style="width:10px;height:10px;border-radius:5px;display:inline-block;background:{C["purple"] if i<n else C["line"]}"></span>' for i in range(3))
    return f'<div style="display:flex;flex-direction:column;gap:2px;padding:6px 0;border-bottom:1px solid {C["line"]}"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:13px;font-weight:700">{label}</span><span style="display:flex;gap:3px">{dots}</span></div><span style="font-size:12px;color:{C["muted"]}">{quote}</span></div>'
def beats():
    items=[(1,"In the action"),(6,"Stakes"),(16,"Someone’s words"),(36,"The turn"),(52,"What changed"),(70,"Detail: team of six"),(90,"Point at the end ✗")]
    out=f'<line x1="0" y1="20" x2="326" y2="20" stroke="{C["line"]}" stroke-width="4" stroke-linecap="round"></line>'
    for t,l in items:
        bad = "✗" in l
        out+=f'<circle cx="{x(t):.1f}" cy="20" r="6" fill="{C["orange"] if bad else C["purple"]}"></circle>'
    labels="".join(f'<span style="font-size:11px;color:{C["orange"] if "✗" in l else C["purple"]};font-weight:700">{l}</span>' for t,l in items)
    return f'<svg width="326" height="30" viewBox="0 0 326 30" aria-hidden="true">{out}</svg><div style="display:flex;flex-wrap:wrap;gap:4px 10px">{labels}</div>'
def spark(label, vals, good_up=True):
    mn,mx=min(vals),max(vals); d="M"+" L".join(f"{i*(150/(len(vals)-1)):.1f} {22-(v-mn)/(mx-mn+1e-9)*18:.1f}" for i,v in enumerate(vals))
    better = (vals[-1]>vals[0]) == good_up
    return f'<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0"><span style="font-size:12px;width:120px">{label}</span><svg width="150" height="24" viewBox="0 0 150 24" aria-hidden="true"><rect x="0" y="6" width="150" height="10" fill="{C["tint"]}"></rect><path d="{d}" stroke="{C["green"] if better else C["orange"]}" stroke-width="2" fill="none"></path><circle cx="150" cy="{22-(vals[-1]-mn)/(mx-mn+1e-9)*18:.1f}" r="3" fill="{C["ink"]}"></circle></svg></div>'
def scatter():
    pts=[(40,50),(55,42),(60,58),(70,48),(80,40),(95,36),(110,30)]
    dots="".join(f'<circle cx="{a}" cy="{b}" r="4" fill="{C["grey"]}"></circle>' for a,b in pts[:-1])
    a,b=pts[-1]
    return f'<svg width="326" height="80" viewBox="0 0 326 80" aria-hidden="true"><line x1="20" y1="70" x2="320" y2="70" stroke="{C["line"]}"></line><line x1="20" y1="70" x2="20" y2="4" stroke="{C["line"]}"></line>{dots}<circle cx="{a}" cy="{b}" r="7" fill="{C["green"]}"></circle><text x="320" y="78" font-size="9" text-anchor="end" fill="{C["muted"]}">pitch variety →</text><text x="24" y="10" font-size="9" fill="{C["muted"]}">↑ volume variety</text><text x="{a+10}" y="{b+4}" font-size="9" fill="{C["green"]}">today</text></svg>'

Cc = f'''
<span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:{C["purple"]}">Maximal mock · C of C · what you said</span>
<h2 style="margin:0;font-family:Fraunces,Georgia,serif;font-size:24px;font-weight:600">What you said</h2>

{section("Transcript, every word marked", "moderate", "words", f'<div style="font-size:15px;line-height:1.75">{transcript}</div>' + legend, False, "Pause words are shown today; hedges, tag questions, repeats and vague words are hidden.")}

{section("Words, against your usual", "moderate", "words", bar("Pause words / min", 0.7, 1.4, 4) + bar("Hedges / 100 words", 3.2, 2.1, 6) + bar("Tag questions / 100 words", 1.1, 0.4, 3) + bar("Repeats and restarts / min", 0.7, 0.9, 3) + bar("Vague words / 100 words", 1.6, 2.4, 6) + bar("Intensifiers / 100 words", 0.8, 1.5, 4) + f'<span style="font-size:11px;color:{C["muted"]}">Black tick = your usual.</span>', False)}

{section("Vocabulary", "weak", "words", grid(stat("Word variety", "0.71", "usual 0.68"), stat("Long words", "14%"), stat("Concreteness", "3.4 / 5", "fairly concrete")) + grid(stat("“I” rate", "9.8"), stat("“We” rate", "0"), stat("“You” rate", "2.3")), False, "Counted, not coached: research doesn’t back “say you more”.")}

{section("Story shape", "moderate", "coach", beats(), True, "Each dot plays the moment the coach heard it.")}

{section("Content, as the coach read it", "weak", "coach", score("Answers the question", 3, "“…the risk everyone called a mistake paid off”") + score("Point first", 1, "The point came at 0:47, not the start") + score("Structure", 2, "Clear opening and middle; weak close") + score("Concrete example", 3, "“a team of six”, “moved cities”") + score("Ending", 0, "“So yeah, I guess that’s it.”") + score("Coherence", 3, "One line of thought throughout") + score("Speaks to the listener", 1, "All about you; no takeaway for them") + f'<span style="font-size:12px;color:{C["muted"]}">Devices used: a turn (“but”), someone’s words. Unneeded hedges: “I guess”, “sort of”.</span>', True, "Scores are shown today. Each would need its quote to be trusted.")}

{section("What a listener would remember", "weak", "coach", f'<div style="font-family:Fraunces,Georgia,serif;font-size:18px;line-height:1.35">“Everyone called it a mistake, and it changed everything.”</div><span style="font-size:12px;color:{C["muted"]}">Strongest line ▶ 0:47 · weakest line ▶ 1:29</span>', False)}

{section("Opening and close", "weak", "words", grid(stat("Opens with a pause word", "No", "", "good"), stat("Ums in first 10 words", "0", "", "good"), stat("Trailing ending", "Yes", "“so yeah…”", "warn"), cols=3), False, "Reliable, simple and high-impact: first and last impressions.")}

{section("Expressiveness over your takes", "strong", "audio", scatter(), False, "Each dot is a take; up and right means more varied pitch and volume.")}

{section("This take vs your recent ones", "strong", "audio", spark("Words per run", [6.1,6.8,7.0,7.9,8.4,9.2]) + spark("Mid-sentence stops", [4,3,3,2,3,2], False) + spark("Pitch range", [6,7,6.5,7.5,8,9]) + spark("Pause words / min", [2.2,1.9,1.6,1.4,1.0,0.7], False) + spark("Rising endings", [1,2,1,1,2,3], False) + f'<span style="font-size:11px;color:{C["muted"]}">Shaded band = normal day-to-day noise.</span>', False)}

{section("Recording quality and confidence", "strong", "audio", grid(stat("Background noise", "Low", "", "good"), stat("Voice clipped", "No", "", "good"), stat("Deeper check", "Ran", "fillers reliable", "good")), False, "Decides how sure each finding above is allowed to sound.")}
'''
board("C-Words", "Maximal feedback C: what you said", 2950, Cc)

canvas = {"v":3,"createdOnFiles":{"v":1,"at":"2026-10-24T18:00:00Z"},"title":"Feedback: maximal (everything we measure)","launch":{"view":"canvas"},"pages":[],
 "boards":{"A-Overview.dc.html":{"x":0,"y":0,"w":390,"h":1680,"title":"A · Overview and moments"},"B-Sound.dc.html":{"x":470,"y":0,"w":390,"h":2620,"title":"B · How it sounded"},"C-Words.dc.html":{"x":940,"y":0,"w":390,"h":2950,"title":"C · What you said"}},
 "order":["A-Overview.dc.html","B-Sound.dc.html","C-Words.dc.html"],"notes":{"t":{"x":0,"y":-240,"text":"Every measure we could show, tagged by evidence and source, each with a keep? box to prune","kind":"title1","maxW":1330}},"designSystems":[]}
json.dump(canvas, open('canvas.json','w'))
