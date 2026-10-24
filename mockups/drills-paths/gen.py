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

# 1 · Home: three doors
home = f'''{top("Good evening", "🔥 4 days this week")}
{H("Ready for today’s 10?")}
<div style="{CARD};background:{C["green"]};color:#FFF;gap:12px">
<div style="display:flex;justify-content:space-between;align-items:flex-start"><div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;opacity:.8">Today’s 10 · guided</span><b style="font-size:20px;line-height:1.2">Sound certain, step 3</b><span style="font-size:13px;opacity:.85">Warm-up · Land it · Use it in a 30 s answer</span></div>{ring(0.0,58,"0","of 10 min").replace(C["line"],"rgba(255,255,255,.25)").replace(f'color:{C["muted"]}','color:#FFF;opacity:.8')}</div>
<div style="padding:13px;border-radius:999px;background:#FFF;color:{C["green"]};font-weight:700;text-align:center">Start · 10 min</div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
<div style="{CARD};gap:6px"><span style="font-size:22px">▶</span><b style="font-size:15px">Quick play</b>{P("One drill, about a minute",size=12)}{chip("★ Land it", C["peach"], C["peachInk"])}</div>
<div style="{CARD};gap:6px"><span style="font-size:22px">⟿</span><b style="font-size:15px">Your path</b>{P("Sound certain · 2 of 5 units",size=12)}<div style="height:6px;border-radius:3px;background:{C["line"]}"><div style="width:40%;height:6px;border-radius:3px;background:{C["green"]}"></div></div></div>
</div>
<div style="{CARD};flex-direction:row;align-items:center;justify-content:space-between"><div style="display:flex;flex-direction:column;gap:6px"><b style="font-size:14px">This week</b>{week(4)}</div></div>
<div style="{CARD};flex-direction:row;align-items:center;gap:10px;background:{C["goldBg"]}"><span style="font-size:22px">🏅</span><div style="display:flex;flex-direction:column"><b style="font-size:14px">New best yesterday</b>{P("Pace lock: 3 in a row at silver",size=12)}</div></div>
{tabs("Today")}'''

# 2 · Quick play
DRILLS = [("Land it","Statements end low","gold","9 / 10",True),("Pace lock","Stay in your pace band","silver","7 / 10",False),("Pause for the point","Hold a beat before the key line","bronze","5 / 10",False),("Hold the last word","Don’t fade at the end","silver","8 / 10",False),("Lift one word","Stress the word that matters","none","new",False),("Stretch the range","Move more than your usual","bronze","6 / 10",False)]
cards = "".join(f'''<div style="{CARD};gap:6px;padding:14px;{'border:2px solid '+C['orange'] if best else ''}">{BEST if best else ''}<b style="font-size:15px;line-height:1.2">{n}</b>{P(d,size=12)}<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:{C["muted"]}">{medal(m)}<span>best {pb}</span></div></div>''' for n,d,m,pb,best in DRILLS)
quick = f'''{top("", "60–90 seconds each")}
{H("Quick play")}
<div style="padding:16px;border-radius:18px;background:{C["green"]};color:#FFF;display:flex;justify-content:space-between;align-items:center"><div style="display:flex;flex-direction:column;gap:3px"><b style="font-size:17px">Surprise me</b><span style="font-size:12px;opacity:.85">Picks the drill for what you’ll gain most from</span></div><span style="font-size:26px">⚡</span></div>
{P("“Land it” is best for you today: 3 of your last 5 takes had a statement that rose like a question.",C["peachInk"],13)}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">{cards}</div>
{P("Bronze, silver, gold: the same drill with a tighter target. Every drill is always open.",size=12)}
{tabs("Quick play")}'''

# 3 · Drill in action (Land it, live)
line_pts = "M8 60 L60 58 L110 62 L160 56 L210 60 L250 64"
drill = f'''{top("✕", "Land it · silver")}
<div style="display:flex;gap:6px">{"".join(f'<div style="flex:1;height:8px;border-radius:4px;background:{C["green"] if i<1 else (C["peach"] if i==1 else C["line"])}"></div>' for i in range(3))}</div>
{P("Rep 2 of 3 · say it, ending low",size=13)}
<div style="{CARD};gap:14px;padding:20px"><span style="font-family:Fraunces,Georgia,serif;font-size:24px;line-height:1.3;font-weight:600">“We’re on track for the launch.”</span>
<svg width="294" height="110" viewBox="0 0 294 110" aria-hidden="true"><rect x="200" y="62" width="94" height="40" rx="10" fill="{C["tint"]}" stroke="{C["green"]}" stroke-dasharray="4 4"></rect><text x="247" y="96" font-size="10" text-anchor="middle" fill="{C["green"]}" font-weight="700">land here</text><line x1="0" y1="56" x2="294" y2="56" stroke="{C["line"]}" stroke-dasharray="3 4"></line><path d="{line_pts}" stroke="{C["green"]}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="250" cy="64" r="7" fill="{C["green"]}"></circle><line x1="256" y1="10" x2="256" y2="104" stroke="{C["ink"]}" stroke-width="2"></line></svg>
<div style="display:flex;align-items:center;gap:8px"><span style="width:12px;height:12px;border-radius:6px;background:{C["orange"]};display:inline-block"></span>{P("Listening… your line draws as you speak",size=13)}</div></div>
<div style="{CARD};flex-direction:row;justify-content:space-between;align-items:center"><div style="display:flex;flex-direction:column"><b style="font-size:13px">Rep 1</b>{P("Landed ↘",C["green"],13)}</div><div style="display:flex;flex-direction:column;align-items:flex-end"><b style="font-size:13px">Your best</b>{P("9 of 10 landed",size=13)}</div></div>
<div style="margin-top:auto;display:flex;justify-content:center"><div style="width:76px;height:76px;border-radius:38px;background:{C["orange"]};display:flex;align-items:center;justify-content:center;color:#FFF;font-size:13px;font-weight:700">Done</div></div>'''

