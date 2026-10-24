import json, math, random
random.seed(3)
HEAD = open('../feedback-v2/Reading.dc.html').read().split('<div style="width: 390px')[0]
C = dict(bg="#FBF6EE", ink="#1E2620", muted="#59645C", green="#2E5B3E", tint="#F1F6F2", line="#EDE4D6", peach="#FCE3CF", peachInk="#7A3A10", orange="#C26A2C", grey="#B9C4BB", purple="#3D3A8C", purpleBg="#EDEBFA", soft="#E6EDE7")
PLAY = '<span class="pb" style="width:26px;height:26px"><svg width="9" height="10" viewBox="0 0 11 12" aria-hidden="true"><path d="M1 1 L10 6 L1 11 Z" fill="#FFFFFF"></path></svg></span>'
CARD = "background:#FFF;border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:10px;box-shadow:0 1px 2px rgba(30,38,32,0.06)"
def kicker(t, col=None): return f'<span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:{col or C["green"]}">{t}</span>'
def h1(t): return f'<h1 style="margin:0;font-family:Fraunces,Georgia,serif;font-size:27px;line-height:1.15;font-weight:600">{t}</h1>'
def h3(t): return f'<b style="font-family:Fraunces,Georgia,serif;font-size:20px;line-height:1.2;font-weight:600">{t}</b>'
def btn(t, bg=None, ink="#FFF"): return f'<div style="padding:12px;border-radius:999px;background:{bg or C["green"]};color:{ink};font-weight:700;font-size:15px;text-align:center">{t}</div>'
def rowlink(t, sub=""): return f'<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:#FFF;border-radius:14px"><span style="font-size:15px;font-weight:700">{t} <span style="color:{C["muted"]};font-weight:400">{sub}</span></span><span style="color:{C["green"]};font-weight:700">›</span></div>'
def top(mode, detail): return f'<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:15px;color:{C["muted"]}">✕</span><span style="font-size:13px;color:{C["muted"]}">{mode} · {detail}</span></div>'
def play_line(t, txt, col=None): return f'<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:{col or C["green"]};font-weight:700">{PLAY}<span>{t}</span><span style="font-weight:400;color:{C["muted"]}">{txt}</span></div>'
def best(t, txt): return f'<div style="{CARD};flex-direction:row;gap:12px;align-items:flex-start"><span style="width:28px;height:28px;border-radius:14px;background:{C["soft"]};display:flex;align-items:center;justify-content:center;flex:none;color:{C["green"]};font-weight:700">✓</span><div style="display:flex;flex-direction:column;gap:6px"><b style="font-size:15px">Best moment, {t}</b><span style="font-size:15px;line-height:1.45">{txt}</span>{play_line("Hear it","")}</div></div>'
def badge(t, bg, ink): return f'<span style="padding:4px 10px;border-radius:999px;background:{bg};color:{ink};font-size:12px;font-weight:700">{t}</span>'
def write(name, title, h, inner):
    tail = f'''</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":390,"height":{h}}}}}'>
class Component extends DCLogic {{ renderVals() {{ return {{}}; }} }}
</script>
</body>
</html>
'''
    open(f'{name}.dc.html','w').write(HEAD.replace('<title>Feedback: reading result</title>', f'<title>{title}</title>') + f'<div style="width:390px;min-height:{h}px;box-sizing:border-box;background:{C["bg"]};color:{C["ink"]};font-family:\'Atkinson Hyperlegible Next\',system-ui,sans-serif;padding:22px 16px 40px;display:flex;flex-direction:column;gap:12px">\n' + inner + tail)

def scrubber(dur, moments, sel=None):
    lv=[0 if random.random()<0.08 else 0.3+0.6*abs(math.sin(i*0.6))*random.uniform(0.6,1) for i in range(200)]
    bars="".join(f'<rect x="{i*1.63:.1f}" y="{26-v*22:.1f}" width="0.9" height="{max(0.5,v*44):.1f}" fill="{C["grey"]}"></rect>' for i,v in enumerate(lv))
    pins=""
    for k,(t,tone) in enumerate(moments):
        col={"good":C["green"],"warn":C["orange"],"info":C["purple"]}[tone]; xx=t/dur*326
        pins+=f'<circle cx="{xx:.1f}" cy="60" r="{7 if k==sel else 5}" fill="{col}" stroke="#FFF" stroke-width="2"></circle><line x1="{xx:.1f}" y1="50" x2="{xx:.1f}" y2="54" stroke="{col}" stroke-width="2"></line>'
    return f'<svg width="326" height="70" viewBox="0 0 326 70" aria-hidden="true">{bars}{pins}</svg>'
