// LandingPage.jsx — 1:1 port of zip landing-hero.jsx + landing-sections.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import NavSearch from './GlobalSearch';

const LANDING_CSS = `
  :root{--sage:#2D7A45;--sage-lt:#7CBF6B;--bg:#F5F1E8;--paper:#FBF8F1;--gold:#D4A574;--forest:#1A3D2E;--ink:#0F1410;--muted:#6B6F68;--line:#DDD8CB;--glass:rgba(251,248,241,0.65);--display:'Inter Tight',sans-serif;--mono:'IBM Plex Mono',monospace;--serif:'Source Serif 4',Georgia,serif;}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--ink);font-family:var(--display);-webkit-font-smoothing:antialiased;overflow-x:hidden}
  @keyframes floatY{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-10px) rotate(0.8deg)}}
  @keyframes floatA{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-14px) rotate(1deg)}}
  @keyframes floatB{0%,100%{transform:translateY(0) translateX(0)}33%{transform:translateY(-8px) translateX(4px)}66%{transform:translateY(-4px) translateX(-4px)}}
  @keyframes pulse-dot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.6);opacity:0.6}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
  .reveal{opacity:0;transform:translateY(40px);transition:opacity 0.7s ease,transform 0.7s ease}
  .reveal.visible{opacity:1;transform:translateY(0)}
  .stagger>*:nth-child(1){transition-delay:0s}.stagger>*:nth-child(2){transition-delay:.08s}.stagger>*:nth-child(3){transition-delay:.16s}.stagger>*:nth-child(4){transition-delay:.24s}.stagger>*:nth-child(5){transition-delay:.32s}.stagger>*:nth-child(6){transition-delay:.40s}
  .glass{background:var(--glass);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.55)}
  .grad-text{background:linear-gradient(135deg,#2D7A45,#7CBF6B,#D4A574);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .tilt-card{transform-style:preserve-3d;transition:transform 0.15s ease,box-shadow 0.3s ease}
  .brand-logo-link{display:flex;align-items:center;flex:0 0 auto;text-decoration:none;min-width:0}
  .brand-logo-img{display:block;height:44px;width:auto;max-width:220px;object-fit:contain}
  .brand-logo-img.footer{height:48px;max-width:240px;filter:brightness(1.25)}
  .desktop-only{display:flex!important}.mobile-only{display:none!important}
  body.no-scroll{overflow:hidden}
  @media(max-width:1024px){.hero-grid{grid-template-columns:1fr!important;gap:56px!important;padding:40px 24px!important}.hero-right{min-height:420px!important}.sec-wrap{padding:72px 24px!important}.grid-2,.grid-2-narrow,.grid-2-cta,.grid-2-end{grid-template-columns:1fr!important;gap:32px!important}.grid-4{grid-template-columns:repeat(2,1fr)!important}.footer-grid{grid-template-columns:1fr 1fr!important;gap:32px!important}.footer-bottom{grid-template-columns:1fr!important;gap:12px!important;text-align:center}}
  @media(max-width:768px){.desktop-only{display:none!important}.mobile-only{display:flex!important}.brand-logo-img{height:38px;max-width:176px}.brand-logo-img.footer{height:42px;max-width:200px}.hero-grid{padding:32px 18px!important;gap:40px!important}.hero-right{min-height:380px!important}.sec-wrap{padding:56px 18px!important}.grid-3{grid-template-columns:1fr!important}.grid-tools{grid-template-columns:1fr!important}.grid-2-end{grid-template-columns:1fr!important}.stat-grid-2{grid-template-columns:1fr 1fr!important}.footer-grid{grid-template-columns:1fr!important}.hero-demo{transform:scale(0.85);transform-origin:center}.micro-l1{left:0!important}.micro-l2{left:0!important}.micro-r1{right:0!important}.micro-r2{right:0!important}}
  @media(max-width:520px){.brand-logo-img{height:34px;max-width:148px}.brand-logo-img.footer{height:38px;max-width:180px}.grid-4{grid-template-columns:1fr!important}.stat-grid-2{grid-template-columns:1fr!important}.hero-demo{transform:scale(0.75)}.micro-l1,.micro-l2,.micro-r1,.micro-r2{display:none!important}}
  @media(max-width:380px){.brand-logo-img{height:32px;max-width:132px}}
`;

function injectCSS(){if(document.getElementById('khetlab-lp-css'))return;const el=document.createElement('style');el.id='khetlab-lp-css';el.textContent=LANDING_CSS;document.head.appendChild(el);}

function useScrollReveal(){
  useEffect(()=>{
    const els=document.querySelectorAll('.reveal');
    const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.08});
    els.forEach(el=>io.observe(el));
    return()=>io.disconnect();
  });
}

const ROUTES={frequency:'/tool/frequency',crosstab:'/tool/crosstab',means:'/tool/means',correlation:'/tool/correlation',regression:'/tool/regression',layouts:'/tool/layouts',onefactor:'/tool/onefactor',twofactor:'/tool/twofactor',threefactor:'/tool/threefactor',latin:'/tool/latin',strip:'/tool/strip',mulcomp:'/tool/mulcomp',pooled:'/tool/pooled',splitenv:'/tool/splitenv',genmean:'/tool/genmean',path:'/tool/path',diallel:'/tool/diallel',partialdial:'/tool/partialdial',stability:'/tool/stability',linetester:'/tool/linetester',augmented:'/tool/augmented',lattice:'/tool/lattice',pbibd:'/tool/pbibd',ttc:'/tool/ttc',pca:'/tool/pca',kmean:'/tool/kmean',probit:'/tool/probit'};
const RES={'Thesis Topic Finder':'/thesis-topics','Literature Review':'/research','Student Opportunity Hub':'/student-hub','Methodology Wizard':'/thesis','Smart Data Cleaner':'/','Documentation':'/resources','Video Guides':'/resources','Sample Datasets':'/resources','Citation Format':'/citations'};

const STAT_CATEGORIES=[
  {id:'descriptive',number:'01',title:'Descriptive Statistics',subtitle:'Summarize, explore, and describe data.',tools:[{name:'Frequency Table',desc:'Summarize value occurrences',tag:'Summary',id:'frequency'},{name:'Cross Tabulation',desc:'Categorical relationships',tag:'Categorical',id:'crosstab'},{name:'Comparing Means',desc:'Hypothesis testing across groups',tag:'Inference',id:'means'},{name:'Correlation Analysis',desc:'Strength & direction between variables',tag:'Relational',id:'correlation'},{name:'Regression Analysis',desc:'Model dependent vs. independent',tag:'Modeling',id:'regression'}]},
  {id:'doe',number:'02',title:'Design of Experiments',subtitle:'Rigorous experimental layouts.',tools:[{name:'Randomization & Layouts',desc:'Generate experimental field plans',tag:'Layout',id:'layouts'},{name:'One Factor (CRD, RBD)',desc:'Single-factor analysis',tag:'ANOVA',id:'onefactor'},{name:'Two Factors (Split-plot)',desc:'Two-factor evaluation',tag:'ANOVA',id:'twofactor'},{name:'Three Factors',desc:'CRD, RBD, split-split designs',tag:'ANOVA',id:'threefactor'},{name:'Latin Square',desc:'Variability control trials',tag:'Design',id:'latin'},{name:'Strip Plot',desc:'Multi-factor structured layout',tag:'Design',id:'strip'},{name:'Multiple Comparison Tests',desc:'Post-hoc separation tests',tag:'Post-hoc',id:'mulcomp'},{name:'Pooled Analysis (RBD)',desc:'Combine data across env.',tag:'Pooled',id:'pooled'},{name:'Two-Factor over Environments',desc:'Pooled two-factor designs',tag:'Pooled',id:'splitenv'}]},
  {id:'biometrical',number:'03',title:'Biometrical Methods',subtitle:'Quantitative genetics & breeding.',tools:[{name:'Generation Means',desc:'Mean performance in breeding',tag:'Breeding',id:'genmean'},{name:'Path Analysis',desc:'Direct & indirect effects',tag:'Relational',id:'path'},{name:'Diallel Analysis',desc:'Breeding value via crosses',tag:'Genetics',id:'diallel'},{name:'Partial Diallel',desc:'Incomplete diallel crossing',tag:'Genetics',id:'partialdial'},{name:'Stability Analysis',desc:'Performance across env.',tag:'GxE',id:'stability'},{name:'Line × Tester',desc:'Combining ability',tag:'Breeding',id:'linetester'},{name:'Augmented Designs',desc:'Unbalanced experiments',tag:'Design',id:'augmented'},{name:'Balanced Lattice',desc:'Efficient comparative trials',tag:'Design',id:'lattice'},{name:'Alpha Lattice (PBIB)',desc:'Partially balanced blocks',tag:'Design',id:'pbibd'},{name:'Triple Test Cross',desc:'Genetic inheritance',tag:'Genetics',id:'ttc'}]},
  {id:'multivariate',number:'04',title:'Multivariate Analysis',subtitle:'Reduction & classification.',tools:[{name:'Principal Component Analysis',desc:'Reduce dimensionality',tag:'Reduction',id:'pca'},{name:'K-Mean Cluster Analysis',desc:'Classify into clusters',tag:'Clustering',id:'kmean'},{name:'Probit Analysis',desc:'Model binary response',tag:'Modeling',id:'probit'}]},
];
const ALL_TOOLS_COUNT=STAT_CATEGORIES.reduce((s,c)=>s+c.tools.length,0);
const THESIS_ITEMS=[
  {name:'Thesis Topic Finder',desc:'AI-assisted topic generation',tag:'AI',link:'/thesis-topics'},
  {name:'Literature Review',desc:'Smart paper summarisation',tag:'AI',link:'/research'},
  {name:'Methodology Wizard',desc:'Pick the right design',tag:'AI',link:'/thesis'},
  {name:'Resources Hub',desc:'Documentation, guides & sample data',tag:'Docs',link:'/resources'},
  {name:'Citation Manager',desc:'Manage and format citations',tag:'Cite',link:'/citations'},
];
const NAV_LINKS=[
  {id:'stats',label:'Statistical Methods',type:'direct',link:'/methods'},
  {id:'studenthub',label:'Student Hub',type:'direct',link:'/student-hub'},
  {id:'thesis',label:'Thesis Helper',type:'dropdown'},
  {id:'resumebuilder',label:'Resume Builder',type:'direct',link:'/resume-builder'},
];

