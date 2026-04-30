// GlobalSearch.jsx — inline nav-bar search with dropdown results
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// ═══ SEARCHABLE INDEX — every page/tool on the site ═══
const SEARCH_ITEMS = [
  // ── Stat tools: Descriptive ──
  {name:'Frequency Table',desc:'Summarize value occurrences in a dataset',tag:'Summary',cat:'Descriptive Statistics',link:'/tool/frequency'},
  {name:'Cross Tabulation',desc:'Analyze relationships between categorical variables',tag:'Categorical',cat:'Descriptive Statistics',link:'/tool/crosstab'},
  {name:'Comparing Means',desc:'Hypothesis testing across groups',tag:'Inference',cat:'Descriptive Statistics',link:'/tool/means'},
  {name:'Correlation Analysis',desc:'Strength and direction between variables',tag:'Relational',cat:'Descriptive Statistics',link:'/tool/correlation'},
  {name:'Regression Analysis',desc:'Model dependent and independent variables',tag:'Modeling',cat:'Descriptive Statistics',link:'/tool/regression'},
  // ── Stat tools: DOE ──
  {name:'Randomization & Layouts',desc:'Generate experimental field plans',tag:'Layout',cat:'Design of Experiments',link:'/tool/layouts'},
  {name:'One Factor (CRD, RBD)',desc:'Single-factor experimental analysis',tag:'ANOVA',cat:'Design of Experiments',link:'/tool/onefactor'},
  {name:'Two Factors (Split-plot)',desc:'Two-factor split-plot evaluation',tag:'ANOVA',cat:'Design of Experiments',link:'/tool/twofactor'},
  {name:'Three Factors',desc:'CRD, RBD, split-split plot designs',tag:'ANOVA',cat:'Design of Experiments',link:'/tool/threefactor'},
  {name:'Latin Square',desc:'Control variability in single-treatment trials',tag:'Design',cat:'Design of Experiments',link:'/tool/latin'},
  {name:'Strip Plot',desc:'Structured multi-factor layout',tag:'Design',cat:'Design of Experiments',link:'/tool/strip'},
  {name:'Multiple Comparison Tests',desc:'Post-hoc mean separation tests',tag:'Post-hoc',cat:'Design of Experiments',link:'/tool/mulcomp'},
  {name:'Pooled Analysis (RBD)',desc:'Combine data across environments',tag:'Pooled',cat:'Design of Experiments',link:'/tool/pooled'},
  {name:'Two-Factor over Environments',desc:'Pooled two-factor designs',tag:'Pooled',cat:'Design of Experiments',link:'/tool/splitenv'},
  // ── Stat tools: Biometrical ──
  {name:'Generation Means',desc:'Mean performance in breeding studies',tag:'Breeding',cat:'Biometrical Methods',link:'/tool/genmean'},
  {name:'Path Analysis',desc:'Direct and indirect effects',tag:'Relational',cat:'Biometrical Methods',link:'/tool/path'},
  {name:'Diallel Analysis',desc:'Breeding value through genetic crosses',tag:'Genetics',cat:'Biometrical Methods',link:'/tool/diallel'},
  {name:'Partial Diallel',desc:'Incomplete diallel crossing',tag:'Genetics',cat:'Biometrical Methods',link:'/tool/partialdial'},
  {name:'Stability Analysis',desc:'Performance across environments',tag:'GxE',cat:'Biometrical Methods',link:'/tool/stability'},
  {name:'Line × Tester',desc:'Combining ability estimation',tag:'Breeding',cat:'Biometrical Methods',link:'/tool/linetester'},
  {name:'Augmented Designs',desc:'Analysis of unbalanced experiments',tag:'Design',cat:'Biometrical Methods',link:'/tool/augmented'},
  {name:'Balanced Lattice',desc:'Efficient designs for comparative trials',tag:'Design',cat:'Biometrical Methods',link:'/tool/lattice'},
  {name:'Alpha Lattice (PBIB)',desc:'Partially balanced incomplete blocks',tag:'Design',cat:'Biometrical Methods',link:'/tool/pbibd'},
  {name:'Triple Test Cross',desc:'Genetic inheritance exploration',tag:'Genetics',cat:'Biometrical Methods',link:'/tool/ttc'},
  // ── Stat tools: Multivariate ──
  {name:'Principal Component Analysis',desc:'Reduce dimensionality, preserve variance',tag:'Reduction',cat:'Multivariate Analysis',link:'/tool/pca'},
  {name:'K-Mean Cluster Analysis',desc:'Classify data into distinct clusters',tag:'Clustering',cat:'Multivariate Analysis',link:'/tool/kmean'},
  {name:'Probit Analysis',desc:'Model binary response data',tag:'Modeling',cat:'Multivariate Analysis',link:'/tool/probit'},
  // ── Pages ──
  {name:'Statistical Methods Directory',desc:'Browse all 27 statistical methods',tag:'Page',cat:'Pages',link:'/methods'},
  {name:'Student Opportunity Hub',desc:'Punjab jobs, government posts & agriculture exams',tag:'Page',cat:'Pages',link:'/student-hub'},
  {name:'Thesis Topic Finder',desc:'AI-assisted topic generation with gap analysis',tag:'AI',cat:'Thesis Helper',link:'/thesis-topics'},
  {name:'Literature Review Generator',desc:'Smart paper summarisation',tag:'AI',cat:'Thesis Helper',link:'/research'},
  {name:'Methodology Wizard',desc:'Pick the right statistical design',tag:'AI',cat:'Thesis Helper',link:'/thesis'},
  {name:'Resources Hub',desc:'Documentation, guides & sample data',tag:'Docs',cat:'Thesis Helper',link:'/resources'},
  {name:'Citation Manager',desc:'Manage and format citations',tag:'Cite',cat:'Thesis Helper',link:'/citations'},
  {name:'Resume Builder',desc:'AI-powered resume builder',tag:'Page',cat:'Pages',link:'/resume-builder'},
  {name:'Home',desc:'KhetLab landing page',tag:'Page',cat:'Pages',link:'/'},
];

