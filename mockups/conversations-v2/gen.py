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


DARK = "#16291F"; DARK2 = "#21392B"; MINT = "#9FD3B0"
def dark_write(name, title, h, inner):
    write(name, title, h, inner)
    s = open(f'{name}.dc.html').read().replace(f'background:{C["bg"]};color:{C["ink"]}', f'background:{DARK};color:#F3EFE6', 1)
    open(f'{name}.dc.html','w').write(s)
def goalchip(t, dark=False): return f'<span style="align-self:flex-start;font-size:12px;font-weight:700;padding:5px 10px;border-radius:999px;background:{"rgba(159,211,176,.16)" if dark else C["soft"]};color:{MINT if dark else C["green"]}">🎯 {t}</span>'
def wave(n=24, col=MINT):
    import math
    bars = "".join(f'<rect x="{i*9}" y="{20-h/2:.0f}" width="5" height="{h:.0f}" rx="2.5" fill="{col}"></rect>' for i,h in enumerate([6+28*abs(math.sin(i*0.7+1.3))*(0.5+0.5*abs(math.cos(i*0.31))) for i in range(n)]))
    return f'<svg width="{n*9}" height="40" viewBox="0 0 {n*9} 40" aria-hidden="true">{bars}</svg>'

# 1 · Situations
GROUPS = [
  ("Meeting someone new", [("The office party", "Ask two questions back", "60 s"), ("A networking intro", "Say what you do in one line", "60 s")]),
  ("Clients", [("Discovery call", "Ask about their problem before pitching", "90 s"), ("“It’s too expensive”", "Answer the price without discounting", "90 s"), ("An unhappy client", "Acknowledge before you explain", "90 s")]),
  ("Colleagues", [("Monday coffee", "Follow up on something they said", "60 s"), ("Asking for a favour", "Ask clearly, then stop", "60 s")]),
  ("Tricky moments", [("The forgotten name", "Recover with warmth", "60 s"), ("Pushing back on a deadline", "Say no with a reason and an offer", "90 s")]),
]
def sit_card(t, g, d, star=False):
    return f'''<div style="{CARD};gap:4px;padding:12px 14px;{'border:2px solid '+C['orange'] if star else ''}"><div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:15px">{t}</b><span style="font-size:11px;color:{C["muted"]}">{d}</span></div><span style="font-size:13px;color:{C["green"]}">🎯 {g}</span>{chip("★ Your weak spot: questions back", C["peach"], C["peachInk"]) if star else ""}</div>'''
sits = "".join(f'<b style="font-size:15px;margin-top:6px">{gname}</b>' + "".join(sit_card(t,g,d, star=(t=="The office party")) for t,g,d in items) for gname,items in GROUPS)
pick = f'''{top("‹ Practice","")}
{H("Talk with someone",28)}
{P("Pick a situation. 60 to 90 seconds, one skill.")}
<div style="padding:14px 16px;border-radius:18px;background:{C["green"]};color:#FFF;display:flex;justify-content:space-between;align-items:center"><div style="display:flex;flex-direction:column;gap:2px"><b style="font-size:16px">Surprise me</b><span style="font-size:12px;opacity:.85">A situation for what you need most</span></div><span style="font-size:22px">⚡</span></div>
{sits}
{P("12 of 30 minutes left this month",size=12)}'''

# 2 · Set-up
setup = f'''{top("✕","")}
{label("Meeting someone new")}
{H("The office party",28)}
{P("Your team’s party, by the snacks. Someone you haven’t met yet says hello.",C["ink"],15)}
<div style="{CARD};flex-direction:row;gap:12px;align-items:center"><span style="width:44px;height:44px;border-radius:22px;background:{C["purpleBg"]};display:flex;align-items:center;justify-content:center;font-weight:800;color:{C["purple"]}">M</span><div style="display:flex;flex-direction:column"><b style="font-size:15px">You’ll talk with Maya</b>{P("New on the design team · curious, laughs easily",size=12)}</div></div>
<div style="{CARD};gap:6px;background:{C["soft"]}"><span style="font-size:12px;font-weight:700;color:{C["green"]};letter-spacing:.04em;text-transform:uppercase">Your goal</span><b style="font-size:19px;font-family:Fraunces,Georgia,serif">Ask two questions back.</b>{P("She’ll ask about you. Answer, then turn it round.",C["ink"],13)}</div>
<div style="display:flex;flex-direction:column;gap:6px"><b style="font-size:13px">How hard</b><div style="display:flex;gap:8px">{"".join(f'<div style="flex:1;padding:10px;border-radius:12px;text-align:center;font-size:13px;font-weight:700;{"background:"+C["green"]+";color:#FFF" if i==1 else "background:#FFF;border:2px solid "+C["line"]}">{t}</div>' for i,t in enumerate(["Easy","Normal","Hard"]))}</div>{P("Hard: she gives short answers and cuts in.",size=12)}</div>
<div style="display:flex;justify-content:space-between;font-size:12px;color:{C["muted"]}"><span>⏱ About 60 seconds</span><span>📞 Like a phone call · talk over each other</span></div>
{btn("Start · 60 s")}
{P("Maya’s voice is AI, by ElevenLabs. Your side is kept on this phone so you can play it back.",size=11)}'''