def moment(t, what, tone="warn"):
    col={"good":C["green"],"warn":C["orange"],"info":C["purple"]}[tone]
    return f'<div style="display:flex;gap:10px;align-items:center;padding:8px 10px;border-radius:12px;background:{C["bg"]};border-left:4px solid {col}">{PLAY}<span style="font-size:13px;line-height:1.35"><b>{t}</b> · {what}</span></div>'

# ---------------- 1. On the spot ----------------
spot = f'''
{top("Table Topic", "“A risk worth taking?” · 1:36")}
{badge("On the spot · light feedback", C["tint"], C["green"])}
{h1("A clear story. The ending trailed off.")}

{best("0:47", "A 1.2 s pause right before <b>“and that changed everything.”</b>")}

<div style="{CARD};border-left:5px solid {C["orange"]}">
{kicker("One change", C["orange"])}
{h3("End on your point, not on “so yeah”.")}
<div style="padding:8px 10px;border-radius:10px;background:{C["bg"]};font-size:14px;line-height:1.45"><span style="font-size:11px;font-weight:700;color:{C["muted"]}">YOU ENDED ▶ 1:29</span><br>“…so yeah, I guess that’s it.”</div>
<div style="padding:8px 10px;border-radius:10px;background:{C["tint"]};font-size:14px;line-height:1.45"><span style="font-size:11px;font-weight:700;color:{C["green"]}">YOUR OWN POINT, AS A CLOSE</span><br>“So the risk worth taking was the one everyone called a mistake.”</div>
<div style="padding:8px 10px;border-radius:10px;background:{C["purpleBg"]};color:{C["purple"]};font-size:13px;line-height:1.4"><b>A habit:</b> 4 of your last 6 answers ended on “so yeah” or “that’s it”.</div>
{btn("Practise just the ending · 10 s")}
</div>

<div style="{CARD}">
<b style="font-size:16px">3 moments</b>
{scrubber(96, [(1,"good"),(6.3,"warn"),(90,"warn")])}
{moment("0:01", "Went straight into the story, no “so, um”.", "good")}
{moment("0:06", "A long stop mid-sentence, with “um” (1.9 s).")}
{moment("1:30", "Got quieter and trailed off at the end.")}
</div>

<div style="{CARD}">
<b style="font-size:16px">Quick check</b>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;font-size:12px;text-align:center">
<div style="background:{C["tint"]};border-radius:12px;padding:8px"><b style="font-size:15px;color:{C["green"]}">0.6 s</b><br>to your first word</div>
<div style="background:{C["peach"]};border-radius:12px;padding:8px"><b style="font-size:15px;color:{C["peachInk"]}">0:47</b><br>when your point came</div>
<div style="background:{C["tint"]};border-radius:12px;padding:8px"><b style="font-size:15px;color:{C["green"]}">✓</b><br>answered the question</div>
</div>
</div>

{rowlink("Make this a rehearsal", "· say it again and compare")}
{rowlink("Next question")}
{rowlink("See more", "· everything we measured")}
'''
write("1-OnTheSpot", "Feedback: on the spot", 1360, spot)

# ---------------- 2. Rehearsal ----------------
def bar_target(label, actual, target, mx, change):
    w=actual/mx*300; tx=target/mx*300
    col = C["green"] if abs(actual-target)<=4 else C["orange"]
    return f'''<div style="display:flex;flex-direction:column;gap:3px"><div style="display:flex;justify-content:space-between;font-size:13px"><span><b>{label}</b></span><span style="color:{col};font-weight:700">{actual//60}:{actual%60:02d} <span style="color:{C["muted"]};font-weight:400">/ {target//60}:{target%60:02d}</span> {change}</span></div>
<svg width="326" height="12" viewBox="0 0 326 12" aria-hidden="true"><rect width="326" height="8" y="2" rx="4" fill="{C["line"]}"></rect><rect width="{w:.1f}" height="8" y="2" rx="4" fill="{col}"></rect><line x1="{tx:.1f}" y1="0" x2="{tx:.1f}" y2="12" stroke="{C["ink"]}" stroke-width="2"></line></svg></div>'''
def runs_spark(label, vals, good_down=True, fmt=str):
    mn,mx=min(vals),max(vals); pts=[(i*40, 26-(v-mn)/(mx-mn+1e-9)*20) for i,v in enumerate(vals)]
    d="M"+" L".join(f"{a:.0f} {b:.1f}" for a,b in pts)
    dots="".join(f'<circle cx="{a:.0f}" cy="{b:.1f}" r="{4 if i==len(pts)-1 else 3}" fill="{C["green"] if i==len(pts)-1 else C["grey"]}"></circle>' for i,(a,b) in enumerate(pts))
    return f'<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:13px;width:130px">{label}</span><svg width="130" height="30" viewBox="-4 0 168 30" aria-hidden="true"><path d="{d}" stroke="{C["grey"]}" stroke-width="2" fill="none"></path>{dots}</svg><b style="font-size:13px;width:44px;text-align:right">{fmt(vals[-1])}</b></div>'
