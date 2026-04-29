// Academic API Service Layer — Google Scholar (Serper), Semantic Scholar, CrossRef, OpenAlex, PubMed, DOAJ

const SEMANTIC_SCHOLAR = 'https://api.semanticscholar.org/graph/v1';
const CROSSREF = 'https://api.crossref.org/works';
const OPENALEX = 'https://api.openalex.org';
const SEMANTIC_SCHOLAR_API_KEY = import.meta.env.VITE_SEMANTIC_SCHOLAR_API_KEY || '';
const SERPER_API_KEY = import.meta.env.VITE_SERPER_API_KEY || '';

const headers = { 'User-Agent': 'KhetLab-Academic-Toolkit/1.0 (mailto:research@khetlab.app)' };
const semanticScholarHeaders = SEMANTIC_SCHOLAR_API_KEY
  ? { 'x-api-key': SEMANTIC_SCHOLAR_API_KEY }
  : {};

// ═══ Semantic Scholar ═══
export const searchPapers = async (query, offset = 0, limit = 10, year = '', fieldsOfStudy = '') => {
  const params = new URLSearchParams({
    query,
    offset: String(offset),
    limit: String(limit),
    fields: 'paperId,title,abstract,year,citationCount,influentialCitationCount,authors,journal,url,openAccessPdf,externalIds,fieldsOfStudy,publicationTypes',
  });
  if (year) params.append('year', year);
  if (fieldsOfStudy) params.append('fieldsOfStudy', fieldsOfStudy);

  const res = await fetch(`${SEMANTIC_SCHOLAR}/paper/search?${params}`, { headers: semanticScholarHeaders });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
};

// ═══ Google Scholar URL (opens in new tab) ═══
export const getGoogleScholarURL = (query) => {
  return `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`;
};

// ═══ Google Scholar — Real-time via Serper API ═══
export const searchGoogleScholar = async (query, page = 1) => {
  if (!SERPER_API_KEY) return [];
  try {
    const res = await fetch('https://google.serper.dev/scholar', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: query,
        gl: 'in',       // geo-location India → Indian results prioritized by Google
        num: 20,         // fetch more so we can re-rank
        page,
      }),
    });
    if (!res.ok) throw new Error(`Serper ${res.status}`);
    const data = await res.json();

    return (data.organic || []).map((item, idx) => ({
      paperId: `gs-${idx}-${Date.now()}`,
      title: item.title || '',
      abstract: item.snippet || '',
      year: item.year ? parseInt(item.year) : null,
      citationCount: item.citedBy?.value || 0,
      authors: item.publication ? [{ name: item.publication }] : [],
      journal: { name: item.publication || '' },
      url: item.link || '',
      openAccessPdf: item.resources?.find(r => r.title?.toLowerCase().includes('pdf'))
        ? { url: item.resources.find(r => r.title?.toLowerCase().includes('pdf')).link }
        : null,
      externalIds: { DOI: null },
      fieldsOfStudy: [],
      _source: 'google_scholar',
      _rawSnippet: item.snippet || '',
      _rawPublication: item.publication || '',
    }));
  } catch (err) {
    console.error('[GoogleScholar]', err.message);
    return [];
  }
};

// ═══ India Priority Scoring ═══
const INDIAN_SIGNALS = [
  // Institutions
  'india', 'indian', 'icar', 'iari', 'pau', 'tnau', 'gbpuat', 'ndri', 'ivri',
  'jnkvv', 'bhu', 'pusa', 'anand', 'ludhiana', 'hyderabad', 'bangalore',
  'bengaluru', 'delhi', 'chennai', 'kolkata', 'mumbai', 'pune', 'coimbatore',
  'kanpur', 'varanasi', 'allahabad', 'prayagraj', 'chandigarh', 'pantnagar',
  'udaipur', 'jodhpur', 'bhopal', 'raipur', 'ranchi', 'patna', 'lucknow',
  'agra', 'jaipur', 'jammu', 'srinagar', 'shimla', 'dehradun', 'guwahati',
  // Orgs
  'csir', 'ugc', 'dst', 'dbt', 'drdo', 'icmr', 'aiims', 'iit', 'nit',
  'iisc', 'isro', 'nabard', 'fci',
  // States
  'punjab', 'haryana', 'rajasthan', 'gujarat', 'maharashtra', 'karnataka',
  'tamil nadu', 'kerala', 'andhra', 'telangana', 'odisha', 'bihar',
  'west bengal', 'uttar pradesh', 'madhya pradesh', 'assam', 'jharkhand',
  // Journals
  'indian journal', 'journal of indian', 'indian j.', 'curr. sci.',
  'indian farming', 'annals of plant', 'j. pharmacogn.', 'ijhs',
];

