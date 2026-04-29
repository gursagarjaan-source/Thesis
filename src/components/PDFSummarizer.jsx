// ═══════════════════════════════════════════════════════════════════════════
// PDF Summarizer — extract text from a research paper PDF, then summarize
// with Gemini (primary) or NVIDIA NIM (fallback). Everything in-browser.
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { extractTextFromPDFUrl, extractTextFromPDFFile } from '../pdfExtractor';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const NVIDIA_KEY = import.meta.env.VITE_NVIDIA_API_KEY || '';

function buildPrompt(text, title = '') {
  return `You are a research assistant helping an M.Sc or Ph.D agriculture student in India
understand a research paper for their thesis literature review.

${title ? `Paper title: ${title}\n` : ''}

Read the paper text below and return a JSON object with these exact fields:

{
  "oneParagraph": "A 4-5 sentence summary of what this paper studied, how, and what it found. Write in past tense. Use specific numbers from the paper (yield values, percentages, treatment doses). Suitable to paste directly into a thesis Chapter 2.",
  "keyFindings": [
    "Finding 1 with specific numbers",
    "Finding 2 with specific numbers",
    "Finding 3 with specific numbers"
  ],
  "methodology": {
    "design": "e.g. RBD with 4 treatments and 3 replications",
    "crop": "e.g. Wheat cv. HD-2967",
    "location": "e.g. Research farm, PAU Ludhiana",
    "duration": "e.g. Rabi 2022-23",
    "treatments": ["T1: ...", "T2: ...", "T0: control"]
  },
  "researchGap": "What the authors themselves said is still unknown or needs further study.",
  "howToCite": "Author(s) (Year). Title. Journal, Volume(Issue), Pages.",
  "relevanceScore": 8,
  "relevanceReason": "Why this paper is or isn't relevant for Indian agriculture students"
}

Return ONLY valid JSON. No markdown. No preamble. No explanation.

Paper text:
"""
${text.slice(0, 12000)}
"""`;
}

async function callGemini(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

async function callNVIDIA(prompt) {
  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NVIDIA_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta/llama-3.3-70b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });
  if (!res.ok) throw new Error(`NVIDIA ${res.status}`);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

