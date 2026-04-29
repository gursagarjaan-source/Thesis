import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Ic = ({ d, size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;


const CHAPTERS = [
  { num: 'I', title: 'Title Page', desc: 'Title, student name, degree, department, university, year', tips: 'Keep the title concise (15-20 words). Include the crop/species name in the title. Mention the key variable or treatment.' },
  { num: 'II', title: 'Certificate & Declaration', desc: 'Advisor signature, originality declaration', tips: 'Follow your university\'s exact format. Get signatures before final binding.' },
  { num: 'III', title: 'Acknowledgement', desc: 'Thank advisor, committee, institution, family', tips: 'Keep it to one page. Thank people in order of academic seniority. Be genuine but professional.' },
  { num: 'IV', title: 'Abstract', desc: '250-300 word summary of entire thesis', tips: 'Write this LAST. Include: objective, methods, key findings, and conclusion. No citations in abstract.' },
  { num: 'V', title: 'Introduction', desc: 'Background, importance of crop/topic, objectives, hypothesis', tips: 'Start broad (crop importance globally) → narrow (specific problem) → your objectives. End with clear hypothesis statement. 4-6 pages.' },
  { num: 'VI', title: 'Review of Literature', desc: 'Past research organized by theme/variable', tips: 'Organize by theme, not chronologically. Cover last 10-15 years. Include both Indian and international studies. 15-25 pages.' },
  { num: 'VII', title: 'Materials & Methods', desc: 'Experimental design, treatments, observations, statistical analysis', tips: 'Specify: location, year, variety, design (CRD/RBD), replications, plot size, treatments in detail. Mention KhetLab for statistical analysis.' },
  { num: 'VIII', title: 'Results & Discussion', desc: 'Present findings with ANOVA tables, means, discussion with literature', tips: 'Present results first, then discuss with literature support. Use "The data presented in Table X reveal that..." format. Always cite the significance level.' },
  { num: 'IX', title: 'Summary & Conclusions', desc: 'Key findings summarized, practical recommendations', tips: 'List findings as numbered points. Include practical recommendations for farmers/researchers. Suggest future research directions.' },
  { num: 'X', title: 'References', desc: 'Complete bibliography in prescribed format', tips: 'Use our Citation Manager tool to format references. Follow your university style (usually APA or Indian Journal format). Verify every DOI.' },
  { num: 'XI', title: 'Appendices', desc: 'Raw data, weather data, supplementary tables', tips: 'Include weather data, soil analysis, original field layout, raw data tables. Number appendices as Appendix-I, II, etc.' },
];

const PARA_TEMPLATES = [
  { name: 'ANOVA Result', template: 'The analysis of variance revealed significant differences among treatments for {PARAMETER} (Table {TABLE_NUM}). The treatment {BEST_TREATMENT} recorded the highest value ({BEST_VALUE}) which was found to be significantly superior over all other treatments. The minimum value ({MIN_VALUE}) was observed in treatment {MIN_TREATMENT}.' },
  { name: 'Non-significant Result', template: 'The data presented in Table {TABLE_NUM} revealed that the effect of treatments on {PARAMETER} was found to be non-significant, indicating that the treatments had no significant influence on this parameter during the course of investigation.' },
  { name: 'At-par Treatments', template: 'The maximum {PARAMETER} ({BEST_VALUE}) was recorded in treatment {BEST_TREATMENT}, which was found to be statistically at par with treatment {ATPAR_TREATMENT} ({ATPAR_VALUE}). Both treatments were significantly superior to the remaining treatments.' },
  { name: 'Literature Support', template: 'The present findings are in conformity with the results reported by {AUTHOR} ({YEAR}) who also observed that {FINDING} in {CROP}. Similar results were also reported by {AUTHOR2} ({YEAR2}).' },
  { name: 'Introduction Opening', template: '{CROP} ({SCIENTIFIC_NAME}) is one of the most important {TYPE} crops grown in India. It belongs to the family {FAMILY} and is native to {ORIGIN}. India is the {RANK} largest producer of {CROP} in the world with an annual production of {PRODUCTION} from an area of {AREA}.' },
];

const LIT_COLUMNS = ['Author(s)', 'Year', 'Title', 'Key Finding', 'Relevance to My Work'];

export default function ThesisHelper() {
  const [checkedChapters, setCheckedChapters] = useState(() => {
    try { return JSON.parse(localStorage.getItem('thesis_progress') || '{}'); } catch { return {}; }
  });
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [filledTemplate, setFilledTemplate] = useState('');
  const [litRows, setLitRows] = useState(() => {
    try { return JSON.parse(localStorage.getItem('thesis_litreview') || '[]'); } catch { return []; }
  });
  const [activeSection, setActiveSection] = useState('structure');

  const toggleChapter = (num) => {
    const updated = { ...checkedChapters, [num]: !checkedChapters[num] };
    setCheckedChapters(updated);
    localStorage.setItem('thesis_progress', JSON.stringify(updated));
  };

  const completedCount = Object.values(checkedChapters).filter(Boolean).length;

  const addLitRow = () => {
    const updated = [...litRows, { author: '', year: '', title: '', finding: '', relevance: '' }];
    setLitRows(updated);
    localStorage.setItem('thesis_litreview', JSON.stringify(updated));
  };

  const updateLitRow = (idx, key, value) => {
    const updated = [...litRows];
    updated[idx][key] = value;
    setLitRows(updated);
    localStorage.setItem('thesis_litreview', JSON.stringify(updated));
  };

  const removeLitRow = (idx) => {
    const updated = litRows.filter((_, i) => i !== idx);
    setLitRows(updated);
    localStorage.setItem('thesis_litreview', JSON.stringify(updated));
  };

  const fillTemplate = (tmpl) => {
    let result = tmpl;
    const placeholders = tmpl.match(/\{[A-Z_0-9]+\}/g) || [];
    placeholders.forEach(p => {
      const label = p.replace(/[{}]/g, '').replace(/_/g, ' ').toLowerCase();
      const val = prompt(`Enter ${label}:`, '');
      if (val) result = result.replace(p, val);
    });
    setFilledTemplate(result);
  };

  const sections = [
    { id: 'structure', label: 'THESIS STRUCTURE', icon: '📋' },
    { id: 'paragraphs', label: 'PARAGRAPH BUILDER', icon: '✏️' },
    { id: 'litreview', label: 'LIT REVIEW TRACKER', icon: '📚' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <div className="site-shell page-hero" style={{ padding: '56px 40px 40px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 14 }}>§ ACADEMIC · THESIS WRITING GUIDE</div>
        <h1 style={{ fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 0.98, marginBottom: 12 }}>
          Thesis <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400 }}>Helper.</span>
        </h1>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--ink-2)', maxWidth: 600 }}>Interactive tools for MSc & PhD thesis writing — chapter checklist, paragraph templates, and literature review organizer.</p>
      </div>

      {/* Section Tabs */}
      <div className="site-shell thesis-section-tabs" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px 24px', display: 'flex', gap: 10 }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            padding: '12px 20px', borderRadius: 10, fontSize: 12, fontFamily: 'var(--mono)', cursor: 'pointer', letterSpacing: '0.06em',
            background: activeSection === s.id ? 'var(--ink)' : 'var(--paper)', color: activeSection === s.id ? 'var(--bg)' : 'var(--ink)',
            border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      <div className="site-shell page-body" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px 80px' }}>

        {/* ═══ THESIS STRUCTURE CHECKLIST ═══ */}
        {activeSection === 'structure' && (
          <div>
            {/* Progress Bar */}
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
              <div className="thesis-progress-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--muted)' }}>COMPLETION PROGRESS</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600 }}>{completedCount}/{CHAPTERS.length}</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-2)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(completedCount / CHAPTERS.length) * 100}%`, background: 'var(--green)', borderRadius: 999, transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {/* Chapters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CHAPTERS.map(ch => (
                <div key={ch.num} onClick={() => toggleChapter(ch.num)} style={{
                  background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 24px', cursor: 'pointer',
                  opacity: checkedChapters[ch.num] ? 0.7 : 1, transition: 'all 0.2s',
                }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  <div className="thesis-chapter-row" style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, border: '2px solid var(--line)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2,
                      background: checkedChapters[ch.num] ? 'var(--green)' : 'transparent', borderColor: checkedChapters[ch.num] ? 'var(--green)' : 'var(--line)',
                    }}>
                      {checkedChapters[ch.num] && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="thesis-chapter-title" style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em' }}>CH. {ch.num}</span>
                        <span style={{ fontWeight: 600, fontSize: 16, textDecoration: checkedChapters[ch.num] ? 'line-through' : 'none' }}>{ch.title}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 8 }}>{ch.desc}</div>
                      <div style={{ fontSize: 12, color: 'var(--green)', background: 'var(--green-soft)', padding: '8px 12px', borderRadius: 8, lineHeight: 1.5 }}>
                        💡 <strong>Tip:</strong> {ch.tips}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ PARAGRAPH BUILDER ═══ */}
        {activeSection === 'paragraphs' && (
          <div className="thesis-paragraph-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
            {/* Template list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 4 }}>TEMPLATES</div>
              {PARA_TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => { setSelectedTemplate(i); setFilledTemplate(''); }} style={{
                  padding: '14px 16px', borderRadius: 10, fontSize: 13, textAlign: 'left', cursor: 'pointer', fontWeight: 500,
                  background: selectedTemplate === i ? 'var(--ink)' : 'var(--paper)', color: selectedTemplate === i ? 'var(--bg)' : 'var(--ink)',
                  border: '1px solid var(--line)',
                }}>{t.name}</button>
              ))}
            </div>

            {/* Template content */}
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 14, padding: 28 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 12 }}>TEMPLATE: {PARA_TEMPLATES[selectedTemplate].name.toUpperCase()}</div>
              <div style={{ fontSize: 15, lineHeight: 1.8, fontFamily: 'var(--serif)', color: 'var(--ink-2)', marginBottom: 20, padding: 20, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--line)' }}>
                {PARA_TEMPLATES[selectedTemplate].template.split(/(\{[A-Z_0-9]+\})/g).map((part, i) =>
                  part.match(/\{[A-Z_0-9]+\}/) ? <span key={i} style={{ background: 'var(--green-soft)', color: 'var(--green)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 12 }}>{part}</span> : <span key={i}>{part}</span>
                )}
              </div>
              <button onClick={() => fillTemplate(PARA_TEMPLATES[selectedTemplate].template)} style={{
                padding: '12px 24px', background: 'var(--ink)', color: 'var(--bg)', border: 'none', borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: 'pointer', marginBottom: 16,
              }}>Fill in Placeholders</button>

              {filledTemplate && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>YOUR PARAGRAPH</div>
                  <div style={{ padding: 20, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--green)', fontSize: 15, lineHeight: 1.8, fontFamily: 'var(--serif)' }}>{filledTemplate}</div>
                  <button onClick={() => navigator.clipboard.writeText(filledTemplate)} style={{
                    marginTop: 10, padding: '8px 18px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 999, fontSize: 11, fontFamily: 'var(--mono)', cursor: 'pointer',
                  }}>📋 Copy Paragraph</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ LITERATURE REVIEW TRACKER ═══ */}
        {activeSection === 'litreview' && (
          <div>
            <div className="thesis-litreview-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--muted)' }}>PAPERS REVIEWED: {litRows.length}</span>
              <button onClick={addLitRow} style={{ padding: '10px 20px', background: 'var(--ink)', color: 'var(--bg)', border: 'none', borderRadius: 999, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--mono)' }}>+ Add Paper</button>
            </div>

            {litRows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--paper)', borderRadius: 14, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink-2)', marginBottom: 8 }}>Start organizing your literature review</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em' }}>CLICK "+ ADD PAPER" TO LOG EACH PAPER YOU READ</div>
              </div>
            ) : (
              <div className="responsive-table-wrap" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'var(--paper)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '14px 16px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', textAlign: 'left', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>#</th>
                      {LIT_COLUMNS.map(c => (
                        <th key={c} style={{ padding: '14px 16px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', textAlign: 'left', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>{c.toUpperCase()}</th>
                      ))}
                      <th style={{ padding: '14px 8px', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {litRows.map((row, i) => (
                      <tr key={i}>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{i + 1}</td>
                        {['author', 'year', 'title', 'finding', 'relevance'].map(key => (
                          <td key={key} style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)' }}>
                            <input value={row[key]} onChange={e => updateLitRow(i, key, e.target.value)} placeholder="..."
                              style={{ width: '100%', padding: '8px', fontSize: 12, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 6, outline: 'none', boxSizing: 'border-box', fontFamily: key === 'year' ? 'var(--mono)' : 'inherit' }} />
                          </td>
                        ))}
                        <td style={{ padding: '8px', borderBottom: '1px solid var(--line)' }}>
                          <button onClick={() => removeLitRow(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14 }}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
