import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { initEngine, runAnalysis } from './statsEngine';
import { interpretResults } from './aiFeatures/resultsInterpreter';
import { AnovaResult, FrequencyResult, CorrelationResult, RegressionResult, MeansResult, CrosstabResult, PCAResult, ClusterResult, ProbitResult, LayoutResult, PathResult, MulCompResult, StabilityResult, getRenderer } from './ResultRenderers';

const TOOLS = {
  'frequency':   { cat: 'descriptive', title: 'Frequency Table',          tagline: 'Summarize the occurrence of values in a dataset.',     needs: ['data'], options: [['classes','Number of classes','8']] },
  'crosstab':    { cat: 'descriptive', title: 'Cross Tabulation',         tagline: 'Analyze relationships between categorical variables.', needs: ['data'], options: [] },
  'means':       { cat: 'descriptive', title: 'Comparing Means',          tagline: 'Compare means across groups using hypothesis testing.', needs: ['data'], options: [['test','Test type','t-test']] },
  'correlation': { cat: 'descriptive', title: 'Correlation Analysis',     tagline: 'Pearson, Spearman rank, and Kendall Tau.',             needs: ['data'], options: [['variables','Number of variables','3']] },
  'regression':  { cat: 'descriptive', title: 'Regression Analysis',      tagline: 'Model dependent and independent variables.',           needs: ['data'], options: [['variables','Number of variables (last=Y)','3']] },
  'layouts':     { cat: 'doe', title: 'Randomization & Layouts',          tagline: 'Generate experimental field plans.',                   needs: [], options: [['design','Design type','RBD'],['treatments','Treatments','6'],['replications','Replications','3']], hasToggle: 'design' },
  'onefactor':   { cat: 'doe', title: 'One Factor (CRD, RBD)',            tagline: 'Single-factor experimental analysis.',                 needs: ['data'], options: [['design','Design','RBD'],['treatments','Treatments','3'],['replications','Replications','4']], hasToggle: 'design' },
  'twofactor':   { cat: 'doe', title: 'Two Factors (Split-plot)',         tagline: 'Two-factor split-plot evaluation.',                    needs: ['data'], options: [['f1','Factor A levels','3'],['f2','Factor B levels','4'],['replications','Replications','3']] },
  'threefactor': { cat: 'doe', title: 'Three Factors',                    tagline: 'CRD, RBD, split-split plot designs.',                  needs: ['data'], options: [['f1','Factor A','2'],['f2','Factor B','3'],['f3','Factor C','4'],['replications','Replications','3']] },
  'latin':       { cat: 'doe', title: 'Latin Square',                     tagline: 'Control variability in single-treatment trials.',      needs: ['data'], options: [['size','Square size (n×n)','5']] },
  'strip':       { cat: 'doe', title: 'Strip Plot',                       tagline: 'Structured multi-factor layout.',                      needs: ['data'], options: [['f1','Horizontal factor','4'],['f2','Vertical factor','3'],['replications','Replications','3']] },
  'mulcomp':     { cat: 'doe', title: 'Multiple Comparison Tests',        tagline: 'Post-hoc mean separation tests.',                      needs: ['data'], options: [['treatments','Treatments','5'],['replications','Replications','4'],['test','Test (LSD/Tukey)','LSD']] },
  'pooled':      { cat: 'doe', title: 'Pooled Analysis (RBD)',            tagline: 'Combine data across environments.',                    needs: ['data'], options: [['treatments','Treatments','4'],['replications','Replications','3'],['envs','Environments','3']] },
  'splitenv':    { cat: 'doe', title: 'Two-Factor over Environments',     tagline: 'Pooled two-factor designs.',                           needs: ['data'], options: [['treatments','Treatments','4'],['replications','Replications','3'],['envs','Environments','3']] },
  'genmean':     { cat: 'biometrical', title: 'Generation Means',         tagline: 'Mean performance in breeding studies.',                needs: ['data'], options: [] },
  'path':        { cat: 'biometrical', title: 'Path Analysis',            tagline: 'Direct and indirect effects.',                         needs: ['data'], options: [['variables','Variables (last=dependent)','4']] },
  'diallel':     { cat: 'biometrical', title: 'Diallel Analysis',         tagline: 'Breeding value through genetic crosses.',              needs: ['data'], options: [['parents','Parents','6'],['method','Griffing Method','II'],['replications','Replications','3']] },
  'partialdial': { cat: 'biometrical', title: 'Partial Diallel',          tagline: 'Incomplete diallel crossing.',                         needs: ['data'], options: [['parents','Parents','8'],['replications','Replications','3']] },
  'stability':   { cat: 'biometrical', title: 'Stability Analysis',       tagline: 'Performance across environments.',                    needs: ['data'], options: [['genotypes','Genotypes','5'],['envs','Environments','4'],['replications','Replications','3']] },
  'linetester':  { cat: 'biometrical', title: 'Line × Tester',            tagline: 'Combining ability estimation.',                        needs: ['data'], options: [['lines','Lines','5'],['testers','Testers','3'],['replications','Replications','3']] },
  'augmented':   { cat: 'biometrical', title: 'Augmented Designs',        tagline: 'Analysis of unbalanced experiments.',                  needs: ['data'], options: [['checks','Checks','3'],['blocks','Blocks','4']] },
  'lattice':     { cat: 'biometrical', title: 'Balanced Lattice',         tagline: 'Efficient designs for comparative trials.',            needs: ['data'], options: [['k','Block size k','4']] },
  'pbibd':       { cat: 'biometrical', title: 'Alpha Lattice (PBIB)',     tagline: 'Partially balanced incomplete blocks.',                needs: ['data'], options: [['k','Block size','5'],['reps','Replications','3']] },
  'ttc':         { cat: 'biometrical', title: 'Triple Test Cross',        tagline: 'Genetic inheritance exploration.',                     needs: ['data'], options: [] },
  'pca':         { cat: 'multivariate', title: 'PCA', tagline: 'Reduce dimensionality, preserve variance.',  needs: ['data'], options: [['variables','Number of variables','4']] },
  'kmean':       { cat: 'multivariate', title: 'K-Mean Cluster Analysis', tagline: 'Classify data into distinct clusters.',                needs: ['data'], options: [['variables','Variables','3'],['k','Clusters (k)','3'],['iter','Max iterations','100']] },
  'probit':      { cat: 'multivariate', title: 'Probit Analysis',         tagline: 'Model binary response data (LC50/LD50).',             needs: ['data'], options: [] },
};

