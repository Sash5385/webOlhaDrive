import { useState, useEffect, useContext } from "react";
import { ref, onValue, update, push, remove } from "firebase/database";
import { db } from "../firebase";

import { ThemeContext } from "../theme.js";

const PALETTE = [
  { id:"green",   color:"#7ed957" },
  { id:"yellow",  color:"#f7c948" },
  { id:"blue",    color:"#5b9bff" },
  { id:"purple",  color:"#c084fc" },
  { id:"red",     color:"#ff5a3c" },
  { id:"teal",    color:"#2dd4bf" },
  { id:"pink",    color:"#f472b6" },
  { id:"orange",  color:"#fb923c" },
  { id:"indigo",  color:"#818cf8" },
  { id:"lime",    color:"#a3e635" },
];
const colorOf = id => PALETTE.find(p=>p.id===id)?.color || "#7ed957";


// ─── DATA ──────────────────────────────────────────────────────
const SERVICES = {
  sv1:{ name:"Автошкола 1г", color:"#7ed957", type:"school"  },
  sv2:{ name:"Автошкола 2г", color:"#7ed957", type:"school"  },
  sv3:{ name:"Приватний 1г", color:"#f7c948", type:"private" },
  sv4:{ name:"Приватний 2г", color:"#f7c948", type:"private" },
};

// ─── ADD TO QUEUE MODAL ─────────────────────────────────────────
function AddToQueueModal({ onSave, onClose, svcs }) {
  const { BG, BG_DEEP, SURFACE, SURF_HI, BORDER, TEXT, DIM, FAINT, SO } = useContext(ThemeContext);
  const [form, setForm] = useState({ name:"", phone:"", svcId:"sv1" });
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const valid = form.name.trim() && form.phone.trim();
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:150,display:"flex",alignItems:"flex-end",backdropFilter:"blur(8px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:"100%",maxWidth:520,margin:"0 auto",
        background:`linear-gradient(180deg,${SURFACE},${BG})`,
        borderRadius:"24px 24px 0 0",padding:"20px 18px 36px",
      }}>
        <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.12)",margin:"0 auto 16px"}}/>
        <div style={{fontSize:16,fontWeight:800,color:TEXT,marginBottom:16}}>⏳ Додати до черги</div>
        {[
          {k:"name",  label:"Ім'я учня",   placeholder:"Ім'я Прізвище", type:"text"},
          {k:"phone", label:"Телефон",      placeholder:"+380...",       type:"tel"},
        ].map(f=>(
          <div key={f.k} style={{marginBottom:12}}>
            <div style={{fontSize:10,color:FAINT,letterSpacing:1,marginBottom:5}}>{f.label.toUpperCase()}</div>
            <input type={f.type} value={form[f.k]} onChange={e=>upd(f.k,e.target.value)}
              placeholder={f.placeholder}
              style={{width:"100%",background:BG_DEEP,border:`1px solid ${BORDER}`,borderRadius:10,padding:"10px 14px",color:TEXT,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          </div>
        ))}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:FAINT,letterSpacing:1,marginBottom:5}}>ПОСЛУГА</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {Object.entries(svcs || SERVICES).map(([id,s])=>(
              <button key={id} onClick={()=>upd("svcId",id)} style={{
                padding:"6px 12px",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
                background:form.svcId===id?`linear-gradient(145deg,${s.color}44,${s.color}22)`:`linear-gradient(145deg,${SURF_HI},${SURFACE})`,
                color:form.svcId===id?s.color:DIM,boxShadow:SO,
              }}>{s.name}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"13px",borderRadius:14,border:"none",cursor:"pointer",background:`linear-gradient(145deg,${SURF_HI},${SURFACE})`,color:DIM,fontSize:13,fontWeight:700,boxShadow:SO}}>Скасувати</button>
          <button onClick={()=>valid&&onSave(form)} style={{
            flex:2,padding:"13px",borderRadius:14,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,
            background:valid?"linear-gradient(165deg,#c084fc,#7c3aed)":`linear-gradient(145deg,${SURF_HI},${SURFACE})`,
            color:valid?"#fff":FAINT,
            boxShadow:valid?"0 4px 14px rgba(192,132,252,0.4)":SO,
          }}>Додати до черги</button>
        </div>
      </div>
    </div>
  );
}

