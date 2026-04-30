import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  THESIS_FIELDS, 
  getTopicsByField, 
  getAllTopics, 
  filterTopics, 
  searchTopics 
} from './thesisTopicData';
import { generateV3ThesisTopics } from './aiFeatures/thesisTopicGenerator';

const Ic = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

const ICONS = {
  search: "M11 4a7 7 0 110 14 7 7 0 010-14zM21 21l-4.35-4.35",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3",
  back: "M19 12H5M12 19l-7-7 7-7",
  arrow: "M5 12h14M13 6l6 6-6 6",
  heart: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z",
  trash: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6",
  book: "M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20",
  ext: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
  robot: "M12 2a2 2 0 012 2v2H10V4a2 2 0 012-2zm-2 4h4v2h-4V6zm-4 4h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2zm3 8a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z",
  sparkle: "M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z",
};

// ═══ HEADER ═══

// ═══ FIELD CARD ═══
const FieldCard = ({ field, onClick, selected = false }) => {
  const [hover, setHover] = useState(false);
  const active = selected || hover;
  
  return (
    <div
      onClick={() => onClick(field.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textDecoration: 'none',
        background: active ? 'var(--ink)' : 'var(--paper)',
        color: active ? 'var(--bg)' : 'var(--ink)',
        border: `1px solid ${selected ? 'var(--green)' : 'var(--line)'}`,
        borderRadius: 14,
        padding: 20,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 138,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
        <span style={{ fontSize: 30 }}>{field.icon}</span>
        <span style={{ 
          fontFamily: 'var(--mono)', 
          fontSize: 10, 
          padding: '4px 10px', 
          borderRadius: 999, 
          background: active ? 'rgba(255,255,255,0.15)' : `${field.color}15`,
          color: active ? 'var(--bg)' : field.color,
          border: `1px solid ${active ? 'rgba(255,255,255,0.2)' : field.color + '30'}`,
        }}>
          {field.cropCount} CROPS
        </span>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 650, letterSpacing: '-0.01em', marginBottom: 8 }}>
        {field.name}
      </h3>
      <p style={{ 
        fontSize: 12, 
        lineHeight: 1.5, 
        color: active ? 'rgba(245,241,232,0.7)' : 'var(--muted)',
        flex: 1,
      }}>
        {field.description}
      </p>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 6, 
        marginTop: 12,
        fontFamily: 'var(--mono)', 
        fontSize: 11, 
        letterSpacing: '0.06em',
        opacity: active ? 1 : 0.6,
        transition: 'opacity 0.2s',
      }}>
        EXPLORE <Ic d={ICONS.arrow} size={13}/>
      </div>
    </div>
  );
};

const METHS = {
  hort: ['Foliar application', 'Soil application', 'Fertigation (drip)', 'Post-harvest treatment', 'Variety evaluation', 'Pruning / training', 'Rooting / propagation', 'Protected cultivation'],
  veg: ['Foliar application', 'Spacing / density', 'Fertigation', 'Weed management', 'Variety evaluation', 'Protected cultivation', 'Growth regulators', 'Seed priming'],
  flori: ['Growth regulators', 'Foliar nutrition', 'Variety evaluation', 'Postharvest storage', 'Propagation', 'Spacing / density', 'Chemical pinching'],
  ento: ['Biocontrol agents', 'Insecticide evaluation', 'Pheromone traps', 'Population dynamics', 'ETL studies', 'Integrated pest management', 'Repellents'],
  path: ['Fungicide evaluation', 'Biocontrol (Trichoderma/Bacillus)', 'Resistance screening', 'Epidemiology', 'Survey & identification', 'Hot water treatment', 'Bactericide'],
  agron: ['Variety evaluation', 'Fertilizer management', 'Weed management', 'Irrigation scheduling', 'Intercropping', 'Crop residue management', 'Organic inputs', 'Seed rate optimization'],
  breed: ['Genotype evaluation', 'Crossing / hybridization', 'Stability analysis', 'Molecular markers', 'Selection indices', 'Character association', 'Path analysis'],
  soil: ['Nutrient management', 'Biofertilizers', 'Soil amendments', 'Soil organic carbon', 'Microbial activity', 'Heavy metal remediation', 'Composting', 'Biochar'],
  eng: ['Irrigation systems', 'Farm machinery evaluation', 'Solar energy in agriculture', 'Residue management', 'Storage structures', 'Precision farming', 'Sensor technology'],
  food: ['Processing / value addition', 'Packaging studies', 'Quality analysis', 'Bioactive compounds', 'Fermentation', 'Drying / dehydration', 'Sensory evaluation'],
  eco: ['Cost-benefit analysis', 'Market survey', 'Supply chain analysis', 'Policy impact', 'Farmer adoption study', 'Value chain mapping'],
  organic: ['Vermicompost', 'Biofertilizers', 'Cover cropping', 'Mulching', 'Compost evaluation', 'Botanical pesticides', 'Farm waste recycling'],
  custom: ['Foliar application', 'Soil application', 'Variety evaluation', 'Field experiment', 'Lab analysis', 'Survey study', 'Pot culture', 'Controlled environment'],
};