const CATEGORIES = {
  descriptive: { num: '01', label: 'Descriptive Statistics' },
  doe: { num: '02', label: 'Design of Experiments' },
  biometrical: { num: '03', label: 'Biometrical Methods' },
  multivariate: { num: '04', label: 'Multivariate Analysis' },
};

const Ic = ({ name, size = 16 }) => {
  const s = 1.5;
  const p = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth={s} fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    back: <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth={s} fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    help: <g stroke="currentColor" strokeWidth={s} fill="none"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 0c0 2-2.5 2-2.5 4M12 17h.01" strokeLinecap="round"/></g>,
    upload: <g stroke="currentColor" strokeWidth={s} fill="none" strokeLinecap="round"><path d="M12 15V3M7 8l5-5 5 5M4 20h16"/></g>,
    play: <path d="M6 4l14 8-14 8V4z" fill="currentColor"/>,
    reset: <g stroke="currentColor" strokeWidth={s} fill="none" strokeLinecap="round"><path d="M3 12a9 9 0 1015-6.7L21 8M21 3v5h-5"/></g>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24">{p[name]}</svg>;
};

// ═══ Toggle Pill (CRD / RBD) ═══
const TogglePill = ({ options, value, onChange }) => {
  const refs = useRef([]);
  const [sliderStyle, setSliderStyle] = useState({});

  useEffect(() => {
    const idx = options.indexOf(value);
    if (idx >= 0 && refs.current[idx]) {
      const el = refs.current[idx];
      setSliderStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [value, options]);

  return (
    <div className="toggle-pill">
      <div className="toggle-pill-slider" style={sliderStyle} />
      {options.map((opt, i) => (
        <button key={opt} ref={el => refs.current[i] = el}
          className={`toggle-pill-btn ${value === opt ? 'active' : ''}`}
          onClick={() => onChange(opt)}>
          {opt}
        </button>
      ))}
    </div>
  );
};


// ═══ Tool Hero ═══
const ToolHero = ({ tool }) => {
  const cat = CATEGORIES[tool.cat];
  const words = tool.title.split(' ');
  return (
    <div className="site-shell tool-hero" style={{ padding: '48px 40px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div className="tool-hero-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <div style={{ maxWidth: 820 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 14 }}>§ {cat.num} — {cat.label.toUpperCase()}</div>
          <h1 style={{ fontSize: 'clamp(36px, 4.5vw, 64px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 0.98, marginBottom: 16 }}>
            {words.slice(0, -1).join(' ')}{' '}
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400 }}>{words.slice(-1)[0]}.</span>
          </h1>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.5, color: 'var(--ink-2)', maxWidth: 600 }}>{tool.tagline}</p>
        </div>
        <div style={{ display: 'flex', gap: 24, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.05em' }}>
          <div><div style={{ color: 'var(--green)', fontSize: 20, fontFamily: 'var(--display)', fontWeight: 600, marginBottom: 4 }}>READY</div>STATUS</div>
        </div>
      </div>
    </div>
  );
};

// ═══ Result Renderer Selector ═══
const RenderResult = ({ toolId, result }) => {
  const type = getRenderer(toolId);
  switch (type) {
    case 'anova': return <AnovaResult result={result} />;
    case 'frequency': return <FrequencyResult result={result} />;
    case 'correlation': return <CorrelationResult result={result} />;
    case 'regression': return <RegressionResult result={result} />;
    case 'means': return <MeansResult result={result} />;
    case 'crosstab': return <CrosstabResult result={result} />;
    case 'pca': return <PCAResult result={result} />;
    case 'cluster': return <ClusterResult result={result} />;
    case 'probit': return <ProbitResult result={result} />;
    case 'layout': return <LayoutResult result={result} />;
    case 'path': return <PathResult result={result} />;
    case 'mulcomp': return <MulCompResult result={result} />;
    case 'stability': return <StabilityResult result={result} />;
    default: return <AnovaResult result={result} />;
  }
};

const LOAD_MESSAGES = {
  'loading-script': ['LOADING STATS ENGINE', 'Preparing Pyodide in the browser...'],
  'loading-runtime': ['LOADING STATS ENGINE', 'Starting the Python runtime...'],
  'loading-packages': ['LOADING NUMPY + SCIPY', 'Loading statistical packages...'],
  'registering-functions': ['REGISTERING METHODS', 'Preparing KhetLab analysis functions...'],
  ready: ['READY', 'Running computation...'],
};

const PyodideLoadingState = ({ stage }) => {
  const [label, message] = LOAD_MESSAGES[stage] || LOAD_MESSAGES['loading-runtime'];
  return (
    <div style={{ margin: 'auto', textAlign: 'center' }}>
      <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 500, marginTop: 8 }}>{message}</div>
    </div>
  );
};

const ComputationError = ({ message, onRetry }) => (
  <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--terra)', padding: 32, background: 'rgba(180,80,40,0.06)', borderRadius: 10, maxWidth: 520 }}>
    <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 16 }}>Computation Error</div>
    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.6 }}>{message}</div>
    <button onClick={onRetry} style={{ marginTop: 16, padding: '8px 16px', background: 'var(--ink)', color: 'var(--bg)', border: 'none', borderRadius: 999, fontSize: 12, cursor: 'pointer' }}>Try Again</button>
  </div>
);