def overlay():
    words=["We","ship","on","Monday,",'<span style="font-weight:700">not</span>',"next","month."]
    xs=[0,26,62,86,150,190,236]
    w="".join(f'<span style="position:absolute;left:{x}px">{t}</span>' for x,t in zip(xs,words))
    return f'''<div style="display:flex;flex-direction:column;gap:2px"><svg width="326" height="56" viewBox="0 0 326 56" aria-hidden="true">
<path d="M4 30 C 40 28, 70 26, 110 30 L 130 30" stroke="{C["grey"]}" stroke-width="2.5" fill="none" stroke-dasharray="1 0"></path>
<path d="M150 32 C 170 30, 190 28, 230 30 C 260 32, 280 22, 300 14" stroke="{C["grey"]}" stroke-width="2.5" fill="none"></path>
<path d="M4 30 C 40 26, 70 24, 120 28" stroke="{C["green"]}" stroke-width="3" fill="none"></path>
<path d="M150 22 C 160 10, 175 8, 190 18 C 220 28, 260 36, 300 44" stroke="{C["green"]}" stroke-width="3" fill="none"></path>
<rect x="124" y="4" width="22" height="48" rx="4" fill="{C["soft"]}"></rect><text x="135" y="54" font-size="8" text-anchor="middle" fill="{C["green"]}">0.6 s</text>
</svg><div style="position:relative;height:20px;font-size:13px">{w}</div>
<div style="display:flex;gap:14px;font-size:11px;color:{C["muted"]}"><span><b style="color:{C["grey"]}">━</b> run 3</span><span><b style="color:{C["green"]}">━</b> run 4</span></div></div>'''

