import React, { useState, useEffect, useRef } from "react";

// Backend URL — set in Netlify env as VITE_API_URL (your Render backend).
const API = import.meta.env.VITE_API_URL || "";

// ─────────────────────────────────────────────────────────────
// DATA: groups, teams, confederations, FIFA ranks (April 2026 — to be
// re-frozen on June 9). Confederation drives Chum v Cum; rank drives the
// 10-spot upset-bonus indicator shown next to each game.
// ─────────────────────────────────────────────────────────────
const TEAMS = {
  Mexico:{flag:"🇲🇽",conf:"CONCACAF",rank:15}, "South Korea":{flag:"🇰🇷",conf:"AFC",rank:23},
  "South Africa":{flag:"🇿🇦",conf:"CAF",rank:61}, Czechia:{flag:"🇨🇿",conf:"UEFA",rank:44},
  Canada:{flag:"🇨🇦",conf:"CONCACAF",rank:30}, Switzerland:{flag:"🇨🇭",conf:"UEFA",rank:19},
  Qatar:{flag:"🇶🇦",conf:"AFC",rank:36}, "Bosnia-Herzegovina":{flag:"🇧🇦",conf:"UEFA",rank:74},
  Brazil:{flag:"🇧🇷",conf:"CONMEBOL",rank:6}, Morocco:{flag:"🇲🇦",conf:"CAF",rank:8},
  Scotland:{flag:"🏴",conf:"UEFA",rank:39}, Haiti:{flag:"🇭🇹",conf:"CONCACAF",rank:83},
  "United States":{flag:"🇺🇸",conf:"CONCACAF",rank:16}, Paraguay:{flag:"🇵🇾",conf:"CONMEBOL",rank:38},
  Australia:{flag:"🇦🇺",conf:"AFC",rank:26}, "Türkiye":{flag:"🇹🇷",conf:"UEFA",rank:27},
  Germany:{flag:"🇩🇪",conf:"UEFA",rank:10}, Ecuador:{flag:"🇪🇨",conf:"CONMEBOL",rank:24},
  "Ivory Coast":{flag:"🇨🇮",conf:"CAF",rank:40}, "Curaçao":{flag:"🇨🇼",conf:"CONCACAF",rank:82},
  Netherlands:{flag:"🇳🇱",conf:"UEFA",rank:7}, Japan:{flag:"🇯🇵",conf:"AFC",rank:18},
  Tunisia:{flag:"🇹🇳",conf:"CAF",rank:41}, Sweden:{flag:"🇸🇪",conf:"UEFA",rank:29},
  Belgium:{flag:"🇧🇪",conf:"UEFA",rank:9}, Iran:{flag:"🇮🇷",conf:"AFC",rank:21},
  Egypt:{flag:"🇪🇬",conf:"CAF",rank:33}, "New Zealand":{flag:"🇳🇿",conf:"OFC",rank:86},
  Spain:{flag:"🇪🇸",conf:"UEFA",rank:2}, Uruguay:{flag:"🇺🇾",conf:"CONMEBOL",rank:17},
  "Saudi Arabia":{flag:"🇸🇦",conf:"AFC",rank:58}, "Cape Verde":{flag:"🇨🇻",conf:"CAF",rank:70},
  France:{flag:"🇫🇷",conf:"UEFA",rank:1}, Senegal:{flag:"🇸🇳",conf:"CAF",rank:14},
  Norway:{flag:"🇳🇴",conf:"UEFA",rank:30}, Iraq:{flag:"🇮🇶",conf:"AFC",rank:57},
  Argentina:{flag:"🇦🇷",conf:"CONMEBOL",rank:3}, Austria:{flag:"🇦🇹",conf:"UEFA",rank:25},
  Algeria:{flag:"🇩🇿",conf:"CAF",rank:42}, Jordan:{flag:"🇯🇴",conf:"AFC",rank:62},
  Portugal:{flag:"🇵🇹",conf:"UEFA",rank:5}, Colombia:{flag:"🇨🇴",conf:"CONMEBOL",rank:13},
  Uzbekistan:{flag:"🇺🇿",conf:"AFC",rank:53}, "DR Congo":{flag:"🇨🇩",conf:"CAF",rank:56},
  England:{flag:"🏴",conf:"UEFA",rank:4}, Croatia:{flag:"🇭🇷",conf:"UEFA",rank:11},
  Panama:{flag:"🇵🇦",conf:"CONCACAF",rank:31}, Ghana:{flag:"🇬🇭",conf:"CAF",rank:72},
};