const TAG_COLORS={Summary:'#6B6F68',Categorical:'#8E5A8E',Inference:'#2D7A45',Relational:'#A0772A',Modeling:'#4A6B8E',Layout:'#6B6F68',ANOVA:'#2D7A45',Design:'#8E5A8E','Post-hoc':'#A0772A',Pooled:'#4A6B8E',Breeding:'#2D7A45',Genetics:'#8E5A8E',GxE:'#A0772A',Reduction:'#4A6B8E',Clustering:'#2D7A45',AI:'#2D7A45',Docs:'#6B6F68',Video:'#A0772A',Data:'#4A6B8E',Cite:'#8E5A8E'};
const TagBadge=({tag})=>{const c=TAG_COLORS[tag]||'#6B6F68';return(<span style={{flexShrink:0,fontSize:10,fontFamily:'var(--mono)',fontWeight:500,padding:'3px 9px',borderRadius:999,border:`1px solid ${c}40`,color:c,background:`${c}10`,whiteSpace:'nowrap',letterSpacing:'0.02em'}}>{tag}</span>);};

/* StatsMegaMenu — all 4 stat categories in one mega-menu */
const StatsMegaMenu=()=>{
  const base={position:'absolute',top:'calc(100% + 8px)',left:'50%',transform:'translateX(-50%)',width:860,maxWidth:'calc(100vw - 40px)',background:'var(--paper)',border:'1px solid var(--line)',borderRadius:16,padding:24,boxShadow:'0 28px 70px rgba(15,20,16,0.16)',animation:'fadeIn 0.18s ease',zIndex:300};
  const row=(it,i)=>(<Link key={i} to={`/tool/${it.id}`} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,padding:'7px 10px',borderRadius:8,textDecoration:'none',color:'inherit',transition:'background 0.15s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(45,122,69,0.07)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:'#0F1410'}}>{it.name}</div><div style={{fontSize:11,color:'#6B6F68',fontFamily:'var(--mono)',marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.desc}</div></div><TagBadge tag={it.tag}/></Link>);
  return(<div style={{...base,display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>{STAT_CATEGORIES.map(cat=>(<div key={cat.id}><div style={{fontFamily:'var(--mono)',fontSize:10,color:'#6B6F68',letterSpacing:'0.12em',marginBottom:8,paddingBottom:6,borderBottom:'1px solid var(--line)'}}>{cat.number} — {cat.title.toUpperCase()}</div>{cat.tools.map(row)}</div>))}</div>);
};

/* ThesisDropdown */
const ThesisDropdown=()=>{
  const base={position:'absolute',top:'calc(100% + 8px)',left:'50%',transform:'translateX(-50%)',width:380,maxWidth:'calc(100vw - 40px)',background:'var(--paper)',border:'1px solid var(--line)',borderRadius:16,padding:16,boxShadow:'0 28px 70px rgba(15,20,16,0.16)',animation:'fadeIn 0.18s ease',zIndex:300};
  return(<div style={base}><div style={{fontFamily:'var(--mono)',fontSize:10,color:'#6B6F68',letterSpacing:'0.12em',marginBottom:10,paddingBottom:8,borderBottom:'1px solid var(--line)'}}>THESIS & RESEARCH TOOLS</div>{THESIS_ITEMS.map((it,i)=>(<Link key={i} to={it.link} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,padding:'9px 10px',borderRadius:8,textDecoration:'none',color:'inherit',transition:'background 0.15s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(45,122,69,0.07)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:'#0F1410'}}>{it.name}</div><div style={{fontSize:11,color:'#6B6F68',fontFamily:'var(--mono)',marginTop:1}}>{it.desc}</div></div><TagBadge tag={it.tag}/></Link>))}</div>);
};

/* MobileDrawer — new 4-item menu */
const MobileDrawer=({open,onClose})=>{
  const[view,setView]=useState('main');
  useEffect(()=>{document.body.classList.toggle('no-scroll',open);if(!open)setView('main');return()=>document.body.classList.remove('no-scroll');},[open]);
  if(!open)return null;
  const Hdr=({title,back})=>(<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 20px',borderBottom:'1px solid var(--line)',background:'var(--paper)',flexShrink:0}}><div style={{display:'flex',alignItems:'center',gap:12}}>{back?(<button onClick={()=>setView(back)} style={{width:36,height:36,background:'transparent',border:'1px solid var(--line)',borderRadius:999,cursor:'pointer',display:'grid',placeItems:'center',padding:0}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F1410" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6"/></svg></button>):(<div style={{width:30,height:30,background:'#0F1410',borderRadius:7,display:'grid',placeItems:'center'}}><svg width="16" height="16" viewBox="0 0 24 24"><path d="M4 20V4M4 20h16M8 16V10M12 16V6M16 16V13M20 16V8" stroke="#F5F1E8" strokeWidth="2" strokeLinecap="round"/></svg></div>)}<span style={{fontSize:16,fontWeight:700,letterSpacing:'-0.02em',color:'#0F1410'}}>{title}</span></div><button onClick={onClose} style={{width:36,height:36,background:'transparent',border:'1px solid var(--line)',borderRadius:999,cursor:'pointer',display:'grid',placeItems:'center',padding:0}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F1410" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>);
  const mBtn=(label,sub,onClick)=>(<button onClick={onClick} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 14px',background:'transparent',border:'none',borderBottom:'1px solid var(--line)',fontFamily:'var(--display)',cursor:'pointer',textAlign:'left'}}><div><div style={{fontSize:16,fontWeight:600,color:'#0F1410'}}>{label}</div><div style={{fontFamily:'var(--mono)',fontSize:10,color:'#6B6F68',marginTop:3,letterSpacing:'0.08em'}}>{sub}</div></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6F68" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg></button>);
  const mLink=(label,sub,to)=>(<Link to={to} onClick={onClose} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 14px',background:'transparent',border:'none',borderBottom:'1px solid var(--line)',fontFamily:'var(--display)',cursor:'pointer',textAlign:'left',textDecoration:'none',color:'inherit'}}><div><div style={{fontSize:16,fontWeight:600,color:'#0F1410'}}>{label}</div><div style={{fontFamily:'var(--mono)',fontSize:10,color:'#6B6F68',marginTop:3,letterSpacing:'0.08em'}}>{sub}</div></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6F68" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg></Link>);
  const renderMain=()=>(<div style={{display:'flex',flexDirection:'column',height:'100%'}}><Hdr title="KhetLab"/><div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'16px 16px 24px'}}><div style={{fontFamily:'var(--mono)',fontSize:10,color:'#6B6F68',letterSpacing:'0.12em',padding:'6px 14px 10px'}}>STATISTICAL METHODS</div>{mLink('All Statistical Methods',ALL_TOOLS_COUNT+' METHODS · 4 CATEGORIES','/methods')}<div style={{fontFamily:'var(--mono)',fontSize:10,color:'#6B6F68',letterSpacing:'0.12em',padding:'20px 14px 10px'}}>OPPORTUNITIES</div>{mLink('Student Opportunity Hub','PUNJAB JOBS & AGRICULTURE EXAMS','/student-hub')}<div style={{fontFamily:'var(--mono)',fontSize:10,color:'#6B6F68',letterSpacing:'0.12em',padding:'20px 14px 10px'}}>RESEARCH</div>{mBtn('Thesis Helper','TOPIC FINDER · LITERATURE · METHODOLOGY',()=>setView('thesis'))}{mLink('AI Resume Builder','BUILD PROFESSIONAL RESUMES','/resume-builder')}</div><div style={{padding:'16px 20px 20px',borderTop:'1px solid var(--line)',background:'var(--paper)',flexShrink:0,display:'flex',flexDirection:'column',gap:10}}><Link to="/tool/onefactor" onClick={onClose} style={{padding:'14px',background:'linear-gradient(135deg,#2D7A45,#1A3D2E)',color:'white',borderRadius:12,fontSize:15,fontWeight:600,fontFamily:'var(--display)',boxShadow:'0 6px 18px rgba(45,122,69,0.35)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,textDecoration:'none'}}>Launch KhetLab<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link></div></div>);
  const renderStats=()=>(<div style={{display:'flex',flexDirection:'column',height:'100%'}}><Hdr title="Statistical Methods" back="main"/><div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'12px 14px 20px'}}>{STAT_CATEGORIES.map(cat=>(<div key={cat.id} style={{marginBottom:18}}><div style={{fontFamily:'var(--mono)',fontSize:10,color:'#6B6F68',letterSpacing:'0.1em',marginBottom:6,paddingLeft:4}}>{cat.number} — {cat.title.toUpperCase()}</div><p style={{fontFamily:'var(--serif)',fontSize:13,color:'#6B6F68',lineHeight:1.4,marginBottom:8,paddingLeft:4}}>{cat.subtitle}</p><div style={{background:'var(--paper)',border:'1px solid var(--line)',borderRadius:12,overflow:'hidden'}}>{cat.tools.map((t,i)=>(<Link key={i} to={`/tool/${t.id}`} onClick={onClose} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'14px 16px',textDecoration:'none',color:'#0F1410',borderBottom:i<cat.tools.length-1?'1px solid var(--line)':'none'}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{t.name}</div><div style={{fontSize:11,color:'#6B6F68',fontFamily:'var(--mono)'}}>{t.desc}</div></div><TagBadge tag={t.tag}/></Link>))}</div></div>))}</div></div>);
  const renderThesis=()=>(<div style={{display:'flex',flexDirection:'column',height:'100%'}}><Hdr title="Thesis Helper" back="main"/><div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'18px 14px 28px'}}><p style={{fontFamily:'var(--serif)',fontSize:14,color:'#2A2F2A',lineHeight:1.5,marginBottom:18}}>AI assistants, literature tools & resources.</p><div style={{background:'var(--paper)',border:'1px solid var(--line)',borderRadius:12,overflow:'hidden'}}>{THESIS_ITEMS.map((t,i)=>(<Link key={i} to={t.link} onClick={onClose} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'14px 16px',textDecoration:'none',color:'#0F1410',borderBottom:i<THESIS_ITEMS.length-1?'1px solid var(--line)':'none'}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{t.name}</div><div style={{fontSize:11,color:'#6B6F68',fontFamily:'var(--mono)'}}>{t.desc}</div></div><TagBadge tag={t.tag}/></Link>))}</div></div></div>);
  let body;if(view==='main')body=renderMain();else if(view==='stats')body=renderStats();else if(view==='thesis')body=renderThesis();else body=renderMain();
  return(<div style={{position:'fixed',top:0,left:0,right:0,bottom:0,height:'100dvh',zIndex:300,background:'var(--bg)',display:'flex',flexDirection:'column',animation:'fadeIn 0.2s ease'}}>{body}</div>);
};

/* Nav — 4-item desktop nav */
const Nav=()=>{
  const[scrolled,setScrolled]=useState(false);const[hoverId,setHoverId]=useState(null);const[drawer,setDrawer]=useState(false);const closeRef=useRef(null);
  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>40);window.addEventListener('scroll',fn);return()=>window.removeEventListener('scroll',fn);},[]);
  const openMenu=id=>{clearTimeout(closeRef.current);setHoverId(id);};const closeMenu=()=>{closeRef.current=setTimeout(()=>setHoverId(null),140);};
  return(<><header style={{position:'fixed',top:0,left:0,right:0,zIndex:200,background:scrolled?'rgba(245,241,232,0.92)':'rgba(245,241,232,0.65)',backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',borderBottom:scrolled?'1px solid var(--line)':'1px solid transparent',transition:'background 0.25s ease, border-color 0.25s ease'}}><div style={{maxWidth:1400,margin:'0 auto',padding:'0 clamp(18px,4vw,40px)',display:'flex',alignItems:'center',justifyContent:'space-between',height:68}}><Link to="/" className="brand-logo-link" aria-label="KhetLab home"><img className="brand-logo-img" src="/khetlab-logo-header.svg" alt="KhetLab" width="760" height="220" /></Link><nav className="desktop-only" style={{position:'relative',alignItems:'center',background:'var(--paper)',border:'1px solid var(--line)',borderRadius:999,padding:4}}>{NAV_LINKS.map(nl=>{const isOpen=hoverId===nl.id;if(nl.type==='direct')return(<Link key={nl.id} to={nl.link} style={{position:'relative',zIndex:1,background:'transparent',border:'none',cursor:'pointer',fontFamily:'var(--display)',fontSize:14,fontWeight:500,color:'#2A2F2A',padding:'9px 16px',borderRadius:999,letterSpacing:'-0.005em',transition:'color 0.2s, background 0.2s',display:'flex',alignItems:'center',gap:5,textDecoration:'none'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(15,20,16,0.06)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>{nl.label}</Link>);return(<div key={nl.id} onMouseEnter={()=>openMenu(nl.id)} onMouseLeave={closeMenu} style={{position:'relative'}}><button style={{position:'relative',zIndex:1,background:isOpen?'#0F1410':'transparent',border:'none',cursor:'pointer',fontFamily:'var(--display)',fontSize:14,fontWeight:500,color:isOpen?'var(--bg)':'#2A2F2A',padding:'9px 16px',borderRadius:999,letterSpacing:'-0.005em',transition:'color 0.2s, background 0.2s',display:'flex',alignItems:'center',gap:5}}>{nl.label}<svg width="9" height="9" viewBox="0 0 10 10" style={{transform:isOpen?'rotate(180deg)':'',transition:'transform 0.2s',opacity:0.7}}><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg></button>{isOpen&&nl.id==='stats'&&<StatsMegaMenu/>}{isOpen&&nl.id==='thesis'&&<ThesisDropdown/>}</div>);})}</nav><div className="desktop-only" style={{gap:10,alignItems:'center'}}><NavSearch/><Link to="/tool/onefactor" style={{padding:'10px 20px',background:'#0F1410',color:'var(--bg)',borderRadius:999,fontSize:14,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontFamily:'var(--display)',textDecoration:'none'}}>Launch<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link></div><div className="mobile-only" style={{display:'flex',alignItems:'center',gap:8,marginLeft:'auto'}}><NavSearch/><button onClick={()=>setDrawer(true)} style={{width:44,height:44,background:'var(--paper)',border:'1px solid var(--line)',borderRadius:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0,flexShrink:0}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F1410" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button></div></div><MobileDrawer open={drawer} onClose={()=>setDrawer(false)}/></header></>);

};

/* HeroBarChart */
const HeroBarChart=()=>{
  const DATA=[[['T1',42],['T2',58],['T3',71],['T4',52],['T5',65]],[['CRD',55],['RBD',68],['SPL',74],['LSQ',60],['AUG',48]],[['P1',44],['P2',62],['P3',70],['P4',56],['P5',67]]];
  const[frame,setFrame]=useState(0);const[active,setActive]=useState(2);
  useEffect(()=>{const t=setInterval(()=>{setFrame(f=>(f+1)%DATA.length);setActive(Math.floor(Math.random()*5));},3000);return()=>clearInterval(t);},[]);
  const bars=DATA[frame];const max=Math.max(...bars.map(b=>b[1]));
  return(<div style={{padding:'16px 16px 10px'}}><div style={{display:'flex',gap:6,alignItems:'flex-end',height:90,marginBottom:6}}>{bars.map(([label,val],i)=>(<div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}><div style={{width:'100%',borderRadius:'4px 4px 0 0',height:`${(val/max)*82}px`,background:i===active?'linear-gradient(180deg,#7CBF6B,#2D7A45)':'rgba(45,122,69,0.2)',transition:'height 0.55s cubic-bezier(0.34,1.56,0.64,1), background 0.4s',boxShadow:i===active?'0 4px 14px rgba(45,122,69,0.4)':'none'}}/><span style={{fontFamily:'var(--mono)',fontSize:8,color:i===active?'#2D7A45':'#6B6F68'}}>{label}</span></div>))}</div><div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontFamily:'var(--mono)',fontSize:10,color:'#6B6F68',borderTop:'1px solid rgba(221,216,203,0.5)',paddingTop:8}}><span>F = 42.83</span><span style={{color:'#2D7A45',fontWeight:600}}>p &lt; 0.001 ★★★</span><span>CV: 5.41%</span></div></div>);
};

/* HeroDemoCard */
const HeroDemoCard=()=>(<div className="glass" style={{borderRadius:20,padding:0,overflow:'hidden',width:340,animation:'floatY 7s ease-in-out infinite',boxShadow:'0 24px 64px rgba(15,20,16,0.18), 0 2px 0 rgba(255,255,255,0.8) inset'}}><div style={{padding:'14px 16px',borderBottom:'1px solid rgba(221,216,203,0.4)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{fontFamily:'var(--mono)',fontSize:9,color:'#6B6F68',letterSpacing:'0.1em',marginBottom:3}}>LIVE · RBD ANALYSIS</div><div style={{fontSize:13,fontWeight:600}}>One Factor ANOVA</div></div><div style={{display:'flex',gap:4}}>{['#ff6b6b','#ffd93d','#6bcb77'].map(c=>(<div key={c} style={{width:8,height:8,borderRadius:999,background:c}}/>))}</div></div><HeroBarChart/><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:1,background:'rgba(221,216,203,0.3)',margin:'0 16px 16px',borderRadius:10,overflow:'hidden'}}>{[['TREATMENTS','5 levels'],['REPLICATIONS','3 blocks'],['GRAND MEAN','57.6'],['CD (5%)','±2.12']].map(([k,v])=>(<div key={k} style={{padding:'10px 12px',background:'rgba(251,248,241,0.8)'}}><div style={{fontFamily:'var(--mono)',fontSize:8,color:'#6B6F68',marginBottom:3}}>{k}</div><div style={{fontSize:14,fontWeight:600,color:'#0F1410'}}>{v}</div></div>))}</div><div style={{margin:'0 16px 16px',padding:'10px 14px',background:'linear-gradient(135deg,rgba(45,122,69,0.12),rgba(124,191,107,0.1))',borderRadius:10,border:'1px solid rgba(45,122,69,0.2)',display:'flex',alignItems:'center',justifyContent:'space-between'}}><span style={{fontSize:12,fontWeight:600,color:'#2D7A45'}}>✓ Significant Difference</span><span style={{fontFamily:'var(--mono)',fontSize:10,color:'#6B6F68'}}>α = 0.05</span></div></div>);
const MicroCard=({style:s,children,className=''})=>(<div className={`glass ${className}`} style={{borderRadius:12,padding:'10px 14px',fontSize:12,fontWeight:600,boxShadow:'0 8px 32px rgba(15,20,16,0.12)',...s}}>{children}</div>);
const Particles=()=>{const ref=useRef(null);useEffect(()=>{const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext('2d');canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;const pts=Array.from({length:40},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*2.5+0.5,vy:Math.random()*0.6+0.2,vx:(Math.random()-0.5)*0.4,opacity:Math.random()*0.5+0.1}));let raf;const draw=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);pts.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(45,122,69,${p.opacity})`;ctx.fill();p.y-=p.vy;p.x+=p.vx;if(p.y<-10){p.y=canvas.height+10;p.x=Math.random()*canvas.width;}});raf=requestAnimationFrame(draw);};draw();return()=>cancelAnimationFrame(raf);},[]);return <canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}/>;};

/* Hero */
const Hero=()=>(<section style={{position:'relative',minHeight:'100vh',overflow:'hidden',display:'flex',alignItems:'center',paddingTop:76}}><div style={{position:'absolute',inset:0,backgroundImage:'url(/hero-bg.jpg)',backgroundSize:'cover',backgroundPosition:'center right',zIndex:0}}/><div style={{position:'absolute',inset:0,zIndex:1,background:'linear-gradient(100deg, rgba(245,241,232,0.97) 40%, rgba(245,241,232,0.55) 65%, rgba(245,241,232,0.1) 100%)'}}/><Particles/><div className="hero-grid" style={{position:'relative',zIndex:2,maxWidth:1320,margin:'0 auto',padding:'60px 40px',width:'100%',display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'center'}}><div><div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:28,padding:'7px 16px',background:'rgba(45,122,69,0.1)',border:'1px solid rgba(45,122,69,0.25)',borderRadius:999,fontSize:13,fontWeight:500,color:'#1A3D2E'}}><span>🌾</span><span>Built for Agriculture Students</span><span style={{width:4,height:4,borderRadius:999,background:'#D4A574'}}/><span style={{color:'#2D7A45',fontWeight:600}}>100% Free Forever</span></div><h1 style={{fontSize:'clamp(44px,5.5vw,80px)',fontWeight:800,letterSpacing:'-0.04em',lineHeight:0.95,marginBottom:24,color:'#0F1410'}}>From Research<br/><span className="grad-text">Question</span> to<br/>Thesis Defense.</h1><p style={{fontFamily:'var(--serif)',fontSize:18,lineHeight:1.6,color:'#2A2F2A',maxWidth:520,marginBottom:36}}>The all-in-one toolkit for agriculture students — statistical analysis, AI topic finder, literature reviews, and thesis writing. <strong>Zero cost. Zero installation.</strong> <em>Designed by someone who sat exactly where you are sitting.</em></p><div style={{display:'flex',gap:12,marginBottom:28,flexWrap:'wrap'}}><Link to="/tool/onefactor" style={{padding:'14px 26px',background:'linear-gradient(135deg,#2D7A45,#1A3D2E)',border:'none',borderRadius:999,fontSize:15,fontWeight:600,color:'white',cursor:'pointer',fontFamily:'var(--display)',display:'flex',alignItems:'center',gap:8,boxShadow:'0 6px 24px rgba(45,122,69,0.4)',textDecoration:'none',transition:'transform 0.15s, box-shadow 0.15s'}} onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 10px 32px rgba(45,122,69,0.5)';}} onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 6px 24px rgba(45,122,69,0.4)';}}>Start Analyzing Now →</Link><a href="#methods" style={{padding:'14px 26px',background:'transparent',border:'2px solid #2D7A45',borderRadius:999,fontSize:15,fontWeight:600,color:'#2D7A45',cursor:'pointer',fontFamily:'var(--display)',transition:'background 0.2s, color 0.2s',textDecoration:'none'}} onMouseEnter={e=>{e.currentTarget.style.background='#2D7A45';e.currentTarget.style.color='white';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#2D7A45';}}>Explore Tools</a></div><div style={{display:'flex',gap:20,fontFamily:'var(--mono)',fontSize:11,color:'#6B6F68',letterSpacing:'0.04em',flexWrap:'wrap'}}>{['No Installation','Works in Browser','Trusted by 25,000+ Students'].map((t,i)=>(<span key={t} style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:5,height:5,borderRadius:999,background:'#2D7A45',display:'inline-block',animation:'pulse-dot 2s ease-in-out infinite',animationDelay:`${i*0.4}s`}}/>{t}</span>))}</div></div><div className="hero-right" style={{position:'relative',display:'flex',justifyContent:'center',alignItems:'center',minHeight:460}}><div className="hero-demo"><HeroDemoCard/></div><MicroCard className="micro-l1" style={{position:'absolute',top:40,left:-20,animation:'floatA 8s ease-in-out infinite',color:'#1A3D2E',background:'rgba(251,248,241,0.9)',minWidth:130}}><div style={{fontFamily:'var(--mono)',fontSize:9,color:'#6B6F68',marginBottom:4}}>P-VALUE</div><div style={{fontSize:16,fontWeight:700,color:'#2D7A45'}}>&lt; 0.001 ***</div></MicroCard><MicroCard className="micro-l2" style={{position:'absolute',bottom:80,left:-30,animation:'floatB 10s ease-in-out infinite',color:'#0F1410',minWidth:150}}><div style={{fontFamily:'var(--mono)',fontSize:9,color:'#6B6F68',marginBottom:6}}>NORMAL DIST.</div><svg viewBox="0 0 80 32" style={{width:80,height:32}}><path d="M2 30 C10 30 20 4 40 4 C60 4 70 30 78 30" stroke="#2D7A45" strokeWidth="2" fill="none"/><line x1="40" y1="4" x2="40" y2="30" stroke="#D4A574" strokeWidth="1" strokeDasharray="2 2"/></svg></MicroCard><MicroCard className="micro-r1" style={{position:'absolute',top:30,right:-40,animation:'floatA 9s ease-in-out infinite 1s',color:'#0F1410',minWidth:130}}><div style={{fontFamily:'var(--mono)',fontSize:9,color:'#6B6F68',marginBottom:3}}>STATUS</div><div style={{fontSize:13,fontWeight:700,color:'#2D7A45',display:'flex',alignItems:'center',gap:6}}><span style={{width:7,height:7,borderRadius:999,background:'#2D7A45',display:'inline-block',animation:'pulse-dot 1.5s ease-in-out infinite'}}/>Significant</div></MicroCard><MicroCard className="micro-r2" style={{position:'absolute',bottom:30,right:-20,animation:'floatB 11s ease-in-out infinite 0.5s',minWidth:120}}><div style={{fontFamily:'var(--mono)',fontSize:9,color:'#6B6F68',marginBottom:3}}>FREE FOREVER</div><div style={{fontSize:13,fontWeight:700}}>🌾 27 Methods</div></MicroCard></div></div></section>);

/* Shared */
const Label=({n,text})=>(<div style={{fontFamily:'var(--mono)',fontSize:11,color:'#2D7A45',letterSpacing:'0.12em',marginBottom:16,display:'flex',alignItems:'center',gap:8}}><span style={{opacity:0.5}}>//</span><span style={{opacity:0.5}}>{String(n).padStart(2,'0')} —</span><span>{text}</span></div>);
const SectionWrap=({id,children,bg,style:s})=>(<section id={id} className="reveal sec-wrap" style={{background:bg||'transparent',padding:'100px 40px',...s}}><div style={{maxWidth:1320,margin:'0 auto'}}>{children}</div></section>);
const TiltCard=({children,style:s,className})=>{const ref=useRef(null);useEffect(()=>{const el=ref.current;if(!el)return;const move=e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-0.5,y=(e.clientY-r.top)/r.height-0.5;el.style.transform=`perspective(700px) rotateX(${-y*12}deg) rotateY(${x*12}deg) scale(1.03)`;};const leave=()=>{el.style.transform='';};el.addEventListener('mousemove',move);el.addEventListener('mouseleave',leave);return()=>{el.removeEventListener('mousemove',move);el.removeEventListener('mouseleave',leave);};},[]);return <div ref={ref} className={`tilt-card ${className||''}`} style={s}>{children}</div>;};

/* ── § 01 Workflow ── */
const WORKFLOW_CARDS=[
  {icon:'💡',step:'01',title:'Discover', sub:'AI Thesis Topic Finder',      desc:'10 viable topics with gap analysis and seed papers. Stop staring at a blank page.',         to:'/thesis-topics'},
  {icon:'📑',step:'02',title:'Review',   sub:'Literature Review Generator', desc:'Drop your PDFs. Get a structured 2,000-word review in minutes.',                          to:'/research'},
  {icon:'📊',step:'03',title:'Analyze',  sub:'27+ Statistical Methods',     desc:'Free, browser-based — ANOVA, regression, diallel, PCA and more.',                        to:'/tool/onefactor'},
  {icon:'🎓',step:'04',title:'Thesis',   sub:'Results Composer + References',desc:'AI writes publication-ready prose from your output. References auto-formatted.',         to:'/thesis'},
];
const Workflow=()=>(
  <SectionWrap id="workflow" bg="var(--paper)">
    <Label n={1} text="WORKFLOW"/>
    <div className="grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,alignItems:'end',marginBottom:56}}>
      <h2 style={{fontSize:'clamp(38px,4vw,60px)',fontWeight:700,letterSpacing:'-0.035em',lineHeight:1,color:'#0F1410'}}>Your Thesis Journey,<br/><span style={{fontFamily:'var(--serif)',fontStyle:'italic',fontWeight:400}}>Simplified.</span></h2>
      <p style={{fontFamily:'var(--serif)',fontSize:17,lineHeight:1.6,color:'#2A2F2A'}}>Four stages. One platform. From the moment you don't know what to research, to the moment you submit.</p>
    </div>
    <div className="stagger grid-4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
      {WORKFLOW_CARDS.map((c,i)=>(
        <Link key={i} to={c.to} style={{textDecoration:'none'}}>
          <TiltCard style={{background:'var(--bg)',border:'1px solid var(--line)',borderRadius:18,padding:'28px 24px',position:'relative',overflow:'hidden',transition:'box-shadow 0.3s',height:'100%'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <span style={{fontFamily:'var(--mono)',fontSize:11,color:'#6B6F68',padding:'4px 10px',background:'rgba(45,122,69,0.08)',borderRadius:999}}>STEP {c.step}</span>
              <span style={{fontSize:26}}>{c.icon}</span>
            </div>
            <div style={{fontSize:22,fontWeight:700,letterSpacing:'-0.02em',marginBottom:4}}>{c.title}</div>
            <div style={{fontFamily:'var(--mono)',fontSize:11,color:'#2D7A45',marginBottom:12,fontWeight:600,letterSpacing:'0.02em'}}>{c.sub}</div>
            <p style={{fontFamily:'var(--serif)',fontSize:14,lineHeight:1.5,color:'#6B6F68'}}>{c.desc}</p>
            {i<3&&(<div style={{position:'absolute',right:-16,top:'50%',transform:'translateY(-50%)',zIndex:5,width:32,height:32,background:'white',borderRadius:999,border:'1px solid var(--line)',display:'grid',placeItems:'center',boxShadow:'0 2px 8px rgba(15,20,16,0.08)',fontSize:14}}>→</div>)}
          </TiltCard>
        </Link>
      ))}
    </div>
  </SectionWrap>
);

/* ── § 02 LiveDemo ── */
const LiveDemo=()=>{
  const[step,setStep]=useState(0);
  const steps=[{n:'01',label:'Upload',desc:'Paste your Excel data or upload a CSV file.'},{n:'02',label:'Choose Method',desc:'Pick from 27 validated statistical methods.'},{n:'03',label:'Run Analysis',desc:'Results computed in under 0.5 seconds.'},{n:'04',label:'Interpret & Export',desc:'AI explains results. Download formatted table.'}];
  useEffect(()=>{const t=setInterval(()=>setStep(s=>(s+1)%4),2500);return()=>clearInterval(t);},[]);
  return(
    <SectionWrap id="demo" bg="var(--bg)">
      <Label n={2} text="LIVE DEMO"/>
      <h2 style={{fontSize:'clamp(36px,3.8vw,56px)',fontWeight:700,letterSpacing:'-0.03em',lineHeight:1.05,marginBottom:56,maxWidth:640}}>From Raw Data to Meaningful Results <span style={{fontFamily:'var(--serif)',fontStyle:'italic',fontWeight:400}}>in 4 Steps.</span></h2>
      <div className="grid-2-narrow" style={{display:'grid',gridTemplateColumns:'1fr 1.4fr',gap:48,alignItems:'start'}}>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          {steps.map((s,i)=>(
            <div key={i} onClick={()=>setStep(i)} style={{padding:'20px 24px',borderRadius:14,cursor:'pointer',background:step===i?'white':'transparent',border:step===i?'1px solid var(--line)':'1px solid transparent',boxShadow:step===i?'0 4px 20px rgba(15,20,16,0.07)':'none',transition:'all 0.25s',display:'flex',gap:16,alignItems:'flex-start'}}>
              <div style={{width:36,height:36,borderRadius:999,flexShrink:0,background:step===i?'linear-gradient(135deg,#2D7A45,#1A3D2E)':'var(--line)',display:'grid',placeItems:'center',color:step===i?'white':'#6B6F68',fontFamily:'var(--mono)',fontSize:11,fontWeight:600,transition:'all 0.25s'}}>{s.n}</div>
              <div><div style={{fontSize:16,fontWeight:600,marginBottom:4,color:step===i?'#0F1410':'#6B6F68',transition:'color 0.25s'}}>{s.label}</div><div style={{fontSize:13,color:'#6B6F68',lineHeight:1.45,opacity:step===i?1:0.6,fontFamily:'var(--serif)'}}>{s.desc}</div></div>
            </div>
          ))}
        </div>
        <div style={{background:'white',borderRadius:18,overflow:'hidden',border:'1px solid var(--line)',boxShadow:'0 20px 60px rgba(15,20,16,0.1)'}}>
          <div style={{padding:'12px 16px',background:'#f0ede6',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',gap:12}}>
            <div style={{display:'flex',gap:6}}>{['#ff6b6b','#ffd93d','#6bcb77'].map(c=>(<div key={c} style={{width:10,height:10,borderRadius:999,background:c}}/>))}</div>
            <div style={{flex:1,background:'white',borderRadius:6,padding:'5px 12px',fontSize:11,fontFamily:'var(--mono)',color:'#6B6F68',border:'1px solid var(--line)'}}>khetlab.com/analyze</div>
          </div>
          <div style={{padding:24,minHeight:320}}>
            {step===0&&(<div><div style={{fontFamily:'var(--mono)',fontSize:10,color:'#6B6F68',marginBottom:12,letterSpacing:'0.1em'}}>DATA INPUT</div><div style={{background:'#f8f6f0',borderRadius:8,padding:16,fontFamily:'var(--mono)',fontSize:12,lineHeight:1.7,color:'#2A2F2A',border:'1px solid var(--line)'}}><div style={{color:'#6B6F68',marginBottom:8}}>Treatment &nbsp; Rep1 &nbsp; Rep2 &nbsp; Rep3</div>{[['T1','42.3','43.8','41.9'],['T2','48.2','49.6','47.5'],['T3','52.1','53.4','51.8']].map((r,i)=>(<div key={i} style={{background:i%2===0?'rgba(45,122,69,0.05)':'transparent',padding:'2px 4px',borderRadius:4}}>{r.join('    ')}</div>))}</div><div style={{marginTop:12,padding:'8px 14px',background:'rgba(45,122,69,0.07)',borderRadius:8,fontFamily:'var(--mono)',fontSize:11,color:'#2D7A45'}}>✓ 3 treatments × 3 replications detected</div></div>)}
            {step===1&&(<div><div style={{fontFamily:'var(--mono)',fontSize:10,color:'#6B6F68',marginBottom:12,letterSpacing:'0.1em'}}>SELECT METHOD</div>{[['One Factor RBD','★ Best match for your data'],['Two Factor Split-plot',''],['Latin Square','']].map(([m,note],i)=>(<div key={i} style={{padding:'12px 16px',borderRadius:10,marginBottom:6,background:i===0?'linear-gradient(135deg,rgba(45,122,69,0.1),rgba(124,191,107,0.07))':'transparent',border:i===0?'1px solid rgba(45,122,69,0.3)':'1px solid var(--line)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:14,fontWeight:i===0?600:400,color:i===0?'#1A3D2E':'#6B6F68'}}>{m}</span>{note&&<span style={{fontFamily:'var(--mono)',fontSize:10,color:'#2D7A45'}}>{note}</span>}</div>))}</div>)}
            {step===2&&(<div><div style={{fontFamily:'var(--mono)',fontSize:10,color:'#6B6F68',marginBottom:12,letterSpacing:'0.1em'}}>ANOVA OUTPUT</div><table style={{width:'100%',borderCollapse:'collapse',fontSize:12,fontFamily:'var(--mono)'}}><thead><tr style={{borderBottom:'1px solid #0F1410'}}>{['Source','df','MS','F','p'].map(h=>(<th key={h} style={{textAlign:'left',padding:'6px 8px',fontSize:10}}>{h}</th>))}</tr></thead><tbody>{[['Replication','2','0.21','0.82','0.47'],['Treatment','2','218.7','42.83','<0.001 ✦'],['Error','4','5.10','—','—']].map((r,i)=>(<tr key={i} style={{borderBottom:'1px solid #f0ede6'}}>{r.map((c,j)=>(<td key={j} style={{padding:'8px 8px',fontWeight:j===0?600:400,color:c.includes('0.001')?'#2D7A45':'inherit'}}>{c}</td>))}</tr>))}</tbody></table><div style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>{[['Grand Mean','47.9'],['CV %','2.36'],['CD (5%)','±2.12']].map(([k,v])=>(<div key={k} style={{padding:10,background:'#f8f6f0',borderRadius:8}}><div style={{fontFamily:'var(--mono)',fontSize:9,color:'#6B6F68'}}>{k}</div><div style={{fontSize:16,fontWeight:600,marginTop:3}}>{v}</div></div>))}</div></div>)}
            {step===3&&(<div><div style={{fontFamily:'var(--mono)',fontSize:10,color:'#6B6F68',marginBottom:12,letterSpacing:'0.1em'}}>AI INTERPRETATION</div><div style={{padding:16,background:'linear-gradient(135deg,rgba(45,122,69,0.06),rgba(212,165,116,0.06))',borderRadius:12,border:'1px solid rgba(45,122,69,0.15)',fontFamily:'var(--serif)',fontSize:14,lineHeight:1.65,color:'#2A2F2A',fontStyle:'italic',marginBottom:16}}>"The analysis of variance revealed a highly significant difference among treatments (F = 42.83, p &lt; 0.001). Treatment T3 recorded the highest mean (52.4), which was significantly superior to T1 (42.7) based on CD at 5%."</div><Link to="/tool/onefactor" style={{padding:'10px 18px',background:'linear-gradient(135deg,#2D7A45,#1A3D2E)',borderRadius:999,color:'white',fontSize:13,fontWeight:600,fontFamily:'var(--display)',display:'inline-flex',alignItems:'center',gap:8,textDecoration:'none'}}>↓ Download Table (.docx)</Link></div>)}
          </div>
        </div>
      </div>
    </SectionWrap>
  );
};

/* ── § 03 Methods ── */
const DOMAINS=[
  {id:'descriptive',number:'01',title:'Descriptive Statistics',short:'Descriptive',subtitle:'Summarize, explore, and describe data distributions.',tools:[{id:'frequency',name:'Frequency Table',desc:'Summarize value occurrences in a dataset',tag:'Summary'},{id:'crosstab',name:'Cross Tabulation',desc:'Analyze relationships between categorical variables',tag:'Categorical'},{id:'means',name:'Comparing Means',desc:'Hypothesis testing across groups',tag:'Inference'},{id:'correlation',name:'Correlation Analysis',desc:'Strength and direction between variables',tag:'Relational'},{id:'regression',name:'Regression Analysis',desc:'Model dependent and independent variables',tag:'Modeling'}]},
  {id:'doe',number:'02',title:'Design of Experiments',short:'Experiments',subtitle:'Structured, rigorous experimental analysis layouts.',tools:[{id:'layouts',name:'Randomization & Layouts',desc:'Generate experimental field plans',tag:'Layout'},{id:'onefactor',name:'One Factor (CRD, RBD)',desc:'Single-factor experimental analysis',tag:'ANOVA'},{id:'twofactor',name:'Two Factors (Split-plot)',desc:'Two-factor split-plot evaluation',tag:'ANOVA'},{id:'threefactor',name:'Three Factors',desc:'CRD, RBD, split-split plot designs',tag:'ANOVA'},{id:'latin',name:'Latin Square',desc:'Control variability in single-treatment trials',tag:'Design'},{id:'strip',name:'Strip Plot',desc:'Structured multi-factor layout',tag:'Design'},{id:'mulcomp',name:'Multiple Comparison Tests',desc:'Post-hoc mean separation tests',tag:'Post-hoc'},{id:'pooled',name:'Pooled Analysis (RBD)',desc:'Combine data across environments',tag:'Pooled'},{id:'splitenv',name:'Two-Factor over Environments',desc:'Pooled two-factor designs',tag:'Pooled'}]},
  {id:'biometrical',number:'03',title:'Biometrical Methods',short:'Biometrical',subtitle:'Quantitative genetics and plant breeding tools.',tools:[{id:'genmean',name:'Generation Means',desc:'Mean performance in breeding studies',tag:'Breeding'},{id:'path',name:'Path Analysis',desc:'Direct and indirect effects',tag:'Relational'},{id:'diallel',name:'Diallel Analysis',desc:'Breeding value through genetic crosses',tag:'Genetics'},{id:'partialdial',name:'Partial Diallel',desc:'Incomplete diallel crossing',tag:'Genetics'},{id:'stability',name:'Stability Analysis',desc:'Performance across environments',tag:'GxE'},{id:'linetester',name:'Line × Tester',desc:'Combining ability estimation',tag:'Breeding'},{id:'augmented',name:'Augmented Designs',desc:'Analysis of unbalanced experiments',tag:'Design'},{id:'lattice',name:'Balanced Lattice',desc:'Efficient designs for comparative trials',tag:'Design'},{id:'pbibd',name:'Alpha Lattice (PBIB)',desc:'Partially balanced incomplete blocks',tag:'Design'},{id:'ttc',name:'Triple Test Cross',desc:'Genetic inheritance exploration',tag:'Genetics'}]},
  {id:'multivariate',number:'04',title:'Multivariate Analysis',short:'Multivariate',subtitle:'Dimensionality reduction and classification.',tools:[{id:'pca',name:'Principal Component Analysis',desc:'Reduce dimensionality, preserve variance',tag:'Reduction'},{id:'kmean',name:'K-Mean Cluster Analysis',desc:'Classify data into distinct clusters',tag:'Clustering'},{id:'probit',name:'Probit Analysis',desc:'Model binary response data',tag:'Modeling'}]},
];
const ToolMiniCard=({tool,hovered,onEnter,onLeave})=>(<Link to={`/tool/${tool.id}`} onMouseEnter={onEnter} onMouseLeave={onLeave} style={{textDecoration:'none',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'20px 22px',minHeight:120,transition:'background 0.2s, color 0.2s',background:hovered?'#0F1410':'transparent',color:hovered?'var(--paper)':'#0F1410',borderRight:'1px solid var(--line)',borderBottom:'1px solid var(--line)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:14}}><span style={{fontSize:12,fontWeight:600,lineHeight:1.25}}>{tool.name}</span><span style={{padding:'3px 9px',borderRadius:999,fontSize:9,fontFamily:'var(--mono)',fontWeight:500,border:hovered?'1px solid rgba(245,241,232,0.3)':'1px solid var(--line)',color:hovered?'var(--paper)':'#6B6F68',whiteSpace:'nowrap',flexShrink:0,marginLeft:8}}>{tool.tag}</span></div><div style={{fontSize:12,lineHeight:1.4,color:hovered?'rgba(245,241,232,0.7)':'#6B6F68'}}>{tool.desc}</div></Link>);
const Methods=()=>{
  const[active,setActive]=useState('descriptive');const[hoverIdx,setHoverIdx]=useState(null);const cat=DOMAINS.find(d=>d.id===active);
  return(
    <SectionWrap id="methods" bg="var(--paper)">
      <Label n={3} text="THE TOOLKIT"/>
      <div className="grid-2-end" style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:64,alignItems:'end',marginBottom:56}}>
        <h2 style={{fontSize:'clamp(36px,4vw,56px)',fontWeight:700,letterSpacing:'-0.035em',lineHeight:1,color:'#0F1410'}}>Twenty-seven methods,<br/><span style={{fontFamily:'var(--serif)',fontStyle:'italic',fontWeight:400}}>one disciplined toolkit.</span></h2>
        <p style={{fontFamily:'var(--serif)',fontSize:16,lineHeight:1.55,color:'#6B6F68'}}>Every analysis is reproducible, documented, and exportable. Choose a family to browse its methods.</p>
      </div>
      <div style={{display:'flex',justifyContent:'center',marginBottom:56}}>
        <div style={{display:'inline-flex',padding:5,background:'var(--bg)',border:'1px solid var(--line)',borderRadius:999}}>
          {DOMAINS.map(d=>(<button key={d.id} onClick={()=>setActive(d.id)} style={{padding:'10px 22px',borderRadius:999,border:'none',cursor:'pointer',fontFamily:'var(--display)',fontSize:14,fontWeight:500,background:active===d.id?'#0F1410':'transparent',color:active===d.id?'var(--paper)':'#0F1410',transition:'background 0.2s, color 0.2s'}}>{d.short}</button>))}
        </div>
      </div>
      <div className="grid-2-narrow" style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:48,alignItems:'start'}}>
        <div>
          <div style={{fontFamily:'var(--mono)',fontSize:12,color:'#6B6F68',letterSpacing:'0.1em',marginBottom:18}}>PART {cat.number} / 04</div>
          <h3 style={{fontSize:36,fontWeight:700,letterSpacing:'-0.025em',lineHeight:1.05,marginBottom:16,color:'#0F1410'}}>{cat.title}</h3>
          <p style={{fontFamily:'var(--serif)',fontSize:16,lineHeight:1.55,color:'#2A2F2A',marginBottom:22,maxWidth:320}}>{cat.subtitle}</p>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'7px 14px',background:'rgba(45,122,69,0.1)',borderRadius:999,fontSize:12,color:'#2D7A45',fontWeight:600,fontFamily:'var(--mono)',letterSpacing:'0.05em'}}><span style={{width:6,height:6,borderRadius:999,background:'#2D7A45',display:'inline-block'}}/>{cat.tools.length} METHODS</div>
        </div>
        <div className="grid-tools" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',borderTop:'1px solid var(--line)',borderLeft:'1px solid var(--line)',borderRadius:12,overflow:'hidden',background:'white'}}>
          {cat.tools.map((t,i)=>(<ToolMiniCard key={t.id} tool={t} hovered={hoverIdx===i} onEnter={()=>setHoverIdx(i)} onLeave={()=>setHoverIdx(null)}/>))}
        </div>
      </div>
    </SectionWrap>
  );
};

/* ── § 04 AI Tools (exact from zip) ── */
const AI_TOOLS=[
  {icon:'💡',title:'Thesis Topic Finder',        tag:'GPT-4o + Semantic Scholar',to:'/thesis-topics', desc:'10 viable topics with gap analysis, keywords, and seed papers — generated for your specialization.'},
  {icon:'📑',title:'Literature Review Generator', tag:'PDF.js + Claude',          to:'/research',      desc:'Drop your PDFs. Get a structured, 2,000-word literature review ready to paste into Chapter 2.'},
  {icon:'🎯',title:'Student Opportunity Hub',   tag:'PUNJAB · JOBS · EXAMS',     to:'/student-hub',   desc:'Latest private jobs, government posts & agriculture exams for Punjab students. AI-powered.'},
  {icon:'✍️',title:'Results Composer',            tag:'Template + AI',            to:'/thesis',        desc:'Paste your ANOVA output. Receive publication-ready prose for your Results & Discussion section.'},
  {icon:'🔍',title:'Methodology Wizard',          tag:'Decision Tree Engine',      to:'/thesis',        desc:'Answer 3 questions about your data. Get the exact statistical test, with justification.'},
  {icon:'📚',title:'Reference Generator 2.0',     tag:'CrossRef + DOAJ',           to:'/citations',     desc:'Drag your PDFs. Auto-format citations in APA, MLA, Chicago, or Vancouver instantly.'},
];
const AiTools=()=>(
  <SectionWrap id="ai" bg="var(--paper)">
    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
      <Label n={4} text="AI POWERED"/>
      <span style={{fontFamily:'var(--mono)',fontSize:10,padding:'3px 10px',background:'linear-gradient(135deg,#2D7A45,#7CBF6B)',color:'white',borderRadius:999,letterSpacing:'0.08em',fontWeight:600,marginBottom:16}}>✦ JUST ADDED</span>
    </div>
    <div className="grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:56,alignItems:'end'}}>
      <h2 style={{fontSize:'clamp(34px,3.8vw,54px)',fontWeight:700,letterSpacing:'-0.03em',lineHeight:1.05}}>Research Accelerated<br/><span style={{fontFamily:'var(--serif)',fontStyle:'italic',fontWeight:400}}>by Intelligence.</span></h2>
      <p style={{fontFamily:'var(--serif)',fontSize:17,lineHeight:1.6,color:'#2A2F2A'}}>We just added AI into these tools. They don't just analyze — <em>they think alongside you</em>. Powered by GPT-4o, Claude, and local AI.</p>
    </div>
    <div className="stagger grid-3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
      {AI_TOOLS.map((t,i)=>(
        <Link key={i} to={t.to} style={{textDecoration:'none'}}>
          <TiltCard style={{background:'white',border:'1px solid var(--line)',borderRadius:18,padding:'28px 24px',cursor:'pointer',position:'relative',overflow:'hidden',transition:'box-shadow 0.3s',height:'100%'}}>
            <div style={{position:'absolute',inset:0,borderRadius:18,background:'linear-gradient(135deg,rgba(45,122,69,0.06),rgba(212,165,116,0.06))',opacity:0,transition:'opacity 0.3s',pointerEvents:'none'}}/>
            <div style={{fontSize:32,marginBottom:14}}>{t.icon}</div>
            <div style={{fontFamily:'var(--mono)',fontSize:9,color:'#2D7A45',letterSpacing:'0.1em',fontWeight:600,marginBottom:8,background:'rgba(45,122,69,0.08)',padding:'3px 10px',borderRadius:999,display:'inline-block'}}>{t.tag}</div>
            <div style={{fontSize:18,fontWeight:700,letterSpacing:'-0.01em',marginBottom:10}}>{t.title}</div>
            <p style={{fontFamily:'var(--serif)',fontSize:14,lineHeight:1.55,color:'#6B6F68'}}>{t.desc}</p>
            <div style={{marginTop:18,display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:600,color:'#2D7A45',fontFamily:'var(--mono)'}}>Try it free →</div>
          </TiltCard>
        </Link>
      ))}
    </div>
  </SectionWrap>
);

/* ── § 05 Testimonials ── */
const TESTIMONIALS=[
  {name:'Gursagar Singh',role:'M.Sc Horticulture',uni:'CCS HAU',avatar:'GS',quote:"I built KhetLab because I couldn't afford SPSS. Every student deserves the same tools — regardless of their university's budget."},
  {name:'Dr. A. Kumar',role:'Assistant Professor',uni:'PAU',avatar:'AK',quote:'I recommend KhetLab to all my MSc students for their thesis work. The ANOVA and diallel analysis tools are accurate and the interface is clean.'},
  {name:'Priya R.',role:'MSc Student',uni:'IARI',avatar:'PR',quote:'I submitted my thesis last month. The AI Results Composer saved me 2 weeks of writing. I wish I had found this in my first year.'},
];
const Testimonials=()=>(
  <SectionWrap id="testimonials" bg="var(--bg)">
    <Label n={5} text="TESTIMONIALS"/>
    <h2 style={{fontSize:'clamp(34px,3.8vw,52px)',fontWeight:700,letterSpacing:'-0.03em',marginBottom:48,lineHeight:1.05}}>Trusted by Students<br/><span style={{fontFamily:'var(--serif)',fontStyle:'italic',fontWeight:400}}>Worldwide.</span></h2>
    <div className="stagger grid-3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
      {TESTIMONIALS.map((t,i)=>(
        <div key={i} style={{background:'var(--paper)',borderRadius:18,padding:'32px 28px',border:'1px solid var(--line)',position:'relative'}}>
          <div style={{fontSize:48,color:'#2D7A45',lineHeight:1,marginBottom:16,fontFamily:'Georgia,serif',opacity:0.25}}>"</div>
          <p style={{fontFamily:'var(--serif)',fontSize:16,lineHeight:1.65,color:'#2A2F2A',marginBottom:24,fontStyle:'italic'}}>{t.quote}</p>
          <div style={{display:'flex',alignItems:'center',gap:12,borderTop:'1px solid var(--line)',paddingTop:20}}>
            <div style={{width:44,height:44,borderRadius:999,flexShrink:0,background:'linear-gradient(135deg,#2D7A45,#1A3D2E)',display:'grid',placeItems:'center',color:'white',fontSize:14,fontWeight:700}}>{t.avatar}</div>
            <div><div style={{fontSize:15,fontWeight:600}}>{t.name}</div><div style={{fontSize:12,color:'#6B6F68'}}>{t.role} · {t.uni}</div></div>
          </div>
        </div>
      ))}
    </div>
  </SectionWrap>
);

/* ── § 06 Coming Soon ── */
const COMING=[
  {icon:'🏫',title:'Course Mode',       desc:'Professors assign datasets, auto-grading for student submissions.'},
  {icon:'🔗',title:'Collaboration Mode',desc:'Share read-only result links with supervisors and reviewers.'},
  {icon:'🌾',title:'Domain Templates',  desc:'Pre-built workflows for wheat breeding, dairy, soil chemistry.'},
  {icon:'🕸️',title:'Citation Network',  desc:'Force-directed paper relationship graph for literature mapping.'},
  {icon:'💻',title:'Offline PWA',       desc:'Desktop app that works with zero internet — for rural universities.'},
  {icon:'✅',title:'AI Proofreader',    desc:'Grammar and clarity checks tailored for academic thesis writing.'},
];
const ComingSoon=()=>(
  <SectionWrap id="coming-soon" bg="var(--paper)">
    <Label n={6} text="COMING SOON"/>
    <h2 style={{fontSize:'clamp(34px,3.8vw,52px)',fontWeight:700,letterSpacing:'-0.03em',marginBottom:48,lineHeight:1.05}}>What's Next for<br/><span className="grad-text">KhetLab.</span></h2>
    <div className="stagger grid-3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
      {COMING.map((c,i)=>(
        <div key={i} style={{border:'2px dashed var(--line)',borderRadius:18,padding:'28px 24px',position:'relative',background:'rgba(251,248,241,0.5)',opacity:0.8}}>
          <div style={{position:'absolute',top:16,right:16,fontFamily:'var(--mono)',fontSize:9,color:'#D4A574',background:'rgba(212,165,116,0.12)',padding:'3px 10px',borderRadius:999,fontWeight:600,letterSpacing:'0.06em',border:'1px solid rgba(212,165,116,0.3)'}}>COMING SOON</div>
          <div style={{fontSize:28,marginBottom:12}}>{c.icon}</div>
          <div style={{fontSize:17,fontWeight:600,marginBottom:8,color:'#0F1410'}}>{c.title}</div>
          <p style={{fontFamily:'var(--serif)',fontSize:13,lineHeight:1.55,color:'#6B6F68'}}>{c.desc}</p>
        </div>
      ))}
    </div>
  </SectionWrap>
);

/* ── § 07 CTA Banner (banner-dark.jpg) ── */
const CtaBanner=()=>(
  <section className="reveal" style={{position:'relative',overflow:'hidden',minHeight:480,display:'flex',alignItems:'center'}}>
    <div style={{position:'absolute',inset:0,backgroundImage:'url(/banner-dark.jpg)',backgroundSize:'cover',backgroundPosition:'center'}}/>
    <div style={{position:'absolute',inset:0,background:'linear-gradient(100deg, rgba(26,61,46,0.95) 45%, rgba(26,61,46,0.7) 100%)'}}/>
    <div className="grid-2-cta" style={{position:'relative',zIndex:2,maxWidth:1320,margin:'0 auto',padding:'80px 40px',width:'100%',display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:64,alignItems:'center'}}>
      <div>
        <h2 style={{fontSize:'clamp(38px,5vw,68px)',fontWeight:800,letterSpacing:'-0.04em',lineHeight:0.95,color:'white',marginBottom:20}}>Built by a student.<br/><span style={{fontFamily:'var(--serif)',fontStyle:'italic',fontWeight:300,color:'#7CBF6B'}}>For every student.</span></h2>
        <p style={{fontFamily:'var(--serif)',fontSize:18,lineHeight:1.6,color:'rgba(255,255,255,0.75)',maxWidth:480,marginBottom:32}}>"I couldn't afford SPSS. I didn't want anyone else to face that barrier."</p>
        <div style={{display:'inline-flex',alignItems:'center',gap:14,padding:'14px 20px',background:'rgba(255,255,255,0.08)',borderRadius:14,border:'1px solid rgba(255,255,255,0.15)',backdropFilter:'blur(12px)',marginBottom:36}}>
          <div style={{width:48,height:48,borderRadius:999,flexShrink:0,background:'linear-gradient(135deg,#2D7A45,#7CBF6B)',display:'grid',placeItems:'center',color:'white',fontSize:16,fontWeight:700}}>GS</div>
          <div><div style={{color:'white',fontWeight:600,fontSize:15}}>Gursagar Singh</div><div style={{color:'rgba(255,255,255,0.6)',fontSize:12,fontFamily:'var(--serif)',fontStyle:'italic'}}>M.Sc Horticulture — Made this for students 🌾</div></div>
        </div>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <Link to="/tool/onefactor" style={{padding:'14px 26px',background:'linear-gradient(135deg,#2D7A45,#7CBF6B)',border:'none',borderRadius:999,fontSize:15,fontWeight:600,color:'white',cursor:'pointer',fontFamily:'var(--display)',textDecoration:'none',boxShadow:'0 6px 24px rgba(45,122,69,0.5)'}}>Get Started for Free →</Link>
          <Link to="/thesis-topics" style={{padding:'14px 26px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:999,fontSize:15,fontWeight:600,color:'white',cursor:'pointer',fontFamily:'var(--display)',backdropFilter:'blur(8px)',textDecoration:'none'}}>▶ Watch Demo</Link>
        </div>
      </div>
      <div className="stat-grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {[['25,000+','Students helped'],['27+','Statistical methods'],['100%','Free forever'],['0s','Setup time']].map(([n,l])=>(
          <div key={l} style={{padding:'24px 20px',background:'rgba(255,255,255,0.07)',borderRadius:14,border:'1px solid rgba(255,255,255,0.1)',backdropFilter:'blur(8px)'}}>
            <div style={{fontSize:36,fontWeight:700,color:'#7CBF6B',letterSpacing:'-0.03em',lineHeight:1,marginBottom:6}}>{n}</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.65)',fontFamily:'var(--serif)'}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── § 08 Footer (exact from zip) ── */
const Footer=()=>(
  <footer style={{background:'#0F1410',color:'white',padding:'72px clamp(18px,4vw,40px) 32px'}}>
    <div style={{maxWidth:1320,margin:'0 auto'}}>
      <div className="footer-grid" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',gap:40,marginBottom:56}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
            <img className="brand-logo-img footer" src="/khetlab-logo-header.svg" alt="KhetLab" width="760" height="220" />
          </div>
          <p style={{fontFamily:'var(--serif)',fontSize:14,lineHeight:1.6,color:'rgba(255,255,255,0.55)',maxWidth:280,marginBottom:20}}>A 100% free, browser-based statistical analysis and thesis toolkit for agriculture students worldwide.</p>
          <div style={{display:'flex',gap:10}}>{['𝕏','in','▶'].map(s=>(<div key={s} style={{width:34,height:34,borderRadius:8,background:'rgba(255,255,255,0.08)',display:'grid',placeItems:'center',fontSize:13,cursor:'pointer',border:'1px solid rgba(255,255,255,0.1)'}}>{s}</div>))}</div>
        </div>
        {[
          {h:'Methods',      items:[{t:'Descriptive Stats',     to:'/tool/frequency'},{t:'Design of Experiments',to:'/tool/onefactor'},{t:'Biometrical Methods',to:'/tool/diallel'},{t:'Multivariate Analysis',to:'/tool/pca'}]},
          {h:'Research Tools',items:[{t:'Thesis Topic Finder',  to:'/thesis-topics'},{t:'Literature Review',to:'/research'},{t:'Methodology Wizard',to:'/thesis'},{t:'Smart Data Cleaner',to:'/'}]},
          {h:'Resources',    items:[{t:'Documentation',         to:'/resources'},{t:'Video Guides',to:'/resources'},{t:'Sample Datasets',to:'/resources'},{t:'Citation Guide',to:'/citations'}]},
          {h:'Support',      items:[{t:'Contact Us',             to:'/'},{t:'Report a Bug',to:'/'},{t:'Feature Request',to:'/'},{t:'About the Author',to:'/'}]},
        ].map(col=>(
          <div key={col.h}>
            <div style={{fontFamily:'var(--mono)',fontSize:10,letterSpacing:'0.12em',color:'rgba(255,255,255,0.4)',marginBottom:16}}>{col.h.toUpperCase()}</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {col.items.map(it=>(<Link key={it.t} to={it.to} style={{color:'rgba(255,255,255,0.6)',textDecoration:'none',fontSize:14,transition:'color 0.15s'}} onMouseEnter={e=>e.target.style.color='#7CBF6B'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.6)'}>{it.t}</Link>))}
            </div>
          </div>
        ))}
      </div>
      <div className="footer-bottom" style={{borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:28,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',alignItems:'center'}}>
        <div style={{fontFamily:'var(--mono)',fontSize:11,color:'rgba(255,255,255,0.3)'}}>© 2024 KhetLab</div>
        <div style={{textAlign:'center',fontFamily:'var(--serif)',fontSize:13,color:'rgba(255,255,255,0.5)',fontStyle:'italic'}}>Gursagar Singh, M.Sc Horticulture — Made this website for the students help 🌾</div>
        <div style={{textAlign:'right',display:'flex',gap:20,justifyContent:'flex-end',fontFamily:'var(--mono)',fontSize:11,color:'rgba(255,255,255,0.3)'}}>
          <a href="#" style={{color:'inherit',textDecoration:'none'}}>Privacy</a>
          <a href="#" style={{color:'inherit',textDecoration:'none'}}>Terms</a>
        </div>
      </div>
    </div>
  </footer>
);

/* ── Root export ── */
export default function LandingPage(){
  useScrollReveal();
  useEffect(()=>{injectCSS();},[]);
  return(
    <div style={{background:'var(--bg)',color:'var(--ink)',fontFamily:'var(--display)',WebkitFontSmoothing:'antialiased'}}>
      <Nav/>
      <Hero/>
      <Workflow/>
      <LiveDemo/>
      <Methods/>
      <AiTools/>
      <Testimonials/>
      <ComingSoon/>
      <CtaBanner/>
      <Footer/>
    </div>
  );
}