export function getIndiaScore(paper) {
  const text = [
    paper.title || '',
    paper.abstract || paper._rawSnippet || '',
    paper.journal?.name || paper._rawPublication || '',
    (paper.authors || []).map(a => a.name || '').join(' '),
  ].join(' ').toLowerCase();

  let score = 0;
  for (const signal of INDIAN_SIGNALS) {
    if (text.includes(signal)) score++;
  }
  return Math.min(score, 10); // cap at 10
}

export function sortIndiaFirst(papers) {
  return papers.map(p => ({ ...p, _indiaScore: getIndiaScore(p) }))
    .sort((a, b) => {
      // India papers first
      if (a._indiaScore > 0 && b._indiaScore === 0) return -1;
      if (a._indiaScore === 0 && b._indiaScore > 0) return 1;
      // Within Indian papers: higher score first
      if (a._indiaScore !== b._indiaScore) return b._indiaScore - a._indiaScore;
      // Then by PDF availability
      const pdfA = a.openAccessPdf?.url ? 1 : 0;
      const pdfB = b.openAccessPdf?.url ? 1 : 0;
      if (pdfA !== pdfB) return pdfB - pdfA;
      // Then by citations
      return (b.citationCount || 0) - (a.citationCount || 0);
    });
}

// ═══ Multi-Source Search (Google Scholar-like breadth) ═══
// Queries 5 sources in parallel: Semantic Scholar + OpenAlex + CrossRef + PubMed + DOAJ
// Then enriches missing PDFs via Unpaywall
export const multiSearch = async (query, offset = 0, limit = 10, year = '', fieldsOfStudy = '') => {
  const results = [];
  const page = Math.floor(offset / limit) + 1;

  // Launch all 6 searches in parallel
  const [gsResult, ssResult, oaResult, crResult, pmResult, doajResult] = await Promise.allSettled([
    // 0. Google Scholar (real-time via Serper)
    searchGoogleScholar(query, page),
    // 1. Semantic Scholar
    searchPapers(query, offset, limit, year, fieldsOfStudy),
    // 2. OpenAlex
    (async () => {
      const params = new URLSearchParams({ search: query, per_page: String(limit), page: String(page) });
      if (year) {
        const yearMatch = year.match(/(\d{4})/);
        if (yearMatch) params.append('filter', `publication_year:${yearMatch[1]}`);
      }
      const res = await fetch(`${OPENALEX}/works?${params}`, { headers });
      if (!res.ok) return { results: [] };
      return res.json();
    })(),
    // 3. CrossRef
    (async () => {
      const params = new URLSearchParams({ query, rows: String(limit), offset: String(offset), sort: 'relevance' });
      const res = await fetch(`${CROSSREF}?${params}`, { headers });
      if (!res.ok) return { message: { items: [] } };
      return res.json();
    })(),
    // 4. PubMed Central
    searchPubMed(query, limit, offset),
    // 5. DOAJ
    searchDOAJ(query, limit, page),
  ]);

  // Helper: check if title already exists (case-insensitive dedup)
  const titleExists = (title) => {
    if (!title) return true;
    const norm = title.toLowerCase().trim();
    return results.some(r => r.title && r.title.toLowerCase().trim() === norm);
  };

  // Collect Google Scholar results FIRST (real-time, India-focused)
  if (gsResult.status === 'fulfilled' && Array.isArray(gsResult.value)) {
    gsResult.value.forEach(p => {
      if (!titleExists(p.title)) results.push(p);
    });
  }

  // Collect Semantic Scholar results
  if (ssResult.status === 'fulfilled' && ssResult.value?.data) {
    ssResult.value.data.forEach(p => {
      results.push({ ...p, _source: 'semantic_scholar' });
    });
  }

  // Normalize OpenAlex results
  if (oaResult.status === 'fulfilled' && oaResult.value?.results) {
    oaResult.value.results.forEach(w => {
      if (!titleExists(w.title)) {
        results.push({
          paperId: w.id || `oa_${Math.random().toString(36).slice(2)}`,
          title: w.title || '',
          abstract: w.abstract_inverted_index ? reconstructAbstract(w.abstract_inverted_index) : '',
          year: w.publication_year,
          citationCount: w.cited_by_count || 0,
          authors: (w.authorships || []).slice(0, 10).map(a => ({ name: a.author?.display_name || '' })),
          journal: { name: w.primary_location?.source?.display_name || '' },
          url: w.doi ? `https://doi.org/${w.doi.replace('https://doi.org/','')}` : (w.primary_location?.landing_page_url || ''),
          openAccessPdf: w.open_access?.oa_url ? { url: w.open_access.oa_url } : null,
          externalIds: { DOI: w.doi ? w.doi.replace('https://doi.org/','') : null },
          fieldsOfStudy: (w.concepts || []).slice(0, 3).map(c => c.display_name),
          _source: 'openalex',
        });
      } else {
        // Enrich existing result
        const existing = results.find(r => r.title?.toLowerCase().trim() === w.title?.toLowerCase().trim());
        if (existing) {
          if (!existing.abstract && w.abstract_inverted_index) existing.abstract = reconstructAbstract(w.abstract_inverted_index);
          if (!existing.openAccessPdf && w.open_access?.oa_url) existing.openAccessPdf = { url: w.open_access.oa_url };
        }
      }
    });
  }

  // Normalize CrossRef results
  if (crResult.status === 'fulfilled' && crResult.value?.message?.items) {
    crResult.value.message.items.forEach(item => {
      const title = item.title?.[0] || '';
      if (!titleExists(title) && title) {
        results.push({
          paperId: item.DOI || `cr_${Math.random().toString(36).slice(2)}`,
          title,
          abstract: item.abstract ? item.abstract.replace(/<[^>]+>/g, '') : '',
          year: item.published?.['date-parts']?.[0]?.[0] || item.issued?.['date-parts']?.[0]?.[0],
          citationCount: item['is-referenced-by-count'] || 0,
          authors: (item.author || []).slice(0, 10).map(a => ({ name: `${a.given || ''} ${a.family || ''}`.trim() })),
          journal: { name: item['container-title']?.[0] || '' },
          url: item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : ''),
          openAccessPdf: null,
          externalIds: { DOI: item.DOI || null },
          fieldsOfStudy: (item.subject || []).slice(0, 3),
          _source: 'crossref',
        });
      } else {
        const existing = results.find(r => r.title?.toLowerCase().trim() === title?.toLowerCase().trim());
        if (existing && !existing.externalIds?.DOI && item.DOI) {
          existing.externalIds = { ...existing.externalIds, DOI: item.DOI };
        }
      }
    });
  }

  // Add PubMed results
  if (pmResult.status === 'fulfilled' && Array.isArray(pmResult.value)) {
    pmResult.value.forEach(p => {
      if (!titleExists(p.title)) results.push(p);
    });
  }

  // Add DOAJ results
  if (doajResult.status === 'fulfilled' && Array.isArray(doajResult.value)) {
    doajResult.value.forEach(p => {
      if (!titleExists(p.title)) results.push(p);
    });
  }

  // Enrich papers without PDFs using Unpaywall (limit to first 10 without PDF to avoid slowdown)
  const noPdfPapers = results.filter(p => !p.openAccessPdf?.url && p.externalIds?.DOI);
  const toEnrich = noPdfPapers.slice(0, 10);
  if (toEnrich.length > 0) {
    const enriched = await enrichWithPDFLinks(toEnrich);
    const enrichMap = new Map(enriched.map(p => [p.paperId, p]));
    for (let i = 0; i < results.length; i++) {
      if (enrichMap.has(results[i].paperId)) {
        results[i] = enrichMap.get(results[i].paperId);
      }
    }
  }

  // Apply India-first sorting (Indian research papers → top, others → bottom)
  const sorted = sortIndiaFirst(results);

  return {
    data: sorted,
    total: sorted.length + (ssResult.status === 'fulfilled' ? (ssResult.value?.total || 0) : 0),
    sources: {
      google_scholar: gsResult.status === 'fulfilled' && (gsResult.value?.length || 0) > 0,
      semantic_scholar: ssResult.status === 'fulfilled',
      openalex: oaResult.status === 'fulfilled',
      crossref: crResult.status === 'fulfilled',
      pubmed: pmResult.status === 'fulfilled',
      doaj: doajResult.status === 'fulfilled',
    },
  };
};

