'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import s from './AdminPage.module.css';

// ── Types ────────────────────────────────────────────────────────────────────
interface WistiaStats {
  name: string;
  stats: {
    load_count: number;
    play_count: number;
    play_rate: number;
    hours_watched: number;
    average_percent_watched: number;
  };
  countries: Array<{ code: string; count: number }>;
  cities: Array<{ city: string; count: number }>;
  dropoff: Array<{ label: string; total: number; pct: number }>;
  highEngPct: number;
  lowEngPct: number;
  daily: Array<{ day: string; views: number }>;
  retention: Array<{ time: string; pct: number }> | null;
  totalEvents: number;
  recentEvents: Array<{
    id: string;
    watchPct: number;
    city: string;
    country: string;
    source: string;
    date: string;
  }>;
}
interface CalendlySlug {
  total: number;
  event_type_name: string;
  daily: Array<{ day: string; calls: number }>;
}
interface CalendlyStats {
  bySlug: {
    'discovery-call'?: CalendlySlug;
    'dialing-calendar'?: CalendlySlug;
  };
}
interface TFStats {
  total: number;
  sources: Array<{ label: string; count: number }>;
  campaigns: Array<{ label: string; count: number }>;
  mediums: Array<{ label: string; count: number }>;
  daily: Array<{ day: string; submissions: number }>;
  recent: Array<{ date: string; source: string; medium: string; campaign: string; content: string }>;
}
interface SalesRecord {
  leadName: string; phone: string; email: string; date: string;
  closer: string; status: string; notes: string; objection: string;
  cc: number; campaign: string; source: string;
}
interface SalesKPIs {
  totalCalls: number; closedCalls: number; noCloses: number;
  noShows: number; closeRate: string; totalCC: number;
}
interface CRMLead {
  id: string; name: string; email: string; phone: string;
  tags: string[]; dateCreated: string; statusLabel: string;
}
interface PipelineOpp {
  id: string; leadName: string; statusLabel: string; statusType: string;
  value: number; dateCreated: string;
}
interface Pipeline {
  id: string; name: string;
  stages: Array<{ label: string; type: string }>;
  opps: PipelineOpp[];
}
interface Student {
  recordId: string;
  id: string;
  name: string;
  revenue: number;
  collected: number;
  source: 'airtable' | 'manual';
}
interface PaySchedule {
  nextDate: string;
  nextAmount: number;
  notes: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const COUNTRY: Record<string, string> = {
  US:'United States',GB:'United Kingdom',CA:'Canada',AU:'Australia',
  DE:'Germany',NL:'Netherlands',NZ:'New Zealand',MX:'Mexico',
  BR:'Brazil',FR:'France',ES:'Spain',IT:'Italy',JP:'Japan',
  IN:'India',SG:'Singapore',AE:'UAE',ZA:'South Africa',
};

const CRM_COLUMNS = ['Opt-In','Applications','Booked Through Funnel','Sales Call','Cancelled Call','Trash'];

const STATUS_COLOR: Record<string, string> = {
  Closed:'#3eb673', Deposit:'#3eb673',
  'No Close':'#d4af37', New:'#6b6b6b',
  'No Show':'#f59e0b', Cancelled:'#ef4444',
};

const PS_KEY = (id: string) => `ps_${id}`;
const CACHE_TTL = 24 * 60 * 60 * 1000;

const FALLBACK_RETENTION = [
  {time:'0:00',pct:100},{time:'1:00',pct:78},{time:'2:00',pct:62},
  {time:'3:00',pct:50},{time:'4:00',pct:41},{time:'5:00',pct:34},
  {time:'6:00',pct:29},{time:'7:00',pct:25},{time:'8:00',pct:22},
  {time:'9:00',pct:20},{time:'10:00',pct:18},
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const CT = {
  contentStyle:{ backgroundColor:'#121212', border:'1px solid #262626', borderRadius:8, fontSize:12 },
  labelStyle:  { color:'#f2f2f2' },
  itemStyle:   { color:'#D4AF37' },
};
const AX = { tick:{ fill:'#6b6b6b', fontSize:11 }, axisLine:false as const, tickLine:false as const };

function fmt$(n: number): string {
  if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`;
  if (n >= 1000)    return `$${(n/1000).toFixed(n%1000===0?0:1)}k`;
  return `$${Math.round(n).toLocaleString()}`;
}
function fmtDate(iso: unknown): string {
  if (!iso || typeof iso !== 'string') return '—';
  const d = new Date(iso.replace(' UTC','Z'));
  return isNaN(d.getTime()) ? iso.slice(0,10) : d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}
function lastUpdatedLabel(ts: number|null): string {
  if (!ts) return 'Never';
  const diff = Date.now()-ts;
  if (diff<60000)    return 'Just now';
  if (diff<3600000)  return `${Math.floor(diff/60000)}m ago`;
  if (diff<86400000) return `${Math.floor(diff/3600000)}h ago`;
  return `${Math.floor(diff/86400000)}d ago`;
}
function studentStatus(s: Student): { label: string; color: string } {
  if (s.collected >= s.revenue) return { label:'Fully Paid', color:'#3eb673' };
  if (s.collected > 0)          return { label:'Partial',    color:'#d4af37' };
  return                               { label:'Active',     color:'#d4af37' };
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function PBar({pct,gold=false}:{pct:number;gold?:boolean}) {
  return (
    <div className={s.pTrack}>
      <div className={`${s.pFill} ${gold?s.pGold:s.pGrey}`} style={{width:`${Math.min(pct,100)}%`}}/>
    </div>
  );
}
function KpiCard({title,value,sub,icon,gold=false}:{title:string;value:string|number;sub:string;icon:string;gold?:boolean}) {
  return (
    <div className={s.kpiCard}>
      <div className={s.kpiTop}><span className={s.kpiTitle}>{title}</span><span className={s.kpiIcon}>{icon}</span></div>
      <div className={`${s.kpiValue} ${gold?s.kpiValueGold:''}`}>{value}</div>
      <div className={s.kpiSub}>{sub}</div>
    </div>
  );
}
function Card({title,children,badge}:{title:string;children:React.ReactNode;badge?:string|number}) {
  return (
    <div className={s.card}>
      <div className={s.cardH}>
        <span className={s.cardT}>{title}</span>
        {badge!==undefined&&<span className={s.badge}>{badge}</span>}
      </div>
      <div className={s.cardB}>{children}</div>
    </div>
  );
}
function Spinner() { return <div className={s.spinner}/>; }
function Empty({text='No data yet'}:{text?:string}) { return <div className={s.empty}>{text}</div>; }

// ── Background ────────────────────────────────────────────────────────────────
function BlobBackground() {
  return (
    <>
      <div className={s.gridOverlay}/>
      <div className={s.blobWrap}>
        <div className={`${s.blob} ${s.blob1}`}/>
        <div className={`${s.blob} ${s.blob2}`}/>
        <div className={`${s.blob} ${s.blob3}`}/>
      </div>
    </>
  );
}

// ── PASSWORD GATE ─────────────────────────────────────────────────────────────
function PasswordGate({onUnlock}:{onUnlock:()=>void}) {
  const [value,setValue]     = useState('');
  const [shake,setShake]     = useState(false);
  const [error,setError]     = useState(false);
  const [loading,setLoading] = useState(false);

  const attempt = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/auth',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({password:value}),
    });
    setLoading(false);
    if (res.ok) { localStorage.setItem('admin_auth','true'); onUnlock(); }
    else {
      setError(true); setShake(true);
      setTimeout(()=>setShake(false),600);
      setTimeout(()=>setError(false),2500);
    }
  };

  return (
    <div className={s.gateRoot} style={{position:'relative'}}>
      <BlobBackground/>
      <div className={`${s.gateCard} ${shake?s.gateShake:''}`} style={{position:'relative',zIndex:1}}>
        <div className={s.gateLogo} style={{
          width:56, height:56, borderRadius:14,
          background:'linear-gradient(135deg,#D4AF37 0%,#8a7124 100%)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:26, color:'#0a0a0a', fontWeight:700, marginBottom:4,
        }}>⬡</div>
        <div className={s.gateTitle}>Orovia Mastermind</div>
        <div className={s.gateSub}>Internal dashboard · access restricted</div>
        <input
          type="password" value={value}
          onChange={e=>setValue(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&attempt()}
          placeholder="Password"
          className={`${s.gateInput} ${error?s.gateInputError:''}`}
          autoFocus
        />
        {error&&<div className={s.gateError}>Incorrect password</div>}
        <button className={s.gateBtn} onClick={attempt} disabled={loading}
          style={{background:'linear-gradient(135deg,#D4AF37 0%,#8a7124 100%)',color:'#0a0a0a'}}>
          {loading?'Checking…':'Unlock'}
        </button>
      </div>
    </div>
  );
}

// ── TAB 1 — VSL / FUNNEL ──────────────────────────────────────────────────────
function VSLTab() {
  const [wistia,setWistia]   = useState<WistiaStats|null>(null);
  const [calendly,setCal]    = useState<CalendlyStats|null>(null);
  const [typeform,setTF]     = useState<TFStats|null>(null);
  const [loading,setLoading] = useState(true);
  const [activePage,setActivePage] = useState<'main'|'discovery'|'dialing'>('main');

  useEffect(()=>{
    Promise.all([
      fetch('/api/admin/wistia').then(r=>r.json()).catch(()=>null),
      fetch('/api/admin/calendly').then(r=>r.json()).catch(()=>null),
      fetch('/api/admin/typeform').then(r=>r.json()).catch(()=>null),
    ]).then(([w,c,t])=>{
      if (w?.stats) setWistia(w);
      if (c?.bySlug) setCal(c);
      if (t?.total!==undefined) setTF(t);
    }).finally(()=>setLoading(false));
  },[]);

  const totalVisitors = wistia?.stats?.load_count ?? 0;
  const playCount     = wistia?.stats?.play_count ?? 0;
  const playRate      = wistia ? (wistia.stats.play_rate*100).toFixed(1) : '—';
  const avgWatch      = wistia ? Math.round(wistia.stats.average_percent_watched*100) : 0;
  const disc          = calendly?.bySlug?.['discovery-call'];
  const dial          = calendly?.bySlug?.['dialing-calendar'];
  const tfTotal       = typeform?.total ?? 0;

  if (loading) return <div className={s.tabLoading}><Spinner/><span>Loading VSL data…</span></div>;

  return (
    <div className={s.tabContent}>
      <div className={s.crmLayout}>
        {/* Sidebar */}
        <div className={s.crmSidebar}>
          <div className={s.crmSidebarTitle}>Pages</div>
          <button className={`${s.crmPipeBtn} ${activePage==='main'?s.crmPipeBtnActive:''}`} onClick={()=>setActivePage('main')}>
            <span>Main Page</span>
            <span className={s.badge}>{totalVisitors.toLocaleString()}</span>
          </button>
          <button className={`${s.crmPipeBtn} ${activePage==='discovery'?s.crmPipeBtnActive:''}`} onClick={()=>setActivePage('discovery')}>
            <span>Discovery Call</span>
            <span className={s.badge}>{disc?.total ?? 0}</span>
          </button>
          <button className={`${s.crmPipeBtn} ${activePage==='dialing'?s.crmPipeBtnActive:''}`} onClick={()=>setActivePage('dialing')}>
            <span>Dialing Calendar</span>
            <span className={s.badge}>{dial?.total ?? 0}</span>
          </button>
        </div>

        {/* Main content */}
        <div className={s.crmMain}>

          {/* ── Main Page ─────────────────────────────────────────────── */}
          {activePage==='main'&&(
            <>
              <div className={s.kpiGrid}>
                <KpiCard title="Total Visitors"  value={totalVisitors.toLocaleString()} sub="Unique page loads"                                         icon="👥"/>
                <KpiCard title="Play Rate"       value={`${playRate}%`}                sub={`${playCount.toLocaleString()} played`}                    icon="▶"/>
                <KpiCard title="Avg Watch Rate"  value={`${avgWatch}%`}               sub={`${(wistia?.stats?.hours_watched??0).toFixed(1)} hrs total`} icon="👁"/>
                <KpiCard title="High Engagement" value={`${wistia?.highEngPct??0}%`}  sub=">75% watched"                                              icon="🔥" gold/>
                <KpiCard title="Applications"    value={tfTotal}                       sub="Typeform submissions"                                       icon="📝" gold/>
              </div>

              {/* Funnel overview */}
              <div className={s.row2}>
                <Card title="Funnel Conversion">
                  <div className={s.funnelList}>
                    {[
                      {label:'Page Visitors',         value:totalVisitors, note:'All traffic loading the VSL page',            pct:100},
                      {label:'Played VSL',            value:playCount,     note:`${playRate}% play rate`,
                        pct:totalVisitors>0?Math.round((playCount/totalVisitors)*100):0},
                      {label:'Discovery Booked',      value:disc?.total??0, note:'Calendly discovery-call',
                        pct:totalVisitors>0&&(disc?.total??0)>0?Math.round(((disc?.total??0)/totalVisitors)*100):0},
                      {label:'Applications',          value:tfTotal,       note:'Typeform submissions',
                        pct:totalVisitors>0&&tfTotal>0?Math.round((tfTotal/totalVisitors)*100):0},
                    ].map((step,i)=>(
                      <div key={i} className={s.funnelStep}>
                        <div className={s.funnelStepTop}>
                          <span className={s.funnelLabel}>{step.label}</span>
                          <span className={s.funnelValue}>{step.value.toLocaleString()}</span>
                        </div>
                        <div className={s.funnelNote}>{step.note}</div>
                        <PBar pct={step.pct} gold={i===0||i===2}/>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card title="Engagement Overview">
                  <div className={s.engBlock}>
                    <div className={s.engRow}><span>High engagement (&gt;75% watched)</span><span className={s.engGold}>{wistia?.highEngPct??0}%</span></div>
                    <PBar pct={wistia?.highEngPct??0} gold/>
                    <div className={s.engSub}>of {(wistia?.totalEvents??0).toLocaleString()} tracked views</div>
                  </div>
                  <div className={s.engBlock}>
                    <div className={s.engRow}><span>Dropped off early (&lt;25% watched)</span><span className={s.engGrey}>{wistia?.lowEngPct??0}%</span></div>
                    <PBar pct={wistia?.lowEngPct??0}/>
                    <div className={s.engSub}>left in the first quarter</div>
                  </div>
                </Card>
              </div>

              <div className={s.row3}>
                <Card title="Top Cities">
                  {(wistia?.cities??[]).length===0?<Empty/>:(wistia?.cities??[]).map(c=>(
                    <div key={c.city} className={s.locRow}><span>{c.city}</span><span className={s.locCount}>{c.count}</span></div>
                  ))}
                </Card>
                <Card title="Top Countries">
                  {(wistia?.countries??[]).length===0?<Empty/>:(wistia?.countries??[]).map(c=>(
                    <div key={c.code} className={s.locRow}><span>{COUNTRY[c.code]??c.code}</span><span className={s.locCount}>{c.count}</span></div>
                  ))}
                </Card>
                <Card title="Video Retention">
                  <div style={{height:192}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={wistia?.retention??FALLBACK_RETENTION} margin={{top:5,right:10,bottom:5,left:0}}>
                        <defs>
                          <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                        <XAxis dataKey="time" {...AX}/>
                        <YAxis tickFormatter={v=>`${v}%`} {...AX} domain={[0,100]} ticks={[0,25,50,75,100]}/>
                        <Tooltip {...CT}/>
                        <Area type="monotone" dataKey="pct" stroke="#D4AF37" strokeWidth={2} fill="url(#retGrad)" dot={false} activeDot={{r:4,fill:'#D4AF37'}}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className={s.chartCap}>% of viewers still watching at each timestamp</p>
                </Card>
              </div>

              <Card title="Daily Page Views (Last 30 Days)">
                <div style={{height:200}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={wistia?.daily??[]} margin={{top:5,right:10,bottom:5,left:-20}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                      <XAxis dataKey="day" {...AX} interval={4}/>
                      <YAxis {...AX}/>
                      <Tooltip {...CT}/>
                      <Bar dataKey="views" fill="#D4AF37" radius={[2,2,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <div className={s.row2}>
                <Card title="UTM Sources" badge={typeform?.sources?.length??0}>
                  {(typeform?.sources??[]).length===0?<Empty text="No Typeform data"/>:(typeform?.sources??[]).map(r=>(
                    <div key={r.label} className={s.locRow}><span className={s.utmLabel}>{r.label}</span><span className={s.badge}>{r.count}</span></div>
                  ))}
                </Card>
                <Card title="UTM Campaigns" badge={typeform?.campaigns?.length??0}>
                  {(typeform?.campaigns??[]).length===0?<Empty text="No Typeform data"/>:(typeform?.campaigns??[]).map(r=>(
                    <div key={r.label} className={s.locRow}><span className={s.utmLabel}>{r.label}</span><span className={s.badge}>{r.count}</span></div>
                  ))}
                </Card>
              </div>

              <Card title="Recent Wistia Visitors" badge={wistia?.totalEvents??0}>
                {(wistia?.recentEvents??[]).length===0?<Empty/>:(
                  <div className={s.tableScroll}>
                    <table className={s.table}>
                      <thead><tr>{['Visitor','Watch %','Location','Source','Date'].map(c=><th key={c} className={s.th}>{c}</th>)}</tr></thead>
                      <tbody>
                        {(wistia?.recentEvents??[]).map((v,i)=>(
                          <tr key={i} className={s.tr}>
                            <td className={s.tdMono}>{v.id}</td>
                            <td className={s.td}>
                              <div className={s.watchCell}>
                                <div className={s.miniBar}><div className={s.miniBarFill} style={{width:`${v.watchPct}%`}}/></div>
                                <span>{v.watchPct}%</span>
                              </div>
                            </td>
                            <td className={s.tdMuted}>{v.city||COUNTRY[v.country.toUpperCase()]||v.country||'—'}</td>
                            <td className={s.tdMuted}>{v.source}</td>
                            <td className={s.tdMuted}>{v.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </>
          )}

          {/* ── Discovery Call ────────────────────────────────────────── */}
          {activePage==='discovery'&&(
            <>
              <div className={s.kpiGrid}>
                <KpiCard title="Booked Calls"    value={disc?.total??0}         sub={disc?.event_type_name??'Discovery Call'} icon="📅" gold/>
                <KpiCard title="Visitor Conv"    value={totalVisitors>0&&(disc?.total??0)>0?`${(((disc?.total??0)/totalVisitors)*100).toFixed(1)}%`:'—'}
                  sub="Visitors to booked" icon="📈" gold/>
                <KpiCard title="Play to Book"    value={playCount>0&&(disc?.total??0)>0?`${(((disc?.total??0)/playCount)*100).toFixed(1)}%`:'—'}
                  sub="Played VSL to booked" icon="🎯"/>
              </div>
              <Card title="Discovery Call Bookings by Day (Last 90 Days)">
                {!disc
                  ?<div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center'}}><Empty text="Loading Calendly…"/></div>
                  :(
                    <div style={{height:200}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={disc.daily} margin={{top:5,right:10,bottom:5,left:-20}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                          <XAxis dataKey="day" {...AX} interval={4}/>
                          <YAxis {...AX} allowDecimals={false}/>
                          <Tooltip {...CT}/>
                          <Bar dataKey="calls" fill="#D4AF37" radius={[2,2,0,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
              </Card>
              <Card title="Recent Applications" badge={tfTotal}>
                {(typeform?.recent??[]).length===0?<Empty text="No Typeform data"/>:(
                  <div className={s.tableScroll}>
                    <table className={s.table}>
                      <thead><tr>{['Date','Source','Medium','Campaign','Content'].map(c=><th key={c} className={s.th}>{c}</th>)}</tr></thead>
                      <tbody>
                        {(typeform?.recent??[]).map((r,i)=>(
                          <tr key={i} className={s.tr}>
                            <td className={s.tdMuted}>{r.date}</td>
                            <td className={s.td}>{r.source}</td>
                            <td className={s.tdMuted}>{r.medium}</td>
                            <td className={s.tdMuted}>{r.campaign}</td>
                            <td className={s.tdMuted}>{r.content}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </>
          )}

          {/* ── Dialing Calendar ──────────────────────────────────────── */}
          {activePage==='dialing'&&(
            <>
              <div className={s.kpiGrid}>
                <KpiCard title="Scheduled Calls"  value={dial?.total??0}         sub={dial?.event_type_name??'Dialing Calendar'} icon="📞" gold/>
                <KpiCard title="Total Discovery"  value={disc?.total??0}         sub="Via discovery-call link"                   icon="📅"/>
                <KpiCard title="Total Pipeline"   value={(disc?.total??0)+(dial?.total??0)} sub="All Calendly events"            icon="📈" gold/>
              </div>
              <Card title="Dialing Calendar Events by Day (Last 90 Days)">
                {!dial
                  ?<div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center'}}><Empty text="Loading Calendly…"/></div>
                  :(
                    <div style={{height:200}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dial.daily} margin={{top:5,right:10,bottom:5,left:-20}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                          <XAxis dataKey="day" {...AX} interval={4}/>
                          <YAxis {...AX} allowDecimals={false}/>
                          <Tooltip {...CT}/>
                          <Bar dataKey="calls" fill="#D4AF37" radius={[2,2,0,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
              </Card>
              <Card title="Typeform Submissions by Day">
                <div style={{height:200}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typeform?.daily??[]} margin={{top:5,right:10,bottom:5,left:-20}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                      <XAxis dataKey="day" {...AX} interval={4}/>
                      <YAxis {...AX} allowDecimals={false}/>
                      <Tooltip {...CT}/>
                      <Bar dataKey="submissions" fill="#8a7124" radius={[2,2,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── TAB 2 — SALES ─────────────────────────────────────────────────────────────
type SalesDash = 'total'|'organic'|'ads'|'webinar'|'lowticket';
const DASH_CONFIG: Array<{id:SalesDash;label:string;keys:string[]}> = [
  { id:'total',     label:'Total Dashboard',          keys:[] },
  { id:'organic',   label:'Organic Free Training',    keys:['organic','free training','content','free','ig organic','instagram organic','reel','short','post'] },
  { id:'ads',       label:'Training Ads',             keys:['ad','paid','meta','facebook','fb','instagram ad','ig ad','sponsored','promo'] },
  { id:'webinar',   label:'Direct Booking Webinar',   keys:['webinar','direct book','booking webinar','live','workshop'] },
  { id:'lowticket', label:'Low Ticket Ascension',     keys:['low ticket','ascension','ltv','low-ticket','mini course','tripwire'] },
];
function filterByCampaign(records:SalesRecord[], id:SalesDash): SalesRecord[] {
  if (id==='total') return records;
  const keys = DASH_CONFIG.find(d=>d.id===id)?.keys??[];
  return records.filter(r=>{
    const hay = `${r.campaign||''} ${r.source||''}`.toLowerCase();
    return keys.some(k=>hay.includes(k));
  });
}
function computeKPIs(recs:SalesRecord[]): SalesKPIs {
  const totalCalls  = recs.length;
  const closedCalls = recs.filter(r=>r.status==='Closed'||r.status==='Deposit').length;
  const noCloses    = recs.filter(r=>r.status==='No Close').length;
  const noShows     = recs.filter(r=>r.status==='No Show').length;
  const showedUp    = totalCalls-noShows;
  const closeRate   = showedUp>0?((closedCalls/showedUp)*100).toFixed(1):'0';
  const totalCC     = recs.reduce((a,r)=>a+r.cc,0);
  return { totalCalls,closedCalls,noCloses,noShows,closeRate,totalCC };
}

function SalesTab() {
  const [records,setRecords]     = useState<SalesRecord[]>([]);
  const [loading,setLoading]     = useState(true);
  const [expanded,setExpanded]   = useState<string|null>(null);
  const [lastFetch,setLastFetch] = useState<number|null>(null);
  const [activeDash,setActiveDash] = useState<SalesDash>('total');

  const load = useCallback((force=false)=>{
    const stored = Number(localStorage.getItem('orovia_fetch_sales_v3')||'0');
    if (!force && stored && Date.now()-stored < CACHE_TTL) {
      const cached = localStorage.getItem('orovia_cache_sales_v3');
      if (cached) {
        try { const d=JSON.parse(cached); setRecords(d.records??[]); setLastFetch(stored); setLoading(false); return; }
        catch { /* fall through */ }
      }
    }
    setLoading(true);
    fetch('/api/admin/sales').then(r=>r.json()).then(d=>{
      setRecords(d.records??[]);
      const now=Date.now(); setLastFetch(now);
      localStorage.setItem('orovia_fetch_sales_v3',String(now));
      localStorage.setItem('orovia_cache_sales_v3',JSON.stringify(d));
    }).finally(()=>setLoading(false));
  },[]);

  useEffect(()=>{ load(); },[load]);

  if (loading) return <div className={s.tabLoading}><Spinner/><span>Loading sales data…</span></div>;

  const filtered = filterByCampaign(records, activeDash);
  const kpis     = computeKPIs(filtered);
  const sorted   = [...filtered].sort((a,b)=>{
    const ta=new Date(b.date).getTime(), tb=new Date(a.date).getTime();
    return isNaN(ta)||isNaN(tb)?0:ta-tb;
  });

  return (
    <div className={s.tabContent}>
      <div className={s.refreshRow}>
        <span className={s.refreshLabel}>Updated {lastUpdatedLabel(lastFetch)}</span>
        <button className={s.refreshBtn} onClick={()=>load(true)}>↻ Refresh</button>
      </div>

      <div className={s.crmLayout}>
        <div className={s.crmSidebar}>
          <div className={s.crmSidebarTitle}>Dashboards</div>
          {DASH_CONFIG.map(d=>(
            <button
              key={d.id}
              className={`${s.crmPipeBtn} ${activeDash===d.id?s.crmPipeBtnActive:''}`}
              onClick={()=>{ setActiveDash(d.id); setExpanded(null); }}
            >
              <span>{d.label}</span>
              <span className={s.badge}>{filterByCampaign(records,d.id).length}</span>
            </button>
          ))}
        </div>

        <div className={s.crmMain}>
          <div className={s.kpiGrid}>
            <KpiCard title="Total Calls"    value={kpis.totalCalls}      sub={activeDash==='total'?'All time':'Filtered calls'}  icon="📞"/>
            <KpiCard title="Closed"         value={kpis.closedCalls}     sub="Closed + deposits"                                 icon="✅" gold/>
            <KpiCard title="Close Rate"     value={`${kpis.closeRate}%`} sub="Of calls that showed"                             icon="📈" gold/>
            <KpiCard title="No Shows"       value={kpis.noShows}         sub="Did not attend"                                    icon="👻"/>
            <KpiCard title="Cash Collected" value={fmt$(kpis.totalCC)}   sub="Across filtered calls"                            icon="💰" gold/>
          </div>

          <Card title="Call Records" badge={filtered.length}>
            {filtered.length===0
              ?<Empty text={activeDash==='total'?'No call records yet':'No records match this dashboard.'}/>
              :(
                <div className={s.tableScroll}>
                  <table className={s.table}>
                    <thead>
                      <tr>{['Lead','Phone','Status','Date','Closer','CC',''].map(c=><th key={c} className={s.th}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {sorted.map((r,i)=>{
                        const color = STATUS_COLOR[r.status]??'#888';
                        const key   = `${r.leadName}-${i}`;
                        const open  = expanded===key;
                        return (
                          <React.Fragment key={key}>
                            <tr className={s.tr} style={{cursor:'pointer'}} onClick={()=>setExpanded(open?null:key)}>
                              <td className={s.td}>{r.leadName||'—'}</td>
                              <td className={s.tdMono}>{r.phone||'—'}</td>
                              <td className={s.td}>
                                <span className={s.statusDot} style={{background:color}}/>
                                <span style={{color}}>{r.status}</span>
                              </td>
                              <td className={s.tdMuted}>{fmtDate(r.date)}</td>
                              <td className={s.tdMuted}>{r.closer||'—'}</td>
                              <td className={s.tdGold}>{r.cc>0?fmt$(r.cc):'—'}</td>
                              <td className={s.tdMuted}>{open?'▲':'▼'}</td>
                            </tr>
                            {open&&(
                              <tr className={s.trExpanded}>
                                <td colSpan={7}>
                                  <div className={s.expandGrid}>
                                    {r.notes&&<div><div className={s.expandLabel}>Call Notes</div><div className={s.expandBody}>{r.notes}</div></div>}
                                    {r.objection&&<div><div className={s.expandLabel}>Objection</div><div className={s.expandBody}>{r.objection}</div></div>}
                                    {r.email&&<div><div className={s.expandLabel}>Email</div><div className={s.expandBody}>{r.email}</div></div>}
                                    {r.campaign&&<div><div className={s.expandLabel}>Campaign</div><div className={s.expandBody}>{r.campaign}</div></div>}
                                    {r.source&&<div><div className={s.expandLabel}>Source</div><div className={s.expandBody}>{r.source}</div></div>}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── TAB 3 — CRM PIPELINE ─────────────────────────────────────────────────────
function CRMTab() {
  const [leads,setLeads]           = useState<CRMLead[]>([]);
  const [pipelines,setPipelines]   = useState<Pipeline[]>([]);
  const [connected,setConn]        = useState(false);
  const [loading,setLoading]       = useState(true);
  const [lastFetch,setLastFetch]   = useState<number|null>(null);
  const [activePipe,setActivePipe] = useState<string|null>(null);

  const load = useCallback((force=false)=>{
    const stored = Number(localStorage.getItem('orovia_fetch_crm')||'0');
    if (!force && stored && Date.now()-stored < CACHE_TTL) {
      const cached = localStorage.getItem('orovia_cache_crm');
      if (cached) {
        try {
          const d=JSON.parse(cached);
          setLeads(d.leads??[]); setPipelines(d.pipelines??[]); setConn(d.connected??false);
          setLastFetch(stored); setLoading(false); return;
        } catch { /* fall through */ }
      }
    }
    setLoading(true);
    Promise.all([
      fetch('/api/admin/crm').then(r=>r.json()),
      fetch('/api/admin/pipelines').then(r=>r.json()),
    ]).then(([crm,pipes])=>{
      setLeads(crm.leads??[]); setConn(crm.connected??false);
      setPipelines(pipes.pipelines??[]);
      const now=Date.now(); setLastFetch(now);
      localStorage.setItem('orovia_fetch_crm',String(now));
      localStorage.setItem('orovia_cache_crm',JSON.stringify({
        leads:crm.leads??[], pipelines:pipes.pipelines??[], connected:crm.connected??false
      }));
    }).finally(()=>setLoading(false));
  },[]);

  useEffect(()=>{ load(); },[load]);

  const LEAD_COL_COLOR: Record<string,string> = {
    'Opt-In':'#d4af37','Applications':'#3eb673','Booked Through Funnel':'#60a5fa',
    'Sales Call':'#a78bfa','Cancelled Call':'#f59e0b','Trash':'#ef4444',
  };
  const STAGE_COLORS: Record<string,string> = {
    active:'#3eb673', won:'#d4af37', lost:'#ef4444',
  };

  if (loading) return <div className={s.tabLoading}><Spinner/><span>Loading CRM data…</span></div>;

  if (!connected) return (
    <div className={s.tabContent}>
      <div className={s.crmConnect}>
        <div className={s.crmConnectIcon}>🔌</div>
        <div className={s.crmConnectTitle}>Close CRM not connected</div>
        <p className={s.crmConnectBody}>
          Add <code className={s.code}>CLOSE_API_KEY</code> to your <code className={s.code}>.env.local</code> to pull your pipeline live.
        </p>
      </div>
    </div>
  );

  const activePipeData = pipelines.find(p=>p.id===activePipe)??null;

  return (
    <div className={s.tabContent}>
      <div className={s.refreshRow}>
        <span className={s.refreshLabel}>Updated {lastUpdatedLabel(lastFetch)}</span>
        <button className={s.refreshBtn} onClick={()=>load(true)}>↻ Refresh</button>
      </div>

      <div className={s.crmLayout}>
        <div className={s.crmSidebar}>
          <div className={s.crmSidebarTitle}>Pipelines</div>
          <button className={`${s.crmPipeBtn} ${activePipe===null?s.crmPipeBtnActive:''}`} onClick={()=>setActivePipe(null)}>
            <span>All Leads</span>
            <span className={s.badge}>{leads.length}</span>
          </button>
          {pipelines.map(p=>(
            <button key={p.id} className={`${s.crmPipeBtn} ${activePipe===p.id?s.crmPipeBtnActive:''}`} onClick={()=>setActivePipe(p.id)}>
              <span>{p.name}</span>
              <span className={s.badge}>{p.opps.length}</span>
            </button>
          ))}
        </div>

        <div className={s.crmMain}>
          {activePipe===null ? (
            <>
              <div className={s.kpiGrid}>
                <KpiCard title="Total Leads" value={leads.length} sub="In CRM" icon="👤"/>
                {CRM_COLUMNS.slice(0,4).map(col=>(
                  <KpiCard key={col} title={col} value={leads.filter(l=>l.statusLabel===col).length} sub="leads" icon="📋"/>
                ))}
              </div>
              <div className={s.kanban}>
                {CRM_COLUMNS.map(col=>{
                  const colLeads = leads.filter(l=>l.statusLabel===col);
                  const cc = LEAD_COL_COLOR[col]??'#333';
                  return (
                    <div key={col} className={s.kanbanCol}>
                      <div className={s.kanbanHeader} style={{borderTopColor:cc}}>
                        <span className={s.kanbanTitle}>{col}</span>
                        <span className={s.badge} style={{background:`${cc}22`,color:cc}}>{colLeads.length}</span>
                      </div>
                      <div className={s.kanbanCards}>
                        {colLeads.length===0
                          ?<div className={s.kanbanEmpty}>No leads</div>
                          :colLeads.map(lead=>(
                            <div key={lead.id} className={s.kanbanCard}>
                              <div className={s.kanbanName}>{lead.name}</div>
                              {lead.phone&&<div className={s.kanbanMeta}>{lead.phone}</div>}
                              {lead.email&&<div className={s.kanbanMeta}>{lead.email}</div>}
                              <div className={s.kanbanDate}>{fmtDate(lead.dateCreated)}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : activePipeData ? (
            <>
              <div className={s.kpiGrid}>
                <KpiCard title={activePipeData.name} value={activePipeData.opps.length} sub="Opportunities" icon="📋" gold/>
                <KpiCard title="Won"    value={activePipeData.opps.filter(o=>o.statusType==='won').length}    sub="Closed"      icon="✅" gold/>
                <KpiCard title="Active" value={activePipeData.opps.filter(o=>o.statusType==='active').length} sub="In progress" icon="⚡"/>
                <KpiCard title="Lost"   value={activePipeData.opps.filter(o=>o.statusType==='lost').length}   sub="Lost/cancelled" icon="❌"/>
              </div>
              <div className={s.kanban}>
                {activePipeData.stages.map(stage=>{
                  const stageOpps = activePipeData.opps.filter(o=>o.statusLabel===stage.label);
                  const sc = STAGE_COLORS[stage.type]??'#555';
                  return (
                    <div key={stage.label} className={s.kanbanCol}>
                      <div className={s.kanbanHeader} style={{borderTopColor:sc}}>
                        <span className={s.kanbanTitle}>{stage.label}</span>
                        <span className={s.badge} style={{background:`${sc}22`,color:sc}}>{stageOpps.length}</span>
                      </div>
                      <div className={s.kanbanCards}>
                        {stageOpps.length===0
                          ?<div className={s.kanbanEmpty}>Empty</div>
                          :stageOpps.map(opp=>(
                            <div key={opp.id} className={s.kanbanCard}>
                              <div className={s.kanbanName}>{opp.leadName}</div>
                              {opp.value>0&&<div className={s.kanbanMeta} style={{color:'#d4af37'}}>{fmt$(opp.value)}</div>}
                              <div className={s.kanbanDate}>{fmtDate(opp.dateCreated)}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── TAB 4 — STUDENTS ─────────────────────────────────────────────────────────
function StudentsTab() {
  const [atStudents,setAtStudents] = useState<Student[]>([]);
  const [selected,setSelected]     = useState<Student|null>(null);
  const [loading,setLoading]       = useState(true);
  const [lastFetch,setLastFetch]   = useState<number|null>(null);
  const [adding,setAdding]         = useState(false);
  const [saving,setSaving]         = useState(false);
  const [form,setForm]             = useState({name:'',revenue:'',collected:'',closeDate:''});
  const [psData,setPSData]         = useState<Record<string,PaySchedule>>({});
  const [editingPS,setEditingPS]   = useState(false);
  const [psForm,setPSForm]         = useState<PaySchedule>({nextDate:'',nextAmount:0,notes:''});

  const loadPS = useCallback(()=>{
    const all: Record<string,PaySchedule> = {};
    for (let i=0; i<localStorage.length; i++) {
      const k = localStorage.key(i)??'';
      if (k.startsWith('ps_')) {
        try { all[k.slice(3)] = JSON.parse(localStorage.getItem(k)??''); } catch { /* ignore */ }
      }
    }
    setPSData(all);
  },[]);

  const loadStudents = useCallback((force=false)=>{
    const stored = Number(localStorage.getItem('orovia_fetch_students')||'0');
    if (!force && stored && Date.now()-stored < CACHE_TTL) {
      const cached = localStorage.getItem('orovia_cache_students');
      if (cached) {
        try {
          const d=JSON.parse(cached);
          setAtStudents((d.students??[]).map((st: Student)=>({...st,source:'airtable' as const})));
          setLastFetch(stored); setLoading(false); return;
        } catch { /* fall through */ }
      }
    }
    setLoading(true);
    fetch('/api/admin/students').then(r=>r.json()).then(d=>{
      setAtStudents((d.students??[]).map((st: Student)=>({...st,source:'airtable' as const})));
      const now=Date.now(); setLastFetch(now);
      localStorage.setItem('orovia_fetch_students',String(now));
      localStorage.setItem('orovia_cache_students',JSON.stringify(d));
    }).finally(()=>setLoading(false));
  },[]);

  useEffect(()=>{ loadStudents(); loadPS(); },[loadStudents,loadPS]);

  const addStudent = async () => {
    const rev = parseFloat(form.revenue);
    const col = parseFloat(form.collected)||0;
    if (!form.name||isNaN(rev)) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/students',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name:form.name, revenue:rev, collected:col, closeDate:form.closeDate||undefined}),
      });
      if (res.ok) {
        setForm({name:'',revenue:'',collected:'',closeDate:''}); setAdding(false);
        loadStudents(true);
      }
    } finally { setSaving(false); }
  };

  const deleteStudent = async (st: Student) => {
    if (st.source==='airtable') {
      await fetch(`/api/admin/students?recordId=${st.recordId}`,{method:'DELETE'});
      loadStudents(true);
    }
    if (selected?.id===st.id) setSelected(null);
    localStorage.removeItem(PS_KEY(st.id));
    loadPS();
  };

  const savePS = (id: string, ps: PaySchedule) => {
    localStorage.setItem(PS_KEY(id), JSON.stringify(ps));
    setPSData(prev=>({...prev,[id]:ps}));
    setEditingPS(false);
  };

  const openPS = (id: string) => {
    const existing = psData[id];
    setPSForm(existing ?? {nextDate:'',nextAmount:0,notes:''});
    setEditingPS(true);
  };

  const sorted = [...atStudents].sort((a,b)=>{
    const aO=a.revenue-a.collected, bO=b.revenue-b.collected;
    return bO!==aO?bO-aO:a.name.localeCompare(b.name);
  });

  const totalRevenue   = atStudents.reduce((a,st)=>a+st.revenue,0);
  const totalCollected = atStudents.reduce((a,st)=>a+st.collected,0);

  return (
    <div className={s.tabContent}>
      {loading&&<div className={s.tabLoading}><Spinner/><span>Loading clients…</span></div>}
      {!loading&&(
        <>
          <div className={s.refreshRow}>
            <span className={s.refreshLabel}>Updated {lastUpdatedLabel(lastFetch)}</span>
            <button className={s.refreshBtn} onClick={()=>loadStudents(true)}>↻ Refresh</button>
          </div>

          <div className={s.kpiGrid}>
            <KpiCard title="Total Clients"  value={atStudents.length}              sub="Active"         icon="👥"/>
            <KpiCard title="Total Revenue"  value={fmt$(totalRevenue)}             sub="Contract value" icon="📋" gold/>
            <KpiCard title="Collected"      value={fmt$(totalCollected)}           sub="Cash in hand"   icon="💰" gold/>
            <KpiCard title="Outstanding"    value={fmt$(totalRevenue-totalCollected)} sub="Still owed"  icon="⏳"/>
          </div>

          <div className={s.studentsLayout}>
            <div className={s.studentsList}>
              <div className={s.studentsListHead}>
                <span className={s.cardT}>Clients <span className={s.badge} style={{marginLeft:6}}>{atStudents.length}</span></span>
                <button className={s.addBtn} onClick={()=>setAdding(a=>!a)}>+ Add</button>
              </div>

              {adding&&(
                <div className={s.addForm}>
                  <input className={s.addInput} placeholder="Client name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
                  <input className={s.addInput} placeholder="Total revenue ($)" type="number" value={form.revenue} onChange={e=>setForm(f=>({...f,revenue:e.target.value}))}/>
                  <input className={s.addInput} placeholder="Cash collected ($)" type="number" value={form.collected} onChange={e=>setForm(f=>({...f,collected:e.target.value}))}/>
                  <input className={s.addInput} type="date" value={form.closeDate} onChange={e=>setForm(f=>({...f,closeDate:e.target.value}))} title="Close date (optional)"/>
                  <div style={{display:'flex',gap:8}}>
                    <button className={s.gateBtn} style={{flex:1,padding:'10px',background:'linear-gradient(135deg,#D4AF37 0%,#8a7124 100%)',color:'#0a0a0a'}} onClick={addStudent} disabled={saving}>
                      {saving?'Saving…':'Save'}
                    </button>
                    <button className={s.lockBtn} onClick={()=>setAdding(false)}>Cancel</button>
                  </div>
                </div>
              )}

              {sorted.map(st=>{
                const status = studentStatus(st);
                const pct    = st.revenue>0?Math.min((st.collected/st.revenue)*100,100):0;
                const ps     = psData[st.id];
                return (
                  <div
                    key={st.id}
                    className={`${s.studentCard} ${selected?.id===st.id?s.studentCardActive:''}`}
                    onClick={()=>{ setSelected(st); setEditingPS(false); }}
                  >
                    <div className={s.studentCardTop}>
                      <span className={s.studentName}>{st.name}</span>
                      <span className={s.badge} style={{background:`${status.color}22`,color:status.color}}>{status.label}</span>
                    </div>
                    <div className={s.studentCardMeta}>
                      <span className={s.studentGold}>{fmt$(st.collected)} paid</span>
                      <span className={s.studentMuted}>{fmt$(st.revenue-st.collected)} owed</span>
                    </div>
                    {ps?.nextDate&&<div className={s.studentMuted} style={{fontSize:11,marginTop:2}}>Next: {fmt$(ps.nextAmount)} on {ps.nextDate}</div>}
                    <div className={s.pTrack} style={{marginTop:6}}>
                      <div className={s.pFill} style={{width:`${pct}%`,background:'#d4af37'}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {selected?(
              <div className={s.studentDetail}>
                <div className={s.studentDetailHead}>
                  <div>
                    <div className={s.studentDetailName}>{selected.name}</div>
                    <div className={s.studentDetailSub}>{fmt$(selected.revenue)} contract</div>
                  </div>
                  <button className={s.lockBtn} style={{color:'#ef4444',borderColor:'#3a1a1a'}} onClick={()=>deleteStudent(selected)}>Delete</button>
                </div>

                {/* Payment progress */}
                <div className={s.paymentList}>
                  <div className={s.paymentRow}>
                    <div className={s.paymentLeft}>
                      <span className={s.statusDot} style={{background:'#3eb673'}}/>
                      <div>
                        <div className={s.paymentLabel}>Cash Collected</div>
                        <div className={s.paymentDate}>Paid to date</div>
                      </div>
                    </div>
                    <div className={s.paymentRight}>
                      <span className={s.paymentAmt}>{fmt$(selected.collected)}</span>
                      <span className={s.badge} style={{background:'#3eb67322',color:'#3eb673'}}>received</span>
                    </div>
                  </div>
                  <div className={s.paymentRow}>
                    <div className={s.paymentLeft}>
                      <span className={s.statusDot} style={{background:'#6b6b6b'}}/>
                      <div>
                        <div className={s.paymentLabel}>Outstanding</div>
                        <div className={s.paymentDate}>Still owed</div>
                      </div>
                    </div>
                    <div className={s.paymentRight}>
                      <span className={s.paymentAmt}>{fmt$(selected.revenue-selected.collected)}</span>
                      <span className={s.badge} style={{background:'#6b6b6b22',color:'#6b6b6b'}}>pending</span>
                    </div>
                  </div>
                </div>
                <div className={s.paymentTotal}>
                  <span>Contract Value</span>
                  <span className={s.studentGold}>{fmt$(selected.revenue)}</span>
                </div>
                <div className={s.pTrack} style={{marginTop:8}}>
                  <div className={s.pFill} style={{width:`${selected.revenue>0?Math.min((selected.collected/selected.revenue)*100,100):0}%`,background:'#d4af37'}}/>
                </div>
                <div className={s.studentMuted} style={{fontSize:11,marginTop:4}}>
                  {selected.revenue>0?Math.round((selected.collected/selected.revenue)*100):0}% collected
                  {selected.source==='airtable'&&<span style={{marginLeft:8,color:'#d4af37'}}>· Airtable</span>}
                </div>

                {/* Payment Schedule */}
                <div className={s.psSection}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div className={s.psSectionTitle}>Payment Schedule</div>
                    <button className={s.psToggle} onClick={()=>{ if(!editingPS) openPS(selected.id); else setEditingPS(false); }}>
                      {editingPS?'Cancel':'Edit'}
                    </button>
                  </div>

                  {!editingPS&&(()=>{
                    const ps = psData[selected.id];
                    if (!ps?.nextDate&&!ps?.notes) return <div className={s.empty} style={{padding:'12px 0',border:'none',color:'#3a3a3a'}}>No schedule set</div>;
                    return (
                      <>
                        {ps.nextDate&&<div className={s.psRow}><span className={s.psLabel}>Next payment</span><span className={s.psVal}>{fmt$(ps.nextAmount)} on {ps.nextDate}</span></div>}
                        {ps.notes&&<div className={s.psNotes}>{ps.notes}</div>}
                      </>
                    );
                  })()}

                  {editingPS&&(
                    <div className={s.psEditForm}>
                      <div className={s.psEditRow}>
                        <div>
                          <div className={s.psSectionTitle} style={{marginBottom:6}}>Next Date</div>
                          <input type="date" className={s.addInput} value={psForm.nextDate} onChange={e=>setPSForm(f=>({...f,nextDate:e.target.value}))}/>
                        </div>
                        <div>
                          <div className={s.psSectionTitle} style={{marginBottom:6}}>Amount ($)</div>
                          <input type="number" className={s.addInput} placeholder="0" value={psForm.nextAmount||''} onChange={e=>setPSForm(f=>({...f,nextAmount:parseFloat(e.target.value)||0}))}/>
                        </div>
                      </div>
                      <div>
                        <div className={s.psSectionTitle} style={{marginBottom:6}}>Notes</div>
                        <input className={s.addInput} placeholder="Payment plan notes…" value={psForm.notes} onChange={e=>setPSForm(f=>({...f,notes:e.target.value}))}/>
                      </div>
                      <button className={s.psEditBtn} onClick={()=>savePS(selected.id,psForm)}>Save Schedule</button>
                    </div>
                  )}
                </div>
              </div>
            ):(
              <div className={s.studentDetailEmpty}>
                <span>Select a client to view details</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── DASHBOARD SHELL ───────────────────────────────────────────────────────────
const TABS = ['VSL / Funnel','Sales','CRM Pipeline','Students'] as const;
type TabName = typeof TABS[number];

function Dashboard({onLock}:{onLock:()=>void}) {
  const [tab,setTab] = useState<TabName>('VSL / Funnel');
  return (
    <div className={s.dashboard} style={{position:'relative'}}>
      <BlobBackground/>

      <div className={s.dbHeader} style={{position:'sticky',zIndex:10}}>
        <div className={s.dbBrand}>
          <div style={{
            width:40, height:40, borderRadius:10,
            background:'linear-gradient(135deg,#D4AF37 0%,#8a7124 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:20, color:'#0a0a0a', fontWeight:700, flexShrink:0,
          }}>⬡</div>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div className={s.dbBrandTitle}>Orovia Mastermind</div>
              <div className={s.pingWrap}>
                <div className={s.pingRing}/>
                <div className={s.pingDot}/>
              </div>
            </div>
            <div className={s.dbBrandSub}>Internal dashboard</div>
          </div>
        </div>
        <button className={s.lockBtn} onClick={onLock}>Lock</button>
      </div>

      <div className={s.tabBar} style={{position:'sticky',zIndex:9}}>
        {TABS.map(t=>(
          <button key={t} className={`${s.tabBtn} ${tab===t?s.tabBtnActive:''}`} onClick={()=>setTab(t)}>{t}</button>
        ))}
      </div>

      <div style={{position:'relative',zIndex:1}}>
        {tab==='VSL / Funnel' && <VSLTab/>}
        {tab==='Sales'         && <SalesTab/>}
        {tab==='CRM Pipeline'  && <CRMTab/>}
        {tab==='Students'      && <StudentsTab/>}
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [unlocked,setUnlocked] = useState(false);
  useEffect(()=>{ if (localStorage.getItem('admin_auth')==='true') setUnlocked(true); },[]);
  const lock = () => { localStorage.removeItem('admin_auth'); setUnlocked(false); };
  if (!unlocked) return <PasswordGate onUnlock={()=>setUnlocked(true)}/>;
  return <Dashboard onLock={lock}/>;
}
