// AppNav.jsx — sticky nav shown on all non-landing pages
// Menu: Statistical Methods | Student Hub | Thesis Helper | Resume Builder
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import NavSearch from './GlobalSearch';

const NAV_CSS = `
  .appnav-root{position:fixed;top:0;left:0;right:0;z-index:9000;transition:background 0.25s ease,border-color 0.25s ease}
  .appnav-root.scrolled{background:rgba(245,241,232,0.97);border-bottom:1px solid #DDD8CB;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
  .appnav-root.top{background:rgba(245,241,232,0.82);border-bottom:1px solid transparent;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
  .brand-logo-link{display:flex;align-items:center;flex:0 0 auto;text-decoration:none;min-width:0}
  .brand-text{font-family:'Inter Tight',sans-serif;font-size:30px;letter-spacing:-0.03em;line-height:1;white-space:nowrap}
  .brand-text .khet{font-weight:800;color:#1A5C2A}
  .brand-text .lab{font-weight:400;color:#2A2F2A}
  .appnav-desktop{display:flex}
  .appnav-hamburger{display:none}
  @keyframes appnav-fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes appnav-slideIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
  .appnav-mega{animation:appnav-fadeIn 0.18s ease}
  .appnav-drawer{animation:appnav-slideIn 0.22s cubic-bezier(.22,.68,0,1.2)}
  .appnav-no-scroll{overflow:hidden!important;height:100%!important}
  @media(max-width:860px){
    .appnav-desktop{display:none!important}
    .appnav-hamburger{display:flex!important}
    .brand-text{font-size:26px}
  }
  @media(max-width:600px){
    .appnav-root .appnav-inner{padding:0 16px!important}
    .brand-text{font-size:24px}
  }
  @media(max-width:380px){
    .brand-text{font-size:22px}
  }
`;

// ═══ STAT TOOL CATEGORIES (used by mega-menu) ═══
const STAT_CATEGORIES = [
  {id:'descriptive',number:'01',title:'Descriptive Statistics',subtitle:'Summarize, explore, and describe data.',
   tools:[{name:'Frequency Table',desc:'Summarize value occurrences',tag:'Summary',id:'frequency'},{name:'Cross Tabulation',desc:'Categorical relationships',tag:'Categorical',id:'crosstab'},{name:'Comparing Means',desc:'Hypothesis testing across groups',tag:'Inference',id:'means'},{name:'Correlation Analysis',desc:'Strength & direction between variables',tag:'Relational',id:'correlation'},{name:'Regression Analysis',desc:'Model dependent vs. independent',tag:'Modeling',id:'regression'}]},
  {id:'doe',number:'02',title:'Design of Experiments',subtitle:'Rigorous experimental layouts.',
   tools:[{name:'Randomization & Layouts',desc:'Generate experimental field plans',tag:'Layout',id:'layouts'},{name:'One Factor (CRD, RBD)',desc:'Single-factor analysis',tag:'ANOVA',id:'onefactor'},{name:'Two Factors (Split-plot)',desc:'Two-factor evaluation',tag:'ANOVA',id:'twofactor'},{name:'Three Factors',desc:'CRD, RBD, split-split designs',tag:'ANOVA',id:'threefactor'},{name:'Latin Square',desc:'Variability control trials',tag:'Design',id:'latin'},{name:'Strip Plot',desc:'Multi-factor structured layout',tag:'Design',id:'strip'},{name:'Multiple Comparison Tests',desc:'Post-hoc separation tests',tag:'Post-hoc',id:'mulcomp'},{name:'Pooled Analysis (RBD)',desc:'Combine data across env.',tag:'Pooled',id:'pooled'},{name:'Two-Factor over Environments',desc:'Pooled two-factor designs',tag:'Pooled',id:'splitenv'}]},
  {id:'biometrical',number:'03',title:'Biometrical Methods',subtitle:'Quantitative genetics & breeding.',
   tools:[{name:'Generation Means',desc:'Mean performance in breeding',tag:'Breeding',id:'genmean'},{name:'Path Analysis',desc:'Direct & indirect effects',tag:'Relational',id:'path'},{name:'Diallel Analysis',desc:'Breeding value via crosses',tag:'Genetics',id:'diallel'},{name:'Partial Diallel',desc:'Incomplete diallel crossing',tag:'Genetics',id:'partialdial'},{name:'Stability Analysis',desc:'Performance across env.',tag:'GxE',id:'stability'},{name:'Line × Tester',desc:'Combining ability',tag:'Breeding',id:'linetester'},{name:'Augmented Designs',desc:'Unbalanced experiments',tag:'Design',id:'augmented'},{name:'Balanced Lattice',desc:'Efficient comparative trials',tag:'Design',id:'lattice'},{name:'Alpha Lattice (PBIB)',desc:'Partially balanced blocks',tag:'Design',id:'pbibd'},{name:'Triple Test Cross',desc:'Genetic inheritance',tag:'Genetics',id:'ttc'}]},
  {id:'multivariate',number:'04',title:'Multivariate Analysis',subtitle:'Reduction & classification.',
   tools:[{name:'Principal Component Analysis',desc:'Reduce dimensionality',tag:'Reduction',id:'pca'},{name:'K-Mean Cluster Analysis',desc:'Classify into clusters',tag:'Clustering',id:'kmean'},{name:'Probit Analysis',desc:'Model binary response',tag:'Modeling',id:'probit'}]},
];