const GROUPS = {
  A:["Mexico","South Korea","South Africa","Czechia"],
  B:["Canada","Switzerland","Qatar","Bosnia-Herzegovina"],
  C:["Brazil","Morocco","Scotland","Haiti"],
  D:["United States","Paraguay","Australia","Türkiye"],
  E:["Germany","Ecuador","Ivory Coast","Curaçao"],
  F:["Netherlands","Japan","Tunisia","Sweden"],
  G:["Belgium","Iran","Egypt","New Zealand"],
  H:["Spain","Uruguay","Saudi Arabia","Cape Verde"],
  I:["France","Senegal","Norway","Iraq"],
  J:["Argentina","Austria","Algeria","Jordan"],
  K:["Portugal","Colombia","Uzbekistan","DR Congo"],
  L:["England","Croatia","Panama","Ghana"],
};

// canonical FIFA group-game pairings (by team index 0-3): 6 games
const PAIRINGS = [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]];
const GLETTERS = Object.keys(GROUPS);

function games(letter){
  const t = GROUPS[letter];
  return PAIRINGS.map(([i,j],idx)=>({
    id:`${letter}${idx+1}`, group:letter, home:t[i], away:t[j],
    upset: Math.abs(TEAMS[t[i]].rank - TEAMS[t[j]].rank) >= 10,
  }));
}
const ALL_GAMES = GLETTERS.flatMap(games);

// ─────────────────────────────────────────────────────────────
const C = {
  ink:"#0E1B2A", paper:"#F4EFE6", grass:"#0B6E4F", grassDk:"#084d37",
  gold:"#E8B53A", red:"#C8472E", line:"#d8cfbf", mute:"#6b7d72",
};
const F_DISP = "'Bebas Neue', 'Arial Narrow', sans-serif";
const F_BODY = "'DM Sans', system-ui, sans-serif";

// ranked label e.g. "#2 🇪🇸 Spain"
const tlabel = (t)=> `#${TEAMS[t].rank} ${TEAMS[t].flag} ${t}`;

// Golden Boot shortlist — top contenders for friends who don't follow soccer.
const BOOT_FAVES = [
  {name:"Kylian Mbappé", team:"France 🇫🇷"},
  {name:"Erling Haaland", team:"Norway 🇳🇴"},
  {name:"Harry Kane", team:"England 🏴"},
  {name:"Vinícius Júnior", team:"Brazil 🇧🇷"},
  {name:"Lionel Messi", team:"Argentina 🇦🇷"},
  {name:"Lautaro Martínez", team:"Argentina 🇦🇷"},
  {name:"Cristiano Ronaldo", team:"Portugal 🇵🇹"},
  {name:"Julián Álvarez", team:"Argentina 🇦🇷"},
];