# 4 · Paths
PATHS = [("Sound certain","Land your endings, hold the last word, cut the hedges","5 units · ~10 min each",0.4,True),("Slow down","Pace lock, pauses that land, breathe before the point","4 units",0.0,False),("Nail a presentation","Open, structure, land the close, handle questions","6 units · has a date",0.0,False),("Small talk","Answer with a story, ask back, keep it going","5 units",0.15,False),("Job interview","Tell me about yourself, stories with results","5 units",0.0,False)]
pcards = "".join(f'''<div style="{CARD};gap:6px;{'border:2px solid '+C['green'] if on else ''}"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:16px">{n}</b>{chip("Your path", C["soft"], C["green"]) if on else ""}</div>{P(d,size=13)}<div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;border-radius:3px;background:{C["line"]}"><div style="width:{f*100:.0f}%;height:6px;border-radius:3px;background:{C["green"]}"></div></div><span style="font-size:11px;color:{C["muted"]}">{u}</span></div></div>''' for n,d,u,f,on in PATHS)
paths = f'''{top("", "")}
{H("Paths")}
{P("Pick a goal. Today’s 10 follows it, one small step a day. Switch any time.")}
{pcards}
<div style="{CARD};gap:6px;border:2px dashed {C["line"]};background:transparent"><b style="font-size:16px">＋ My path</b>{P("Pin the drills and lessons you want. Today’s 10 draws from them.",size=13)}</div>
{tabs("Paths")}'''

# 5 · Path detail
STEPS = [("Learn","Why a falling end sounds sure","1 min","done"),("Drill","Land it, bronze","2 min","done"),("Use it","30 s answer, ending each point low","4 min","now"),("Real check","A full Rapid Fire; endings are checked","4 min","next"),("Come back","Land it again in 3 days","1 min","later")]
def step_row(i, n, d, t, s):
    dot = {"done":(C["green"],"#FFF","✓"),"now":(C["orange"],"#FFF",str(i+1)),"next":(C["line"],C["ink"],str(i+1)),"later":(C["line"],C["muted"],"⟳")}[s]
    return f'''<div style="display:flex;gap:12px;align-items:flex-start"><div style="display:flex;flex-direction:column;align-items:center"><span style="width:30px;height:30px;border-radius:15px;background:{dot[0]};color:{dot[1]};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px">{dot[2]}</span>{'' if i==4 else f'<span style="width:2px;height:30px;background:{C["line"]}"></span>'}</div><div style="flex:1;display:flex;flex-direction:column;gap:2px;{'padding:10px 12px;border-radius:14px;background:'+C['peach'] if s=='now' else ''}"><div style="display:flex;justify-content:space-between"><b style="font-size:14px">{n}</b><span style="font-size:12px;color:{C["muted"]}">{t}</span></div>{P(d,size=13)}</div></div>'''
units = [("1","Endings that land","done"),("2","Hold the last word","done"),("3","Land it under pressure","now"),("4","Cut the hedges","locked"),("5","Certain in a real talk","locked")]
detail = f'''{top("‹ Paths", "")}
{label("Path · Sound certain")}
{H("Unit 3: Land it under pressure",24)}
<div style="display:flex;gap:6px">{"".join(f'<div style="flex:1;height:8px;border-radius:4px;background:{C["green"] if s=="done" else (C["orange"] if s=="now" else C["line"])}"></div>' for _,_,s in units)}</div>
{P("Unit 3 of 5 · about 10 minutes, today or spread over days")}
<div style="{CARD};gap:0">{"".join(step_row(i,*st) for i,st in enumerate(STEPS))}</div>
{btn("Continue · Use it")}
{P("Coming up: 4 · Cut the hedges, 5 · Certain in a real talk. All open; we suggest this order.",size=12)}'''

