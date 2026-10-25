import json, random
random.seed(5)
HEAD = open('../feedback-v2/Reading.dc.html').read().split('<div style="width: 390px')[0]
C = dict(bg="#FBF6EE", ink="#1E2620", muted="#59645C", green="#2E5B3E", tint="#F1F6F2", line="#EDE4D6", peach="#FCE3CF", peachInk="#7A3A10", orange="#C26A2C", grey="#B9C4BB", purple="#3D3A8C", purpleBg="#EDEBFA", soft="#E6EDE7")
PLAY = '<span class="pb" style="width:26px;height:26px"><svg width="9" height="10" viewBox="0 0 11 12" aria-hidden="true"><path d="M1 1 L10 6 L1 11 Z" fill="#FFFFFF"></path></svg></span>'
CARD = "background:#FFF;border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:10px;box-shadow:0 1px 2px rgba(30,38,32,0.06)"
def write(name, title, h, inner):
    tail = f'''</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":390,"height":{h}}}}}'>
class Component extends DCLogic {{ renderVals() {{ return {{}}; }} }}
</script>
</body>
</html>
'''
    open(f'{name}.dc.html','w').write(HEAD.replace('<title>Feedback: reading result</title>', f'<title>{title}</title>') + f'<div style="width:390px;min-height:{h}px;box-sizing:border-box;background:{C["bg"]};color:{C["ink"]};font-family:\'Atkinson Hyperlegible Next\',system-ui,sans-serif;padding:22px 16px 40px;display:flex;flex-direction:column;gap:14px">\n' + inner + tail)
def card(title, question, body, foot=""):
    f = f'<span style="font-size:13px;color:{C["muted"]};line-height:1.4">{foot}</span>' if foot else ""
    return f'<div style="{CARD}"><div style="display:flex;flex-direction:column;gap:2px"><b style="font-size:16px">{title}</b><span style="font-size:12px;color:{C["purple"]};font-weight:700">Answers: {question}</span></div>{body}{f}</div>'

# Simplified voice line: a few straight strokes over words, ending arrow; drawn up to `upto` (0..1)

C.update(gold="#C9962B", goldBg="#F7ECD2", silver="#8E9AA0", bronze="#B0703A")
def label(t): return f'<span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:{C["purple"]}">{t}</span>'
def H(t, size=26): return f'<h1 style="margin:0;font-family:Fraunces,Georgia,serif;font-size:{size}px;line-height:1.15;font-weight:600">{t}</h1>'
def P(t, col=None, size=14): return f'<span style="font-size:{size}px;color:{col or C["muted"]};line-height:1.45">{t}</span>'
def chip(t, bg, fg): return f'<span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:{bg};color:{fg};white-space:nowrap">{t}</span>'
BEST = chip("★ Best for you today", C["peach"], C["peachInk"])
def btn(t, primary=True): return f'<div style="padding:14px;border-radius:999px;background:{C["green"] if primary else "#FFF"};color:{"#FFF" if primary else C["ink"]};border:{"none" if primary else "2px solid "+C["line"]};font-weight:700;font-size:15px;text-align:center">{t}</div>'
def top(left, right=""): return f'<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;color:{C["muted"]}"><span>{left}</span><span>{right}</span></div>'
def tabs(active):
    items = [("☼","Today"),("▶","Quick play"),("⟿","Paths"),("▥","Progress")]
    cells = "".join(f'<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:11px;font-weight:{700 if n==active else 500};color:{C["green"] if n==active else C["muted"]}"><span style="font-size:18px">{i}</span>{n}</div>' for i,n in items)
    return f'<div style="margin-top:auto;display:flex;background:#FFF;border-radius:18px;padding:8px 4px;box-shadow:0 1px 2px rgba(30,38,32,.08)">{cells}</div>'
def ring(frac, size=64, label_text="", sub=""):
    r = size/2-6; import math; c = 2*math.pi*r
    return f'<div style="position:relative;width:{size}px;height:{size}px;flex:none"><svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" aria-hidden="true"><circle cx="{size/2}" cy="{size/2}" r="{r}" stroke="{C["line"]}" stroke-width="7" fill="none"></circle><circle cx="{size/2}" cy="{size/2}" r="{r}" stroke="{C["green"]}" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="{c*frac:.1f} {c:.1f}" transform="rotate(-90 {size/2} {size/2})"></circle></svg><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><b style="font-size:{14 if size<70 else 18}px">{label_text}</b><span style="font-size:10px;color:{C["muted"]}">{sub}</span></div></div>'
def week(done):
    days = "MTWTFSS"
    return '<div style="display:flex;gap:6px">' + "".join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:3px"><span style="width:26px;height:26px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;background:{C["green"] if i<done else (C["peach"] if i==done else C["line"])};color:{"#FFF" if i<done else C["ink"]}">{"✓" if i<done else ""}</span><span style="font-size:10px;color:{C["muted"]}">{d}</span></div>' for i,d in enumerate(days)) + '</div>'