const SIDEBETS = [
  {key:"goldenboot", title:"Golden Boot", emoji:"👟", pts:"12 pts",
   blurb:"Pick the tournament's top scorer. Hardest call, stays live till the final — biggest extras payout.",
   type:"boot", placeholder:"Type a player, or tap a favorite below"},
  {key:"darkhorse", title:"Dark Horse", emoji:"🐴", pts:"5 / 8 / 12 / 15 / 25",
   blurb:"Pick a non-favorite (ranked outside the top 20). Scores by how far they go: R32 = 5, R16 = 8, QF = 12, SF = 15, Final = 25.",
   type:"team", filter:(t)=>TEAMS[t].rank>20},
  {key:"flop", title:"Group Stage Flop", emoji:"💀", pts:"6 pts",
   blurb:"Name a big team (ranked top 15) you think busts and fails to escape its group. Correct = 6 pts.",
   type:"team", filter:(t)=>TEAMS[t].rank<=15},
  {key:"penaldo", title:"Penaldo v Pessi", emoji:"🐐", pts:"5 pts",
   blurb:"Who scores more — Ronaldo (Penaldo) or Messi (Pessi)? Tie broken by whose nation (Portugal / Argentina) goes further. Double-tie = both score.",
   type:"choice", options:["Penaldo","Pessi"]},
  {key:"nostril", title:"The Golden Nostril", emoji:"👃", pts:"5 pts",
   blurb:"Does Portugal reach the semifinals? Straight yes / no.",
   type:"choice", options:["Yes — semis","No — they don't"]},
  {key:"chumcum", title:"Chum v Cum", emoji:"🌍", pts:"5 pts",
   blurb:"Which continent's best team goes further — Africa or Asia? Furthest-advancing team wins it.",
   type:"choice", options:["Chum (Africa)","Cum (Asia)"]},
];

// ─────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen] = useState(0); // 0 signup,1 instructions,2..13 groups,14 sidebets,15 done
  const [user,setUser] = useState({username:"",phone:""});
  const [picks,setPicks] = useState({});       // gameId -> "home"|"draw"|"away"
  const [order,setOrder] = useState({});        // group letter -> [team,...] predicted 1-4
  const [bets,setBets] = useState({});          // key -> value
  const [saved,setSaved] = useState(false);
  const topRef = useRef(null);

  // ---- save & resume (draft kept in this browser) ----
  useEffect(()=>{ try{
    const raw = localStorage.getItem("wc_draft");
    if(raw){ const d=JSON.parse(raw); setUser(d.user||{username:"",phone:""});
      setPicks(d.picks||{}); setOrder(d.order||{}); setBets(d.bets||{}); }
  }catch(e){} },[]);
  useEffect(()=>{ try{
    localStorage.setItem("wc_draft",JSON.stringify({user,picks,order,bets}));
  }catch(e){} },[user,picks,order,bets]);
  useEffect(()=>{ topRef.current?.scrollTo(0,0); },[screen]);

  const groupIdx = screen-2;                    // 0..11 while on a group screen
  const onGroup = screen>=2 && screen<=13;
  const letter = onGroup ? GLETTERS[groupIdx] : null;

  const totalPicked = Object.keys(picks).length;
  const groupComplete = (L)=> games(L).every(g=>picks[g.id]) &&
    (order[L]||[]).length===4;

  // ── submit (saves to your Render backend) ──
  const [submitting,setSubmitting] = useState(false);
  async function submit(){
    if(submitting) return;
    setSubmitting(true);
    const record = {
      username:user.username.trim(), phone:user.phone.trim(),
      submittedAt:Date.now(), picks, order, bets,
    };
    try{
      const res = await fetch(`${API}/picks`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(record),
      });
      if(!res.ok) throw new Error("bad response");
      localStorage.removeItem("wc_draft");
      localStorage.setItem("wc_me", record.username.toLowerCase());
      setSaved(true); setScreen(15);
    }catch(e){
      alert("Couldn't save your picks — check your connection and try again.");
    }finally{ setSubmitting(false); }
  }

  return (
    <div ref={topRef} style={{
      fontFamily:F_BODY, color:C.ink, background:C.paper, minHeight:"100vh",
      maxWidth:430, margin:"0 auto", position:"relative", overflowX:"hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        @keyframes pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
        .scr{animation:pop .25s ease}
        .opt{transition:all .12s ease}
        .opt:active{transform:scale(.97)}
      `}</style>

      {/* progress bar */}
      {screen>0 && screen<15 && (
        <div style={{position:"sticky",top:0,zIndex:9,background:C.paper,padding:"10px 16px 6px"}}>
          <div style={{height:6,background:C.line,borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(screen/14)*100}%`,background:C.grass,transition:"width .3s"}}/>
          </div>
          <div style={{fontSize:11,color:C.mute,marginTop:5,letterSpacing:.3}}>
            {onGroup ? `GROUP ${letter} · ${groupIdx+1} of 12` :
             screen===1 ? "HOW IT WORKS" : screen===14 ? "SIDE BETS" : ""}
            {onGroup && ` · ${totalPicked}/72 games picked`}
          </div>
        </div>
      )}

      <div style={{padding:"8px 16px 120px"}}>
        {screen===0 && <Signup user={user} setUser={setUser} next={()=>setScreen(1)} />}
        {screen===1 && <Instructions next={()=>setScreen(2)} />}
        {onGroup && <GroupScreen letter={letter} picks={picks} setPicks={setPicks}
                      order={order} setOrder={setOrder} />}
        {screen===14 && <SideBets bets={bets} setBets={setBets} />}
        {screen===15 && <Done user={user} />}
      </div>

      {/* sticky footer nav */}
      {screen<15 && (
        <Footer
          screen={screen} onGroup={onGroup} letter={letter}
          canNext={
            screen===0 ? (user.username.trim().length>=2 && user.phone.trim().length>=7) :
            onGroup ? groupComplete(letter) :
            screen===14 ? SIDEBETS.every(b=>bets[b.key]&&String(bets[b.key]).trim()) : true
          }
          back={()=>setScreen(s=>Math.max(0,s-1))}
          next={()=>{ if(screen===14) submit(); else setScreen(s=>s+1); }}
          submitting={submitting}
        />
      )}
    </div>
  );
}

