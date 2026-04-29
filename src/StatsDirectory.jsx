// StatsDirectory.jsx — browsable directory of all statistical methods
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ═══ DATA ═══
const CATEGORIES = [
  {id:'descriptive',number:'01',title:'Descriptive Statistics',subtitle:'Summarize, explore, and describe data distributions.',icon:'📊',
   tools:[{id:'frequency',name:'Frequency Table',desc:'Summarize value occurrences in a dataset',tag:'Summary'},{id:'crosstab',name:'Cross Tabulation',desc:'Analyze relationships between categorical variables',tag:'Categorical'},{id:'means',name:'Comparing Means',desc:'Hypothesis testing across groups',tag:'Inference'},{id:'correlation',name:'Correlation Analysis',desc:'Strength and direction between variables',tag:'Relational'},{id:'regression',name:'Regression Analysis',desc:'Model dependent and independent variables',tag:'Modeling'}]},
  {id:'doe',number:'02',title:'Design of Experiments',subtitle:'Structured, rigorous experimental analysis layouts.',icon:'🧪',
   tools:[{id:'layouts',name:'Randomization & Layouts',desc:'Generate experimental field plans',tag:'Layout'},{id:'onefactor',name:'One Factor (CRD, RBD)',desc:'Single-factor experimental analysis',tag:'ANOVA'},{id:'twofactor',name:'Two Factors (Split-plot)',desc:'Two-factor split-plot evaluation',tag:'ANOVA'},{id:'threefactor',name:'Three Factors',desc:'CRD, RBD, split-split plot designs',tag:'ANOVA'},{id:'latin',name:'Latin Square',desc:'Control variability in single-treatment trials',tag:'Design'},{id:'strip',name:'Strip Plot',desc:'Structured multi-factor layout',tag:'Design'},{id:'mulcomp',name:'Multiple Comparison Tests',desc:'Post-hoc mean separation tests',tag:'Post-hoc'},{id:'pooled',name:'Pooled Analysis (RBD)',desc:'Combine data across environments',tag:'Pooled'},{id:'splitenv',name:'Two-Factor over Environments',desc:'Pooled two-factor designs',tag:'Pooled'}]},
  {id:'biometrical',number:'03',title:'Biometrical Methods',subtitle:'Quantitative genetics and plant breeding tools.',icon:'🌱',
   tools:[{id:'genmean',name:'Generation Means',desc:'Mean performance in breeding studies',tag:'Breeding'},{id:'path',name:'Path Analysis',desc:'Direct and indirect effects',tag:'Relational'},{id:'diallel',name:'Diallel Analysis',desc:'Breeding value through genetic crosses',tag:'Genetics'},{id:'partialdial',name:'Partial Diallel',desc:'Incomplete diallel crossing',tag:'Genetics'},{id:'stability',name:'Stability Analysis',desc:'Performance across environments',tag:'GxE'},{id:'linetester',name:'Line × Tester',desc:'Combining ability estimation',tag:'Breeding'},{id:'augmented',name:'Augmented Designs',desc:'Analysis of unbalanced experiments',tag:'Design'},{id:'lattice',name:'Balanced Lattice',desc:'Efficient designs for comparative trials',tag:'Design'},{id:'pbibd',name:'Alpha Lattice (PBIB)',desc:'Partially balanced incomplete blocks',tag:'Design'},{id:'ttc',name:'Triple Test Cross',desc:'Genetic inheritance exploration',tag:'Genetics'}]},
  {id:'multivariate',number:'04',title:'Multivariate Analysis',subtitle:'Dimensionality reduction and classification.',icon:'🔬',
   tools:[{id:'pca',name:'Principal Component Analysis',desc:'Reduce dimensionality, preserve variance',tag:'Reduction'},{id:'kmean',name:'K-Mean Cluster Analysis',desc:'Classify data into distinct clusters',tag:'Clustering'},{id:'probit',name:'Probit Analysis',desc:'Model binary response data',tag:'Modeling'}]},
];

const ALL_TOOLS = CATEGORIES.flatMap(c => c.tools.map(t => ({...t, catId: c.id, catTitle: c.title, catNumber: c.number})));
const ALL_TAGS = [...new Set(ALL_TOOLS.map(t => t.tag))];

const TAG_COLORS = {Summary:'#6B6F68',Categorical:'#8E5A8E',Inference:'#2D7A45',Relational:'#A0772A',Modeling:'#4A6B8E',Layout:'#6B6F68',ANOVA:'#2D7A45',Design:'#8E5A8E','Post-hoc':'#A0772A',Pooled:'#4A6B8E',Breeding:'#2D7A45',Genetics:'#8E5A8E',GxE:'#A0772A',Reduction:'#4A6B8E',Clustering:'#2D7A45'};

