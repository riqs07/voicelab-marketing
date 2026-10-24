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
WORDS = [("And",0),("honestly",34),("I",104),("believed",120),("him,",190),("right?",238)]
def voice_line(points, words=WORDS, upto=1.0, end="rose", col=None, cursor=True, ghost=None, ghost_end=None, hl=None):
    col = col or C["green"]
    d = "M" + " L".join(f"{x} {y}" for x,y in points)
    out = f'<svg width="326" height="70" viewBox="0 0 326 70" aria-hidden="true"><line x1="0" y1="40" x2="326" y2="40" stroke="{C["line"]}" stroke-width="1.5" stroke-dasharray="3 4"></line>'
    if ghost:
        gd = "M" + " L".join(f"{x} {y}" for x,y in ghost)
        out += f'<path d="{gd}" stroke="{C["grey"]}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>'
    out += f'<path d="{d}" stroke="{C["line"]}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>'
    clip = f'<clipPath id="c{int(upto*100)}{len(points)}"><rect x="0" y="0" width="{326*upto:.0f}" height="70"></rect></clipPath>'
    endcol = C["orange"] if end=="rose" else C["green"]
    out += f'<defs>{clip}</defs><path d="{d}" stroke="{col}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#c{int(upto*100)}{len(points)})"></path>'
    if upto >= 1:
        lx,ly = points[-1]; px,py = points[-2]
        out += f'<circle cx="{lx}" cy="{ly}" r="6" fill="{endcol}"></circle>'
    if cursor and upto < 1:
        cx = 326*upto
        out += f'<line x1="{cx:.0f}" y1="2" x2="{cx:.0f}" y2="66" stroke="{C["ink"]}" stroke-width="2"></line><circle cx="{cx:.0f}" cy="4" r="4" fill="{C["ink"]}"></circle>'
    out += '</svg>'
    wd = '<div style="position:relative;height:24px;font-size:15px">'
    for i,(w,xx) in enumerate(words):
        played = xx < 326*upto
        bold = ' font-weight:700;' if hl == i else ''
        wd += f'<span style="position:absolute;left:{xx}px;color:{C["ink"] if played else C["grey"]};{bold}">{w}</span>'
    wd += '</div>'
    return out + wd
ROSE = [(4,42),(60,40),(110,44),(170,40),(230,38),(290,22),(318,10)]
FELL = [(4,38),(60,34),(110,36),(170,38),(230,42),(290,52),(318,60)]

def flow_ribbon():
    segs = [(0,24,"s"),(24,30,"p"),(30,62,"s"),(62,82,"long"),(82,150,"s"),(150,155,"p"),(155,212,"s"),(212,236,"point"),(236,300,"s"),(300,306,"p"),(306,326,"s")]
    out = '<svg width="326" height="62" viewBox="0 0 326 62" aria-hidden="true">'
    for a,b,k in segs:
        if k=="s": out += f'<rect x="{a}" y="14" width="{b-a-1}" height="22" rx="6" fill="{C["green"]}"></rect>'
        elif k=="long": out += f'<rect x="{a+1}" y="22" width="{b-a-2}" height="6" rx="3" fill="{C["orange"]}"></rect><text x="{(a+b)/2}" y="52" font-size="10" text-anchor="middle" fill="{C["peachInk"]}" font-weight="700">1.9 s stop</text>'
        elif k=="point": out += f'<rect x="{a+1}" y="22" width="{b-a-2}" height="6" rx="3" fill="{C["soft"]}"></rect><text x="{(a+b)/2}" y="52" font-size="10" text-anchor="middle" fill="{C["green"]}" font-weight="700">pause ✓</text>'
    out += f'<text x="0" y="8" font-size="9" fill="{C["muted"]}">0:00</text><text x="326" y="8" font-size="9" text-anchor="end" fill="{C["muted"]}">1:36</text></svg>'
    return out
def pace_ribbon():
    pts = [(0,36),(40,34),(80,36),(100,18),(130,14),(150,30),(200,36),(260,38),(326,42)]
    d = "M" + " L".join(f"{x} {y}" for x,y in pts)
    return f'<svg width="326" height="64" viewBox="0 0 326 64" aria-hidden="true"><rect x="0" y="28" width="326" height="16" rx="8" fill="{C["tint"]}"></rect><text x="322" y="56" font-size="9" text-anchor="end" fill="{C["green"]}">your usual pace</text><rect x="92" y="4" width="62" height="46" rx="8" fill="{C["peach"]}" opacity="0.6"></rect><text x="123" y="60" font-size="10" text-anchor="middle" fill="{C["peachInk"]}" font-weight="700">rushed · 0:31</text><path d="{d}" stroke="{C["ink"]}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