// ── Screen 0: signup ──
function Signup({user,setUser,next}){
  return (
    <div className="scr" style={{paddingTop:24}}>
      <div style={{textAlign:"center",marginBottom:8}}>
        <div style={{fontSize:64,lineHeight:1}}>🏆</div>
        <h1 style={{fontFamily:F_DISP,fontSize:46,lineHeight:.92,margin:"10px 0 0",letterSpacing:1}}>
          TLFKATL<br/>WORLD CUP 2026
        </h1>
        <div style={{color:C.grass,fontWeight:700,letterSpacing:3,fontSize:13,marginTop:6}}>
          MAKE YOUR PICKS
        </div>
      </div>
      <div style={{background:"#fff",border:`1px solid ${C.line}`,borderRadius:16,padding:20,marginTop:26}}>
        <Field label="USERNAME" hint="shown on the leaderboard — pick something you'll remember">
          <input value={user.username} maxLength={18}
            onChange={e=>setUser({...user,username:e.target.value})}
            placeholder="e.g. himbo_jay" style={inp}/>
        </Field>
        <Field label="PHONE NUMBER" hint="for score-update texts during the tournament">
          <input value={user.phone} inputMode="tel"
            onChange={e=>setUser({...user,phone:e.target.value})}
            placeholder="(555) 123-4567" style={inp}/>
        </Field>
      </div>
      <p style={{fontSize:12,color:C.mute,textAlign:"center",marginTop:18,lineHeight:1.5}}>
        You'll make all your picks now, in one sitting.<br/>Picks lock at the first kickoff — no edits after.
      </p>
    </div>
  );
}