const ALL_TOOLS_COUNT = STAT_CATEGORIES.reduce((s, c) => s + c.tools.length, 0);

// ═══ THESIS HELPER ITEMS ═══
const THESIS_ITEMS = [
  {name:'Thesis Topic Finder',desc:'AI-assisted topic generation',tag:'AI',link:'/thesis-topics'},
  {name:'Literature Review',desc:'Smart paper summarisation',tag:'AI',link:'/research'},
  {name:'Methodology Wizard',desc:'Pick the right design',tag:'AI',link:'/thesis'},
  {name:'Resources Hub',desc:'Documentation, guides & sample data',tag:'Docs',link:'/resources'},
  {name:'Citation Manager',desc:'Manage and format citations',tag:'Cite',link:'/citations'},
];

const TAG_COLORS = {Summary:'#6B6F68',Categorical:'#8E5A8E',Inference:'#2D7A45',Relational:'#A0772A',Modeling:'#4A6B8E',Layout:'#6B6F68',ANOVA:'#2D7A45',Design:'#8E5A8E','Post-hoc':'#A0772A',Pooled:'#4A6B8E',Breeding:'#2D7A45',Genetics:'#8E5A8E',GxE:'#A0772A',Reduction:'#4A6B8E',Clustering:'#2D7A45',AI:'#2D7A45',PUNJAB:'#92400E',Docs:'#6B6F68',Video:'#A0772A',Data:'#4A6B8E',Cite:'#8E5A8E'};

const TagBadge = ({ tag }) => {
  const c = TAG_COLORS[tag] || '#6B6F68';
  return <span style={{flexShrink:0,fontSize:10,fontFamily:"'IBM Plex Mono',monospace",fontWeight:500,padding:'3px 9px',borderRadius:999,border:`1px solid ${c}40`,color:c,background:`${c}10`,whiteSpace:'nowrap'}}>{tag}</span>;
};