const ResultsInterpreter = ({ result, tool, opts }) => {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle');

  const runInterpretation = async () => {
    setStatus('loading');
    try {
      const interpretation = await interpretResults({ result, toolTitle: tool.title, opts });
      setText(interpretation);
      setStatus('ready');
    } catch (error) {
      console.error(error);
      setText('KhetLab could not prepare an interpretation for this result.');
      setStatus('error');
    }
  };

  const copyText = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
      window.setTimeout(() => setStatus('ready'), 1200);
    } catch {
      setStatus('ready');
    }
  };

  return (
    <div style={{ marginTop: 18, padding: 16, border: '1px solid var(--line)', borderRadius: 12, background: 'var(--bg-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: text ? 12 : 0 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em' }}>AI RESULT INTERPRETER</div>
        <button
          onClick={text ? copyText : runInterpretation}
          disabled={status === 'loading'}
          style={{ padding: '8px 13px', background: 'var(--ink)', color: 'var(--bg)', border: 'none', borderRadius: 999, fontSize: 12, cursor: status === 'loading' ? 'wait' : 'pointer', opacity: status === 'loading' ? 0.65 : 1 }}
        >
          {status === 'loading' ? 'Writing...' : text ? (status === 'copied' ? 'Copied' : 'Copy') : 'Interpret'}
        </button>
      </div>
      {text && <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.6 }}>{text}</p>}
    </div>
  );
};

// ═══ DATA PLACEHOLDERS ═══
const PLACEHOLDERS = {
  onefactor: "Paste treatment × replication data.\nEach row = one treatment, values separated by spaces or tabs.\n\nExample (3 treatments × 4 reps):\n123 123 131 133\n142 149 147 134\n147 172 143 139",
  twofactor: "Data: reps × Factor_A × Factor_B\nValues space/tab separated, row-wise.\n\nExample (2 reps × 3A × 2B = 12 values):\n45 52 48 55 43 50\n47 54 46 53 41 49",
  latin: "Paste n×n data matrix:\n\n42 48 36 52 44\n45 38 50 43 47\n39 46 44 48 41\n51 43 47 39 45\n44 50 42 46 40",
  correlation: "Columns = variables, rows = observations:\n\n23 45 67\n25 48 72\n28 52 78\n22 43 63\n30 55 81",
  regression: "Columns = X₁, X₂, ..., Y (last column is dependent):\n\n23 45 67\n25 48 72\n28 52 78\n22 43 63",
  default: "Paste your data here.\nValues separated by spaces or tabs.\nRows separated by line breaks.",
};