// ── Screen 1: instructions ──
function Instructions({next}){
  const Row=({n,t,d})=>(
    <div style={{display:"flex",gap:12,marginBottom:16}}>
      <div style={{fontFamily:F_DISP,fontSize:30,color:C.grass,lineHeight:1,minWidth:34}}>{n}</div>
      <div><div style={{fontWeight:700,marginBottom:2}}>{t}</div>
        <div style={{fontSize:13.5,color:C.mute,lineHeight:1.5}}>{d}</div></div>
    </div>
  );
  return (
    <div className="scr" style={{paddingTop:14}}>
      <h2 style={{fontFamily:F_DISP,fontSize:38,margin:"4px 0 4px",letterSpacing:.5}}>HOW SCORING WORKS</h2>
      <div style={{fontSize:13,color:C.mute,marginBottom:20}}>Three buckets. Read once — it's on the home screen all tournament.</div>

      <Bucket color={C.grass} tag="BUCKET 1" name="THE GROUP STAGE">
        <Row n="3" t="Per correct game" d="Pick the result of all 72 group games — win, draw, or loss. 3 pts each time you're right."/>
        <Row n="+2" t="Upset bonus" d="Correctly back a team ranked 10+ FIFA spots below their opponent and you bag a bonus +2. We flag these games with a ⚡."/>
        <Row n="+10" t="Perfect group order" d="Nail a group's exact 1–2–3–4 finishing order and grab +10. All-or-nothing per group."/>
      </Bucket>

      <Bucket color={C.ink} tag="BUCKET 2" name="THE KNOCKOUT BRACKET">
        <div style={{fontSize:13.5,color:C.mute,lineHeight:1.6,marginBottom:10}}>
          After groups, you fill a March-Madness-style bracket. Points climb each round (scored independently — an early miss never kills a later correct pick):
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[["R32","6"],["R16","10"],["QF","18"],["SF","30"],["FINAL","52"]].map(([r,p])=>(
            <div key={r} style={{flex:"1 0 28%",background:"#fff",border:`1px solid ${C.line}`,borderRadius:10,padding:"8px 4px",textAlign:"center"}}>
              <div style={{fontSize:11,color:C.mute,letterSpacing:.5}}>{r}</div>
              <div style={{fontFamily:F_DISP,fontSize:26,color:C.ink}}>{p}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:12,color:C.mute,marginTop:8}}>This is where comebacks happen — a strong bracket can erase a rough group stage.</div>
      </Bucket>

      <Bucket color={C.gold} tag="BUCKET 3" name="THE SIDE BETS">
        <div style={{fontSize:13.5,color:C.mute,lineHeight:1.6}}>
          Six fun extras (Golden Boot, Dark Horse, Penaldo v Pessi & more). Enough to give you an edge in a tight race — never enough to win it alone. Full reminders shown when you pick them.
        </div>
      </Bucket>
    </div>
  );
}