# 3 · Their turn
them = f'''<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;opacity:.8"><span>The office party</span><span>0:12 / 1:00</span></div>
<div style="height:4px;border-radius:2px;background:{DARK2}"><div style="width:20%;height:4px;border-radius:2px;background:{MINT}"></div></div>
{goalchip("Questions back: 0 of 2", True)}
<div style="display:flex;flex-direction:column;align-items:center;gap:14px;margin-top:40px"><div style="width:120px;height:120px;border-radius:60px;background:{C["purpleBg"]};display:flex;align-items:center;justify-content:center;font-size:44px;font-weight:800;color:{C["purple"]};box-shadow:0 0 0 10px rgba(237,235,250,.12),0 0 0 22px rgba(237,235,250,.06)">M</div><b style="font-size:20px">Maya is talking</b>{wave()}</div>
<div style="margin-top:28px;padding:14px 16px;border-radius:16px;background:{DARK2};font-size:15px;line-height:1.45;color:#E6E1D6">“These snacks are dangerous, right? I’m Maya, I just joined design.”</div>
<div style="display:flex;justify-content:space-between;font-size:12px;opacity:.7"><span>Captions on</span><span>Talk any time to cut in</span></div>
<div style="margin-top:auto;display:flex;justify-content:center"><div style="padding:12px 20px;border-radius:999px;border:2px solid {DARK2};font-size:14px">End</div></div>'''

# 4 · Your turn
you = f'''<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;opacity:.8"><span>The office party</span><span>0:31 / 1:00</span></div>
<div style="height:4px;border-radius:2px;background:{DARK2}"><div style="width:52%;height:4px;border-radius:2px;background:{MINT}"></div></div>
{goalchip("Questions back: 1 of 2 ✓", True)}
<div style="display:flex;flex-direction:column;align-items:center;gap:14px;margin-top:40px"><div style="width:120px;height:120px;border-radius:60px;background:#F2A36A;display:flex;align-items:center;justify-content:center;font-size:40px;box-shadow:0 0 0 10px rgba(242,163,106,.22),0 0 0 22px rgba(242,163,106,.1)">🎙</div><b style="font-size:20px">Your turn</b>{wave(col="#F2A36A")}</div>
<div style="margin-top:28px;padding:14px 16px;border-radius:16px;border:2px dashed {DARK2};font-size:15px;line-height:1.45;color:#E6E1D6">I’m in sales, two years now. <b style="color:{MINT}">How are you finding it so far?</b> <span style="opacity:.5">…</span></div>
<div style="display:flex;justify-content:center;font-size:12px;opacity:.7">Hearing you · your words appear as you speak</div>
<div style="margin-top:auto;display:flex;justify-content:center"><div style="padding:12px 20px;border-radius:999px;border:2px solid {DARK2};font-size:14px">End</div></div>'''

# 5 · Results
def line(who, text, mark=None):
    you = who=="You"
    m = f'<span style="font-size:11px;font-weight:700;color:{C["green"] if mark=="q" else C["peachInk"]}">{"? question back" if mark=="q" else "▶ try again"}</span>' if mark else ""
    return f'<div style="align-self:{"flex-end" if you else "flex-start"};max-width:82%;padding:10px 12px;border-radius:14px;background:{C["peach"] if you else "#FFF"};display:flex;flex-direction:column;gap:2px"><b style="font-size:11px;color:{C["muted"]}">{who}</b><span style="font-size:13px">{text}</span>{m}</div>'