// ═══ Workspace ═══
const Workspace = ({ toolId, tool }) => {
  const [data, setData] = useState('');
  const [opts, setOpts] = useState(() => {
    const o = {};
    (tool.options || []).forEach(([k, , def]) => o[k] = def);
    return o;
  });
  const [step, setStep] = useState('input');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadStage, setLoadStage] = useState('loading-script');

  useEffect(() => {
    initEngine({ onStage: setLoadStage }).catch(e => console.error("Prefetch Error", e));
  }, []);

  const handleRun = async () => {
    setStep('running');
    setErrorMessage('');
    setLoadStage('loading-runtime');
    try {
      const res = await runAnalysis(toolId, data, opts, { onStage: setLoadStage });
      setResult(res);
      setStep('result');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Computation failed.');
      setStep('error');
    }
  };

  const reset = () => { setStep('input'); setResult(null); setErrorMessage(''); };

  const placeholder = PLACEHOLDERS[toolId] || PLACEHOLDERS.default;

  return (
    <div className="site-shell tool-workspace" style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 40px 80px' }}>
      <div className="tool-workspace-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>

        {/* ─── LEFT: Input ─── */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="panel-head" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)' }}>01 · INPUT PANEL</span>
          </div>

          <div className="panel-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', flex: 1, gap: 16 }}>
            {/* Options */}
            {(tool.options || []).length > 0 && (
              <div className="tool-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                {tool.options.map(([k, label]) => (
                  <div key={k}>
                    <label className="op-label">{label}</label>
                    {/* Toggle for design field */}
                    {k === 'design' && tool.hasToggle ? (
                      <TogglePill options={['CRD', 'RBD']} value={opts[k]} onChange={v => setOpts({ ...opts, [k]: v })} />
                    ) : (
                      <input className="op-input" value={opts[k]} onChange={e => setOpts({ ...opts, [k]: e.target.value })} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Data Matrix */}
            {tool.needs.includes('data') && (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <label className="op-label">Data Matrix (paste from Excel)</label>
                <textarea
                  className="data-matrix"
                  value={data}
                  onChange={e => setData(e.target.value)}
                  placeholder={placeholder}
                  style={{ flex: 1 }}
                />
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="panel-footer" style={{ padding: '14px 24px', background: 'var(--bg-2)', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
              {step === 'input' && '▸ READY TO COMPUTE'}
              {step === 'running' && '▸ COMPUTING...'}
              {step === 'result' && '✓ ANALYSIS COMPLETE'}
              {step === 'error' && '✗ ERROR'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {step === 'result' && (
                <button onClick={reset} style={{ padding: '9px 14px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 999, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--ink-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Ic name="reset" size={12}/> Reset
                </button>
              )}
              <button onClick={handleRun} disabled={step === 'running'} style={{
                padding: '10px 20px', background: 'var(--ink)', color: 'var(--bg)',
                border: 'none', borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--display)',
                opacity: step === 'running' ? 0.5 : 1,
              }}>
                <Ic name="play" size={11}/> {step === 'running' ? 'Computing...' : 'Run Analysis'}
              </button>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Output ─── */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', minHeight: 560, display: 'flex', flexDirection: 'column' }}>
          <div className="panel-head" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)' }}>02 · RESULTS</span>
          </div>

          <div className="panel-body" style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {step === 'input' && (
              <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 380, opacity: 0.6 }}>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink-2)' }}>
                  {tool.needs.includes('data')
                    ? 'Configure your parameters and paste data to begin analysis.'
                    : 'Set your parameters above, then click Run Analysis to generate results.'}
                </div>
              </div>
            )}
            {step === 'running' && (
              <PyodideLoadingState stage={loadStage} />
            )}
            {step === 'error' && (
              <ComputationError message={errorMessage} onRetry={reset} />
            )}
            {step === 'result' && result && (
              <>
                <RenderResult toolId={toolId} result={result} />
                <ResultsInterpreter result={result} tool={tool} opts={opts} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Tool() {
  const { toolId } = useParams();
  const tool = TOOLS[toolId];
  if (!tool) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 40 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, marginBottom: 16 }}>Tool not found</h2>
          <Link to="/" style={{ color: 'var(--green)' }}>← Return home</Link>
        </div>
      </div>
    );
  }
  return (
    <>
      <ToolHero tool={tool} />
      <Workspace key={toolId} toolId={toolId} tool={tool} />
    </>
  );
}