const CSS = `
  .sd-root{min-height:100vh;background:#F5F1E8;font-family:'Inter Tight',sans-serif;-webkit-font-smoothing:antialiased}
  .sd-hero{padding:64px 40px 48px;text-align:center;position:relative;overflow:hidden}
  .sd-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(45,122,69,0.08) 0%,transparent 70%);pointer-events:none}
  .sd-wrap{max-width:1320px;margin:0 auto;position:relative}
  .sd-search-wrap{max-width:560px;margin:0 auto 0;position:relative}
  .sd-search{width:100%;padding:16px 20px 16px 52px;background:#FBF8F1;border:2px solid #DDD8CB;border-radius:16px;font-size:16px;font-family:'Inter Tight',sans-serif;color:#0F1410;outline:none;transition:border-color 0.2s,box-shadow 0.2s}
  .sd-search:focus{border-color:#2D7A45;box-shadow:0 0 0 4px rgba(45,122,69,0.12)}
  .sd-search::placeholder{color:#A0A09A}
  .sd-search-icon{position:absolute;left:18px;top:50%;transform:translateY(-50%);pointer-events:none;color:#6B6F68}
  .sd-filters{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;padding:0 40px;margin-bottom:48px}
  .sd-filter-btn{padding:7px 16px;border-radius:999px;border:1px solid #DDD8CB;background:#FBF8F1;font-size:12px;font-family:'IBM Plex Mono',monospace;font-weight:500;color:#6B6F68;cursor:pointer;transition:all 0.2s;white-space:nowrap;letter-spacing:0.02em}
  .sd-filter-btn:hover{border-color:#2D7A45;color:#2D7A45}
  .sd-filter-btn.active{background:#0F1410;color:#F5F1E8;border-color:#0F1410}
  .sd-section{padding:0 40px 64px}
  .sd-cat-header{display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #DDD8CB}
  .sd-cat-icon{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;font-size:22px;flex-shrink:0}
  .sd-cat-num{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#6B6F68;letter-spacing:0.12em;margin-bottom:2px}
  .sd-cat-title{font-size:24px;font-weight:700;color:#0F1410;letter-spacing:-0.02em;line-height:1.1}
  .sd-cat-sub{font-family:'Source Serif 4',Georgia,serif;font-size:14px;color:#6B6F68;margin-top:2px}
  .sd-cat-count{margin-left:auto;flex-shrink:0;padding:4px 12px;background:rgba(45,122,69,0.1);border-radius:999px;font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:600;color:#2D7A45;display:flex;align-items:center;gap:6px}
  .sd-cat-dot{width:5px;height:5px;border-radius:999px;background:#2D7A45}
  .sd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-bottom:56px}
  .sd-card{display:flex;flex-direction:column;padding:22px 24px;background:#FBF8F1;border:1px solid #DDD8CB;border-radius:16px;text-decoration:none;color:inherit;transition:all 0.22s ease;position:relative;overflow:hidden}
  .sd-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#2D7A45,#7CBF6B);transform:scaleX(0);transform-origin:left;transition:transform 0.3s ease}
  .sd-card:hover{background:#0F1410;color:#F5F1E8;border-color:#0F1410;transform:translateY(-2px);box-shadow:0 12px 32px rgba(15,20,16,0.18)}
  .sd-card:hover::after{transform:scaleX(1)}
  .sd-card:hover .sd-card-desc{color:rgba(245,241,232,0.65)}
  .sd-card:hover .sd-card-tag{border-color:rgba(245,241,232,0.3);color:rgba(245,241,232,0.8);background:rgba(245,241,232,0.08)}
  .sd-card:hover .sd-card-arrow{opacity:1;transform:translateX(0)}
  .sd-card-top{display:flex;align-items:start;justify-content:space-between;gap:12px;margin-bottom:10px}
  .sd-card-name{font-size:15px;font-weight:600;letter-spacing:-0.01em;line-height:1.25}
  .sd-card-tag{padding:3px 10px;border-radius:999px;font-size:10px;font-family:'IBM Plex Mono',monospace;font-weight:500;border:1px solid #DDD8CB;color:#6B6F68;white-space:nowrap;flex-shrink:0;transition:all 0.2s}
  .sd-card-desc{font-size:13px;line-height:1.5;color:#6B6F68;transition:color 0.2s;flex:1}
  .sd-card-footer{display:flex;align-items:center;justify-content:space-between;margin-top:14px;padding-top:12px;border-top:1px solid rgba(221,216,203,0.5)}
  .sd-card:hover .sd-card-footer{border-top-color:rgba(245,241,232,0.15)}
  .sd-card-cat-label{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#A0A09A;letter-spacing:0.06em;transition:color 0.2s}
  .sd-card:hover .sd-card-cat-label{color:rgba(245,241,232,0.5)}
  .sd-card-arrow{opacity:0;transform:translateX(-6px);transition:all 0.25s ease;color:#2D7A45}
  .sd-card:hover .sd-card-arrow{color:#7CBF6B}
  .sd-empty{text-align:center;padding:80px 20px;color:#6B6F68}
  .sd-empty-icon{font-size:48px;margin-bottom:16px}
  .sd-empty-title{font-size:20px;font-weight:600;color:#0F1410;margin-bottom:8px}
  .sd-empty-desc{font-size:14px;font-family:'Source Serif 4',Georgia,serif}
  .sd-stats-bar{display:flex;gap:24px;justify-content:center;margin-bottom:40px;flex-wrap:wrap}
  .sd-stat{text-align:center;padding:16px 28px;background:#FBF8F1;border:1px solid #DDD8CB;border-radius:14px;min-width:120px}
  .sd-stat-num{font-size:32px;font-weight:800;color:#0F1410;letter-spacing:-0.03em;line-height:1}
  .sd-stat-label{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#6B6F68;letter-spacing:0.1em;margin-top:6px}
  .sd-quick-cats{display:flex;gap:8px;justify-content:center;margin-bottom:32px;flex-wrap:wrap}
  .sd-quick-cat{display:flex;align-items:center;gap:8px;padding:10px 18px;background:#FBF8F1;border:1px solid #DDD8CB;border-radius:12px;cursor:pointer;font-size:13px;font-weight:500;color:#0F1410;transition:all 0.2s;text-decoration:none}
  .sd-quick-cat:hover,.sd-quick-cat.active{background:#0F1410;color:#F5F1E8;border-color:#0F1410}
  .sd-quick-cat .sd-qc-icon{font-size:16px}
  @media(max-width:768px){
    .sd-hero{padding:40px 20px 32px}
    .sd-section{padding:0 20px 48px}
    .sd-filters{padding:0 20px}
    .sd-grid{grid-template-columns:1fr}
    .sd-cat-header{flex-wrap:wrap;gap:10px}
    .sd-cat-count{margin-left:0}
    .sd-stats-bar{gap:12px}
    .sd-stat{min-width:90px;padding:12px 16px}
    .sd-stat-num{font-size:24px}
    .sd-quick-cats{gap:6px}
  }
  @media(max-width:480px){
    .sd-search-wrap{margin:0 0}
    .sd-hero h1{font-size:32px!important}
  }
`;