const TAG_COLORS = {Summary:'#6B6F68',Categorical:'#8E5A8E',Inference:'#2D7A45',Relational:'#A0772A',Modeling:'#4A6B8E',Layout:'#6B6F68',ANOVA:'#2D7A45',Design:'#8E5A8E','Post-hoc':'#A0772A',Pooled:'#4A6B8E',Breeding:'#2D7A45',Genetics:'#8E5A8E',GxE:'#A0772A',Reduction:'#4A6B8E',Clustering:'#2D7A45',AI:'#2D7A45',Docs:'#6B6F68',Cite:'#8E5A8E',Page:'#4A6B8E'};

const CSS_ID = 'gs-css';
const CSS = `
  .gs-wrap{position:relative;display:flex;align-items:center}
  .gs-bar{display:flex;align-items:center;gap:8px;background:#FBF8F1;border:1px solid #DDD8CB;border-radius:12px;padding:0 12px;height:38px;transition:all 0.25s ease;cursor:text;min-width:38px}
  .gs-bar.collapsed{padding:0;width:38px;border-radius:999px;justify-content:center;cursor:pointer}
  .gs-bar.expanded{width:280px}
  .gs-bar.focused{border-color:#2D7A45;box-shadow:0 0 0 3px rgba(45,122,69,0.12)}
  .gs-icon{flex-shrink:0;color:#6B6F68;display:grid;place-items:center;transition:color 0.2s}
  .gs-bar.focused .gs-icon{color:#2D7A45}
  .gs-input{flex:1;border:none;background:transparent;font-size:16px;font-family:'Inter Tight',sans-serif;color:#0F1410;outline:none;min-width:0;padding:0}
  .gs-input::placeholder{color:#A0A09A}
  .gs-clear{background:none;border:none;cursor:pointer;color:#6B6F68;font-size:16px;padding:0;line-height:1;display:grid;place-items:center;flex-shrink:0}
  .gs-clear:hover{color:#0F1410}
  .gs-dropdown{position:absolute;top:calc(100% + 6px);right:0;width:420px;max-width:calc(100vw - 32px);max-height:min(440px,calc(100vh - 120px));background:#FBF8F1;border:1px solid #DDD8CB;border-radius:16px;box-shadow:0 20px 60px rgba(15,20,16,0.18);overflow:hidden;display:flex;flex-direction:column;animation:gs-dropIn 0.18s ease;z-index:9999}
  .gs-list{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:6px 0}
  .gs-empty{padding:28px 16px;text-align:center;color:#6B6F68}
  .gs-cat{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#6B6F68;letter-spacing:0.1em;padding:10px 16px 4px}
  .gs-row{display:flex;align-items:center;gap:12px;padding:9px 16px;cursor:pointer;text-decoration:none;color:inherit;transition:background 0.12s}
  .gs-row:hover,.gs-row.active{background:rgba(45,122,69,0.08)}
  .gs-row-name{font-size:13px;font-weight:600;color:#0F1410;line-height:1.2}
  .gs-row-desc{font-size:11px;color:#6B6F68;line-height:1.3;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .gs-row-tag{flex-shrink:0;padding:2px 8px;border-radius:999px;font-size:9px;font-family:'IBM Plex Mono',monospace;font-weight:500;white-space:nowrap}
  .gs-row-arrow{flex-shrink:0;opacity:0;transition:opacity 0.15s;color:#2D7A45}
  .gs-row:hover .gs-row-arrow,.gs-row.active .gs-row-arrow{opacity:1}
  .gs-hint{display:flex;align-items:center;justify-content:space-between;padding:8px 16px;border-top:1px solid #DDD8CB;background:#F5F1E8;border-radius:0 0 16px 16px}
  .gs-hint-text{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#6B6F68;display:flex;align-items:center;gap:4px}
  .gs-hint-key{padding:1px 5px;background:#FBF8F1;border:1px solid #DDD8CB;border-radius:3px;font-size:9px}
  @keyframes gs-dropIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
  @media(max-width:860px){
    .gs-bar.expanded{width:220px}
    .gs-dropdown{width:calc(100vw - 32px);right:-60px}
  }
  @media(max-width:500px){
    .gs-bar.expanded{width:min(180px,calc(100vw - 92px))}
    .gs-dropdown{right:-58px;max-width:calc(100vw - 20px)}
    .gs-hint{display:none}
  }
`;

