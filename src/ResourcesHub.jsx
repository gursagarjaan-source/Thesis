import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';


// eslint-disable-next-line react-refresh/only-export-components
export const CATEGORIES = [
  {
    id: 'journals', icon: '📰', title: 'Open Access Journals', desc: 'Free peer-reviewed journals for agriculture & horticulture',
    resources: [
      { name: 'DOAJ — Directory of Open Access Journals', url: 'https://doaj.org', desc: 'Searchable directory of 19,000+ open access journals across all fields.', tip: 'Search for your specific crop or topic. Filter by country (India) for Indian journals.' },
      { name: 'PubMed Central (PMC)', url: 'https://www.ncbi.nlm.nih.gov/pmc/', desc: 'Free full-text archive of biomedical and life sciences literature.', tip: 'Best for plant pathology, physiology, and biochemistry papers.' },
      { name: 'Indian Journals (ICAR)', url: 'https://www.indianjournals.com', desc: 'Indian research journals including IARI, ICAR publications.', tip: 'Essential for Indian agricultural research citations.' },
      { name: 'IJHS — Indian Journal of Horticultural Sciences', url: 'https://www.indianjournals.com/ijor.aspx?target=ijor:ijhs', desc: 'Premier Indian horticulture research journal published by ICAR-IIHR.', tip: 'Key journal for fruit crops, vegetables, floriculture, and post-harvest papers.' },
      { name: 'Google Scholar', url: 'https://scholar.google.com', desc: 'Broad search engine for scholarly literature across disciplines.', tip: 'Use "cited by" to find latest papers citing a classic study.' },
      { name: 'Sci-Hub', url: 'https://sci-hub.se', desc: 'Access to paywalled research papers (legality varies by jurisdiction).', tip: 'Paste the DOI to access full-text PDFs of paywalled papers.' },
    ]
  },
  {
    id: 'thesis', icon: '🎓', title: 'Thesis Repositories', desc: 'Access completed MSc & PhD theses for reference',
    resources: [
      { name: 'Shodhganga (INFLIBNET)', url: 'https://shodhganga.inflibnet.ac.in', desc: 'India\'s largest repository of PhD theses from all Indian universities.', tip: 'Search your exact topic to find previous theses from your university or related institutions.' },
      { name: 'NDLTD — Networked Digital Library of Theses', url: 'https://ndltd.org', desc: 'Global ETD search covering millions of theses and dissertations.', tip: 'Search internationally to find how similar experiments were conducted abroad.' },
      { name: 'ProQuest Dissertations', url: 'https://www.proquest.com/products-services/pqdtglobal.html', desc: 'World\'s largest collection of dissertations and theses.', tip: 'Often available through your university library. Ask your librarian for access.' },
      { name: 'KRISHIKOSH (ICAR)', url: 'https://krishikosh.egranth.ac.in', desc: 'ICAR institutional repository for agricultural theses, reports, and publications.', tip: 'Best for agriculture-specific theses from Indian Agricultural Universities.' },
    ]
  },
  {
    id: 'data', icon: '📊', title: 'Data Sources & Portals', desc: 'Official statistics and data for agricultural research',
    resources: [
      { name: 'FAOSTAT', url: 'https://www.fao.org/faostat/', desc: 'FAO\'s global statistics on food, agriculture, and natural resources.', tip: 'Use for global production, area, and yield data of any crop. Export as Excel.' },
      { name: 'APEDA AgriExchange', url: 'https://agriexchange.apeda.gov.in', desc: 'India\'s agricultural export data from APEDA.', tip: 'Good source for export statistics and market trends of Indian crops.' },
      { name: 'NHB — National Horticulture Board', url: 'https://nhb.gov.in', desc: 'Indian horticulture statistics — area, production, and productivity data.', tip: 'Essential for introduction chapter data on fruit/vegetable production in India.' },
      { name: 'India Stat', url: 'https://www.indiastat.com', desc: 'Comprehensive Indian socio-economic and agricultural statistics.', tip: 'Paid, but your university library may have institutional access.' },
      { name: 'DAC&FW — Agriculture Statistics', url: 'https://agricoop.nic.in', desc: 'Department of Agriculture data including annual reports and statistics.', tip: 'Official government data for crop area, production, and policy information.' },
    ]
  },
  {
    id: 'software', icon: '💻', title: 'Free Statistical Software', desc: 'Software tools for data analysis and visualization',
    resources: [
      { name: 'R + RStudio', url: 'https://posit.co/download/rstudio-desktop/', desc: 'The gold standard for statistical computing. Free and open-source.', tip: 'Use the "agricolae" package for ANOVA, LSD, DMRT. "ggplot2" for publication-quality graphs.' },
      { name: 'OPSTAT (Original)', url: 'http://14.139.232.166/opstat/', desc: 'Original OPSTAT from CCS HAU Hisar — the web-based statistical tool for agriculture.', tip: 'Cross-verify your results with the original OPSTAT. Both should match exactly.' },
      { name: 'PAST (PAleontological STatistics)', url: 'https://www.nhm.uio.no/english/research/resources/past/', desc: 'Free multivariate analysis software — PCA, cluster analysis, ANOVA.', tip: 'Easy alternative to R for multivariate analysis. Good for PCA and cluster dendrograms.' },
      { name: 'jamovi', url: 'https://www.jamovi.org', desc: 'User-friendly statistical software built on R with spreadsheet-style UI.', tip: 'Best for beginners — point-and-click interface with R power underneath.' },
      { name: 'JASP', url: 'https://jasp-stats.org', desc: 'Free, open-source stats software with Bayesian analysis support.', tip: 'Great for ANOVA, t-tests, regression with beautiful output tables.' },
      { name: 'STAR (IRRI)', url: 'https://bbi.irri.org/products', desc: 'Statistical Tool for Agricultural Research developed by IRRI.', tip: 'Specifically designed for agricultural field trials. Handles augmented designs well.' },
    ]
  },
  {
    id: 'writing', icon: '✍️', title: 'Writing & Formatting Tools', desc: 'Polish your thesis writing and presentation',
    resources: [
      { name: 'Grammarly (Free)', url: 'https://www.grammarly.com', desc: 'AI-powered grammar, spelling, and style checker.', tip: 'Use the free version — it catches most errors. Install the browser extension.' },
      { name: 'Hemingway Editor', url: 'https://hemingwayapp.com', desc: 'Makes your writing bold and clear. Highlights complex sentences.', tip: 'Paste your abstract and discussion sections to simplify academic jargon.' },
      { name: 'Overleaf (LaTeX)', url: 'https://www.overleaf.com', desc: 'Online LaTeX editor for beautifully typeset documents.', tip: 'Search for your university thesis template on Overleaf. Many Indian universities have templates.' },
      { name: 'Zotero', url: 'https://www.zotero.org', desc: 'Free reference manager — collect, organize, cite, and share research.', tip: 'Install the browser connector to save papers with one click. Auto-formats citations.' },
      { name: 'Mendeley', url: 'https://www.mendeley.com', desc: 'Free reference manager and academic social network by Elsevier.', tip: 'Good PDF reader with annotation features. Syncs across devices.' },
    ]
  },
  {
    id: 'presentation', icon: '🎨', title: 'Presentation & Defense', desc: 'Tools for thesis defense and seminars',
    resources: [
      { name: 'Canva', url: 'https://www.canva.com', desc: 'Free design platform with presentation templates.', tip: 'Search "thesis defense" for professional templates. Use the academic color palette.' },
      { name: 'Google Slides', url: 'https://slides.google.com', desc: 'Free collaborative presentation tool.', tip: 'Search for "thesis defense template" on SlidesGo.com for free Google Slides templates.' },
      { name: 'Beautiful.ai', url: 'https://www.beautiful.ai', desc: 'AI-powered presentation maker with smart templates.', tip: 'Limited free plan, but great for creating visually impressive defense presentations.' },
      { name: 'draw.io (diagrams.net)', url: 'https://app.diagrams.net', desc: 'Free online diagram tool for flowcharts, experimental layouts.', tip: 'Create field layout diagrams, experimental design flowcharts, and conceptual frameworks.' },
      { name: 'BioRender', url: 'https://www.biorender.com', desc: 'Scientific figure creation tool with free plan for students.', tip: 'Create professional experimental workflow diagrams and graphical abstracts.' },
    ]
  },
];