def targets(hits):
    words = ["I finished the report.", "The numbers look good.", "We’re ready to launch.", "The team did great work.", "I’ll send it tonight."]
    out = ""
    for w,h in zip(words,hits):
        out += f'<div style="display:flex;align-items:center;gap:10px"><svg width="44" height="36" viewBox="0 0 44 36" aria-hidden="true"><circle cx="22" cy="20" r="9" fill="none" stroke="{C["grey"]}" stroke-width="2"></circle><circle cx="22" cy="20" r="2" fill="{C["grey"]}"></circle><circle cx="{22 if h else 34}" cy="{20 if h else 8}" r="5" fill="{C["green"] if h else C["orange"]}"></circle></svg><span style="font-size:14px;color:{C["ink"] if h else C["peachInk"]}">{w}</span><b style="margin-left:auto;font-size:18px;color:{C["green"] if h else C["orange"]}">{"↘" if h else "↗"}</b></div>'
    return out
def lanes():
    turns=[("t",0,40),("y",44,86),("t",90,140),("y",136,186),("t",190,214),("y",218,280),("t",284,326)]
    out = f'<svg width="326" height="70" viewBox="0 0 326 70" aria-hidden="true"><text x="0" y="12" font-size="10" fill="{C["muted"]}">Maya</text><text x="0" y="58" font-size="10" fill="{C["muted"]}">You</text>'
    for who,a,b in turns:
        y = 18 if who=="t" else 40
        out += f'<rect x="{a}" y="{y}" width="{b-a}" height="14" rx="5" fill="{C["grey"] if who=="t" else C["green"]}"></rect>'
    out += f'<rect x="136" y="16" width="5" height="40" rx="2" fill="{C["orange"]}" opacity="0.8"></rect><text x="140" y="68" font-size="9" fill="{C["peachInk"]}" font-weight="700">cut in</text><text x="62" y="51" font-size="9" fill="#FFF" font-weight="700">?</text><text x="249" y="51" font-size="9" text-anchor="middle" fill="#FFF" font-weight="700">★ follow-up</text></svg>'
    return out

charts = f'''
<span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:{C["purple"]}">Six main charts · one per result, chosen by today’s change</span>
<span style="font-size:13px;color:{C["muted"]};line-height:1.45">One visual language: green = landed, orange = look here, grey = before or context. Every chart plays from where you tap.</span>

{card("1 · Voice line over your words", "Where did I rise, fall or go flat?", voice_line(ROSE) + f'<div style="display:flex;align-items:center;gap:8px">{PLAY}<span style="font-size:13px;color:{C["peachInk"]};font-weight:700">Rose at the end, like a question</span></div>', "Simplified to a few strokes: only movement a listener would hear. Draws itself as it plays.")}

{card("2 · Flow ribbon", "Where did I flow, and where did I stop?", flow_ribbon(), "Green blocks = speaking. Only long stops and pauses before a point are marked; small gaps are left as plain space.")}

{card("3 · Pace ribbon", "Where did I rush or drag?", pace_ribbon(), "The band is your own usual pace, not a norm.")}

{card("4 · Before and after", "Did my change work?", voice_line(FELL, ghost=ROSE, end="fell") + f'<div style="display:flex;gap:14px;font-size:12px;color:{C["muted"]}"><span><b style="color:{C["grey"]}">━</b> try 1</span><span><b style="color:{C["green"]}">━</b> try 2</span><b style="margin-left:auto;color:{C["green"]}">Now it falls ↘</b></div>', "Same words lined up, so the change is the only thing that moves.")}

{card("5 · Target hits", "Did I hit it?", targets([1,1,0,1,1]), "For drills: each dot lands on the target or misses. Tap a miss to hear it.")}

{card("6 · Conversation lanes", "How did the turns go?", lanes(), "Each block is a turn. Questions, follow-ups and cut-ins are marked on it.")}
'''
write("Charts", "Six main charts", 1780, charts)

def phone_top(label): return f'<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:15px;color:{C["muted"]}">✕</span><span style="font-size:13px;color:{C["muted"]}">{label}</span></div>'
def player(t, total="0:24", frac=0.3):
    return f'''<div style="display:flex;align-items:center;gap:10px;background:#FFF;border-radius:999px;padding:6px 12px 6px 6px"><span class="pb" style="width:36px;height:36px"><svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true"><rect x="1" y="1" width="3.5" height="12" fill="#FFF"></rect><rect x="7.5" y="1" width="3.5" height="12" fill="#FFF"></rect></svg></span><div style="flex:1;height:6px;border-radius:3px;background:{C["line"]}"><div style="width:{frac*100:.0f}%;height:6px;border-radius:3px;background:{C["green"]}"></div></div><span style="font-size:12px;color:{C["muted"]}">{t} / {total}</span></div>'''