// Helper: reconstruct abstract from OpenAlex inverted index
function reconstructAbstract(invertedIndex) {
  if (!invertedIndex) return '';
  const words = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    positions.forEach(pos => { words[pos] = word; });
  }
  return words.filter(Boolean).join(' ').slice(0, 1000);
}

export const getPaperDetails = async (paperId) => {
  const fields = 'paperId,title,abstract,year,citationCount,authors,journal,url,openAccessPdf,externalIds,references,citations,fieldsOfStudy';
  const res = await fetch(`${SEMANTIC_SCHOLAR}/paper/${paperId}?fields=${fields}`, { headers: semanticScholarHeaders });
  if (!res.ok) throw new Error(`Paper fetch failed: ${res.status}`);
  return res.json();
};

export const getRecommendations = async (paperId) => {
  const fields = 'paperId,title,abstract,year,citationCount,authors,journal,url,openAccessPdf';
  const res = await fetch(`${SEMANTIC_SCHOLAR}/paper/${paperId}/citations?fields=${fields}&limit=5`, { headers: semanticScholarHeaders });
  if (!res.ok) return { data: [] };
  return res.json();
};

// ═══ CrossRef — DOI Lookup & Citation Generation ═══
export const lookupDOI = async (doi) => {
  const cleanDOI = doi.replace(/^https?:\/\/doi\.org\//, '').trim();
  const res = await fetch(`${CROSSREF}/${encodeURIComponent(cleanDOI)}`, { headers });
  if (!res.ok) throw new Error(`DOI not found: ${cleanDOI}`);
  const data = await res.json();
  return data.message;
};

export const searchCrossRef = async (query, rows = 10) => {
  const params = new URLSearchParams({ query, rows: String(rows), sort: 'relevance' });
  const res = await fetch(`${CROSSREF}?${params}`, { headers });
  if (!res.ok) throw new Error(`CrossRef search failed`);
  const data = await res.json();
  return data.message.items || [];
};

// ═══ Citation Formatting ═══
export const formatCitation = (meta, style = 'APA') => {
  if (!meta) return '';
  const authors = (meta.author || []).map(a => `${a.family || ''}, ${(a.given || '').charAt(0)}.`);
  const year = meta.published?.['date-parts']?.[0]?.[0] || meta.issued?.['date-parts']?.[0]?.[0] || 'n.d.';
  const title = meta.title?.[0] || meta['container-title']?.[0] || '';
  const journal = meta['container-title']?.[0] || '';
  const volume = meta.volume || '';
  const issue = meta.issue || '';
  const pages = meta.page || '';
  const doi = meta.DOI || '';

  const authorStr = authors.length > 6
    ? `${authors.slice(0, 6).join(', ')} ... ${authors[authors.length - 1]}`
    : authors.join(', ');
  const authorStrMLA = authors.length > 0 ? `${(meta.author[0]?.family || '')}, ${(meta.author[0]?.given || '')}` + (authors.length > 1 ? ', et al.' : '') : '';

  switch (style) {
    case 'APA':
      return `${authorStr} (${year}). ${title}. *${journal}*, ${volume}${issue ? `(${issue})` : ''}${pages ? `, ${pages}` : ''}. https://doi.org/${doi}`;
    case 'MLA':
      return `${authorStrMLA}. "${title}." *${journal}* ${volume}${issue ? `.${issue}` : ''} (${year})${pages ? `: ${pages}` : ''}. doi:${doi}.`;
    case 'Harvard':
      return `${authorStr} ${year}, '${title}', *${journal}*, vol. ${volume}${issue ? `, no. ${issue}` : ''}${pages ? `, pp. ${pages}` : ''}. DOI: ${doi}`;
    case 'Chicago':
      return `${authorStr}. "${title}." *${journal}* ${volume}${issue ? `, no. ${issue}` : ''} (${year})${pages ? `: ${pages}` : ''}. https://doi.org/${doi}.`;
    case 'IJHS':
      return `${authorStr} (${year}). ${title}. *${journal}* ${volume}${issue ? `(${issue})` : ''}${pages ? `: ${pages}` : ''}.`;
    default:
      return `${authorStr} (${year}). ${title}. ${journal} ${volume}(${issue}): ${pages}. doi:${doi}`;
  }
};

// ═══ OpenAlex — Open Access Discovery ═══
export const searchOpenAlex = async (query, page = 1) => {
  const params = new URLSearchParams({
    search: query,
    per_page: '10',
    page: String(page),
  });
  const res = await fetch(`${OPENALEX}/works?${params}`, { headers });
  if (!res.ok) throw new Error('OpenAlex search failed');
  const data = await res.json();
  return data.results || [];
};

// ═══ PubMed Central (free, no key) ═══
export const searchPubMed = async (query, limit = 10, offset = 0) => {
  try {
    const searchRes = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=${encodeURIComponent(query)}&retmax=${limit}&retstart=${offset}&retmode=json`
    );
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    const ids = searchData.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    const detailRes = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pmc&id=${ids.join(',')}&retmode=json`
    );
    if (!detailRes.ok) return [];
    const detailData = await detailRes.json();

    return Object.values(detailData.result || {})
      .filter(p => p.uid)
      .map(p => ({
        paperId: `pubmed-${p.uid}`,
        title: p.title || '',
        abstract: '',
        year: parseInt(p.pubdate?.split(' ')[0]) || null,
        citationCount: 0,
        authors: (p.authors || []).slice(0, 10).map(a => ({ name: a.name })),
        journal: { name: p.fulljournalname || p.source || '' },
        url: `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${p.uid}/`,
        openAccessPdf: { url: `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${p.uid}/pdf/` },
        externalIds: { DOI: p.elocationid?.replace('doi: ', '') || null },
        fieldsOfStudy: [],
        _source: 'pubmed',
      }));
  } catch (err) {
    console.error('[PubMed]', err.message);
    return [];
  }
};