reh = f'''
{top("Prepared speech", "“Team kickoff” · run 4")}
{badge("Rehearsal · compared with your other runs", C["purpleBg"], C["purple"])}
{h1("Better than run 3. Section 3 still trips you up.")}

<div style="{CARD}">
<b style="font-size:16px">Across your 4 runs</b>
{runs_spark("Run time", [212,198,187,181], fmt=lambda v: f"{v//60}:{v%60:02d}")}
{runs_spark("Long stops", [6,4,3,2])}
{runs_spark("Planned marks hit", [3,5,5,7], fmt=lambda v: f"{v} of 8")}
{runs_spark("Script kept", [88,93,95,97], fmt=lambda v: f"{v}%")}
<span style="font-size:12px;color:{C["muted"]}">Target length 3:00 · you’re 0:01 over.</span>
</div>

<div style="{CARD}">
<b style="font-size:16px">Section by section</b>
{bar_target("1 · Opening", 41, 30, 80, '<span style="color:#2E5B3E">▼ 6 s</span>')}
{bar_target("2 · Why now", 52, 50, 80, '<span style="color:#2E5B3E">▼ 4 s</span>')}
{bar_target("3 · The plan", 61, 60, 80, '<span style="color:#7A3A10">2 stops</span>')}
{bar_target("4 · Close", 27, 40, 80, '<span style="color:#7A3A10">rushed</span>')}
<span style="font-size:11px;color:{C["muted"]}">Black tick = your target for that section.</span>
</div>

<div style="{CARD};border-left:5px solid {C["orange"]}">
{kicker("Trouble spot", C["orange"])}
{h3("“The first milestone is …” in section 3")}
<span style="font-size:14px;line-height:1.45">A long stop here in <b>4 of 4 runs</b>, always before “milestone”. It looks like a memory gap, not nerves.</span>
<div style="display:flex;gap:4px">{"".join(badge(f"run {i}", C["peach"], C["peachInk"]) for i in range(1,5))}</div>
{play_line("Run 4 · 1:52", "hear the stop", C["peachInk"])}
{btn("Drill just this line · 3 times")}
</div>

<div style="{CARD}">
<b style="font-size:16px">What changed since run 3</b>
<span style="font-size:13px;color:{C["muted"]}">Section 2, the key line, lined up word by word:</span>
{overlay()}
<span style="font-size:14px;line-height:1.45">✓ You added the pause before <b>“not”</b> and stressed it, and the ending now falls. That’s the line landing.</span>
<div style="display:flex;gap:14px">{play_line("Run 3","")}{play_line("Run 4","")}</div>
</div>

<div style="{CARD}">
<b style="font-size:16px">Your planned marks</b>
<div style="font-family:Fraunces,Georgia,serif;font-size:15px;line-height:1.9">
We ship on Monday, <span style="color:{C["green"]};font-weight:700">/✓</span> <u style="text-decoration-color:{C["green"]};text-decoration-thickness:2px">not</u><span style="color:{C["green"]}">✓</span> next month. The first <span style="color:{C["orange"]};font-weight:700">/✗</span> milestone is the pilot <span style="color:{C["green"]};font-weight:700">/✓</span> … and <u style="text-decoration-color:{C["orange"]};text-decoration-thickness:2px">every</u><span style="color:{C["orange"]}">✗</span> team gets a seat.
</div>
<span style="font-size:13px;color:{C["muted"]}">/ = planned pause · underline = planned stress · 7 of 8 hit.</span>
</div>

<div style="{CARD}">
<b style="font-size:16px">Script check</b>
<span style="font-size:14px;line-height:1.5">You dropped <span style="background:{C["peach"]};border-radius:4px;padding:0 3px;text-decoration:line-through">“and we’ll review it every Friday”</span> again (runs 3 and 4).</span>
</div>

<div style="{CARD}">
<b style="font-size:16px">Your best version of each section</b>
{"".join(f'<div style="display:flex;justify-content:space-between;align-items:center;font-size:14px"><span>{s}</span>{play_line(r,"")}</div>' for s,r in [("1 · Opening","Run 2"),("2 · Why now","Run 4"),("3 · The plan","Run 1"),("4 · Close","Run 2")])}
<span style="font-size:12px;color:{C["muted"]}">Listen back to these before your next run.</span>
</div>

{btn("Run it again")}
{rowlink("See more", "· every layer, run by run")}
'''
write("2-Rehearsal", "Feedback: rehearsal", 1980, reh)

# ---------------- 3. Drill ----------------
def end_row(text, ok, t):
    col = C["green"] if ok else C["orange"]
    return f'<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:{C["bg"] if ok else C["peach"]}"><b style="font-size:20px;color:{col}">{"↘" if ok else "↗"}</b><span style="font-size:14px;flex:1">{text}</span>{"" if ok else PLAY}<span style="font-size:11px;color:{C["muted"]}">{t}</span></div>'
drill = f'''
{top("Drill", "Land your statements")}
{badge("Drill · only the target", C["soft"], C["green"])}
<div style="{CARD};align-items:center;text-align:center">
{kicker("Your goal")}
<span style="font-size:16px">End all 5 statements <b>low</b>.</span>
<span style="font-family:Fraunces,Georgia,serif;font-size:64px;font-weight:600;line-height:1;color:{C["green"]}">4 of 5</span>
<span style="font-size:14px;color:{C["muted"]}">Up from 2 of 5 on your first try.</span>
</div>

<div style="{CARD}">
{end_row("I finished the report.", True, "0:02")}
{end_row("The numbers look good.", True, "0:05")}
{end_row("We’re ready to launch.", False, "0:08")}
{end_row("The team did great work.", True, "0:12")}
{end_row("I’ll send it tonight.", True, "0:15")}
<span style="font-size:13px;color:{C["peachInk"]}">“ready to launch” went up, so it sounded like a question. Let “launch” drop.</span>
</div>

<div style="{CARD};align-items:center">
<b style="font-size:15px">Three in a row to lock it in</b>
<div style="display:flex;gap:10px">{"".join(f'<span style="width:36px;height:36px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-weight:700;background:{C["line"]};color:#FFF"></span>' for i in range(3))}</div>
<span style="font-size:13px;color:{C["muted"]}">A 5 of 5 starts the count. You’re one ending away.</span>
</div>
{btn("Try again")}
{rowlink("Learn why it matters", "· 1-minute card")}
'''
write("3-Drill", "Feedback: drill", 900, drill)

