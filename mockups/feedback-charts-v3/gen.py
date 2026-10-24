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

def sure(level):
    col = {"High": C["green"], "Medium": "#8A6D1E"}[level]
    bg = {"High": C["soft"], "Medium": "#F6EDCF"}[level]
    return f'<span style="align-self:flex-start;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:{bg};color:{col}">How sure we can be: {level.lower()}</span>'
def chart(title, q, body, foot, level, needs="Audio only"):
    return card(title, q, body + f'<div style="display:flex;gap:6px;flex-wrap:wrap">{sure(level)}<span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:{C["purpleBg"]};color:{C["purple"]}">{needs}</span></div>', foot)
def label(t): return f'<span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:{C["purple"]}">{t}</span>'
def P(t): return f'<span style="font-size:13px;color:{C["muted"]};line-height:1.45">{t}</span>'

# A · Loudness: one soft shape per sentence; tails that fade are orange
def loudness():
    sents = [(0,70,False),(78,150,True),(158,222,False),(230,326,True)]
    out = '<svg width="326" height="78" viewBox="0 0 326 78" aria-hidden="true"><line x1="0" y1="40" x2="326" y2="40" stroke="#EDE4D6" stroke-width="1"></line>'
    for a,b,fade in sents:
        w = b-a; tail = a + w*0.72 if fade else b
        top = [(a,40),(a+6,20),(a+w*0.3,16),(a+w*0.6,19),(tail,20)]
        if fade: top += [(b,36)]
        else: top += [(b-6,22),(b,40)]
        d = "M" + " L".join(f"{x:.0f} {y}" for x,y in top) + " " + " L".join(f"{x:.0f} {80-y}" for x,y in reversed(top)) + " Z"
        out += f'<path d="{d}" fill="{C["green"]}" opacity="0.85"></path>'
        if fade:
            out += f'<rect x="{tail:.0f}" y="10" width="{b-tail+2:.0f}" height="60" fill="#FFF" opacity="0.0"></rect>'
            seg = [(tail,20),(b,36)]
            out += f'<path d="M{tail:.0f} 20 L{b} 36 L{b} 44 L{tail:.0f} 60 Z" fill="{C["orange"]}"></path>'
            out += f'<text x="{(tail+b)/2:.0f}" y="76" font-size="9" text-anchor="middle" fill="{C["peachInk"]}" font-weight="700">faded</text>'
    return out + '</svg>' + f'<span style="font-size:14px;color:{C["peachInk"]};font-weight:700">Your last words got quieter in 2 of 4 sentences</span>'

# B · Sentence endings: a tiny tail per sentence
def endings():
    ends = [("down","We grew 20%."),("down","Costs are flat."),("up","We’re on track?"),("down","Hiring starts May."),("flat","Questions welcome"),("down","Thanks.")]
    glyph = {"down":"M2 6 L18 6 L28 18","up":"M2 18 L18 18 L28 4","flat":"M2 12 L28 12"}
    col = {"down":C["green"],"up":C["orange"],"flat":C["grey"]}
    out = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'
    for k,w in ends:
        out += f'<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;border-radius:12px;background:{C["peach"] if k=="up" else C["tint"]}"><svg width="30" height="22" viewBox="0 0 30 22" aria-hidden="true"><path d="{glyph[k]}" stroke="{col[k]}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg><span style="font-size:11px;color:{C["ink"]};text-align:center">…{w.split()[-1]}</span></div>'
    return out + '</div>' + f'<span style="font-size:14px;color:{C["green"]};font-weight:700">4 of 6 landed. One rose like a question.</span>'