// ─── QUEUE OFFER MODAL ──────────────────────────────────────────
function QueueOfferModal({ cancelledBk, waiting, queueMode, onInvite, onClose, svcsMap }) {
  const { BG, SURFACE, SURF_HI, TEXT, DIM, FAINT, PURPLE, GOLD, SO } = useContext(ThemeContext);
  const [selected, setSelected] = useState(
    queueMode === "fifo" ? [waiting[0]?.id] : queueMode === "broadcast" ? waiting.map(q=>q.id) : []
  );
  const toggle = id => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:150,display:"flex",alignItems:"flex-end",backdropFilter:"blur(8px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:"100%",maxWidth:520,margin:"0 auto",
        background:`linear-gradient(180deg,${SURFACE},${BG})`,
        borderRadius:"24px 24px 0 0",padding:"20px 18px 36px",
      }}>
        <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.12)",margin:"0 auto 14px"}}/>
        <div style={{fontSize:16,fontWeight:800,color:TEXT,marginBottom:4}}>⏳ Слот вільний!</div>
        <div style={{fontSize:12,color:DIM,marginBottom:16}}>
          Запис скасовано. Є <b style={{color:PURPLE}}>{waiting.length}</b> {waiting.length===1?"учень":"учнів"} в черзі.
          Режим: <b style={{color:GOLD}}>{queueMode==="fifo"?"FIFO":queueMode==="broadcast"?"Broadcast":"Ручний"}</b>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
          {waiting.map(q=>(
            <div key={q.id} onClick={()=>queueMode==="manual"&&toggle(q.id)} style={{
              display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:11,
              background:selected.includes(q.id)?`linear-gradient(145deg,rgba(192,132,252,0.2),rgba(124,58,237,0.1))`:`linear-gradient(145deg,${SURF_HI},${SURFACE})`,
              border:selected.includes(q.id)?`1px solid ${PURPLE}44`:`1px solid transparent`,
              cursor:queueMode==="manual"?"pointer":"default",boxShadow:SO,
            }}>
              <div style={{width:4,height:32,borderRadius:3,background:PURPLE,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:800,color:TEXT}}>{q.name}</div>
                <div style={{fontSize:10,color:DIM}}>{q.phone} · {(svcsMap||SERVICES)[q.svcId]?.name||q.svcId}</div>
              </div>
              {selected.includes(q.id) && <span style={{fontSize:16}}>✓</span>}
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"13px",borderRadius:14,border:"none",cursor:"pointer",background:`linear-gradient(145deg,${SURF_HI},${SURFACE})`,color:DIM,fontSize:13,fontWeight:700,boxShadow:SO}}>Пізніше</button>
          <button onClick={()=>selected.length>0&&onInvite(waiting.filter(q=>selected.includes(q.id)))} disabled={selected.length===0} style={{
            flex:2,padding:"13px",borderRadius:14,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,
            background:selected.length>0?"linear-gradient(165deg,#c084fc,#7c3aed)":`linear-gradient(145deg,${SURF_HI},${SURFACE})`,
            color:selected.length>0?"#fff":FAINT,
            boxShadow:selected.length>0?"0 4px 14px rgba(192,132,252,0.4)":SO,
          }}>👑 Запросити ({selected.length})</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN VIEW ─────────────────────────────────────────────────
export default function BookingsView({ settings }) {
  const { SURFACE, SURF_HI, BORDER, TEXT, DIM, FAINT, PURPLE, GOLD, GREEN, SO } = useContext(ThemeContext);
  const css = `
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-thumb{background:${BORDER};border-radius:3px}
textarea{color-scheme:dark}
.icon3d{display:inline-flex;align-items:center;justify-content:center;border-radius:14px;position:relative;overflow:hidden;flex-shrink:0;box-shadow:-2px 4px 10px rgba(0,0,0,0.5),inset 1px 1px 0 rgba(255,255,255,0.25),inset -1px -1px 0 rgba(0,0,0,0.3)}
.icon3d::before{content:'';position:absolute;top:0;right:0;width:60%;height:50%;background:radial-gradient(ellipse at top right,rgba(255,255,255,0.4) 0%,transparent 70%);pointer-events:none}
.icon3d>svg{position:relative;z-index:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.4))}
@keyframes expand-in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.expand-body{animation:expand-in .18s ease both}
@keyframes bk-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.bk-in{animation:bk-in .2s ease both}
`;

  const [svcsMap,    setSvcsMap]    = useState(SERVICES);

  useEffect(() => {
    return onValue(ref(db, "admin_data/services"), snap => {
      const arr = snap.val();
      if (!Array.isArray(arr)) return;
      const map = {};
      arr.forEach(s => { if (s?.id) map[s.id] = { ...s, color: colorOf(s.colorId) }; });
      if (Object.keys(map).length) setSvcsMap(map);
    });
  }, []);

  // ── ЧЕРГА ──────────────────────────────────────────────────────
  const [queue,        setQueue]        = useState([]);
  const [queueOpen,    setQueueOpen]    = useState(null); // null = not yet loaded
  const [addQueueOpen, setAddQueueOpen] = useState(false);
  const [queueOffer,   setQueueOffer]   = useState(null);

  useEffect(() => {
    return onValue(ref(db, "queue"), snap => {
      const d = snap.val();
      if (!d) { setQueue([]); setQueueOpen(prev => prev === null ? false : prev); return; }
      const arr = [];
      Object.entries(d).forEach(([id, v]) => {
        if (v?.entries) {
          // Client format: queue/{date_time}/entries/{uid}
          Object.entries(v.entries).forEach(([uid, entry]) => {
            arr.push({
              id: `${id}__${uid}`,
              _slotKey: id, _uid: uid, _nested: true,
              name: entry.name || '—',
              phone: entry.phone || '',
              status: entry.status || 'waiting',
              addedAt: entry.addedAt || 0,
              studentType: entry.studentType,
              durationHours: entry.durationHours,
              slotKey: id,
            });
          });
        } else {
          arr.push({ id, ...v });
        }
      });
      arr.sort((a,b) => (a.order ?? a.addedAt ?? 0) - (b.order ?? b.addedAt ?? 0));
      setQueue(arr);
      setQueueOpen(prev => prev === null ? arr.some(q => q.status === "waiting") : prev);
    }, () => {});
  }, []);

  const addToQueue = (form) => {
    push(ref(db, "queue"), { ...form, addedAt: Date.now(), status: "waiting" });
  };
  const removeFromQueue = (item) => {
    if (typeof item === "string") { remove(ref(db, `queue/${item}`)); return; }
    if (item._nested) remove(ref(db, `queue/${item._slotKey}/entries/${item._uid}`));
    else remove(ref(db, `queue/${item.id}`));
  };
  const markOffered = (item) => {
    if (typeof item === "string") { update(ref(db, `queue/${item}`), { status: "offered", offeredAt: Date.now() }); return; }
    if (item._nested) update(ref(db, `queue/${item._slotKey}/entries/${item._uid}`), { status: "offered", offeredAt: Date.now() });
    else update(ref(db, `queue/${item.id}`), { status: "offered", offeredAt: Date.now() });
  };

  const queueMode = settings?.queueAutoFifo ? "fifo"
    : settings?.queueBroadcast ? "broadcast" : "manual";

  return (
    <>
      <style>{css}</style>
      <div style={{display:"flex",flexDirection:"column",gap:10,fontFamily:"ui-sans-serif,-apple-system,system-ui,sans-serif",color:TEXT}}>

        {/* ── ЧЕРГА ── */}
        <div style={{background:`linear-gradient(155deg,${SURF_HI},${SURFACE})`,borderRadius:13,overflow:"hidden",boxShadow:SO,border:`1px solid rgba(192,132,252,${queue.some(q=>q.status==="waiting")?0.35:0.1})`}}>
          <div onClick={()=>setQueueOpen(v=>!v)} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",cursor:"pointer"}}>
            <div style={{width:4,alignSelf:"stretch",borderRadius:3,background:PURPLE,flexShrink:0}}/>
            <span style={{fontSize:16}}>⏳</span>
            <span style={{flex:1,fontSize:13,fontWeight:800,color:TEXT}}>Черга очікування</span>
            {queue.filter(q=>q.status==="waiting").length > 0 && (
              <span style={{background:"linear-gradient(145deg,#c084fc,#7c3aed)",color:"#fff",borderRadius:8,padding:"1px 8px",fontSize:11,fontWeight:700,boxShadow:"0 0 8px rgba(192,132,252,0.5)"}}>
                {queue.filter(q=>q.status==="waiting").length} очікує
              </span>
            )}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={FAINT} strokeWidth="2.2" strokeLinecap="round"
              style={{transform:queueOpen?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0}}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          {queueOpen && (
            <div style={{borderTop:`1px solid ${BORDER}`,padding:"8px 12px 4px"}}>
              {queue.length === 0 ? (
                <div style={{textAlign:"center",padding:"14px 0",color:FAINT,fontSize:12}}>Черга порожня</div>
              ) : queue.filter(q=>q.status!=="archived").map(q => {
                const svc = svcsMap[q.svcId] || {};
                const stColor = q.status==="offered" ? GOLD : q.status==="booked" ? GREEN : PURPLE;
                const stLabel = q.status==="offered" ? "Запрошено" : q.status==="booked" ? "Записаний" : "Очікує";
                return (
                  <div key={q.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 4px",borderBottom:`1px solid ${BORDER}`}}>
                    <div style={{width:4,height:32,borderRadius:3,background:stColor,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:800,color:TEXT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.name}</div>
                      <div style={{fontSize:10,color:DIM}}>
                        {q.phone}{svc.name?` · ${svc.name}`:""}
                        {q.slotKey && <span style={{color:FAINT}}>{q.phone||svc.name?" · ":""}{q.slotKey.replace("_"," ")}</span>}
                      </div>
                    </div>
                    {(()=>{const h=q.durationHours||(svc.name||"").match(/(\d+)г/)?.[1];return h?(<div style={{padding:"3px 7px",borderRadius:7,background:"rgba(247,201,72,0.15)",border:"1px solid rgba(247,201,72,0.3)",fontSize:11,fontWeight:900,color:GOLD,flexShrink:0,whiteSpace:"nowrap"}}>{h} год</div>):null;})()}
                    <span style={{fontSize:9,color:stColor,fontWeight:700,background:`${stColor}20`,padding:"2px 7px",borderRadius:6,flexShrink:0}}>{stLabel}</span>
                    {q.status==="waiting" && (
                      <button onClick={()=>markOffered(q)} style={{background:"linear-gradient(145deg,#c084fc,#7c3aed)",border:"none",borderRadius:7,padding:"4px 9px",cursor:"pointer",color:"#fff",fontSize:11,fontWeight:700,flexShrink:0}}>Запросити</button>
                    )}
                    <button onClick={()=>removeFromQueue(q)} style={{background:"none",border:"none",cursor:"pointer",color:FAINT,fontSize:15,padding:"0 2px",flexShrink:0}}>×</button>
                  </div>
                );
              })}
              <button onClick={()=>setAddQueueOpen(true)} style={{
                width:"100%",padding:"9px",margin:"8px 0 4px",borderRadius:10,border:`1px dashed rgba(192,132,252,0.4)`,cursor:"pointer",
                background:"rgba(192,132,252,0.07)",color:PURPLE,fontSize:12,fontWeight:700,
              }}>+ Додати до черги</button>
            </div>
          )}
        </div>

      </div>

      {/* ADD TO QUEUE MODAL */}
      {addQueueOpen && <AddToQueueModal onSave={form=>{addToQueue(form);setAddQueueOpen(false);}} onClose={()=>setAddQueueOpen(false)} svcs={svcsMap}/>}

      {/* QUEUE OFFER MODAL */}
      {queueOffer && (
        <QueueOfferModal
          cancelledBk={queueOffer.cancelledBk}
          waiting={queueOffer.waiting}
          queueMode={queueMode}
          svcsMap={svcsMap}
          onInvite={items=>{items.forEach(item=>markOffered(item));setQueueOffer(null);}}
          onClose={()=>setQueueOffer(null)}
        />
      )}
    </>
  );
}