// ═══ INLINE NAV SEARCH (renders in the menu bar) ═══
export default function NavSearch() {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // inject CSS once
  useEffect(() => {
    if (!document.getElementById(CSS_ID)) {
      const el = document.createElement('style');
      el.id = CSS_ID;
      el.textContent = CSS;
      document.head.appendChild(el);
    }
  }, []);

  // close on route change
  useEffect(() => { close(); }, [location.pathname]);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        expand();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // click outside to close
  useEffect(() => {
    if (!expanded) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expanded]);

  const expand = () => {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const close = () => {
    setExpanded(false);
    setQuery('');
    setFocused(false);
    setActiveIdx(0);
  };

  const showDropdown = expanded && (query.trim().length > 0 || focused);

  const results = useMemo(() => {
    if (!query.trim()) return SEARCH_ITEMS.slice(0, 8);
    const q = query.toLowerCase();
    return SEARCH_ITEMS.filter(it =>
      it.name.toLowerCase().includes(q) ||
      it.desc.toLowerCase().includes(q) ||
      it.tag.toLowerCase().includes(q) ||
      it.cat.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = {};
    results.forEach(r => {
      if (!map[r.cat]) map[r.cat] = [];
      map[r.cat].push(r);
    });
    return Object.entries(map);
  }, [results]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  const goTo = useCallback((item) => {
    close();
    navigate(item.link);
  }, [navigate]);

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, results.length - 1));
      scrollActive(activeIdx + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
      scrollActive(activeIdx - 1);
    } else if (e.key === 'Enter' && results[activeIdx]) {
      goTo(results[activeIdx]);
    } else if (e.key === 'Escape') {
      close();
      inputRef.current?.blur();
    }
  };

  const scrollActive = (idx) => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${idx}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  };

  let flatIdx = -1;

  return (
    <div className="gs-wrap" ref={wrapRef}>
      <div
        className={`gs-bar ${expanded ? 'expanded' : 'collapsed'} ${focused ? 'focused' : ''}`}
        onClick={() => { if (!expanded) expand(); }}
      >
        <span className="gs-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </span>
        {expanded && (
          <>
            <input
              ref={inputRef}
              className="gs-input"
              placeholder="Search tools, pages..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={handleKey}
            />
            {query && <button className="gs-clear" onClick={() => setQuery('')}>×</button>}
          </>
        )}
      </div>

      {showDropdown && (
        <div className="gs-dropdown">
          <div className="gs-list" ref={listRef}>
            {results.length === 0 ? (
              <div className="gs-empty">
                <div style={{fontSize:24,marginBottom:6}}>🔍</div>
                <div style={{fontSize:13,fontWeight:600,color:'#0F1410'}}>No results for "{query}"</div>
                <div style={{fontSize:12,fontFamily:"'Source Serif 4',Georgia,serif",marginTop:4}}>Try a different term</div>
              </div>
            ) : (
              grouped.map(([cat, items]) => (
                <div key={cat}>
                  <div className="gs-cat">{cat.toUpperCase()}</div>
                  {items.map(item => {
                    flatIdx++;
                    const idx = flatIdx;
                    const tc = TAG_COLORS[item.tag] || '#6B6F68';
                    return (
                      <Link
                        key={item.link}
                        to={item.link}
                        data-idx={idx}
                        className={`gs-row ${activeIdx === idx ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); goTo(item); }}
                        onMouseEnter={() => setActiveIdx(idx)}
                      >
                        <div style={{flex:1,minWidth:0}}>
                          <div className="gs-row-name">{highlightMatch(item.name, query)}</div>
                          <div className="gs-row-desc">{item.desc}</div>
                        </div>
                        <span className="gs-row-tag" style={{border:`1px solid ${tc}40`,color:tc,background:`${tc}10`}}>{item.tag}</span>
                        <span className="gs-row-arrow">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ))
            )}
          </div>
          <div className="gs-hint">
            <span className="gs-hint-text">
              <span className="gs-hint-key">↑↓</span> navigate
              <span style={{margin:'0 4px'}}>·</span>
              <span className="gs-hint-key">↵</span> open
              <span style={{margin:'0 4px'}}>·</span>
              <span className="gs-hint-key">esc</span> close
            </span>
            <span className="gs-hint-text"><span className="gs-hint-key">Ctrl</span>+<span className="gs-hint-key">K</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

function highlightMatch(text, query) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{background:'rgba(45,122,69,0.2)',borderRadius:2,padding:'0 1px'}}>{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}