// ═══ DOAJ — Directory of Open Access Journals (free, no key) ═══
export const searchDOAJ = async (query, limit = 10, page = 1) => {
  try {
    const res = await fetch(
      `https://doaj.org/api/search/articles/${encodeURIComponent(query)}?pageSize=${limit}&page=${page}`
    );
    if (!res.ok) return [];
    const data = await res.json();

    return (data.results || []).map(item => {
      const bib = item.bibjson || {};
      const doi = bib.identifier?.find(i => i.type === 'doi')?.id || null;
      const pdfLink = bib.link?.find(l => l.type === 'fulltext')?.url || null;

      return {
        paperId: `doaj-${item.id}`,
        title: bib.title || '',
        abstract: bib.abstract || '',
        year: parseInt(bib.year) || null,
        citationCount: 0,
        authors: (bib.author || []).slice(0, 10).map(a => ({ name: `${a.name || ''}`.trim() })),
        journal: { name: bib.journal?.title || '' },
        url: pdfLink || (doi ? `https://doi.org/${doi}` : ''),
        openAccessPdf: pdfLink ? { url: pdfLink } : null,
        externalIds: { DOI: doi },
        fieldsOfStudy: (bib.subject || []).slice(0, 3).map(s => s.term || s),
        _source: 'doaj',
      };
    });
  } catch (err) {
    console.error('[DOAJ]', err.message);
    return [];
  }
};

