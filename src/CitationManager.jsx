import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { lookupDOI, formatCitation, getSavedCitations, saveCitation, removeCitation, clearCitations } from './scholarAPI';

const Ic = ({ d, size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
const ICONS = {
  copy: "M8 8h12v12H8zM4 16V6a2 2 0 012-2h10",
  trash: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6",
  download: "M12 3v12M7 10l5 5 5-5M4 20h16",
  plus: "M12 5v14M5 12h14",
  back: "M19 12H5M12 19l-7-7 7-7",
};

const STYLES = ['APA', 'MLA', 'Harvard', 'Chicago', 'IJHS'];


export default function CitationManager() {
  const [searchParams] = useSearchParams();
  const [doi, setDoi] = useState(searchParams.get('doi') || '');
  const [style, setStyle] = useState('APA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState(null);
  const [citations, setCitations] = useState(getSavedCitations());
  const [copied, setCopied] = useState(false);
  const [bulkDOIs, setBulkDOIs] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkResults, setBulkResults] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const formatted = useMemo(() => meta ? formatCitation(meta, style) : '', [meta, style]);

  const handleLookup = useCallback(async () => {
    if (!doi.trim()) return;
    setLoading(true); setError(''); setMeta(null);
    try {
      const data = await lookupDOI(doi);
      setMeta(data);
    } catch (err) {
      setError(err.message || 'DOI not found');
    } finally { setLoading(false); }
  }, [doi]);

  useEffect(() => {
    if (!searchParams.get('doi')) return undefined;
    const timer = setTimeout(handleLookup, 0);
    return () => clearTimeout(timer);
  }, [handleLookup, searchParams]);

  const handleSave = () => {
    if (!formatted) return;
    const newList = saveCitation({ doi, style, formatted, title: meta?.title?.[0] || '', savedAt: Date.now() });
    setCitations(newList);
  };

  const handleRemove = (id) => { setCitations(removeCitation(id)); };
  const handleClear = () => { if (confirm('Clear all saved citations?')) setCitations(clearCitations()); };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const exportAll = () => {
    const text = citations.map((c, i) => `${i + 1}. ${c.formatted}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const text = citations.map((c, i) => `${i + 1}. ${c.formatted}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'references.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulk = async () => {
    const dois = bulkDOIs.split('\n').map(d => d.trim()).filter(Boolean);
    if (dois.length === 0) return;
    setBulkLoading(true); setBulkResults([]);
    const results = [];
    for (const d of dois) {
      try {
        const data = await lookupDOI(d);
        const fmt = formatCitation(data, style);
        results.push({ doi: d, formatted: fmt, error: false });
      } catch {
        results.push({ doi: d, formatted: `[Error: DOI "${d}" not found]`, error: true });
      }
    }
    setBulkResults(results);
    setBulkLoading(false);
  };

  const saveBulk = () => {
    bulkResults.filter(r => !r.error).forEach(r => {
      saveCitation({ doi: r.doi, style, formatted: r.formatted, title: '', savedAt: Date.now() });
    });
    setCitations(getSavedCitations());
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <div className="site-shell page-hero" style={{ padding: '56px 40px 40px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 14 }}>§ CITATIONS · REFERENCE MANAGER</div>
        <h1 style={{ fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 0.98, marginBottom: 12 }}>
          Cite <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400 }}>Sources.</span>
        </h1>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--ink-2)', maxWidth: 600 }}>Paste a DOI, get a perfectly formatted citation in APA, MLA, Harvard, or IJHS style. Build your reference list instantly.</p>
      </div>

      <div className="site-shell page-body" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px 80px' }}>
        <div className="citation-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>

          {/* LEFT: Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Mode toggle */}
            <div className="citation-mode-tabs" style={{ display: 'flex', gap: 0 }}>
              {[['single', 'Single DOI'], ['bulk', 'Bulk (multiple)']].map(([k, l]) => (
                <button key={k} onClick={() => setBulkMode(k === 'bulk')} style={{
                  padding: '10px 20px', fontSize: 12, fontFamily: 'var(--mono)', cursor: 'pointer',
                  background: (bulkMode ? 'bulk' : 'single') === k ? 'var(--ink)' : 'var(--paper)',
                  color: (bulkMode ? 'bulk' : 'single') === k ? 'var(--bg)' : 'var(--ink)',
                  border: '1px solid var(--line)', borderRadius: k === 'single' ? '999px 0 0 999px' : '0 999px 999px 0',
                }}>{l}</button>
              ))}
            </div>

            {/* Style selector */}
            <div>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>CITATION STYLE</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STYLES.map(s => (
                  <button key={s} onClick={() => setStyle(s)} style={{
                    padding: '8px 16px', borderRadius: 999, fontSize: 12, fontFamily: 'var(--mono)', cursor: 'pointer',
                    background: style === s ? 'var(--ink)' : 'var(--paper)', color: style === s ? 'var(--bg)' : 'var(--ink)', border: '1px solid var(--line)',
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {!bulkMode ? (
              /* Single DOI */
              <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 14, padding: 24 }}>
                <label style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>ENTER DOI</label>
                <div className="citation-doi-row" style={{ display: 'flex', gap: 10 }}>
                  <input value={doi} onChange={e => setDoi(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLookup()}
                    placeholder="e.g. 10.1016/j.scienta.2020.109375"
                    style={{ flex: 1, padding: '14px 18px', fontSize: 15, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10, fontFamily: 'var(--mono)', outline: 'none' }} />
                  <button onClick={handleLookup} disabled={loading} style={{
                    padding: '14px 24px', background: 'var(--ink)', color: 'var(--bg)', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', opacity: loading ? 0.5 : 1,
                  }}>{loading ? 'Looking up...' : 'Generate'}</button>
                </div>
                {error && <div style={{ marginTop: 12, padding: 12, background: 'rgba(180,80,40,0.08)', borderRadius: 8, color: 'var(--terra)', fontSize: 13 }}>{error}</div>}

                {formatted && (
                  <div style={{ marginTop: 20 }}>
                    <label style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>FORMATTED CITATION ({style})</label>
                    <div style={{ padding: 16, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--line)', fontSize: 14, lineHeight: 1.7, fontFamily: 'var(--serif)' }}>{formatted}</div>
                    <div className="citation-actions" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button onClick={() => copyText(formatted)} style={{ padding: '8px 16px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 999, fontSize: 11, fontFamily: 'var(--mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Ic d={ICONS.copy} size={11}/> {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button onClick={handleSave} style={{ padding: '8px 16px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 999, fontSize: 11, fontFamily: 'var(--mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Ic d={ICONS.plus} size={11}/> Add to List
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Bulk DOIs */
              <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 14, padding: 24 }}>
                <label style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>PASTE MULTIPLE DOIs (one per line)</label>
                <textarea value={bulkDOIs} onChange={e => setBulkDOIs(e.target.value)} rows={8} placeholder={"10.1016/j.scienta.2020.109375\n10.1007/s10722-019-00844-3\n10.1080/14620316.2018.1530065"}
                  style={{ width: '100%', padding: 14, fontSize: 13, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10, fontFamily: 'var(--mono)', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                <button onClick={handleBulk} disabled={bulkLoading} style={{
                  marginTop: 12, padding: '12px 24px', background: 'var(--ink)', color: 'var(--bg)', border: 'none', borderRadius: 999, fontSize: 13, cursor: 'pointer', opacity: bulkLoading ? 0.5 : 1,
                }}>{bulkLoading ? 'Processing...' : 'Generate All'}</button>

                {bulkResults.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <label style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>RESULTS ({bulkResults.filter(r => !r.error).length}/{bulkResults.length} found)</label>
                    {bulkResults.map((r, i) => (
                      <div key={i} style={{ padding: 12, background: r.error ? 'rgba(180,80,40,0.06)' : 'var(--bg)', borderRadius: 8, border: '1px solid var(--line)', marginBottom: 8, fontSize: 13, lineHeight: 1.6, fontFamily: 'var(--serif)' }}>{r.formatted}</div>
                    ))}
                    <button onClick={saveBulk} style={{ marginTop: 8, padding: '10px 20px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 999, fontSize: 12, cursor: 'pointer' }}>Save All to Reference List</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Saved Reference List */}
          <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="citation-list-head" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)' }}>REFERENCE LIST ({citations.length})</span>
              {citations.length > 0 && (
                <div className="citation-list-actions" style={{ display: 'flex', gap: 6 }}>
                  <button onClick={exportAll} style={{ padding: '5px 12px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 999, fontSize: 10, fontFamily: 'var(--mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Ic d={ICONS.copy} size={10}/> Copy All
                  </button>
                  <button onClick={downloadTxt} style={{ padding: '5px 12px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 999, fontSize: 10, fontFamily: 'var(--mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Ic d={ICONS.download} size={10}/> .txt
                  </button>
                  <button onClick={handleClear} style={{ padding: '5px 12px', background: 'rgba(180,80,40,0.08)', border: '1px solid rgba(180,80,40,0.2)', borderRadius: 999, fontSize: 10, fontFamily: 'var(--mono)', cursor: 'pointer', color: 'var(--terra)' }}>Clear</button>
                </div>
              )}
            </div>
            <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
              {citations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.5 }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-2)' }}>Your reference list is empty</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 8, letterSpacing: '0.08em' }}>GENERATE CITATIONS AND ADD THEM HERE</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {citations.map((c, i) => (
                    <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'start', padding: 14, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--line)' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', minWidth: 24, marginTop: 2 }}>{i + 1}.</span>
                      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.6, fontFamily: 'var(--serif)' }}>{c.formatted}</div>
                      <button onClick={() => handleRemove(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, flexShrink: 0 }}>
                        <Ic d={ICONS.trash} size={13}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