// ── Screens 2–13: one group at a time ──
function GroupScreen({letter,picks,setPicks,order,setOrder}){
  const gs = games(letter);
  const teams = GROUPS[letter];
  const ord = order[letter]||[];

  function setResult(id,val){ setPicks({...picks,[id]:val}); }
  function toggleOrder(team){
    let next=[...ord];
    if(next.includes(team)) next=next.filter(t=>t!==team);
    else if(next.length<4) next.push(team);
    setOrder({...order,[letter]:next});
  }

  return (
    <div className="scr" style={{paddingTop:6}}>
      <h2 style={{fontFamily:F_DISP,fontSize:40,margin:"2px 0 2px",letterSpacing:1}}>GROUP {letter}</h2>
      <div style={{fontSize:13,color:C.mute,marginBottom:16}}>
        {teams.map((t,i)=><span key={t}>{TEAMS[t].flag} {t}{i<3?"  ·  ":""}</span>)}
      </div>

      <SecTag>PICK ALL 6 RESULTS</SecTag>
      {gs.map(g=>(
        <div key={g.id} style={{background:"#fff",border:`1px solid ${C.line}`,borderRadius:14,padding:"12px 12px 12px",marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:12.5,fontWeight:700}}>
              {TEAMS[g.home].flag} {g.home} <span style={{color:C.mute,fontWeight:400}}>v</span> {g.away} {TEAMS[g.away].flag}
            </span>
            {g.upset && <span title="upset bonus available" style={{fontSize:11,color:C.gold,fontWeight:700}}>⚡ UPSET</span>}
          </div>
          <div style={{display:"flex",gap:6}}>
            {[["home",g.home,TEAMS[g.home].rank],["draw","Draw",null],["away",g.away,TEAMS[g.away].rank]].map(([v,lbl,rk])=>{
              const on = picks[g.id]===v;
              return (
                <button key={v} className="opt" onClick={()=>setResult(g.id,v)} style={{
                  flex:1,padding:"10px 4px",borderRadius:10,fontSize:12,fontWeight:on?700:500,
                  border:`1.5px solid ${on?C.grass:C.line}`,background:on?C.grass:"#fff",
                  color:on?"#fff":C.ink,cursor:"pointer",lineHeight:1.15,
                }}>
                  {rk!==null && <span style={{fontSize:9,opacity:.6,marginRight:3}}>#{rk}</span>}
                  {lbl}{v!=="draw"?" win":""}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{height:18}}/>
      <SecTag>PREDICT THE FINISH · TAP IN ORDER 1→4 <span style={{color:C.gold}}>+10</span></SecTag>
      <div style={{fontSize:12,color:C.mute,margin:"-4px 0 10px"}}>
        Tap teams in the order you think they'll finish. Get all four exactly right for the bonus.
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {teams.map(t=>{
          const pos = ord.indexOf(t);
          const on = pos>=0;
          return (
            <button key={t} className="opt" onClick={()=>toggleOrder(t)} style={{
              display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,
              border:`1.5px solid ${on?C.ink:C.line}`,background:on?C.ink:"#fff",
              color:on?"#fff":C.ink,cursor:"pointer",textAlign:"left",
            }}>
              <span style={{fontFamily:F_DISP,fontSize:24,minWidth:26,color:on?C.gold:C.mute}}>
                {on?pos+1:"–"}
              </span>
              <span style={{fontSize:16}}>{TEAMS[t].flag}</span>
              <span style={{fontWeight:on?700:500,fontSize:14}}>{t}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Screen 14: side bets ──
function SideBets({bets,setBets}){
  return (
    <div className="scr" style={{paddingTop:10}}>
      <h2 style={{fontFamily:F_DISP,fontSize:38,margin:"2px 0 4px",letterSpacing:.5}}>SIDE BETS</h2>
      <div style={{fontSize:13,color:C.mute,marginBottom:18}}>
        Six extras. Reminders below so you don't have to scroll back. All six required.
      </div>
      {SIDEBETS.map(b=>{
        const teamOpts = b.type==="team"
          ? Object.keys(TEAMS).filter(b.filter).sort((x,y)=>TEAMS[x].rank-TEAMS[y].rank)
          : [];
        return (
        <div key={b.key} style={{background:"#fff",border:`1px solid ${C.line}`,borderRadius:16,padding:16,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontWeight:700,fontSize:16}}>{b.emoji} {b.title}</div>
            <div style={{fontSize:11,fontWeight:700,color:C.grass,background:"#e7f0ea",padding:"3px 8px",borderRadius:99}}>{b.pts}</div>
          </div>
          <div style={{fontSize:12.5,color:C.mute,lineHeight:1.5,margin:"7px 0 12px"}}>{b.blurb}</div>

          {b.type==="boot" && (
            <BootPicker value={bets[b.key]||""} set={v=>setBets({...bets,[b.key]:v})} ph={b.placeholder}/>
          )}
          {b.type==="team" && (
            <select value={bets[b.key]||""} onChange={e=>setBets({...bets,[b.key]:e.target.value})} style={{...inp,appearance:"auto"}}>
              <option value="">Select a team…</option>
              {teamOpts.map(t=><option key={t} value={t}>{tlabel(t)}</option>)}
            </select>
          )}
          {b.type==="choice" && (
            <div style={{display:"flex",gap:8}}>
              {b.options.map(o=>{
                const on=bets[b.key]===o;
                return <button key={o} className="opt" onClick={()=>setBets({...bets,[b.key]:o})} style={{
                  flex:1,padding:"11px 6px",borderRadius:10,fontSize:12.5,fontWeight:on?700:500,
                  border:`1.5px solid ${on?C.grass:C.line}`,background:on?C.grass:"#fff",
                  color:on?"#fff":C.ink,cursor:"pointer",
                }}>{o}</button>;
              })}
            </div>
          )}
        </div>
      );})}
    </div>
  );
}

// Golden Boot: free text + tap-to-fill favorites for non-soccer-fans
function BootPicker({value,set,ph}){
  const [open,setOpen]=useState(false);
  return (
    <div>
      <input value={value} placeholder={ph} onChange={e=>set(e.target.value)} style={inp}/>
      <button onClick={()=>setOpen(o=>!o)} style={{
        marginTop:8,background:"none",border:"none",color:C.grass,fontWeight:700,
        fontSize:12.5,cursor:"pointer",padding:0,textDecoration:"underline"}}>
        {open?"Hide favorites":"Not sure? Tap to see the favorites ▾"}
      </button>
      {open && (
        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
          {BOOT_FAVES.map(p=>{
            const on=value===p.name;
            return (
              <button key={p.name} className="opt" onClick={()=>{set(p.name);setOpen(false);}} style={{
                display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"10px 12px",borderRadius:10,textAlign:"left",cursor:"pointer",
                border:`1.5px solid ${on?C.grass:C.line}`,background:on?"#e7f0ea":"#fff"}}>
                <span style={{fontWeight:700,fontSize:13.5}}>{p.name}</span>
                <span style={{fontSize:12,color:C.mute}}>{p.team}</span>
              </button>
            );
          })}
          <div style={{fontSize:11,color:C.mute,marginTop:2}}>These are the bookmakers' favorites — but a long-shot pick is allowed too.</div>
        </div>
      )}
    </div>
  );
}

// ── Screen 15: done ──
function Done({user}){
  return (
    <div className="scr" style={{paddingTop:80,textAlign:"center"}}>
      <div style={{fontSize:72}}>✅</div>
      <h2 style={{fontFamily:F_DISP,fontSize:46,margin:"14px 0 6px",letterSpacing:1}}>YOU'RE IN</h2>
      <p style={{color:C.mute,fontSize:15,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>
        Picks locked for <b style={{color:C.ink}}>{user.username}</b>. See you on the leaderboard once the ball gets rolling.
      </p>
      <div style={{marginTop:28,fontSize:13,color:C.mute}}>You can close this page now.</div>
    </div>
  );
}

// ── shared bits ──
const inp={width:"100%",padding:"13px 14px",borderRadius:11,border:`1.5px solid ${C.line}`,
  fontSize:15,fontFamily:F_BODY,background:"#fff",color:C.ink,outline:"none"};
function Field({label,hint,children}){
  return <div style={{marginBottom:16}}>
    <div style={{fontSize:11,fontWeight:700,letterSpacing:1,color:C.mute,marginBottom:6}}>{label}</div>
    {children}
    {hint&&<div style={{fontSize:11.5,color:C.mute,marginTop:6,lineHeight:1.4}}>{hint}</div>}
  </div>;
}
function SecTag({children}){
  return <div style={{fontSize:11,fontWeight:700,letterSpacing:1.2,color:C.grass,marginBottom:10}}>{children}</div>;
}
function Bucket({color,tag,name,children}){
  return <div style={{borderLeft:`3px solid ${color}`,paddingLeft:14,marginBottom:24}}>
    <div style={{fontSize:10.5,fontWeight:700,letterSpacing:1.5,color}}>{tag}</div>
    <div style={{fontFamily:F_DISP,fontSize:26,letterSpacing:.5,marginBottom:10}}>{name}</div>
    {children}
  </div>;
}
function Footer({screen,onGroup,canNext,back,next,submitting}){
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,maxWidth:430,margin:"0 auto",
      background:"rgba(244,239,230,.94)",backdropFilter:"blur(8px)",borderTop:`1px solid ${C.line}`,
      padding:"12px 16px",display:"flex",gap:10}}>
      {screen>0 && (
        <button onClick={back} style={{padding:"14px 18px",borderRadius:12,border:`1.5px solid ${C.line}`,
          background:"#fff",fontWeight:700,fontSize:14,color:C.ink,cursor:"pointer"}}>Back</button>
      )}
      <button onClick={next} disabled={!canNext||submitting} style={{
        flex:1,padding:"14px",borderRadius:12,border:"none",fontWeight:700,fontSize:15,
        background:(canNext&&!submitting)?C.grass:C.line,color:(canNext&&!submitting)?"#fff":C.mute,
        cursor:(canNext&&!submitting)?"pointer":"not-allowed",fontFamily:F_BODY}}>
        {submitting?"Saving…": screen===0?"Start picking →": screen===1?"Make my picks →":
         screen===14?"Lock in my picks ✓": "Next →"}
      </button>
    </div>
  );
}