export default function PDFSummarizer() {
  const [mode, setMode]       = useState('url');
  const [pdfUrl, setPdfUrl]   = useState('');
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState('');
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');

  async function summarize() {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      setStatus('Extracting text from PDF...');
      let text = '';

      if (mode === 'url') {
        if (!pdfUrl.trim()) throw new Error('Please enter a PDF URL');
        text = await extractTextFromPDFUrl(pdfUrl.trim());
      } else if (file) {
        text = await extractTextFromPDFFile(file);
      } else {
        throw new Error('Please select a PDF file');
      }

      if (!text || text.trim().length < 200) {
        throw new Error('Could not extract readable text. This may be a scanned image PDF — only text-based PDFs are supported.');
      }

      setStatus('Summarizing with AI...');
      const prompt = buildPrompt(text);

      let summary = null;
      // Try Gemini first
      if (GEMINI_KEY) {
        try {
          summary = await callGemini(prompt);
        } catch (err) {
          console.warn('[PDFSummarizer] Gemini failed:', err.message);
        }
      }
      // Fallback to NVIDIA NIM
      if (!summary && NVIDIA_KEY) {
        try {
          setStatus('Gemini unavailable, trying NVIDIA...');
          summary = await callNVIDIA(prompt);
        } catch (err) {
          console.warn('[PDFSummarizer] NVIDIA failed:', err.message);
        }
      }

      if (!summary) throw new Error('AI summarization failed. Please try again later.');

      setResult(summary);
    } catch (err) {
      setError(err.message || 'Something went wrong. Try a different PDF.');
    }

    setLoading(false);
    setStatus('');
  }

  return (
    <div style={{
      background: 'var(--paper)',
      border: '1px solid var(--line)',
      borderRadius: 14,
      padding: '20px 24px',
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>📄</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Paper Summarizer</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 8px', borderRadius: 999, background: '#e8f5e9', color: '#2e7d32', letterSpacing: '0.06em' }}>AI-POWERED</span>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 14, border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', width: 'fit-content' }}>
        {[['url', 'Paste PDF URL'], ['upload', 'Upload PDF']].map(([m, label]) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(''); setResult(null); }}
            style={{
              padding: '8px 18px', fontSize: 12, cursor: 'pointer', border: 'none',
              background: mode === m ? 'var(--ink)' : 'var(--paper)',
              color: mode === m ? 'var(--bg)' : 'var(--muted)',
              fontWeight: mode === m ? 600 : 400,
              fontFamily: 'var(--mono)',
              letterSpacing: '0.04em',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      {mode === 'url' ? (
        <input
          type="text"
          placeholder="https://www.ncbi.nlm.nih.gov/pmc/articles/.../pdf/ or any open-access PDF URL"
          value={pdfUrl}
          onChange={e => setPdfUrl(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', fontSize: 13, marginBottom: 12,
            background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10,
            fontFamily: 'var(--display)', outline: 'none', boxSizing: 'border-box',
          }}
        />
      ) : (
        <div style={{
          marginBottom: 12, padding: '16px', borderRadius: 10,
          border: '2px dashed var(--line)', background: 'var(--bg)',
          textAlign: 'center', cursor: 'pointer',
        }}>
          <input
            type="file"
            accept=".pdf"
            onChange={e => setFile(e.target.files[0])}
            style={{ fontSize: 13 }}
          />
          {file && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{file.name} ({(file.size / 1024).toFixed(0)} KB)</div>}
        </div>
      )}

      {/* Summarize button */}
      <button
        onClick={summarize}
        disabled={loading || (mode === 'url' ? !pdfUrl.trim() : !file)}
        style={{
          background: loading ? 'var(--muted)' : 'var(--ink)',
          color: '#fff', border: 'none', borderRadius: 10,
          padding: '11px 24px', fontSize: 13, fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--display)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        {loading ? (
          <>
            <span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
            {status}
          </>
        ) : '✨ Summarize this paper'}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Error */}
      {error && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#dc2626', background: '#fef2f2', padding: '10px 14px', borderRadius: 8 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {result && <SummaryOutput summary={result} pdfUrl={pdfUrl} />}
    </div>
  );
}

function SummaryOutput({ summary, pdfUrl }) {
  const [copied, setCopied] = useState(false);

  function copyParagraph() {
    navigator.clipboard.writeText(summary.oneParagraph);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function saveToCitations() {
    const existing = JSON.parse(localStorage.getItem('opstat_citations') || '[]');
    existing.push({ text: summary.howToCite, format: 'APA', savedAt: new Date().toISOString(), pdfUrl });
    localStorage.setItem('opstat_citations', JSON.stringify(existing));
    alert('Citation saved! View it in Citation Manager.');
  }

  const sectionStyle = { fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' };

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid var(--line)', paddingTop: 16 }}>

      {/* Relevance score */}
      {summary.relevanceScore != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
            padding: '4px 10px', borderRadius: 6,
            background: summary.relevanceScore >= 7 ? '#d1fae5' : summary.relevanceScore >= 4 ? '#fef3c7' : '#fee2e2',
            color: summary.relevanceScore >= 7 ? '#065f46' : summary.relevanceScore >= 4 ? '#92400e' : '#991b1b',
          }}>
            Relevance: {summary.relevanceScore}/10
          </span>
          {summary.relevanceReason && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{summary.relevanceReason}</span>}
        </div>
      )}

      {/* Summary paragraph */}
      <div style={sectionStyle}>Summary (paste into Chapter 2)</div>
      <div style={{
        fontSize: 13, color: 'var(--ink)', lineHeight: 1.75, marginBottom: 10,
        background: '#f5f1e8', padding: '12px 14px', borderRadius: 10,
      }}>
        {summary.oneParagraph}
      </div>
      <button onClick={copyParagraph} style={{
        fontSize: 11, padding: '5px 12px', borderRadius: 6,
        border: '1px solid var(--line)', cursor: 'pointer',
        background: copied ? 'var(--ink)' : 'var(--paper)',
        color: copied ? '#fff' : 'var(--ink)', marginBottom: 16,
        fontFamily: 'var(--mono)',
      }}>
        {copied ? '✓ Copied!' : 'Copy paragraph'}
      </button>

      {/* Key findings */}
      <div style={sectionStyle}>Key Findings</div>
      <ul style={{ paddingLeft: 18, marginBottom: 16 }}>
        {(summary.keyFindings || []).map((f, i) => (
          <li key={i} style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.65, marginBottom: 4 }}>{f}</li>
        ))}
      </ul>

      {/* Research gap */}
      {summary.researchGap && (
        <>
          <div style={sectionStyle}>Research Gap (use for thesis justification)</div>
          <div style={{
            fontSize: 13, color: '#7a4d1a', background: '#fef3c7',
            padding: '10px 14px', borderRadius: 10, marginBottom: 16, lineHeight: 1.65,
          }}>
            💡 {summary.researchGap}
          </div>
        </>
      )}

      {/* Methodology */}
      {summary.methodology && (
        <>
          <div style={sectionStyle}>Methodology</div>
          <div style={{
            fontSize: 12, color: 'var(--ink)', background: 'var(--bg)',
            padding: '10px 14px', borderRadius: 10, marginBottom: 16,
            border: '1px solid var(--line)', lineHeight: 1.6,
          }}>
            {summary.methodology.design && <div><strong>Design:</strong> {summary.methodology.design}</div>}
            {summary.methodology.crop && <div><strong>Crop:</strong> {summary.methodology.crop}</div>}
            {summary.methodology.location && <div><strong>Location:</strong> {summary.methodology.location}</div>}
            {summary.methodology.duration && <div><strong>Duration:</strong> {summary.methodology.duration}</div>}
            {summary.methodology.treatments?.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <strong>Treatments:</strong>
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  {summary.methodology.treatments.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      {/* Citation */}
      {summary.howToCite && (
        <>
          <div style={sectionStyle}>Citation</div>
          <div style={{
            fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink)',
            background: '#f5f1e8', padding: '10px 14px', borderRadius: 10, marginBottom: 10, lineHeight: 1.5,
          }}>
            {summary.howToCite}
          </div>
          <button onClick={saveToCitations} style={{
            fontSize: 11, padding: '5px 12px', borderRadius: 6,
            border: '1px solid var(--line)', cursor: 'pointer',
            background: 'var(--paper)', color: 'var(--ink)',
            fontFamily: 'var(--mono)',
          }}>
            Save to Citation Manager →
          </button>
        </>
      )}
    </div>
  );
}