const STATES = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Rajasthan', 'Maharashtra'];

// ═══ TOPIC CARD ═══
const Badge = ({ color = 'gray', children }) => {
  const colors = {
    gray: ['#EEE9DF', '#6B6F68'],
    green: ['#EAF3DE', '#1A3D2E'],
    amber: ['#FEF3C7', '#92400E'],
    blue: ['#E8F0FE', '#2D5A8E'],
  };
  const [bg, text] = colors[color] || colors.gray;
  return <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 8px', borderRadius: 999, background: bg, color: text, fontWeight: 500 }}>{children}</span>;
};

const normalizeTopic = (topic, index = 0) => {
  const gap = String(topic.gap || topic.researchGap || 'medium').toLowerCase();
  const difficulty = topic.difficulty || (gap.includes('high') ? 'Medium' : 'Low');
  return {
    ...topic,
    rank: topic.rank || index + 1,
    title: topic.title,
    oneliner: topic.oneliner || topic.description || topic.whyValuable || 'A practical thesis experiment with measurable field outcomes.',
    gap: gap.includes('high') ? 'high' : gap.includes('low') ? 'low' : 'medium',
    gapReason: topic.gapReason || topic.researchGap || topic.whyValuable || 'This topic has regional importance and needs clearer local evidence.',
    gapNote: topic.gapNote || `${topic.paperCount || topic.papers || 25} papers estimated for this topic area.`,
    treats: topic.treats || [
      { t: 'T1: Recommended practice or treatment', ctrl: false },
      { t: 'T2: Improved or alternative treatment', ctrl: false },
      { t: 'T0: Control (standard farmer practice)', ctrl: true },
    ],
    design: topic.design || 'RBD',
    reps: topic.reps || 3,
    plotSize: topic.plotSize || 'One uniform plot per replication',
    obs: topic.obs || ['Growth parameters', 'Yield', 'Quality parameters', 'Economics'],
    duration: topic.duration || topic.yearRange || 'One crop season',
    cost: topic.cost || 'Rs 10000-18000',
    costBreak: topic.costBreak || 'Field inputs, labour, sampling and basic analysis',
    novelty: topic.novelty || topic.noveltyScore || 7,
    difficulty,
    diffReason: topic.diffReason || topic.methodology || 'Uses standard university field and lab facilities.',
    vars: topic.vars || [topic.cropName || 'Recommended cultivar'],
    funding: topic.funding || 'Self-funded / departmental support',
    profNote: topic.profNote || 'Keep the treatment count realistic and justify each observation clearly.',
    papers: topic.papers || topic.paperCount || 25,
    query: topic.query || topic.title,
  };
};