f1 = f'''{phone_top("Rapid Fire · playing your take")}
<span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:{C["purple"]}">Storyboard 1 of 3 · the line draws as you listen</span>
<h1 style="margin:0;font-family:Fraunces,Georgia,serif;font-size:25px;line-height:1.2;font-weight:600">Listen to how it sounded.</h1>
<div style="{CARD}">{voice_line(ROSE, upto=0.42, hl=3)}<span style="font-size:13px;color:{C["muted"]}">The word you’re hearing lights up; the line follows your voice.</span></div>
{player("0:19", frac=0.42)}
'''
f2 = f'''{phone_top("Rapid Fire · playing your take")}
<span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:{C["purple"]}">Storyboard 2 of 3 · it pauses on the moment</span>
<h1 style="margin:0;font-family:Fraunces,Georgia,serif;font-size:25px;line-height:1.2;font-weight:600">Hear that? It went up.</h1>
<div style="{CARD};border:2px solid {C["orange"]}">{voice_line(ROSE, upto=1.0, cursor=False, hl=5)}<div style="padding:10px 12px;border-radius:12px;background:{C["peach"]};color:{C["peachInk"]};font-size:14px;line-height:1.45"><b>“right?”</b> rose at the end, so the whole sentence sounded like a question. Let it fall.</div>
<div style="padding:12px;border-radius:999px;background:{C["green"]};color:#FFF;font-weight:700;font-size:15px;text-align:center">Say it again, ending low</div></div>
{player("0:21", frac=1.0)}
'''
confetti = "".join(f'<circle cx="{random.randint(10,316)}" cy="{random.randint(6,70)}" r="{random.choice([2,3,4])}" fill="{random.choice([C["green"],C["orange"],C["purple"],"#E8B931"])}"></circle>' for _ in range(28))
f3 = f'''{phone_top("Rapid Fire · try 2")}
<span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:{C["purple"]}">Storyboard 3 of 3 · the change worked</span>
<svg width="326" height="74" viewBox="0 0 326 74" aria-hidden="true">{confetti}</svg>
<h1 style="margin:-40px 0 0;font-family:Fraunces,Georgia,serif;font-size:34px;line-height:1.1;font-weight:600;text-align:center">It landed. ↘</h1>
<span style="text-align:center;font-size:15px;color:{C["muted"]}">Same sentence, and this time it fell at the end.</span>
<div style="{CARD}">{voice_line(FELL, ghost=ROSE, end="fell")}<div style="display:flex;gap:14px;font-size:12px;color:{C["muted"]}"><span><b style="color:{C["grey"]}">━</b> try 1</span><span><b style="color:{C["green"]}">━</b> try 2</span></div><div style="display:flex;gap:14px">{''.join(f'<span style="display:flex;align-items:center;gap:6px;font-size:13px;color:{C["green"]};font-weight:700">{PLAY} {t}</span>' for t in ["Try 1","Try 2"])}</div></div>
<div style="{CARD};align-items:center"><b style="font-size:15px">Three in a row makes it stick</b><div style="display:flex;gap:10px">{''.join(f'<span style="width:34px;height:34px;border-radius:17px;display:flex;align-items:center;justify-content:center;font-weight:700;background:{C["green"] if i==0 else C["line"]};color:#FFF">{"✓" if i==0 else ""}</span>' for i in range(3))}</div></div>
<div style="padding:12px;border-radius:999px;background:{C["green"]};color:#FFF;font-weight:700;font-size:15px;text-align:center">Once more</div>
'''
write("Play1", "Storyboard 1", 640, f1)
write("Play2", "Storyboard 2", 700, f2)
write("Play3", "Storyboard 3", 820, f3)
json.dump({"v":3,"createdOnFiles":{"v":1,"at":"2026-10-24T21:00:00Z"},"title":"Main charts and the playback storyboard","launch":{"view":"canvas"},"pages":[],
 "boards":{"Charts.dc.html":{"x":0,"y":0,"w":390,"h":1780,"title":"Six main charts"},"Play1.dc.html":{"x":470,"y":0,"w":390,"h":640,"title":"1 · Line draws as you listen"},"Play2.dc.html":{"x":940,"y":0,"w":390,"h":700,"title":"2 · Pauses on the moment"},"Play3.dc.html":{"x":1410,"y":0,"w":390,"h":820,"title":"3 · The change worked"}},
 "order":["Charts.dc.html","Play1.dc.html","Play2.dc.html","Play3.dc.html"],"notes":{"t":{"x":0,"y":-240,"text":"Main charts, and how a result plays: listen, see the moment, try again, celebrate","kind":"title1","maxW":1800}},"designSystems":[]}, open('canvas.json','w'))