# C · Today vs your usual: dot in your own band
def usual():
    rows = [("Pace", 0.55, (0.35,0.65), "usual"),("Long stops", 0.82, (0.2,0.55), "more than usual"),("Voice movement", 0.5, (0.4,0.7), "usual"),("Loudness", 0.45, (0.3,0.6), "usual")]
    out = '<div style="display:flex;flex-direction:column;gap:12px">'
    for name,v,(lo,hi),word in rows:
        off = not (lo <= v <= hi)
        out += f'''<div style="display:flex;flex-direction:column;gap:4px"><div style="display:flex;justify-content:space-between;font-size:13px"><b>{name}</b><span style="color:{C["peachInk"] if off else C["muted"]};font-weight:{700 if off else 400}">{word}</span></div>
<svg width="294" height="16" viewBox="0 0 294 16" aria-hidden="true"><rect x="0" y="6" width="294" height="4" rx="2" fill="{C["line"]}"></rect><rect x="{lo*294:.0f}" y="2" width="{(hi-lo)*294:.0f}" height="12" rx="6" fill="{C["soft"]}"></rect><circle cx="{v*294:.0f}" cy="8" r="7" fill="{C["orange"] if off else C["green"]}" stroke="#FFF" stroke-width="2"></circle></svg></div>'''
    return out + '</div>'

# D · Emphasis: words weighted by how hard you leaned on them
def emphasis():
    ws = [("We",0),("cut",2),("costs",1),("by",0),("twenty",3),("percent,",1),("and",0),("we",0),("did",0),("it",0),("in",0),("ONE",3),("quarter.",1)]
    size = {0:14,1:16,2:19,3:23}
    out = '<div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 7px;line-height:1.3">'
    for w,s in ws:
        out += f'<span style="font-size:{size[s]}px;font-weight:{400 if s<2 else 700};color:{C["grey"] if s==0 else C["green"] if s<3 else C["ink"]}">{w.lower() if w=="ONE" else w}</span>'
    return out + '</div>' + f'<span style="font-size:14px;color:{C["green"]};font-weight:700">You leaned on “twenty” and “one”: the two numbers. Good choice.</span>'

# E · Shape of the take: start, middle, end
def shape():
    pts = [(0,26),(40,20),(80,24),(120,38),(160,48),(200,46),(240,34),(280,22),(326,18)]
    d = "M" + " ".join(f"{'' if i==0 else 'L'}{x} {y}" for i,(x,y) in enumerate(pts))
    area = d + " L326 70 L0 70 Z"
    out = f'<svg width="326" height="86" viewBox="0 0 326 86" aria-hidden="true"><path d="{area}" fill="{C["soft"]}"></path><rect x="109" y="0" width="108" height="70" fill="{C["peach"]}" opacity="0.55"></rect><path d="{d}" stroke="{C["green"]}" stroke-width="3.5" fill="none" stroke-linejoin="round" stroke-linecap="round"></path>'
    for i,(t,c) in enumerate([("Start",C["green"]),("Middle",C["peachInk"]),("End",C["green"])]):
        out += f'<text x="{54+i*109}" y="84" font-size="11" text-anchor="middle" fill="{c}" font-weight="700">{t}</text>'
    out += '</svg>'
    return out + f'<span style="font-size:14px;color:{C["peachInk"]};font-weight:700">Strong start and finish. Energy dipped in the middle (0:40–1:05).</span>'

# F · Range: how far your voice moved, today against your usual
def rng():
    out = '<svg width="326" height="96" viewBox="0 0 326 96" aria-hidden="true">'
    out += f'<text x="0" y="12" font-size="10" fill="{C["muted"]}">your usual</text><rect x="0" y="18" width="326" height="22" rx="11" fill="{C["tint"]}"></rect><rect x="90" y="18" width="150" height="22" rx="11" fill="{C["grey"]}"></rect>'
    out += f'<text x="0" y="62" font-size="10" fill="{C["muted"]}">today</text><rect x="0" y="68" width="326" height="22" rx="11" fill="{C["tint"]}"></rect><rect x="128" y="68" width="74" height="22" rx="11" fill="{C["orange"]}"></rect>'
    out += f'<text x="2" y="34" font-size="9" fill="{C["muted"]}">low</text><text x="324" y="34" font-size="9" text-anchor="end" fill="{C["muted"]}">high</text></svg>'
    return out + f'<span style="font-size:14px;color:{C["peachInk"]};font-weight:700">Your voice moved about half as much as usual. It may have sounded flat.</span>'

