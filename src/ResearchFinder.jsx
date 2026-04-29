import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { multiSearch, getGoogleScholarURL, getReadingList, saveToReadingList, removeFromReadingList } from './scholarAPI';
import { summarizePapers } from './geminiService';
// PDFSummarizer removed for now — will add later

const Ic = ({ d, size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;

const ICONS = {
  search: "M11 4a7 7 0 110 14 7 7 0 010-14zM21 21l-4.35-4.35",
  book: "M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20",
  save: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8",
  ext: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
  heart: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z",
  trash: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6",
  back: "M19 12H5M12 19l-7-7 7-7",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3",
  robot: "M12 2a2 2 0 012 2v2h4a2 2 0 012 2v2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2H2a2 2 0 01-2-2v-8a2 2 0 012-2h2V8a2 2 0 012-2h4V4a2 2 0 012-2z",
  sparkle: "M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z",
  lightbulb: "M9 18h6v2H9zM12 2a5 5 0 015 5v4a5 5 0 01-10 0V7a5 5 0 015-5z",
};

const FIELDS = ['', 'Agricultural And Food Sciences', 'Biology', 'Chemistry', 'Environmental Science', 'Medicine', 'Computer Science', 'Mathematics'];




const PaperCard = ({ paper, isSaved, onToggleSave }) => {
  const [expanded, setExpanded] = useState(false);
  const authors = (paper.authors || []).slice(0, 3).map(a => a.name).join(', ');
  const moreAuthors = (paper.authors || []).length > 3 ? ` +${paper.authors.length - 3} more` : '';
  const pdfUrl = paper.openAccessPdf?.url;

  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 14, padding: '24px 28px', transition: 'box-shadow 0.2s', cursor: 'default' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

      {/* Top tags */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        {paper.year && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', background: 'var(--bg-2)', padding: '3px 8px', borderRadius: 4, color: 'var(--muted)' }}>{paper.year}</span>}
        {paper.citationCount > 0 && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', background: paper.citationCount > 50 ? 'var(--green-soft)' : 'var(--bg-2)', padding: '3px 8px', borderRadius: 4, color: paper.citationCount > 50 ? 'var(--green)' : 'var(--muted)' }}>
          <Ic d={ICONS.star} size={9}/> {paper.citationCount} citations
        </span>}
        {pdfUrl && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', background: '#e8f5e9', padding: '3px 8px', borderRadius: 4, color: '#2e7d32' }}>Open Access</span>}
        {(paper.fieldsOfStudy || []).slice(0, 2).map(f => <span key={f} style={{ fontFamily: 'var(--mono)', fontSize: 10, background: 'var(--bg-2)', padding: '3px 8px', borderRadius: 4, color: 'var(--muted)' }}>{f}</span>)}
        {paper._source && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 4, color: '#fff', background: ({ google_scholar: '#4285F4', semantic_scholar: '#4a7c59', openalex: '#2d5a8e', crossref: '#b45028', pubmed: '#2e7d32', doaj: '#8e24aa' })[paper._source] || '#666' }}>{{ google_scholar: 'Scholar', semantic_scholar: 'S2', openalex: 'OpenAlex', crossref: 'CrossRef', pubmed: 'PubMed', doaj: 'DOAJ' }[paper._source] || paper._source}</span>}
        {paper._indiaScore > 0 && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 4, color: '#fff', background: '#e65100' }}>🇮🇳 India</span>}
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35, marginBottom: 8, letterSpacing: '-0.01em' }}>{paper.title}</h3>

      {/* Authors & Journal */}
      <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 8, lineHeight: 1.4 }}>
        {authors}{moreAuthors}
        {paper.journal?.name && <> — <span style={{ fontStyle: 'italic' }}>{paper.journal.name}</span></>}
      </div>

      {/* Abstract */}
      {paper.abstract && (
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>
          {expanded ? paper.abstract : `${paper.abstract.slice(0, 200)}${paper.abstract.length > 200 ? '...' : ''}`}
          {paper.abstract.length > 200 && (
            <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: 12, fontWeight: 500, marginLeft: 4 }}>
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={onToggleSave} style={{
          padding: '7px 14px', borderRadius: 999, fontSize: 11, fontFamily: 'var(--mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
          background: isSaved ? 'var(--ink)' : 'var(--paper)', color: isSaved ? 'var(--bg)' : 'var(--ink)', border: `1px solid ${isSaved ? 'var(--ink)' : 'var(--line)'}`,
        }}>
          <Ic d={isSaved ? ICONS.trash : ICONS.heart} size={11}/> {isSaved ? 'Saved' : 'Save'}
        </button>
        {paper.url && (
          <a href={paper.url} target="_blank" rel="noopener noreferrer" style={{ padding: '7px 14px', borderRadius: 999, fontSize: 11, fontFamily: 'var(--mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, background: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--line)', textDecoration: 'none' }}>
            <Ic d={ICONS.ext} size={11}/> View Paper
          </a>
        )}
        {pdfUrl && (
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '7px 14px', borderRadius: 999, fontSize: 11, fontFamily: 'var(--mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, background: 'var(--green)', color: '#fff', border: 'none', textDecoration: 'none' }}>
            <Ic d={ICONS.book} size={11}/> PDF
          </a>
        )}
        {paper.externalIds?.DOI && (
          <Link to={`/citations?doi=${paper.externalIds.DOI}`} style={{ padding: '7px 14px', borderRadius: 999, fontSize: 11, fontFamily: 'var(--mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, background: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--line)', textDecoration: 'none' }}>
            Cite
          </Link>
        )}
      </div>
    </div>
  );
};