# ---------------- 4. Conversation ----------------
turns=[("them",6),("you",9),("them",7),("you",5),("them",8),("you",11),("them",4),("you",6),("them",9),("you",7)]
def timeline():
    xx=0; out=""
    total=sum(d for _,d in turns)
    for i,(who,d) in enumerate(turns):
        w=d/total*326
        y=8 if who=="them" else 30
        col=C["grey"] if who=="them" else C["green"]
        out+=f'<rect x="{xx:.1f}" y="{y}" width="{w-2:.1f}" height="16" rx="4" fill="{col}"></rect>'
        if who=="you" and i in (3,7): out+=f'<text x="{xx+w/2:.1f}" y="{y+12}" font-size="10" text-anchor="middle" fill="#FFF">?★</text>'
        if who=="you" and i==1: out+=f'<text x="{xx+w/2:.1f}" y="{y+12}" font-size="10" text-anchor="middle" fill="#FFF">?</text>'
        if i==5: out+=f'<circle cx="{xx:.1f}" cy="27" r="5" fill="{C["orange"]}"></circle>'
        xx+=w
    return f'<svg width="326" height="52" viewBox="0 0 326 52" aria-hidden="true">{out}</svg><div style="display:flex;gap:12px;font-size:11px;color:{C["muted"]}"><span><b style="color:{C["grey"]}">■</b> Maya</span><span><b style="color:{C["green"]}">■</b> you</span><span>? question · ★ follow-up</span><span><b style="color:{C["orange"]}">●</b> cut in</span></div>'
conv = f'''
{top("Conversation", "Coffee with Maya · 3:12")}
{badge("Conversation · listening and connecting", C["peach"], C["peachInk"])}
{h1("You asked real follow-ups. Maya talked a bit less.")}

<div style="{CARD}">
<b style="font-size:16px">How the conversation went</b>
{timeline()}
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;font-size:12px;text-align:center">
<div style="background:{C["bg"]};border-radius:12px;padding:8px"><b style="font-size:15px">55%</b><br>you talked</div>
<div style="background:{C["tint"]};border-radius:12px;padding:8px"><b style="font-size:15px;color:{C["green"]}">3</b><br>questions, 2 follow-ups</div>
<div style="background:{C["bg"]};border-radius:12px;padding:8px"><b style="font-size:15px">0.7 s</b><br>typical reply gap</div>
</div>
</div>

{best("1:05", "You picked up her word: <b>“Wait, you got a <i>kitten</i>? What’s its name?”</b>")}

<div style="{CARD};border-left:5px solid {C["orange"]}">
{kicker("One change", C["orange"])}
{h3("Let her finish the story.")}
<span style="font-size:14px;line-height:1.45">At 1:42 you came in while she was still talking about her trip. She didn’t get to the end.</span>
{play_line("1:40", "hear it", C["peachInk"])}
<span style="font-size:13px;color:{C["muted"]};line-height:1.45">The move: wait for the end of her sentence, then react to the last thing she said.</span>
{btn("Try that moment again")}
</div>

<div style="{CARD}">
<b style="font-size:16px">What you picked up on</b>
<span style="font-size:14px;line-height:1.5">✓ the kitten · ✓ her new job · <span style="color:{C["muted"]}">missed: her sister’s visit</span></span>
<span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:{C["purpleBg"]};color:{C["purple"]};align-self:flex-start">Coach’s read · from both sides</span>
</div>

{rowlink("Talk again")}
{rowlink("See more", "· every turn")}
'''
write("4-Conversation", "Feedback: conversation", 1110, conv)

json.dump({"v":3,"createdOnFiles":{"v":1,"at":"2026-10-24T20:00:00Z"},"title":"Feedback by kind of practice","launch":{"view":"canvas"},"pages":[],
 "boards":{"1-OnTheSpot.dc.html":{"x":0,"y":0,"w":390,"h":1360,"title":"1 · On the spot (light)"},"2-Rehearsal.dc.html":{"x":470,"y":0,"w":390,"h":1980,"title":"2 · Rehearsal (deep, compared run to run)"},"3-Drill.dc.html":{"x":940,"y":0,"w":390,"h":900,"title":"3 · Drill (only the target)"},"4-Conversation.dc.html":{"x":1410,"y":0,"w":390,"h":1110,"title":"4 · Conversation (listening and connecting)"}},
 "order":["1-OnTheSpot.dc.html","2-Rehearsal.dc.html","3-Drill.dc.html","4-Conversation.dc.html"],"notes":{"t":{"x":0,"y":-240,"text":"Feedback by kind of practice: on the spot, rehearsal, drill, conversation","kind":"title1","maxW":1800}},"designSystems":[]}, open('canvas.json','w'))