export default function StatsDirectory() {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [activeCat, setActiveCat] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById('sd-css')) {
      const el = document.createElement('style');
      el.id = 'sd-css';
      el.textContent = CSS;
      document.head.appendChild(el);
    }
  }, []);

  const filtered = useMemo(() => {
    let results = ALL_TOOLS;
    if (activeCat) results = results.filter(t => t.catId === activeCat);
    if (activeTag) results = results.filter(t => t.tag === activeTag);
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.tag.toLowerCase().includes(q) ||
        t.catTitle.toLowerCase().includes(q)
      );
    }
    return results;
  }, [query, activeTag, activeCat]);

  const grouped = useMemo(() => {
    if (query.trim() || activeTag) return null;
    return CATEGORIES
      .filter(c => !activeCat || c.id === activeCat)
      .map(c => ({...c, filteredTools: c.tools.filter(t => filtered.some(f => f.id === t.id))}))
      .filter(c => c.filteredTools.length > 0);
  }, [filtered, activeCat, query, activeTag]);

  const clearAll = () => { setQuery(''); setActiveTag(null); setActiveCat(null); };

  const handleKey = (e) => {
    if (e.key === 'Escape') { clearAll(); inputRef.current?.blur(); }
  };

  return (
    <div className="sd-root">
      {/* Hero */}
      <div className="sd-hero">
        <div className="sd-wrap">
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'#2D7A45',letterSpacing:'0.15em',marginBottom:16,fontWeight:600}}>
            // STATISTICAL METHODS DIRECTORY
          </div>
          <h1 style={{fontSize:'clamp(36px,5vw,56px)',fontWeight:800,letterSpacing:'-0.04em',lineHeight:1,color:'#0F1410',marginBottom:16}}>
            Find Your Method
          </h1>
          <p style={{fontFamily:"'Source Serif 4',Georgia,serif",fontSize:17,lineHeight:1.6,color:'#6B6F68',maxWidth:520,margin:'0 auto 36px'}}>
            {ALL_TOOLS.length} validated statistical methods — search, browse, and launch instantly.
          </p>

          {/* Stats bar */}
          <div className="sd-stats-bar">
            {CATEGORIES.map(c => (
              <div key={c.id} className="sd-stat" style={{cursor:'pointer',border:activeCat===c.id?'2px solid #2D7A45':'1px solid #DDD8CB'}} onClick={() => setActiveCat(activeCat===c.id ? null : c.id)}>
                <div className="sd-stat-num">{c.tools.length}</div>
                <div className="sd-stat-label">{c.title.split(' ')[0].toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="sd-search-wrap">
            <svg className="sd-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              className="sd-search"
              type="text"
              placeholder={`Search ${ALL_TOOLS.length} methods — try "ANOVA", "regression", "diallel"...`}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
            />
            {(query || activeTag || activeCat) && (
              <button onClick={clearAll} style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',padding:4,color:'#6B6F68',fontSize:18,lineHeight:1}}>×</button>
            )}
          </div>
        </div>
      </div>

      {/* Quick category pills */}
      <div className="sd-quick-cats">
        {CATEGORIES.map(c => (
          <button key={c.id} className={`sd-quick-cat ${activeCat===c.id ? 'active' : ''}`}
            onClick={() => { setActiveCat(activeCat===c.id ? null : c.id); setActiveTag(null); }}>
            <span className="sd-qc-icon">{c.icon}</span>
            {c.title}
          </button>
        ))}
      </div>

      {/* Tag filters */}
      <div className="sd-filters">
        {ALL_TAGS.map(tag => (
          <button key={tag} className={`sd-filter-btn ${activeTag===tag ? 'active' : ''}`}
            onClick={() => setActiveTag(activeTag===tag ? null : tag)}>
            {tag}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="sd-section">
        <div className="sd-wrap">
          {filtered.length === 0 ? (
            <div className="sd-empty">
              <div className="sd-empty-icon">🔍</div>
              <div className="sd-empty-title">No methods found</div>
              <div className="sd-empty-desc">Try a different search term or clear your filters.</div>
              <button onClick={clearAll} style={{marginTop:16,padding:'10px 24px',background:'#0F1410',color:'#F5F1E8',border:'none',borderRadius:999,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:"'Inter Tight',sans-serif"}}>
                Clear Filters
              </button>
            </div>
          ) : grouped ? (
            grouped.map(cat => (
              <div key={cat.id}>
                <div className="sd-cat-header">
                  <div className="sd-cat-icon" style={{background:'rgba(45,122,69,0.1)'}}>{cat.icon}</div>
                  <div>
                    <div className="sd-cat-num">PART {cat.number} / 04</div>
                    <div className="sd-cat-title">{cat.title}</div>
                    <div className="sd-cat-sub">{cat.subtitle}</div>
                  </div>
                  <div className="sd-cat-count">
                    <span className="sd-cat-dot"/>
                    {cat.filteredTools.length} METHODS
                  </div>
                </div>
                <div className="sd-grid">
                  {cat.filteredTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} catNumber={cat.number} catTitle={cat.title}/>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'#6B6F68',letterSpacing:'0.1em',marginBottom:20}}>
                {filtered.length} RESULT{filtered.length !== 1 ? 'S' : ''} {query && `FOR "${query.toUpperCase()}"`} {activeTag && `· TAG: ${activeTag.toUpperCase()}`}
              </div>
              <div className="sd-grid">
                {filtered.map(tool => (
                  <ToolCard key={tool.id} tool={tool} catNumber={tool.catNumber} catTitle={tool.catTitle}/>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ToolCard({ tool, catNumber, catTitle }) {
  const tagColor = TAG_COLORS[tool.tag] || '#6B6F68';
  return (
    <Link to={`/tool/${tool.id}`} className="sd-card">
      <div className="sd-card-top">
        <span className="sd-card-name">{tool.name}</span>
        <span className="sd-card-tag" style={{borderColor:`${tagColor}40`,color:tagColor,background:`${tagColor}10`}}>{tool.tag}</span>
      </div>
      <div className="sd-card-desc">{tool.desc}</div>
      <div className="sd-card-footer">
        <span className="sd-card-cat-label">{catNumber} · {catTitle}</span>
        <span className="sd-card-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </span>
      </div>
    </Link>
  );
}