// ═══ AI RESEARCH INSIGHTS ═══
const AIResearchInsights = ({ query, results, onAnalyze }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [showInsights, setShowInsights] = useState(false);

  const handleAnalyze = async () => {
    if (insights) {
      setShowInsights(!showInsights);
      return;
    }
    setAnalyzing(true);
    const analysis = await summarizePapers(results, query);
    setInsights(analysis);
    setShowInsights(true);
    setAnalyzing(false);
    if (onAnalyze) onAnalyze(analysis);
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <button
        onClick={handleAnalyze}
        disabled={analyzing || results.length === 0}
        style={{
          width: '100%',
          padding: '16px 24px',
          background: insights 
            ? (showInsights ? 'var(--paper)' : 'linear-gradient(135deg, #e74c3c, #c0392b)') 
            : (results.length === 0 ? 'var(--bg-2)' : 'linear-gradient(135deg, #e74c3c, #c0392b)'),
          color: insights && showInsights ? '#e74c3c' : (results.length === 0 ? 'var(--muted)' : 'white'),
          border: insights && showInsights ? '2px solid #e74c3c' : 'none',
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 600,
          cursor: results.length === 0 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: 'all 0.2s',
          boxShadow: insights && !showInsights ? 'none' : (results.length === 0 ? 'none' : '0 4px 15px rgba(231, 76, 60, 0.3)'),
        }}
      >
        {analyzing ? (
          <>
            <span style={{ 
              width: 18, 
              height: 18, 
              border: '2px solid currentColor', 
              borderTopColor: 'transparent', 
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}/>
            Analyzing Research Landscape...
          </>
        ) : (
          <>
            <Ic d={insights ? (showInsights ? ICONS.robot : ICONS.sparkle) : ICONS.robot} size={18}/>
            {insights 
              ? (showInsights ? 'Hide AI Insights' : 'Show AI Research Analysis') 
              : '🤖 Get AI Research Insights'}
          </>
        )}
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {showInsights && insights && (
        <div style={{
          marginTop: 16,
          padding: '24px',
          background: 'linear-gradient(135deg, var(--paper) 0%, rgba(231, 76, 60, 0.03) 100%)',
          border: '2px solid #e74c3c',
          borderRadius: 16,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: -10,
            left: 24,
            background: '#e74c3c',
            color: 'white',
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 11,
            fontFamily: 'var(--mono)',
            fontWeight: 600,
          }}>
            🤖 AI GENERATED ANALYSIS
          </div>

          <div style={{ marginTop: 8 }}>
            {/* Research Trends */}
            {insights.trends && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>📈</span> Key Research Trends
                </h4>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.8, color: 'var(--ink-2)' }}>
                  {Array.isArray(insights.trends) 
                    ? insights.trends.map((trend, i) => <li key={i}>{trend}</li>)
                    : <li>{insights.trends}</li>
                  }
                </ul>
              </div>
            )}

            {/* Research Gaps */}
            {insights.gaps && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>🔍</span> Identified Research Gaps
                </h4>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.8, color: 'var(--ink-2)' }}>
                  {Array.isArray(insights.gaps) 
                    ? insights.gaps.map((gap, i) => <li key={i}>{gap}</li>)
                    : <li>{insights.gaps}</li>
                  }
                </ul>
              </div>
            )}

            {/* Future Research */}
            {insights.futureResearch && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>💡</span> Future Research Directions
                </h4>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.8, color: 'var(--ink-2)' }}>
                  {Array.isArray(insights.futureResearch) 
                    ? insights.futureResearch.map((item, i) => <li key={i}>{item}</li>)
                    : <li>{insights.futureResearch}</li>
                  }
                </ul>
              </div>
            )}

            {/* Methodologies */}
            {insights.methodologies && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>🔬</span> Common Methodologies Observed
                </h4>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.8, color: 'var(--ink-2)' }}>
                  {Array.isArray(insights.methodologies) 
                    ? insights.methodologies.map((method, i) => <li key={i}>{method}</li>)
                    : <li>{insights.methodologies}</li>
                  }
                </ul>
              </div>
            )}
          </div>

          {/* Thesis Suggestion Box */}
          <div style={{
            marginTop: 20,
            padding: '16px',
            background: 'rgba(231, 76, 60, 0.08)',
            borderRadius: 10,
            border: '1px dashed #e74c3c',
          }}>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: '#c0392b' }}>
              <strong>💡 Thesis Opportunity:</strong> Based on these gaps, consider exploring an under-researched area with high potential for contribution. Use the <Link to="/thesis-topics" style={{ color: '#c0392b', textDecoration: 'underline', fontWeight: 600 }}>Thesis Topic Finder</Link> for more suggestions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ResearchFinder() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [yearFilter, setYearFilter] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [readingList, setReadingList] = useState(getReadingList());
  const [view, setView] = useState('search'); // search | saved
  const [sources, setSources] = useState(null);

  const doSearch = async (newOffset = 0) => {
    if (!query.trim()) return;
    setLoading(true); setError('');
    try {
      const data = await multiSearch(query, newOffset, 10, yearFilter, fieldFilter);
      setResults(data.data || []);
      setTotal(data.total || 0);
      setOffset(newOffset);
      setSources(data.sources || null);
    } catch (err) {
      setError(err.message || 'Search failed. Please try again.');
    } finally { setLoading(false); }
  };

  const toggleSave = (paper) => {
    const saved = readingList.find(p => p.paperId === paper.paperId);
    if (saved) {
      setReadingList(removeFromReadingList(paper.paperId));
    } else {
      setReadingList(saveToReadingList(paper));
    }
  };

  const isSaved = (paperId) => readingList.some(p => p.paperId === paperId);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <div className="site-shell page-hero" style={{ padding: '56px 40px 40px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 14 }}>§ RESEARCH · LITERATURE DISCOVERY</div>
        <h1 style={{ fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 0.98, marginBottom: 12 }}>
          Find <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400 }}>Papers.</span>
        </h1>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--ink-2)', maxWidth: 600 }}>Real-time <b>Google Scholar</b> + 5 databases — Indian research papers shown first. Papers with free PDFs float to the top.</p>
      </div>

      {/* Tabs */}
      <div className="site-shell page-tabs" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px 20px', display: 'flex', gap: 0 }}>
        {['search', 'saved'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '10px 24px', fontSize: 13, fontFamily: 'var(--mono)', letterSpacing: '0.06em', cursor: 'pointer',
            background: view === v ? 'var(--ink)' : 'var(--paper)', color: view === v ? 'var(--bg)' : 'var(--ink)',
            border: '1px solid var(--line)', borderRadius: v === 'search' ? '999px 0 0 999px' : '0 999px 999px 0',
          }}>
            {v === 'search' ? `SEARCH` : `SAVED (${readingList.length})`}
          </button>
        ))}
      </div>

      <div className="site-shell page-body" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px 80px' }}>

        {view === 'search' && (
          <>
            {/* Search Bar */}
            <div className="research-search-row" style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div className="research-search-input" style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text" value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSearch(0)}
                  placeholder="Search by topic, keyword, or author..."
                  style={{ width: '100%', padding: '16px 20px 16px 48px', fontSize: 16, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, fontFamily: 'var(--display)', outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}><Ic d={ICONS.search} size={18}/></div>
              </div>
              <button onClick={() => setShowFilters(!showFilters)} style={{ padding: '16px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, cursor: 'pointer', color: 'var(--ink)' }}>
                <Ic d={ICONS.filter} size={18}/>
              </button>
              <button onClick={() => doSearch(0)} disabled={loading} style={{
                padding: '16px 32px', background: 'var(--ink)', color: 'var(--bg)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--display)',
                opacity: loading ? 0.5 : 1, whiteSpace: 'nowrap',
              }}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              {query.trim() && (
                <a href={getGoogleScholarURL(query)} target="_blank" rel="noopener noreferrer" style={{
                  padding: '16px 24px', background: '#4285F4', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--display)', textDecoration: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                  Google Scholar
                </a>
              )}
            </div>

            {/* Source status */}
            {sources && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {[['google_scholar', 'Google Scholar', '#4285F4'], ['semantic_scholar', 'Semantic Scholar', '#4a7c59'], ['openalex', 'OpenAlex', '#2d5a8e'], ['crossref', 'CrossRef', '#b45028'], ['pubmed', 'PubMed', '#2e7d32'], ['doaj', 'DOAJ', '#8e24aa']].map(([key, label, color]) => (
                  <span key={key} style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '4px 10px', borderRadius: 999, letterSpacing: '0.06em', background: sources[key] ? color : 'var(--bg-2)', color: sources[key] ? '#fff' : 'var(--muted)' }}>
                    {sources[key] ? '✓' : '✗'} {label}
                  </span>
                ))}
              </div>
            )}

            {/* Filters */}
            {showFilters && (
              <div className="research-filters" style={{ display: 'flex', gap: 12, marginBottom: 20, padding: 16, background: 'var(--paper)', borderRadius: 10, border: '1px solid var(--line)' }}>
                <div>
                  <label style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>YEAR</label>
                  <input value={yearFilter} onChange={e => setYearFilter(e.target.value)} placeholder="e.g. 2020-2024" style={{ padding: '10px 14px', fontSize: 13, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8, width: 140 }} />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>FIELD</label>
                  <select value={fieldFilter} onChange={e => setFieldFilter(e.target.value)} style={{ padding: '10px 14px', fontSize: 13, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8, minWidth: 200 }}>
                    {FIELDS.map(f => <option key={f} value={f}>{f || 'All fields'}</option>)}
                  </select>
                </div>
              </div>
            )}

            {error && <div style={{ padding: 16, background: 'rgba(180,80,40,0.08)', borderRadius: 10, color: 'var(--terra)', fontSize: 14, marginBottom: 20 }}>{error}</div>}

            {/* Results */}
            {results.length > 0 && (
              <>
                <AIResearchInsights query={query} results={results} />
                
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 16 }}>
                  SHOWING {offset + 1}–{Math.min(offset + 10, total)} OF {total.toLocaleString()} RESULTS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {results.map(p => <PaperCard key={p.paperId} paper={p} isSaved={isSaved(p.paperId)} onToggleSave={() => toggleSave(p)} />)}
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
                  {offset > 0 && <button onClick={() => doSearch(offset - 10)} style={{ padding: '10px 20px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--mono)' }}>← Previous</button>}
                  {offset + 10 < total && <button onClick={() => doSearch(offset + 10)} style={{ padding: '10px 20px', background: 'var(--ink)', color: 'var(--bg)', border: 'none', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--mono)' }}>Next →</button>}
                </div>
              </>
            )}

            {/* Empty state */}
            {!loading && results.length === 0 && !error && (
              <div style={{ textAlign: 'center', padding: '80px 40px', opacity: 0.6 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 19, color: 'var(--ink-2)' }}>Search for any research topic to discover papers</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 10, letterSpacing: '0.08em' }}>TRY: "guava post harvest quality" · "wheat yield stability" · "NPK fertilizer"</div>
              </div>
            )}
          </>
        )}

        {/* Saved / Reading List */}
        {view === 'saved' && (
          <>
            {readingList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 40px', opacity: 0.6 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💾</div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 19, color: 'var(--ink-2)' }}>Your reading list is empty</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 10, letterSpacing: '0.08em' }}>SEARCH AND SAVE PAPERS TO BUILD YOUR LIST</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {readingList.map(p => <PaperCard key={p.paperId} paper={p} isSaved={true} onToggleSave={() => toggleSave(p)} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