const TopicCard = ({ topic, isSaved, onToggleSave, onFindPapers, isOpen, onToggle }) => {
  const t = normalizeTopic(topic, topic.rank ? topic.rank - 1 : 0);
  const open = isOpen ?? false;
  const toggle = onToggle || (() => {});

  return (
    <div style={{ background: '#FBF8F1', border: '0.5px solid', borderColor: open ? '#2D7A45' : '#DDD8CB', borderRadius: 12, overflow: 'hidden', marginBottom: 10, transition: 'border-color .15s' }}>
      <div style={{ display: 'flex', cursor: 'pointer' }} onClick={toggle}>
        <div style={{ width: 4, flexShrink: 0, background: t.gap === 'high' ? '#2D7A45' : '#D4A574' }} />
        <div style={{ padding: '14px 16px', flex: 1 }}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 7 }}>
            <Badge color="gray">#{t.rank}</Badge>
            <Badge color={t.gap === 'high' ? 'green' : 'amber'}>{t.gap === 'high' ? 'High research gap' : t.gap === 'low' ? 'Low research gap' : 'Medium research gap'}</Badge>
            <Badge color="blue">~{t.papers} papers</Badge>
            <Badge color="gray">{t.difficulty} effort</Badge>
            <Badge color="gray">{t.duration}</Badge>
            <Badge color="gray">{t.cost}</Badge>
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.45, marginBottom: 5 }}>{t.title}</div>
          <div style={{ fontSize: 12, color: '#6B6F68', lineHeight: 1.5 }}>{t.oneliner}</div>
        </div>
        <div style={{ padding: '14px 14px 0 0', color: '#6B6F68', fontSize: 18 }}>{open ? '⌄' : '›'}</div>
      </div>

      {open && (
        <div style={{ padding: 16, borderTop: '0.5px solid #DDD8CB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#6B6F68', width: 52, flexShrink: 0 }}>Novelty</div>
            <div style={{ flex: 1, height: 4, background: '#EEE9DF', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(10, Number(t.novelty) || 7) * 10}%`, height: '100%', background: '#2D7A45', borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#2D7A45', width: 30, textAlign: 'right' }}>{t.novelty}/10</div>
          </div>

          <div style={{ background: '#EAF3DE', borderRadius: 6, padding: '9px 12px', fontSize: 12, color: '#1A3D2E', lineHeight: 1.6, marginBottom: 14 }}>
            <strong>Research gap:</strong> {t.gapReason}
          </div>

          <SectionLabel>Treatments</SectionLabel>
          {t.treats.map((tr, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'baseline', padding: '5px 8px', borderRadius: 6, marginBottom: 3, fontSize: 12, background: tr.ctrl ? '#FEF3C7' : '#F5F1E8', color: tr.ctrl ? '#92400E' : '#0F1410' }}>
              {tr.ctrl && <span style={{ fontSize: 10, fontWeight: 500 }}>CTRL</span>}
              {tr.t}
            </div>
          ))}

          <div className="topic-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, margin: '14px 0' }}>
            {[
              ['Design', `${t.design} · ${t.reps} reps`],
              ['Plot size', t.plotSize],
              ['Duration', t.duration],
              ['Est. cost', t.cost],
              ['Funding', t.funding],
              ['Difficulty', t.difficulty],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: '#6B6F68', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>

          <SectionLabel>Key observations to record</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 14 }}>
            {t.obs.map((o, i) => <div key={i} style={{ fontSize: 12, padding: '4px 8px', background: '#F5F1E8', borderRadius: 5 }}>{o}</div>)}
          </div>

          <SectionLabel>Feasibility checklist</SectionLabel>
          {[
            { text: 'Equipment available at standard agriculture university', status: 'good' },
            { text: `Completable in ${t.duration} - within thesis timeline`, status: 'good' },
            { text: `Cost: ${t.costBreak}`, status: t.difficulty === 'Low' ? 'good' : t.difficulty === 'Medium' ? 'warn' : 'bad' },
            { text: `Varieties available: ${t.vars.join(', ')}`, status: 'good' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, padding: '5px 8px', borderRadius: 6, marginBottom: 4, background: item.status === 'good' ? '#EAF3DE' : item.status === 'warn' ? '#FEF3C7' : '#FEE2E2', color: item.status === 'good' ? '#1A3D2E' : item.status === 'warn' ? '#92400E' : '#991B1B' }}>
              <span style={{ fontSize: 11, flexShrink: 0, marginTop: 1 }}>{item.status === 'good' ? '✓' : item.status === 'warn' ? '!' : '×'}</span>
              {item.text}
            </div>
          ))}

          <div style={{ background: '#FEF3C7', borderRadius: 6, padding: '9px 12px', fontSize: 12, color: '#92400E', lineHeight: 1.6, margin: '14px 0 12px' }}>
            Professor's note: "{t.profNote}"
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 12px', background: '#EAF3DE', borderRadius: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#1A3D2E' }}>~{t.papers} papers · {t.gapNote}</div>
            <button onClick={() => onFindPapers(t.query, t.title)} style={{ fontSize: 11, color: '#1A3D2E', cursor: 'pointer', fontWeight: 500, border: 'none', background: 'transparent' }}>Find papers in KhetLab →</button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => onFindPapers(t.query, t.title)} style={{ padding: '8px 16px', borderRadius: 8, background: '#1A3D2E', color: '#F5F1E8', border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Find papers</button>
            <button onClick={onToggleSave} style={{ padding: '8px 14px', borderRadius: 8, background: isSaved ? '#0F1410' : 'transparent', color: isSaved ? '#F5F1E8' : '#0F1410', border: '0.5px solid #DDD8CB', fontSize: 12, cursor: 'pointer' }}>{isSaved ? 'Saved' : 'Save topic'}</button>
            <button style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', border: '0.5px solid #DDD8CB', fontSize: 12, cursor: 'pointer' }}>Start synopsis →</button>
            <button onClick={() => navigator.clipboard?.writeText(t.title)} style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', border: '0.5px solid #DDD8CB', fontSize: 12, cursor: 'pointer' }}>Share</button>
          </div>
        </div>
      )}
    </div>
  );
};

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 500, color: '#6B6F68', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{children}</div>
);

const DividerText = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0' }}>
    <div style={{ flex: 1, height: '0.5px', background: '#DDD8CB' }} />
    <div style={{ fontSize: 11, color: '#6B6F68' }}>{children}</div>
    <div style={{ flex: 1, height: '0.5px', background: '#DDD8CB' }} />
  </div>
);

const Segmented = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
    {options.map(option => {
      const optionValue = Array.isArray(option) ? option[0] : option;
      const label = Array.isArray(option) ? option[1] : option;
      return (
        <button key={optionValue} onClick={() => onChange(optionValue)} style={{ flex: 1, minWidth: 90, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: value === optionValue ? 'var(--ink)' : 'var(--bg)', color: value === optionValue ? 'var(--bg)' : 'var(--ink)', cursor: 'pointer', fontWeight: 600 }}>
          {label}
        </button>
      );
    })}
  </div>
);

// ═══ MAIN COMPONENT ═══
export default function ThesisTopicFinder() {
  const navigate = useNavigate();
  const [selectedField, setSelectedField] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gapFilter, setGapFilter] = useState('');
  const [savedTopics, setSavedTopics] = useState(() => {
    try { return JSON.parse(localStorage.getItem('thesis_saved_topics') || '[]'); }
    catch { return []; }
  });
  const [view, setView] = useState('ai'); // AI-only page; older browse/search panes are no longer surfaced.
  const [openTopicId, setOpenTopicId] = useState(null);

  // AI states
  const [aiStep, setAiStep] = useState(1);
  const [aiLoading, setAiLoading] = useState(false);
  const [customField, setCustomField] = useState('');
  const [customMeth, setCustomMeth] = useState('');
  const [aiState, setAiState] = useState('Punjab');
  const [aiMeth, setAiMeth] = useState(0);
  const [aiLevel, setAiLevel] = useState('MSc');
  const [aiField, setAiField] = useState('');
  const [aiPov, setAiPov] = useState('student');
  const [aiResults, setAiResults] = useState([]);
  const [aiError, setAiError] = useState('');

  const allFields = Object.values(THESIS_FIELDS);
  
  const fieldTopics = useMemo(() => {
    if (!selectedField) return {};
    return getTopicsByField(selectedField);
  }, [selectedField]);
  
  const currentField = selectedField ? THESIS_FIELDS[selectedField] : null;
  
  const cropsList = useMemo(() => {
    return Object.entries(fieldTopics).map(([key, data]) => ({
      key,
      ...data,
    }));
  }, [fieldTopics]);
  
  const currentTopics = useMemo(() => {
    if (!selectedField) return [];
    if (!selectedCrop) {
      // Show all topics for field
      const all = [];
      Object.entries(fieldTopics).forEach(([cropKey, cropData]) => {
        cropData.topics.forEach(topic => {
          all.push({
            ...topic,
            cropKey,
            cropName: cropData.name,
            fieldId: selectedField,
            fieldName: currentField?.name,
          });
        });
      });
      return all;
    }
    // Show topics for specific crop
    const cropData = fieldTopics[selectedCrop];
    if (!cropData) return [];
    return cropData.topics.map(topic => ({
      ...topic,
      cropKey: selectedCrop,
      cropName: cropData.name,
      fieldId: selectedField,
      fieldName: currentField?.name,
    }));
  }, [selectedField, selectedCrop, fieldTopics, currentField]);
  
  const filteredTopics = useMemo(() => {
    let topics = currentTopics;
    
    if (gapFilter) {
      topics = topics.filter(t => t.researchGap === gapFilter);
    }
    
    if (searchQuery && view === 'search') {
      topics = searchTopics(searchQuery);
    }
    
    return topics;
  }, [currentTopics, gapFilter, searchQuery, view]);
  
  const savedTopicsData = useMemo(() => {
    const all = getAllTopics();
    return savedTopics
      .map(id => all.find(t => t.id === id) || (() => {
        try { return JSON.parse(localStorage.getItem(`thesis_topic_${id}`) || 'null'); }
        catch { return null; }
      })())
      .filter(Boolean)
      .map(t => ({
        ...t,
        fieldName: THESIS_FIELDS[t.fieldId]?.name || t.fieldId,
      }));
  }, [savedTopics]);
  
  const toggleSaveTopic = (topicId) => {
    const saved = savedTopics.includes(topicId);
    let updated;
    if (saved) {
      updated = savedTopics.filter(id => id !== topicId);
    } else {
      updated = [...savedTopics, topicId];
    }
    setSavedTopics(updated);
    localStorage.setItem('thesis_saved_topics', JSON.stringify(updated));
  };

  const saveGeneratedTopic = (topic) => {
    const id = topic.id || `v3_${Date.now()}_${topic.rank || 1}`;
    const stored = { ...topic, id, fieldId: 'ai_generated', fieldName: customField || THESIS_FIELDS[aiField]?.name || aiField || 'Custom field' };
    localStorage.setItem(`thesis_topic_${id}`, JSON.stringify(stored));
    if (!savedTopics.includes(id)) {
      const updated = [...savedTopics, id];
      setSavedTopics(updated);
      localStorage.setItem('thesis_saved_topics', JSON.stringify(updated));
    }
  };

  const handleFindPapers = (query, topicTitle) => {
    sessionStorage.setItem('khetlab_paper_query', query);
    sessionStorage.setItem('khetlab_paper_topic', topicTitle);
    navigate(`/research?q=${encodeURIComponent(query)}`);
  };
  
  const handleFieldSelect = (fieldId) => {
    setSelectedField(fieldId);
    setSelectedCrop(null);
    setGapFilter('');
    setSearchQuery('');
    setView('field-detail');
  };
  
  const handleBack = () => {
    if (selectedCrop) {
      setSelectedCrop(null);
    } else if (selectedField) {
      setSelectedField(null);
      setView('fields');
    }
  };

  const handleAiGenerate = async () => {
    const fieldName = customField.trim() || THESIS_FIELDS[aiField]?.name || '';
    const methodList = METHS[aiField] || METHS.custom;
    const methodName = customMeth.trim() || methodList[aiMeth] || '';
    if (!fieldName || !methodName) return;
    setAiLoading(true);
    setAiError('');
    setAiResults([]);
    try {
      const topics = await generateV3ThesisTopics({
        field: fieldName,
        customField: customField.trim(),
        state: aiState,
        methodology: methodName,
        customMeth: customMeth.trim(),
        level: aiLevel,
        pov: aiPov,
      });
      if (topics && topics.length > 0) {
        const mapped = topics.map((t, i) => ({
          ...t,
          id: t.id || `v3_${Date.now()}_${i}`,
          fieldId: 'ai_generated',
          fieldName: fieldName,
        }));
        setAiResults(mapped);
        setAiStep(3);
        setOpenTopicId(mapped[0]?.id || null);
      } else {
        setAiError('No topics generated. Please try a more specific field or method.');
      }
    } catch (e) {
      setAiError('AI service error. Please try again.');
    }
    setAiLoading(false);
  };
  
  const gapStats = useMemo(() => {
    const stats = { High: 0, Medium: 0, Low: 0 };
    currentTopics.forEach(t => {
      stats[t.researchGap] = (stats[t.researchGap] || 0) + 1;
    });
    return stats;
  }, [currentTopics]);

  const canProceedAi = Boolean(aiField || customField.trim());
  const activeMethodList = METHS[aiField] || METHS.custom;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <div className="site-shell page-hero" style={{ padding: '42px clamp(18px, 4vw, 48px) 24px', maxWidth: 1520, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 14 }}>
          § ACADEMIC · AI THESIS TOPIC FINDER
        </div>
        <h1 style={{ fontSize: 'clamp(42px, 5.2vw, 76px)', fontWeight: 750, letterSpacing: '-0.035em', lineHeight: 0.94, marginBottom: 14 }}>
          Build a thesis topic <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400 }}>fast.</span>
        </h1>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink-2)', maxWidth: 760, lineHeight: 1.5 }}>
          Start with your own field or pick a discipline below. KhetLab then builds full thesis-ready cards with methods, feasibility, cost, observations, and paper searches.
        </p>
      </div>
      
      <div className="site-shell page-body" style={{ maxWidth: 1520, margin: '0 auto', padding: '0 clamp(18px, 4vw, 48px) 80px' }}>
        
        {/* ═══ FIELDS VIEW ═══ */}
        {view === 'fields' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 16 }}>
              {allFields.map(field => (
                <FieldCard
                  key={field.id}
                  field={field}
                  onClick={handleFieldSelect}
                />
              ))}
            </div>
            
            {/* High Gap Highlight */}
            <div style={{ marginTop: 48, padding: '32px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>🎯</span>
                <h3 style={{ fontSize: 20, fontWeight: 600 }}>Why Research Gap Matters</h3>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
                Choosing a thesis topic in a <strong>High Research Gap</strong> area means:
              </p>
              <ul style={{ marginTop: 12, paddingLeft: 20, fontSize: 14, lineHeight: 1.8, color: 'var(--ink-2)' }}>
                <li>More original contribution to agricultural science</li>
                <li>Better chances for publication in quality journals</li>
                <li>Higher relevance for future research and development</li>
                <li>Greater potential for practical application by farmers</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* ═══ FIELD DETAIL VIEW ═══ */}
        {view === 'field-detail' && currentField && (
          <div>
            {/* Back & Header */}
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={handleBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  color: 'var(--muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: 16,
                }}
              >
                <Ic d={ICONS.back} size={14}/> Back to Fields
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <span style={{ fontSize: 48 }}>{currentField.icon}</span>
                <div>
                  <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {currentField.name}
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
                    {currentField.description}
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {Object.entries(gapStats).map(([level, count]) => count > 0 && (
                  <div
                    key={level}
                    style={{
                      padding: '8px 16px',
                      background: level === 'High' ? '#fee2e2' : level === 'Medium' ? '#fef3c7' : '#d1fae5',
                      borderRadius: 999,
                      fontFamily: 'var(--mono)',
                      fontSize: 12,
                    }}
                  >
                    <span style={{ 
                      color: level === 'High' ? '#dc2626' : level === 'Medium' ? '#d97706' : '#059669',
                      fontWeight: 600,
                    }}>
                      {count} {level} Gap
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Crop Selector */}
            {cropsList.length > 1 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 12 }}>
                  SELECT CROP / AREA
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedCrop(null)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 999,
                      fontSize: 13,
                      cursor: 'pointer',
                      background: selectedCrop === null ? 'var(--ink)' : 'var(--paper)',
                      color: selectedCrop === null ? 'var(--bg)' : 'var(--ink)',
                      border: `1px solid ${selectedCrop === null ? 'var(--ink)' : 'var(--line)'}`,
                    }}
                  >
                    All Crops
                  </button>
                  {cropsList.map(crop => (
                    <button
                      key={crop.key}
                      onClick={() => setSelectedCrop(crop.key)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 999,
                        fontSize: 13,
                        cursor: 'pointer',
                        background: selectedCrop === crop.key ? 'var(--ink)' : 'var(--paper)',
                        color: selectedCrop === crop.key ? 'var(--bg)' : 'var(--ink)',
                        border: `1px solid ${selectedCrop === crop.key ? 'var(--ink)' : 'var(--line)'}`,
                      }}
                    >
                      {crop.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Gap Filter */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 12 }}>
                FILTER BY RESEARCH GAP
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['', 'High', 'Medium', 'Low'].map(level => (
                  <button
                    key={level || 'all'}
                    onClick={() => setGapFilter(level)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 999,
                      fontSize: 13,
                      cursor: 'pointer',
                      background: gapFilter === level ? 'var(--ink)' : 'var(--paper)',
                      color: gapFilter === level ? 'var(--bg)' : 'var(--ink)',
                      border: `1px solid ${gapFilter === level ? 'var(--ink)' : 'var(--line)'}`,
                    }}
                  >
                    {level === '' ? 'All Gaps' : `${level} Gap`}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Topics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
              {filteredTopics.map(topic => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  isSaved={savedTopics.includes(topic.id)}
                  onToggleSave={() => toggleSaveTopic(topic.id)}
                  onFindPapers={handleFindPapers}
                  isOpen={openTopicId === topic.id}
                  onToggle={() => setOpenTopicId(openTopicId === topic.id ? null : topic.id)}
                />
              ))}
            </div>
            
            {filteredTopics.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <div style={{ fontSize: 16 }}>No topics match your filters.</div>
                <button
                  onClick={() => { setGapFilter(''); setSelectedCrop(null); }}
                  style={{
                    marginTop: 16,
                    padding: '10px 20px',
                    background: 'var(--ink)',
                    color: 'var(--bg)',
                    border: 'none',
                    borderRadius: 999,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* ═══ SEARCH VIEW ═══ */}
        {view === 'search' && (
          <div>
            {/* Search Bar */}
            <div className="research-search-row" style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search topics, crops, or keywords..."
                  style={{
                    width: '100%',
                    padding: '16px 20px 16px 48px',
                    fontSize: 16,
                    background: 'var(--paper)',
                    border: '1px solid var(--line)',
                    borderRadius: 12,
                    fontFamily: 'var(--display)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
                  <Ic d={ICONS.search} size={18}/>
                </div>
              </div>
            </div>
            
            {/* Search Results */}
            {searchQuery && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
                {searchTopics(searchQuery).map(topic => (
                  <TopicCard
                    key={topic.id}
                    topic={{
                      ...topic,
                      fieldName: THESIS_FIELDS[topic.fieldId]?.name || topic.fieldId,
                    }}
                    isSaved={savedTopics.includes(topic.id)}
                    onToggleSave={() => toggleSaveTopic(topic.id)}
                    onFindPapers={handleFindPapers}
                    isOpen={openTopicId === topic.id}
                    onToggle={() => setOpenTopicId(openTopicId === topic.id ? null : topic.id)}
                  />
                ))}
              </div>
            )}
            
            {searchQuery && searchTopics(searchQuery).length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <div style={{ fontSize: 16 }}>No topics found for "{searchQuery}"</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>Try searching for: mango, tomato, drought, disease, organic, etc.</div>
              </div>
            )}
            
            {!searchQuery && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🌾</div>
                <div style={{ fontSize: 16 }}>Type a keyword to find thesis topics</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>Try: mango, tomato, drought, disease, organic, etc.</div>
              </div>
            )}
          </div>
        )}
        
        {/* ═══ AI SUGGEST VIEW ═══ */}
        {view === 'ai' && (
          <div>
            <div style={{ maxWidth: 1420, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'end', marginBottom: 22, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 750, letterSpacing: '-0.025em', marginBottom: 8 }}>AI thesis workspace</h2>
                  <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 680, lineHeight: 1.5 }}>
                    One focused page: field first, method second, complete topic cards third.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Badge color="green">AI-first</Badge>
                  <Badge color="blue">Full cards</Badge>
                  <Badge color="gray">Paper search linked</Badge>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[['1', 'Field'], ['2', 'Method'], ['3', 'Results']].map(([num, label]) => (
                  <button key={num} onClick={() => setAiStep(Number(num))} style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid var(--line)', background: aiStep === Number(num) ? 'var(--ink)' : 'var(--paper)', color: aiStep === Number(num) ? 'var(--bg)' : 'var(--ink)', fontFamily: 'var(--mono)', fontSize: 11, cursor: 'pointer' }}>
                    {num}. {label}
                  </button>
                ))}
              </div>

              {aiStep === 1 && (
                <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 18, padding: 'clamp(18px, 2vw, 28px)', marginBottom: 32, boxShadow: '0 18px 60px rgba(15,20,16,0.05)' }}>
                  <div className="thesis-quick-entry" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12, alignItems: 'end', marginBottom: 8 }}>
                    <div>
                      <SectionLabel>Quick field entry</SectionLabel>
                      <input
                        type="text"
                        value={customField}
                        onChange={e => { setCustomField(e.target.value); setAiField(e.target.value.trim() ? 'custom' : ''); setAiMeth(0); }}
                        placeholder="Type your field: Pomology, Mushroom cultivation, Precision agriculture, Sericulture, Apiculture..."
                        style={{ width: '100%', padding: '16px 18px', fontSize: 16, borderRadius: 12, border: '1px solid #DDD8CB', background: '#FBF8F1', color: '#0F1410', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                    </div>
                    <button disabled={!canProceedAi} onClick={() => setAiStep(2)} style={{ minWidth: 190, padding: '16px 22px', background: canProceedAi ? '#1A3D2E' : '#DDD8CB', color: '#F5F1E8', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 650, cursor: canProceedAi ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>
                      Continue →
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: '#6B6F68', marginBottom: 18 }}>Fast path: type your field above and continue. Or select a field card below to move straight into method selection.</div>

                  <DividerText>or select a field</DividerText>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: 12 }}>
                    {allFields.map(field => (
                      <FieldCard
                        key={field.id}
                        field={field}
                        selected={aiField === field.id && !customField}
                        onClick={(id) => { setAiField(id); setCustomField(''); setAiMeth(0); setAiStep(2); }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {aiStep === 2 && (
                <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 16, marginBottom: 18 }}>
                    <div>
                      <SectionLabel>Location</SectionLabel>
                      <select value={aiState} onChange={e => setAiState(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)', fontSize: 14 }}>
                        {STATES.map(state => <option key={state} value={state}>{state}</option>)}
                      </select>
                    </div>
                    <div>
                      <SectionLabel>Study level</SectionLabel>
                      <Segmented options={['BSc', 'MSc', 'PhD']} value={aiLevel} onChange={setAiLevel} />
                    </div>
                    <div>
                      <SectionLabel>Perspective</SectionLabel>
                      <Segmented options={[['student', 'Student'], ['prof', 'Professor']]} value={aiPov} onChange={setAiPov} />
                    </div>
                  </div>

                  <SectionLabel>Methodology</SectionLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {activeMethodList.map((m, i) => (
                      <button key={m} onClick={() => { setAiMeth(i); setCustomMeth(''); }} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, border: '0.5px solid', borderColor: aiMeth === i && !customMeth ? '#1A3D2E' : '#DDD8CB', background: aiMeth === i && !customMeth ? '#EAF3DE' : '#FBF8F1', color: aiMeth === i && !customMeth ? '#1A3D2E' : '#6B6F68', cursor: 'pointer', fontWeight: aiMeth === i && !customMeth ? 500 : 400 }}>
                        {m}
                      </button>
                    ))}
                  </div>
                  <DividerText>or describe your own method</DividerText>
                  <input
                    type="text"
                    value={customMeth}
                    onChange={e => { setCustomMeth(e.target.value); if (e.target.value.trim()) setAiMeth(null); }}
                    placeholder="e.g. nano-fertilizer foliar spray, biochar-enriched compost, laser scarification..."
                    style={{ width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 8, border: '0.5px solid #DDD8CB', background: '#FBF8F1', color: '#0F1410', outline: 'none', fontFamily: 'inherit', marginBottom: 6, boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: 11, color: '#6B6F68', marginBottom: 18 }}>Can not find your method? Type it and KhetLab will include it in topic suggestions.</div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button onClick={() => setAiStep(1)} style={{ padding: '12px 18px', borderRadius: 10, background: 'transparent', border: '1px solid var(--line)', cursor: 'pointer' }}>Back</button>
                    <button onClick={handleAiGenerate} disabled={aiLoading} style={{ flex: 1, minWidth: 220, padding: '12px 18px', borderRadius: 10, background: '#1A3D2E', color: '#F5F1E8', border: 'none', cursor: aiLoading ? 'wait' : 'pointer', fontWeight: 600 }}>
                      {aiLoading ? 'Generating thesis topics...' : 'Generate full topic cards'}
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {aiError && (
                <div style={{ padding: '16px 20px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', fontSize: 14, marginBottom: 24 }}>
                  ⚠️ {aiError}
                </div>
              )}

              {/* Results */}
              {aiStep === 3 && aiResults.length > 0 && (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 20,
                    padding: '16px 20px',
                    background: 'var(--paper)',
                    border: '1px solid var(--line)',
                    borderRadius: 12,
                  }}>
                    <div>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>AI GENERATED FOR</span>
                      <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{customField || THESIS_FIELDS[aiField]?.name || aiField} · {aiState} · {aiLevel}</div>
                    </div>
                    <div style={{
                      padding: '8px 16px',
                      background: 'var(--ink)',
                      color: 'var(--bg)',
                      borderRadius: 999,
                      fontFamily: 'var(--mono)',
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {aiResults.length} TOPICS
                    </div>
                  </div>

                  <div>
                    {aiResults.map((topic, i) => (
                      <div key={topic.id}>
                        <div style={{
                          padding: '4px 12px',
                          background: 'var(--ink)',
                          color: 'var(--bg)',
                          borderRadius: '999px 999px 0 0',
                          fontFamily: 'var(--mono)',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          display: 'inline-block',
                          marginLeft: 16,
                        }}>
                          🤖 AI TOPIC {i + 1}
                        </div>
                        <TopicCard
                          topic={topic}
                          isSaved={savedTopics.includes(topic.id)}
                          onToggleSave={() => saveGeneratedTopic(topic)}
                          onFindPapers={handleFindPapers}
                          isOpen={openTopicId === topic.id}
                          onToggle={() => setOpenTopicId(openTopicId === topic.id ? null : topic.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 640px) {
                  .thesis-quick-entry { grid-template-columns: 1fr !important; }
                  .thesis-quick-entry button { width: 100% !important; min-width: 0 !important; }
                }
              `}</style>
            </div>
          </div>
        )}

        {/* ═══ SAVED VIEW ═══ */}
        {view === 'saved' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>
              Saved Topics ({savedTopics.length})
            </h2>
            
            {savedTopicsData.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
                {savedTopicsData.map(topic => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    isSaved={true}
                    onToggleSave={() => toggleSaveTopic(topic.id)}
                    onFindPapers={handleFindPapers}
                    isOpen={openTopicId === topic.id}
                    onToggle={() => setOpenTopicId(openTopicId === topic.id ? null : topic.id)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
                <div style={{ fontSize: 16 }}>No saved topics yet</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>Browse fields and click "Save" on topics that interest you</div>
                <button
                  onClick={() => { setView('fields'); setSelectedField(null); }}
                  style={{
                    marginTop: 16,
                    padding: '12px 24px',
                    background: 'var(--ink)',
                    color: 'var(--bg)',
                    border: 'none',
                    borderRadius: 999,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Browse Fields
                </button>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}