export default function ResourcesHub() {
  const [searchParams] = useSearchParams();
  const requestedCategory = searchParams.get('category');
  const initialCategory = CATEGORIES.some(c => c.id === requestedCategory) ? requestedCategory : 'journals';
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const currentCat = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <div className="site-shell page-hero" style={{ padding: '56px 40px 40px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 14 }}>§ ACADEMIC · CURATED RESOURCES</div>
        <h1 style={{ fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 0.98, marginBottom: 12 }}>
          Resource <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400 }}>Hub.</span>
        </h1>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--ink-2)', maxWidth: 600 }}>Curated collection of free tools, journals, data portals, and writing aids for agricultural research students.</p>
      </div>

      <div className="site-shell page-body" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px 80px' }}>
        <div className="resources-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28 }}>

          {/* Sidebar */}
          <div className="resources-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                padding: '14px 18px', borderRadius: 12, fontSize: 13, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s',
                background: activeCategory === cat.id ? 'var(--ink)' : 'var(--paper)', color: activeCategory === cat.id ? 'var(--bg)' : 'var(--ink)',
                border: '1px solid var(--line)', fontWeight: activeCategory === cat.id ? 600 : 400,
              }}>
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <div>
                  <div style={{ marginBottom: 2 }}>{cat.title}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>{cat.resources.length} RESOURCES</div>
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 6 }}>{currentCat?.icon} {currentCat?.title?.toUpperCase()}</div>
            <div style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 20 }}>{currentCat?.desc}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentCat?.resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{
                  background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 24px', textDecoration: 'none', color: 'var(--ink)', transition: 'box-shadow 0.2s, transform 0.15s', display: 'block',
                }} onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                   onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{r.name}</h3>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 8px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 999, letterSpacing: '0.06em', flexShrink: 0 }}>FREE</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 10 }}>{r.desc}</div>
                  <div style={{ fontSize: 12, color: 'var(--green)', background: 'var(--green-soft)', padding: '8px 12px', borderRadius: 8, lineHeight: 1.5 }}>
                    🎓 <strong>Student Tip:</strong> {r.tip}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