# 6 · Today's 10: the plan
PLAN = [("1","Warm-up","Lip trills and one line at three volumes","1 min"),("2","Land it","Quick drill, silver","2 min"),("3","Use it","Sound certain, step 3: a 30 s answer","4 min"),("4","One real rep","Rapid Fire on a surprise question","3 min")]
plan = f'''{top("✕", "Today’s 10")}
{H("Your 10 minutes")}
{P("Built from your path and your last takes. Swap any step.")}
<div style="{CARD};gap:12px">{"".join(f'<div style="display:flex;gap:12px;align-items:center"><span style="width:30px;height:30px;border-radius:15px;background:{C["soft"]};color:{C["green"]};display:flex;align-items:center;justify-content:center;font-weight:700">{n}</span><div style="flex:1;display:flex;flex-direction:column"><b style="font-size:14px">{t}</b>{P(d,size=12)}</div><span style="font-size:12px;color:{C["muted"]}">{m}</span></div>' for n,t,d,m in PLAN)}</div>
<div style="{CARD};flex-direction:row;gap:10px;align-items:center;background:{C["purpleBg"]}"><span style="font-size:20px">💡</span>{P("Why “Land it”: 3 of your last 5 takes had a statement that rose like a question.",C["purple"],13)}</div>
<div style="display:flex;gap:10px"><div style="flex:1">{btn("Only 5 min", False)}</div><div style="flex:2">{btn("Start")}</div></div>'''

# 7 · Today's 10: mid-session (Use it)
mid = f'''{top("✕", "Step 3 of 4 · 6 min left")}
<div style="display:flex;gap:6px">{"".join(f'<div style="flex:1;height:8px;border-radius:4px;background:{C["green"] if i<2 else (C["peach"] if i==2 else C["line"])}"></div>' for i in range(4))}</div>
{label("Use it · Sound certain")}
{H("“What’s one thing you’d change about your job?”",22)}
<div style="{CARD};flex-direction:row;gap:10px;align-items:center"><span style="width:30px;height:30px;border-radius:15px;background:{C["peach"]};display:flex;align-items:center;justify-content:center">🎯</span><div style="display:flex;flex-direction:column"><b style="font-size:14px">Your target</b>{P("End each point low. We’ll mark every ending.",size=13)}</div></div>
<div style="{CARD};gap:8px;align-items:center;padding:22px"><span style="font-family:Fraunces,Georgia,serif;font-size:44px;font-weight:600">0:18</span>{P("of 0:30",size=13)}
<div style="display:flex;gap:6px;margin-top:6px">{"".join(f'<span style="width:30px;height:24px;border-radius:8px;background:{C["tint"] if k=="d" else C["peach"]};display:flex;align-items:center;justify-content:center;color:{C["green"] if k=="d" else C["orange"]};font-weight:800">{"↘" if k=="d" else "↗"}</span>' for k in "dud")}</div>{P("Endings so far",size=11)}</div>
<div style="margin-top:auto;display:flex;justify-content:center"><div style="width:76px;height:76px;border-radius:38px;background:{C["orange"]};display:flex;align-items:center;justify-content:center;color:#FFF;font-size:13px;font-weight:700">Done</div></div>'''

# 8 · Today's 10: finish
confetti = "".join(f'<circle cx="{random.randint(10,316)}" cy="{random.randint(6,80)}" r="{random.choice([2,3,4])}" fill="{random.choice([C["green"],C["orange"],C["purple"],C["gold"]])}"></circle>' for _ in range(30))
finish = f'''{top("", "Today’s 10")}
<svg width="326" height="84" viewBox="0 0 326 84" aria-hidden="true">{confetti}</svg>
<div style="margin-top:-60px;display:flex;flex-direction:column;align-items:center;gap:8px">{ring(1.0,96,"10","minutes")}{H("Done for today.",30)}</div>
<div style="{CARD};gap:10px">
<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:14px">Land it</b><span style="display:flex;align-items:center;gap:6px;font-size:13px;color:{C["gold"]};font-weight:700">{medal("gold")} New best: gold</span></div>
<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:14px">In your 30 s answer</b>{P("4 of 5 endings landed",C["green"],13)}</div>
<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:14px">Path</b>{P("Sound certain: unit 3 done",size=13)}</div></div>
<div style="{CARD};gap:8px"><b style="font-size:14px">This week</b>{week(5)}{P("5 days. Two more and it’s your best week yet.",size=12)}</div>
{btn("Back to today")}
<div style="text-align:center">{P("One more quick drill?",C["green"],13)}</div>'''

boards = [("Home","Home: three doors",home,844),("QuickPlay","Quick play",quick,980),("Drill","A drill, live",drill,844),("Paths","Paths",paths,980),("PathDetail","One path's steps",detail,900),("Plan","Today's 10: the plan",plan,844),("Mid","Today's 10: step 3",mid,844),("Finish","Today's 10: done",finish,900)]
for name,title,inner,h in boards: write(name, title, h, inner)
json.dump({"v":3,"createdOnFiles":{"v":1,"at":"2026-10-24T23:00:00Z"},"title":"Drills, paths and Today's 10","launch":{"view":"canvas"},"pages":[],
 "boards":{f"{n}.dc.html":{"x":(i%4)*470,"y":(i//4)*1100,"w":390,"h":h,"title":t} for i,(n,t,_,h) in enumerate(boards)},
 "order":[f"{n}.dc.html" for n,_,_,_ in boards],"notes":{"t":{"x":0,"y":-240,"text":"Three doors: Today's 10 (guided), Quick play (free), Paths (your journey)","kind":"title1","maxW":1800}},"designSystems":[]}, open('canvas.json','w'))