// ═══ STATISTICAL METHODS MEGA-MENU ═══
const StatsMegaMenu = ({ onClose }) => (
  <div className="appnav-mega" style={{position:'absolute',top:'calc(100% + 8px)',left:'50%',transform:'translateX(-50%)',width:860,maxWidth:'calc(100vw - 40px)',background:'#FBF8F1',border:'1px solid #DDD8CB',borderRadius:16,padding:24,boxShadow:'0 28px 70px rgba(15,20,16,0.16)',zIndex:300}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:16,marginBottom:16,borderBottom:'1px solid #DDD8CB'}}>
      <div>
        <div style={{fontSize:19,fontWeight:700,color:'#0F1410',letterSpacing:'-0.02em'}}>Statistical Methods</div>
        <div style={{fontSize:12.5,color:'#6B6F68',fontFamily:"'Source Serif 4',Georgia,serif",marginTop:4}}>All analytical tools in one place</div>
      </div>
      <div style={{display:'inline-flex',alignItems:'center',gap:6,flexShrink:0,padding:'4px 10px',background:'rgba(45,122,69,0.1)',borderRadius:999,fontSize:11,color:'#2D7A45',fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>
        <span style={{width:5,height:5,borderRadius:999,background:'#2D7A45'}}/>{ALL_TOOLS_COUNT} METHODS
      </div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
      {STAT_CATEGORIES.map(cat => (
        <div key={cat.id}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#6B6F68',letterSpacing:'0.12em',marginBottom:8,paddingBottom:6,borderBottom:'1px solid #DDD8CB'}}>
            {cat.number} — {cat.title.toUpperCase()}
          </div>
          {cat.tools.map((t, i) => (
            <Link key={i} to={`/tool/${t.id}`} onClick={onClose}
              style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,padding:'7px 10px',borderRadius:8,textDecoration:'none',color:'inherit',transition:'background 0.15s'}}
              onMouseEnter={e => e.currentTarget.style.background='rgba(45,122,69,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:'#0F1410'}}>{t.name}</div>
                <div style={{fontSize:11,color:'#6B6F68',fontFamily:"'IBM Plex Mono',monospace",marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.desc}</div>
              </div>
              <TagBadge tag={t.tag}/>
            </Link>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// ═══ THESIS HELPER DROPDOWN ═══
const ThesisDropdown = ({ onClose }) => (
  <div className="appnav-mega" style={{position:'absolute',top:'calc(100% + 8px)',left:'50%',transform:'translateX(-50%)',width:380,maxWidth:'calc(100vw - 40px)',background:'#FBF8F1',border:'1px solid #DDD8CB',borderRadius:16,padding:16,boxShadow:'0 28px 70px rgba(15,20,16,0.16)',zIndex:300}}>
    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#6B6F68',letterSpacing:'0.12em',marginBottom:10,paddingBottom:8,borderBottom:'1px solid #DDD8CB'}}>THESIS & RESEARCH TOOLS</div>
    {THESIS_ITEMS.map((it, i) => (
      <Link key={i} to={it.link} onClick={onClose}
        style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,padding:'9px 10px',borderRadius:8,textDecoration:'none',color:'inherit',transition:'background 0.15s'}}
        onMouseEnter={e => e.currentTarget.style.background='rgba(45,122,69,0.07)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:600,color:'#0F1410'}}>{it.name}</div>
          <div style={{fontSize:11,color:'#6B6F68',fontFamily:"'IBM Plex Mono',monospace",marginTop:1}}>{it.desc}</div>
        </div>
        <TagBadge tag={it.tag}/>
      </Link>
    ))}
  </div>
);

// ═══ MOBILE DRAWER ═══
const MobileDrawer = ({ open, onClose }) => {
  const [view, setView] = useState('main');

  useEffect(() => {
    if (open) {
      document.body.classList.add('appnav-no-scroll');
    } else {
      document.body.classList.remove('appnav-no-scroll');
      setView('main');
    }
    return () => document.body.classList.remove('appnav-no-scroll');
  }, [open]);

  if (!open) return null;

  const renderHeader = (title, back) => (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px',borderBottom:'1px solid #DDD8CB',background:'#FBF8F1',flexShrink:0}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        {back ? (
          <button onClick={() => setView(back)} style={{width:38,height:38,background:'transparent',border:'1px solid #DDD8CB',borderRadius:999,cursor:'pointer',display:'grid',placeItems:'center',padding:0,WebkitTapHighlightColor:'transparent'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F1410" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6"/></svg>
          </button>
        ) : (
          <div style={{width:32,height:32,background:'#0F1410',borderRadius:8,display:'grid',placeItems:'center'}}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M4 20V4M4 20h16M8 16V10M12 16V6M16 16V13M20 16V8" stroke="#F5F1E8" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        )}
        <span style={{fontSize:17,fontWeight:700,letterSpacing:'-0.02em',color:'#0F1410'}}>{title}</span>
      </div>
      <button onClick={onClose} style={{width:38,height:38,background:'transparent',border:'1px solid #DDD8CB',borderRadius:999,cursor:'pointer',display:'grid',placeItems:'center',padding:0,WebkitTapHighlightColor:'transparent'}}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F1410" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
  );

  const renderMain = () => (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      {renderHeader('KhetLab')}
      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'12px 14px 20px'}}>
        {/* Statistical Methods */}
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#6B6F68',letterSpacing:'0.12em',padding:'8px 12px 10px'}}>STATISTICAL METHODS</div>
        <Link to="/methods" onClick={onClose}
          style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 12px',background:'transparent',border:'none',borderBottom:'1px solid #DDD8CB',fontFamily:"'Inter Tight',sans-serif",cursor:'pointer',textAlign:'left',textDecoration:'none',WebkitTapHighlightColor:'transparent'}}>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:'#0F1410'}}>All Statistical Methods</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#6B6F68',marginTop:3,letterSpacing:'0.06em'}}>{ALL_TOOLS_COUNT} METHODS · 4 CATEGORIES</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6F68" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
        </Link>

        {/* Student Hub */}
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#6B6F68',letterSpacing:'0.12em',padding:'18px 12px 10px'}}>OPPORTUNITIES</div>
        <Link to="/student-hub" onClick={onClose}
          style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 12px',background:'transparent',border:'none',borderBottom:'1px solid #DDD8CB',fontFamily:"'Inter Tight',sans-serif",cursor:'pointer',textAlign:'left',textDecoration:'none',WebkitTapHighlightColor:'transparent'}}>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:'#0F1410'}}>Student Opportunity Hub</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#6B6F68',marginTop:3,letterSpacing:'0.06em'}}>PUNJAB JOBS & AGRICULTURE EXAMS</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6F68" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
        </Link>

        {/* Thesis Helper */}
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#6B6F68',letterSpacing:'0.12em',padding:'18px 12px 10px'}}>RESEARCH</div>
        <button onClick={() => setView('thesis')}
          style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 12px',background:'transparent',border:'none',borderBottom:'1px solid #DDD8CB',fontFamily:"'Inter Tight',sans-serif",cursor:'pointer',textAlign:'left',WebkitTapHighlightColor:'transparent'}}>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:'#0F1410'}}>Thesis Helper</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#6B6F68',marginTop:3,letterSpacing:'0.06em'}}>TOPIC FINDER · LITERATURE · METHODOLOGY</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6F68" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
        </button>

        {/* Resume Builder */}
        <Link to="/resume-builder" onClick={onClose}
          style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 12px',background:'transparent',border:'none',borderBottom:'1px solid #DDD8CB',fontFamily:"'Inter Tight',sans-serif",cursor:'pointer',textAlign:'left',textDecoration:'none',WebkitTapHighlightColor:'transparent'}}>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:'#0F1410'}}>AI Resume Builder</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#6B6F68',marginTop:3,letterSpacing:'0.06em'}}>BUILD PROFESSIONAL RESUMES</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6F68" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
        </Link>
      </div>
      <div style={{padding:'14px 16px 24px',borderTop:'1px solid #DDD8CB',background:'#FBF8F1',flexShrink:0,display:'flex',flexDirection:'column',gap:10}}>
        <Link to="/tool/onefactor" onClick={onClose}
          style={{padding:'15px',background:'linear-gradient(135deg,#2D7A45,#1A3D2E)',color:'white',borderRadius:12,fontSize:15,fontWeight:600,fontFamily:"'Inter Tight',sans-serif",boxShadow:'0 6px 18px rgba(45,122,69,0.35)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,textDecoration:'none',WebkitTapHighlightColor:'transparent'}}>
          Launch KhetLab
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </Link>
        <Link to="/" onClick={onClose}
          style={{padding:'13px',background:'transparent',color:'#0F1410',border:'1px solid #DDD8CB',borderRadius:12,fontSize:14,fontWeight:500,fontFamily:"'Inter Tight',sans-serif",textDecoration:'none',textAlign:'center',WebkitTapHighlightColor:'transparent'}}>
          Home
        </Link>
      </div>
    </div>
  );

  const renderStats = () => (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      {renderHeader('Statistical Methods', 'main')}
      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'12px 14px 20px'}}>
        {STAT_CATEGORIES.map(cat => (
          <div key={cat.id} style={{marginBottom:18}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#6B6F68',letterSpacing:'0.1em',marginBottom:6,paddingLeft:4}}>
              {cat.number} — {cat.title.toUpperCase()}
            </div>
            <p style={{fontFamily:"Georgia,serif",fontSize:13,color:'#6B6F68',lineHeight:1.4,marginBottom:8,paddingLeft:4}}>{cat.subtitle}</p>
            <div style={{background:'#FBF8F1',border:'1px solid #DDD8CB',borderRadius:12,overflow:'hidden'}}>
              {cat.tools.map((t, i) => (
                <Link key={i} to={`/tool/${t.id}`} onClick={onClose}
                  style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'14px 16px',textDecoration:'none',color:'#0F1410',borderBottom:i < cat.tools.length-1 ? '1px solid #DDD8CB' : 'none',WebkitTapHighlightColor:'transparent'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{t.name}</div>
                    <div style={{fontSize:11,color:'#6B6F68',fontFamily:"'IBM Plex Mono',monospace"}}>{t.desc}</div>
                  </div>
                  <TagBadge tag={t.tag}/>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderThesis = () => (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      {renderHeader('Thesis Helper', 'main')}
      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'18px 14px 28px'}}>
        <p style={{fontFamily:"Georgia,serif",fontSize:14,color:'#2A2F2A',lineHeight:1.55,marginBottom:18}}>AI assistants, literature tools & resources.</p>
        <div style={{background:'#FBF8F1',border:'1px solid #DDD8CB',borderRadius:12,overflow:'hidden'}}>
          {THESIS_ITEMS.map((t, i) => (
            <Link key={i} to={t.link} onClick={onClose}
              style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'14px 16px',textDecoration:'none',color:'#0F1410',borderBottom:i < THESIS_ITEMS.length-1 ? '1px solid #DDD8CB' : 'none',WebkitTapHighlightColor:'transparent'}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{t.name}</div>
                <div style={{fontSize:11,color:'#6B6F68',fontFamily:"'IBM Plex Mono',monospace"}}>{t.desc}</div>
              </div>
              <TagBadge tag={t.tag}/>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  let body;
  if (view === 'main') body = renderMain();
  else if (view === 'stats') body = renderStats();
  else if (view === 'thesis') body = renderThesis();
  else body = renderMain();

  return ReactDOM.createPortal(
    <div className="appnav-drawer" style={{position:'fixed',top:0,left:0,right:0,bottom:0,height:'100dvh',zIndex:9999,background:'#F5F1E8',display:'flex',flexDirection:'column'}}>
      {body}
    </div>,
    document.body
  );
};

// ═══ MAIN NAV COMPONENT ═══
export default function AppNav() {
  const [scrolled, setScrolled] = useState(false);
  const [hoverId, setHoverId] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const closeRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (document.getElementById('appnav-css')) return;
    const el = document.createElement('style');
    el.id = 'appnav-css';
    el.textContent = NAV_CSS;
    document.head.appendChild(el);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setDrawer(false); setHoverId(null); }, [location.pathname]);

  const openMenu = id => { clearTimeout(closeRef.current); setHoverId(id); };
  const closeMenu = () => { closeRef.current = setTimeout(() => setHoverId(null), 140); };
  const closeDrop = () => setHoverId(null);

  const btnStyle = (isOpen) => ({
    position:'relative',zIndex:1,
    background:isOpen?'#0F1410':'transparent',border:'none',cursor:'pointer',
    fontFamily:"'Inter Tight',sans-serif",fontSize:14,fontWeight:500,
    color:isOpen?'#F5F1E8':'#2A2F2A',padding:'9px 16px',borderRadius:999,
    letterSpacing:'-0.005em',transition:'color 0.2s, background 0.2s',
    display:'flex',alignItems:'center',gap:5
  });

  const linkStyle = {
    position:'relative',zIndex:1,background:'transparent',border:'none',cursor:'pointer',
    fontFamily:"'Inter Tight',sans-serif",fontSize:14,fontWeight:500,color:'#2A2F2A',
    padding:'9px 16px',borderRadius:999,letterSpacing:'-0.005em',
    transition:'color 0.2s, background 0.2s',display:'flex',alignItems:'center',gap:5,textDecoration:'none'
  };

  const chevron = (isOpen) => (
    <svg width="9" height="9" viewBox="0 0 10 10" style={{transform:isOpen?'rotate(180deg)':'',transition:'transform 0.2s',opacity:0.7}}>
      <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );

  return (
    <>
      <header className={`appnav-root ${scrolled ? 'scrolled' : 'top'}`}>
        <div className="appnav-inner" style={{maxWidth:1400,margin:'0 auto',padding:'0 clamp(16px,4vw,40px)',display:'flex',alignItems:'center',justifyContent:'space-between',height:68}}>

          {/* Logo */}
          <Link to="/" className="brand-logo-link" aria-label="KhetLab home">
            <span className="brand-text"><span className="khet">Khet</span><span className="lab">Lab</span></span>
          </Link>

          {/* Desktop nav — 4 items */}
          <nav className="appnav-desktop" style={{position:'relative',alignItems:'center',background:'#FBF8F1',border:'1px solid #DDD8CB',borderRadius:999,padding:4}}>
            {/* 1. Statistical Methods — direct link to directory */}
            <Link to="/methods" style={linkStyle}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(15,20,16,0.06)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              Statistical Methods
            </Link>

            {/* 2. Student Hub */}
            <Link to="/student-hub" style={linkStyle}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(15,20,16,0.06)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              Student Hub
            </Link>

            {/* 3. Thesis Helper */}
            <div onMouseEnter={() => openMenu('thesis')} onMouseLeave={closeMenu} style={{position:'relative'}}>
              <button style={btnStyle(hoverId==='thesis')}>
                Thesis Helper {chevron(hoverId==='thesis')}
              </button>
              {hoverId==='thesis' && <ThesisDropdown onClose={closeDrop}/>}
            </div>

            {/* 4. Resume Builder */}
            <Link to="/resume-builder" style={linkStyle}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(15,20,16,0.06)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              Resume Builder
            </Link>
          </nav>

          {/* Right desktop */}
          <div className="appnav-desktop" style={{gap:8,alignItems:'center'}}>
            <NavSearch/>
            <Link to="/" style={{padding:'9px 16px',background:'transparent',border:'1px solid #DDD8CB',borderRadius:999,fontSize:14,fontWeight:500,color:'#2A2F2A',fontFamily:"'Inter Tight',sans-serif",textDecoration:'none',display:'flex',alignItems:'center',gap:6,transition:'background 0.15s'}}
              onMouseEnter={e => e.currentTarget.style.background='rgba(15,20,16,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              Home
            </Link>
            <Link to="/tool/onefactor"
              style={{padding:'10px 18px',background:'#0F1410',color:'#F5F1E8',borderRadius:999,fontSize:14,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontFamily:"'Inter Tight',sans-serif",textDecoration:'none'}}>
              Launch
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </Link>
          </div>

          {/* Mobile: search + hamburger grouped on the right */}
          <div className="appnav-hamburger" style={{gap:8,alignItems:'center',marginLeft:'auto'}}>
            <NavSearch/>
            <button onClick={() => setDrawer(true)}
              style={{width:44,height:44,background:'#FBF8F1',border:'1px solid #DDD8CB',borderRadius:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0,WebkitTapHighlightColor:'transparent',flexShrink:0}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F1410" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div style={{height:68}}/>

      <MobileDrawer open={drawer} onClose={() => setDrawer(false)}/>
    </>
  );
}