def medal(level):
    col = {"gold":C["gold"],"silver":C["silver"],"bronze":C["bronze"],"none":C["line"]}[level]
    return f'<span style="width:14px;height:14px;border-radius:7px;background:{col};display:inline-block"></span>'


TEMPLATES = [
  ("Lesson learned", "For interviews and talks", ["The situation", "What went wrong", "What I did", "What I learned"]),
  ("Client win", "For pitches and case studies", ["The problem", "What we tried", "The result, with a number", "Why it matters"]),
  ("Turning point", "For openings and about-me", ["How it was", "The moment it changed", "How it is now"]),
  ("Funny moment", "For toasts and small talk", ["The set-up", "The twist", "The line that lands"]),
]
def beats_list(beats, marks=None, quotes=None):
    rows = ""
    for i,b in enumerate(beats):
        m = marks[i] if marks else None
        dot_bg = {None:C["peach"],"good":C["green"],"weak":C["orange"],"missing":C["line"]}[m]
        dot_fg = "#FFF" if m in ("good","weak") else C["peachInk"] if m is None else C["muted"]
        sym = {None:str(i+1),"good":"✓","weak":"!","missing":"–"}[m]
        q = f'<span style="font-size:13px;color:{C["muted"]};font-style:italic">“{quotes[i]}”</span>' if quotes and quotes[i] else ""
        rows += f'<div style="display:flex;gap:10px;align-items:flex-start"><span style="flex:none;width:24px;height:24px;border-radius:12px;background:{dot_bg};color:{dot_fg};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">{sym}</span><div style="display:flex;flex-direction:column;gap:2px"><span style="font-size:15px">{b}</span>{q}</div></div>'
    return f'<div style="display:flex;flex-direction:column;gap:10px">{rows}</div>'
POINTERS = f'''<div style="{CARD};gap:8px;background:{C["purpleBg"]}"><b style="font-size:13px;color:{C["purple"]}">Three things every good story does</b>{"".join(f'<span style="font-size:13px;color:{C["ink"]}">• <b>{a}</b> {b}</span>' for a,b in [("Start in the moment.","Skip the build-up."),("One specific detail.","A name, a number, a sound."),("End on the point.","Then stop.")])}</div>'''
def navtabs(): return tabs("Paths").replace("Paths</div>","Practice</div>").replace("⟿","🎙")

# 1 · Stories page
tcards = "".join(f'<div style="{CARD};gap:4px;padding:14px"><b style="font-size:15px">{n}</b>{P(w,size=12)}<span style="font-size:12px;color:{C["green"]}">{" → ".join(b)}</span></div>' for n,w,b in TEMPLATES)
home = f'''{top("‹ Practice","")}
{H("Stories",30)}
{P("Pick a template, tell it, then tell it again a little better.")}
<div style="{CARD};gap:8px;background:{C["green"]};color:#FFF"><span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;opacity:.8">Today’s story</span><b style="font-family:Fraunces,Georgia,serif;font-size:21px;line-height:1.25">Tell me about a time a plan fell apart at the last minute.</b><span style="font-size:13px;opacity:.85">Suggested template: Lesson learned</span><div style="padding:12px;border-radius:999px;background:#FFF;color:{C["green"]};font-weight:700;text-align:center">Tell it</div></div>
<b style="font-size:17px;margin-top:6px">Your stories</b>
<div style="{CARD};gap:0;padding:4px 16px">{"".join(f'<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;{"border-top:1px solid "+C["line"] if i else ""}"><div style="display:flex;flex-direction:column"><b style="font-size:14px">{t}</b>{P(s,size=12)}</div><span style="font-size:13px;color:{C["green"]};font-weight:700">Tell again ›</span></div>' for i,(t,s) in enumerate([("The restaurant demo that crashed","Client win · told 3 times · best 1:42"),("My first talk at a meetup","Turning point · told once")]))}</div>
<b style="font-size:17px;margin-top:6px">Templates</b>
{tcards}
{P("Or pick a prompt yourself: A time something went wrong · A small win · A first time · Something funny ›",size=12)}'''

# 2 · Choose template
tsel = "".join(f'''<div style="{CARD};gap:6px;padding:14px;{'border:2px solid '+C['green'] if i==0 else ''}"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:15px">{n}</b>{chip("Suggested", C["soft"], C["green"]) if i==0 else ""}</div>{P(w,size=12)}{beats_list(b) if i==0 else '<span style="font-size:12px;color:'+C["green"]+'">'+" → ".join(b)+'</span>'}</div>''' for i,(n,w,b) in enumerate(TEMPLATES))
choose = f'''{top("✕","Tell a story")}
{label("Your story")}
{H("Tell me about a time a plan fell apart at the last minute.",24)}
<b style="font-size:15px;margin-top:4px">Template</b>
{tsel}
<div style="{CARD};gap:6px;background:{C["goldBg"]}"><b style="font-size:13px">Example · Lesson learned</b>{P("“The night before our launch the demo server died. <b>(situation)</b> Nobody had a backup. <b>(went wrong)</b> I rebuilt it on my laptop at 2am. <b>(what I did)</b> Now every demo has a plan B. <b>(learned)</b>”",C["ink"],13)}</div>
<div style="display:flex;gap:10px"><div style="flex:1;padding:12px;border-radius:14px;border:2px solid {C["line"]};background:#FFF;text-align:center"><b style="font-size:14px">Short</b><br>{P("about 1 min",size=12)}</div><div style="flex:1;padding:12px;border-radius:14px;background:{C["green"]};color:#FFF;text-align:center"><b style="font-size:14px">Full</b><br><span style="font-size:12px;opacity:.85">2 to 3 min</span></div></div>
{btn("Start · a minute to plan")}'''