// ═══ Unpaywall — Free legal PDF finder (no key, just email) ═══
export const checkUnpaywall = async (doi) => {
  if (!doi) return null;
  try {
    const res = await fetch(
      `https://api.unpaywall.org/v2/${encodeURIComponent(doi)}?email=khetlab.research@gmail.com`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const loc = data.best_oa_location;
    return loc?.url_for_pdf || loc?.url || null;
  } catch {
    return null;
  }
};

// Enrich papers that lack PDFs using Unpaywall
export const enrichWithPDFLinks = async (papers) => {
  const results = [];
  for (const paper of papers) {
    if (paper.openAccessPdf?.url) {
      results.push(paper);
      continue;
    }
    const doi = paper.externalIds?.DOI;
    if (doi) {
      const pdfUrl = await checkUnpaywall(doi);
      if (pdfUrl) {
        results.push({ ...paper, openAccessPdf: { url: pdfUrl } });
      } else {
        results.push(paper);
      }
    } else {
      results.push(paper);
    }
    await new Promise(r => setTimeout(r, 100)); // Unpaywall rate limit
  }
  return results;
};

// ═══ Local Storage Helpers (Reading List) ═══
const STORAGE_KEY = 'opstat_reading_list';
const CITATIONS_KEY = 'opstat_citations';

export const getReadingList = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};
export const saveToReadingList = (paper) => {
  const list = getReadingList();
  if (!list.find(p => p.paperId === paper.paperId)) {
    list.push({ ...paper, savedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  return list;
};
export const removeFromReadingList = (paperId) => {
  const list = getReadingList().filter(p => p.paperId !== paperId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
};

export const getSavedCitations = () => {
  try { return JSON.parse(localStorage.getItem(CITATIONS_KEY) || '[]'); } catch { return []; }
};
export const saveCitation = (citation) => {
  const list = getSavedCitations();
  list.push({ ...citation, id: Date.now() });
  localStorage.setItem(CITATIONS_KEY, JSON.stringify(list));
  return list;
};
export const removeCitation = (id) => {
  const list = getSavedCitations().filter(c => c.id !== id);
  localStorage.setItem(CITATIONS_KEY, JSON.stringify(list));
  return list;
};
export const clearCitations = () => {
  localStorage.setItem(CITATIONS_KEY, '[]');
  return [];
};