results = f'''{top("Conversation","Just now")}
{label("The office party · with Maya · 0:58")}
{H("1 of 2 questions back.",28)}
<div style="display:flex;gap:6px">{"".join(f'<span style="width:34px;height:34px;border-radius:17px;display:flex;align-items:center;justify-content:center;font-weight:800;background:{C["green"] if i==0 else C["line"]};color:#FFF">{"✓" if i==0 else ""}</span>' for i in range(2))}<span style="font-size:13px;color:{C["muted"]};align-self:center;margin-left:4px">Goal: ask two questions back</span></div>
<div style="{CARD};gap:10px">{chip("What worked", C["soft"], C["green"])}{P("“How are you finding it so far?” turned it back to her, right on time.",C["ink"],15)}{chip("One change", C["peach"], C["peachInk"])}{P("When she mentioned the launch, you answered and stopped. Ask her one thing about it.",C["ink"],15)}</div>
<div style="{CARD};gap:10px;border:2px solid {C["orange"]}"><b style="font-size:15px">Try that moment again</b><div style="padding:10px 12px;border-radius:12px;background:{C["tint"]};font-size:13px"><b>Maya:</b> “Was the launch as stressful as it sounded?”</div><div style="font-size:13px;color:{C["muted"]}">You said: “yes very but it went fine”</div><div style="border-left:3px solid {C["green"]};padding-left:10px;font-size:13px">Could sound like: “Honestly, very. [one moment from launch day]. <b>How’s your first month been?</b>”</div><div style="display:flex;gap:8px"><div style="flex:1;padding:11px;border-radius:999px;border:2px solid {C["line"]};text-align:center;font-size:13px;font-weight:700">▶ Hear it</div><div style="flex:2;padding:11px;border-radius:999px;background:{C["green"]};color:#FFF;text-align:center;font-size:13px;font-weight:700">Answer again</div></div></div>
<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:15px">The conversation</b><span style="font-size:13px;color:{C["green"]};font-weight:700">▶ Play your side</span></div>
<div style="display:flex;flex-direction:column;gap:8px">{line("Maya","These snacks are dangerous, right? I’m Maya, I just joined design.")}{line("You","Ha, they are. I’m Jordan, in sales, two years now. How are you finding it so far?","q")}{line("Maya","Good! Busy. I heard you just did a big launch?")}{line("You","yes very but it went fine","t")}</div>
{P("You did 46% of the talking · turns about 6 seconds",size=12)}
{btn("Talk again · same situation")}
<div style="{CARD};gap:4px;align-items:center;background:transparent;border:2px dashed {C["line"]}"><b style="font-size:13px">Every chart (trial) stays below</b></div>'''

# 6 · Try that moment again
retry = f'''{top("✕","Try that moment again")}
{label("The office party · one turn")}
<div style="{CARD};gap:8px"><span style="font-size:12px;color:{C["muted"]}">Maya</span><span style="font-family:Fraunces,Georgia,serif;font-size:22px;line-height:1.3">“Was the launch as stressful as it sounded?”</span><div style="padding:10px;border-radius:999px;border:2px solid {C["line"]};text-align:center;font-size:13px;font-weight:700">▶ Hear her again</div></div>
{goalchip("Answer, then ask her one thing")}
<div style="display:flex;justify-content:center;margin-top:20px"><div style="width:150px;height:150px;border-radius:75px;background:#F2A36A;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px"><span style="font-size:26px">🎙</span><b style="font-family:Fraunces,Georgia,serif;font-size:20px">Answer</b><span style="font-size:12px">one turn</span></div></div>
<div style="{CARD};gap:6px;background:{C["soft"]}"><b style="font-size:13px;color:{C["green"]}">Last time</b>{P("“yes very but it went fine”",C["ink"],13)}{P("No question back.",size=12)}</div>
{P("Three good answers in a row and it’s marked as learned.",size=12)}'''

boards = [("Situations","Pick a situation",pick,1500,False),("Setup","Set-up: goal, who, how hard",setup,920,False),("Them","Their turn",them,844,True),("You","Your turn",you,844,True),("Results","Results: goal first",results,1560,False),("Retry","Try that moment again",retry,844,False)]
for name,title,inner,h,dark in boards: (dark_write if dark else write)(name, title, h, inner)
json.dump({"v":3,"createdOnFiles":{"v":1,"at":"2026-10-25T12:00:00Z"},"title":"Talk with someone v2","launch":{"view":"canvas"},"pages":[],
 "boards":{f"{n}.dc.html":{"x":i*470,"y":0,"w":390,"h":h,"title":t} for i,(n,t,_,h,_) in enumerate(boards)},
 "order":[f"{n}.dc.html" for n,*_ in boards],"notes":{"t":{"x":0,"y":-240,"text":"Talk with someone: situation first, 60 to 90 seconds, one goal","kind":"title1","maxW":2800}},"designSystems":[]}, open('canvas.json','w'))