# 3 · Planning with beats
plan = f'''{top("✕","Planning · 0:38 left")}
{label("Lesson learned")}
{H("Tell me about a time a plan fell apart at the last minute.",22)}
<div style="{CARD};gap:12px"><b style="font-size:13px;color:{C["muted"]}">Your beats, in order</b>{beats_list(TEMPLATES[0][2])}</div>
{POINTERS}
<div style="display:flex;justify-content:center;margin-top:8px"><div style="width:150px;height:150px;border-radius:75px;background:#F2A36A;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px"><span style="font-size:24px">🎙</span><b style="font-family:Fraunces,Georgia,serif;font-size:20px">Ready</b><span style="font-size:12px">start telling</span></div></div>
{P("The beats stay on screen while you tell it.",size=12)}'''

# 4 · Results
marks = ["good","good","weak","missing"]
quotes = ["the night before the client demo, the projector died","we had nothing to show them","so I just… talked through it, I guess",None]
results = f'''{top("Story","Told just now")}
{label("Lesson learned · second telling")}
{H("It landed better than last time.",26)}
<div style="{CARD};gap:10px"><div style="display:flex;gap:8px;align-items:center">{chip("What worked", C["soft"], C["green"])}</div>{P("You opened right in the moment: “the night before the client demo, the projector died.”",C["ink"],15)}
<div style="display:flex;gap:8px;align-items:center;margin-top:4px">{chip("One change", C["peach"], C["peachInk"])}</div>{P("Say what you learned. The story stops at what you did, so it has no point yet.",C["ink"],15)}
<div style="padding:10px 12px;border-radius:12px;background:{C["tint"]}"><span style="font-size:12px;color:{C["muted"]}">Next time</span><br><b style="font-family:Fraunces,Georgia,serif;font-size:19px">End with “Now I always…”</b></div></div>
<div style="{CARD};gap:12px"><b style="font-size:15px">Your beats</b>{beats_list(TEMPLATES[0][2], marks, quotes)}<div style="display:flex;gap:12px;font-size:11px;color:{C["muted"]}"><span>✓ strong</span><span>! weak</span><span>– missing</span></div></div>
<div style="{CARD};gap:8px"><span style="font-size:12px;color:{C["muted"]}">Your line</span>{P("“so I just… talked through it, I guess”",C["ink"],15)}<div style="border-left:3px solid {C["green"]};padding-left:10px"><span style="font-size:12px;color:{C["muted"]}">Could sound like</span><br><span style="font-size:15px">So I talked them through it, <i style="color:{C["green"]}">[slide by slide, from memory]</i>.</span></div></div>
<div style="{CARD};gap:8px"><b style="font-size:15px">This telling vs last</b>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">{"".join(f'<div style="padding:10px;border-radius:12px;background:{bg}"><span style="font-size:11px;color:{C["muted"]}">{h}</span><br><b style="font-size:14px">{a}</b><br>{P(b,size=12)}</div>' for h,a,b,bg in [("Last time","2 of 4 beats","2:31",C["tint"]),("This time","3 of 4 beats","1:48 · tighter",C["soft"])])}</div>
<div style="display:flex;gap:10px">{"".join(f'<div style="flex:1;padding:10px;border-radius:999px;border:2px solid {C["line"]};text-align:center;font-size:13px;font-weight:700">▶ {t}</div>' for t in ["Last time","This time"])}</div></div>
<div style="{CARD};gap:4px;align-items:center;background:transparent;border:2px dashed {C["line"]}"><b style="font-size:14px">Your voice, numbers and every chart (trial)</b>{P("As they are now, below this, for your week of testing ↓",size=12)}</div>
{btn("Tell it again · same template")}'''

boards = [("StoriesHome","Stories page",home,1100),("Choose","Choose a template",choose,1250),("Plan","Planning with your beats",plan,844),("Results","Results: template first",results,1500)]
for name,title,inner,h in boards: write(name, title, h, inner)
json.dump({"v":3,"createdOnFiles":{"v":1,"at":"2026-10-25T10:00:00Z"},"title":"Stories with templates","launch":{"view":"canvas"},"pages":[],
 "boards":{f"{n}.dc.html":{"x":i*470,"y":0,"w":390,"h":h,"title":t} for i,(n,t,_,h) in enumerate(boards)},
 "order":[f"{n}.dc.html" for n,_,_,_ in boards],"notes":{"t":{"x":0,"y":-240,"text":"Stories: templates instead of shapes, feedback beat by beat","kind":"title1","maxW":1800}},"designSystems":[]}, open('canvas.json','w'))