# G · Progress on your focus
def progress():
    vals = [5,4,5,3,4,3,2,3,2,1]
    out = '<svg width="326" height="98" viewBox="0 0 326 98" aria-hidden="true">'
    out += f'<rect x="0" y="60" width="326" height="26" rx="6" fill="{C["soft"]}"></rect><text x="322" y="96" font-size="9" text-anchor="end" fill="{C["green"]}">goal zone</text>'
    pts = [(14+i*33, 80-v*13) for i,v in enumerate(vals)]
    out += '<path d="M' + " L".join(f"{x} {y}" for x,y in pts) + f'" stroke="{C["grey"]}" stroke-width="2" fill="none"></path>'
    for i,(x,y) in enumerate(pts):
        last = i == len(pts)-1
        out += f'<circle cx="{x}" cy="{y}" r="{7 if last else 4.5}" fill="{C["green"] if last else C["grey"]}" stroke="#FFF" stroke-width="2"></circle>'
    out += '</svg>'
    return out + f'''<div style="display:flex;align-items:center;gap:10px"><span style="font-size:22px">🔥</span><div style="display:flex;flex-direction:column"><b style="font-size:14px;color:{C["green"]}">Rising endings: 5 → 1 over 10 takes</b><span style="font-size:12px;color:{C["muted"]}">First time in the goal zone. 6-day streak.</span></div></div>'''

page1 = f'''{label("Charts, round 2 · where we are")}
<div style="{CARD}"><b style="font-size:15px">From round 1</b>
<span style="font-size:13px;line-height:1.5"><b style="color:{C["green"]}">Everyday:</b> 1 Voice line · 2 Flow ribbon · 3 Pace ribbon<br><b style="color:{C["muted"]}">Situational:</b> 4 Before and after (retries) · 6 Conversation lanes<br><b style="color:{C["orange"]}">Dropped:</b> 5 Target hits</span></div>
{P("New candidates for everyday use. Each says how sure we can be and what it needs. All work from audio alone unless marked.")}
{chart("A · Loudness shape", "Did I trail off?", loudness(), "One shape per sentence. Only a clear drop over the last words is marked.", "High")}
{chart("B · Sentence endings", "How did my sentences land?", endings(), "One tiny tail per sentence: down, flat or up. Tap one to hear that ending.", "High")}
{chart("C · Today vs your usual", "Was today normal for me?", usual(), "Grey-green band = your usual over the last 10 takes. Only a dot outside it is coloured.", "High")}
'''
page2 = f'''{label("Charts, round 2 · more candidates")}
{chart("D · Emphasis in your words", "Which words did I lean on?", emphasis(), "Bigger, darker words = said louder and higher. Good for checking you stressed the point, not filler.", "Medium", "Needs the words")}
{chart("E · Shape of the take", "How did I start, middle and finish?", shape(), "Energy = loudness and voice movement together, smoothed. Great for longer takes and rehearsals.", "High")}
{chart("F · Voice range", "Did my voice move, or stay flat?", rng(), "Width = how far your pitch moved. Compared with you, not with anyone else.", "High")}
{chart("G · Progress on your focus", "Am I getting better at this?", progress(), "One line for whatever you’re working on, over your last takes. The Duolingo moment.", "High")}
'''
write("Charts2a", "Charts round 2 (1)", 1100, page1)
write("Charts2b", "Charts round 2 (2)", 1280, page2)
json.dump({"v":3,"createdOnFiles":{"v":1,"at":"2026-10-24T22:00:00Z"},"title":"Feedback charts, round 2","launch":{"view":"canvas"},"pages":[],
 "boards":{"Charts2a.dc.html":{"x":0,"y":0,"w":390,"h":1100,"title":"Kept + A–C"},"Charts2b.dc.html":{"x":470,"y":0,"w":390,"h":1280,"title":"D–G"}},
 "order":["Charts2a.dc.html","Charts2b.dc.html"],"notes":{"t":{"x":0,"y":-240,"text":"Feedback charts, round 2: new everyday candidates","kind":"title1","maxW":900}},"designSystems":[]}, open('canvas.json','w'))
