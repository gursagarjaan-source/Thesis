import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  THESIS_FIELDS, 
  getTopicsByField, 
  getAllTopics, 
  filterTopics, 
  searchTopics 
} from './thesisTopicData';
import { generateThesisTopics } from './geminiService';

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
const FieldCard = ({ field, onClick }) => {
  const [hover, setHover] = useState(false);
  
  return (
    <div
      onClick={() => onClick(field.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textDecoration: 'none',
        background: hover ? 'var(--ink)' : 'var(--paper)',
        color: hover ? 'var(--bg)' : 'var(--ink)',
        border: '1px solid var(--line)',
        borderRadius: 16,
        padding: 28,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 160,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
        <span style={{ fontSize: 36 }}>{field.icon}</span>
        <span style={{ 
          fontFamily: 'var(--mono)', 
          fontSize: 10, 
          padding: '4px 10px', 
          borderRadius: 999, 
          background: hover ? 'rgba(255,255,255,0.15)' : `${field.color}15`,
          color: hover ? 'var(--bg)' : field.color,
          border: `1px solid ${hover ? 'rgba(255,255,255,0.2)' : field.color + '30'}`,
        }}>
          {field.cropCount} CROPS
        </span>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 8 }}>
        {field.name}
      </h3>
      <p style={{ 
        fontSize: 13, 
        lineHeight: 1.5, 
        color: hover ? 'rgba(245,241,232,0.7)' : 'var(--muted)',
        flex: 1,
      }}>
        {field.description}
      </p>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 6, 
        marginTop: 16,
        fontFamily: 'var(--mono)', 
        fontSize: 11, 
        letterSpacing: '0.06em',
        opacity: hover ? 1 : 0.6,
        transition: 'opacity 0.2s',
      }}>
        EXPLORE <Ic d={ICONS.arrow} size={13}/>
      </div>
    </div>
  );
};

// ═══ TOPIC CARD ═══
const TopicCard = ({ topic, isSaved, onToggleSave }) => {
  const [hover, setHover] = useState(false);
  const [showTitles, setShowTitles] = useState(false);
  
  const gapColors = {
    High: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
    Medium: { bg: '#fef3c7', text: '#d97706', border: '#fde68a' },
    Low: { bg: '#d1fae5', text: '#059669', border: '#a7f3d0' },
  };
  
  const gapStyle = gapColors[topic.researchGap];
  
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 14,
        padding: '24px 28px',
        transition: 'box-shadow 0.2s',
        boxShadow: hover ? '0 4px 20px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      {/* Tags */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          letterSpacing: '0.08em',
          background: gapStyle.bg,
          color: gapStyle.text,
          padding: '4px 10px',
          borderRadius: 999,
          border: `1px solid ${gapStyle.border}`,
          fontWeight: 600,
        }}>
          {topic.researchGap.toUpperCase()} GAP
        </span>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          background: 'var(--bg-2)',
          padding: '3px 8px',
          borderRadius: 4,
          color: 'var(--muted)',
        }}>
          📄 {topic.paperCount} papers
        </span>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          background: 'var(--bg-2)',
          padding: '3px 8px',
          borderRadius: 4,
          color: 'var(--muted)',
        }}>
          📅 {topic.yearRange}
        </span>
      </div>
      
      {/* Title */}
      <h3 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35, marginBottom: 8, letterSpacing: '-0.01em' }}>
        {topic.title}
      </h3>
      
      {/* Description */}
      <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 12 }}>
        {topic.description}
      </p>
      
      {/* Why Valuable */}
      <div style={{
        fontSize: 12,
        color: 'var(--green)',
        background: 'var(--green-soft)',
        padding: '10px 14px',
        borderRadius: 8,
        lineHeight: 1.5,
        marginBottom: 16,
      }}>
        <strong>💡 Why this matters:</strong> {topic.whyValuable}
      </div>
      
      {/* Suggested Titles Toggle */}
      <button
        onClick={() => setShowTitles(!showTitles)}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'var(--bg)',
          border: '1px solid var(--line)',
          borderRadius: 8,
          fontSize: 12,
          fontFamily: 'var(--mono)',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span>🎓 Suggested Thesis Titles ({topic.suggestedTitles.length})</span>
        <span>{showTitles ? '▲' : '▼'}</span>
      </button>
      
      {showTitles && (
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--line)',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
        }}>
          {topic.suggestedTitles.map((title, i) => (
            <div
              key={i}
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                marginBottom: i < topic.suggestedTitles.length - 1 ? 10 : 0,
                paddingBottom: i < topic.suggestedTitles.length - 1 ? 10 : 0,
                borderBottom: i < topic.suggestedTitles.length - 1 ? '1px solid var(--line)' : 'none',
              }}
            >
              {i + 1}. {title}
            </div>
          ))}
        </div>
      )}
      
      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onToggleSave}
          style={{
            padding: '8px 14px',
            borderRadius: 999,
            fontSize: 11,
            fontFamily: 'var(--mono)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: isSaved ? 'var(--ink)' : 'var(--paper)',
            color: isSaved ? 'var(--bg)' : 'var(--ink)',
            border: isSaved ? '1px solid var(--ink)' : '1px solid var(--line)',
          }}
        >
          <Ic d={isSaved ? ICONS.trash : ICONS.heart} size={11}/>
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <Link
          to={`/research?q=${encodeURIComponent(topic.title)}`}
          style={{
            padding: '8px 14px',
            borderRadius: 999,
            fontSize: 11,
            fontFamily: 'var(--mono)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'var(--ink)',
            color: 'var(--bg)',
            border: '1px solid var(--ink)',
            textDecoration: 'none',
          }}
        >
          <Ic d={ICONS.ext} size={11}/>
          Find Papers
        </Link>
      </div>
    </div>
  );
};

// ═══ MAIN COMPONENT ═══
export default function ThesisTopicFinder() {
  const [selectedField, setSelectedField] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gapFilter, setGapFilter] = useState('');
  const [savedTopics, setSavedTopics] = useState(() => {
    try { return JSON.parse(localStorage.getItem('thesis_saved_topics') || '[]'); }
    catch { return []; }
  });
  const [view, setView] = useState('fields'); // fields | field-detail | saved | search | ai

  // AI states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiLevel, setAiLevel] = useState('MSc');
  const [aiField, setAiField] = useState('');
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
      .map(id => all.find(t => t.id === id))
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
    if (!aiInput.trim() || !aiField) return;
    setAiLoading(true);
    setAiError('');
    setAiResults([]);
    try {
      const topics = await generateThesisTopics(aiField, aiInput.trim(), aiLevel);
      if (topics && topics.length > 0) {
        setAiResults(topics.map((t, i) => ({
          ...t,
          id: t.id || `ai_${Date.now()}_${i}`,
          fieldId: 'ai_generated',
          fieldName: aiField,
        })));
      } else {
        setAiError('No topics generated. Please try a more specific interest.');
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <div className="site-shell page-hero" style={{ padding: '56px 40px 40px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 14 }}>
          § ACADEMIC · THESIS TOPIC FINDER
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 0.98, marginBottom: 12 }}>
          Find Your <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400 }}>Thesis Topic.</span>
        </h1>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--ink-2)', maxWidth: 600 }}>
          Discover under-researched topics across 12+ agriculture fields. Each suggestion includes research gap analysis, paper counts, and ready-to-use thesis titles.
        </p>
      </div>
      
      {/* Tabs */}
      <div className="site-shell page-tabs" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px 20px', display: 'flex', gap: 0 }}>
        {[
          { id: 'fields', label: 'ALL FIELDS' },
          { id: 'ai', label: '🤖 AI SUGGEST' },
          { id: 'search', label: 'SEARCH' },
          { id: 'saved', label: `SAVED (${savedTopics.length})` },
        ].map(v => (
          <button
            key={v.id}
            onClick={() => {
              setView(v.id);
              if (v.id === 'fields') {
                setSelectedField(null);
                setSelectedCrop(null);
              }
            }}
            style={{
              padding: '10px 24px',
              fontSize: 13,
              fontFamily: 'var(--mono)',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              background: view === v.id ? 'var(--ink)' : 'var(--paper)',
              color: view === v.id ? 'var(--bg)' : 'var(--ink)',
              border: '1px solid var(--line)',
              borderRadius: v.id === 'fields' ? '999px 0 0 999px' : v.id === 'saved' ? '0 999px 999px 0' : 0,
            }}
          >
            {v.label}
          </button>
        ))}
      </div>
      
      <div className="site-shell page-body" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px 80px' }}>
        
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
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
                <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>AI Thesis Topic Suggester</h2>
                <p style={{ fontSize: 15, color: 'var(--muted)' }}>
                  Tell the AI what you want to study. It will generate proper topic names, estimate paper counts, and identify research gaps.
                </p>
              </div>

              {/* Input Form */}
              <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, padding: 32, marginBottom: 32 }}>
                {/* Field Selector */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 10 }}>
                    SELECT FIELD
                  </label>
                  <select
                    value={aiField}
                    onChange={e => setAiField(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: 16,
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 10,
                      fontFamily: 'var(--display)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Choose a field...</option>
                    {allFields.map(f => (
                      <option key={f.id} value={f.name}>{f.icon} {f.name}</option>
                    ))}
                  </select>
                </div>

                {/* Level Selector */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 10 }}>
                    STUDY LEVEL
                  </label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {['BSc', 'MSc', 'PhD'].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setAiLevel(lvl)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: 10,
                          fontSize: 16,
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: aiLevel === lvl ? 'var(--ink)' : 'var(--bg)',
                          color: aiLevel === lvl ? 'var(--bg)' : 'var(--ink)',
                          border: `1px solid ${aiLevel === lvl ? 'var(--ink)' : 'var(--line)'}`,
                        }}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interest Input */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 10 }}>
                    YOUR INTEREST / SPECIFIC AREA
                  </label>
                  <input
                    type="text"
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    placeholder="e.g., high-density mango orchard management, organic pest control in tomato, precision irrigation in wheat..."
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: 16,
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 10,
                      fontFamily: 'var(--display)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleAiGenerate}
                  disabled={aiLoading || !aiField || !aiInput.trim()}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: 15,
                    fontWeight: 600,
                    borderRadius: 12,
                    cursor: aiLoading || !aiField || !aiInput.trim() ? 'not-allowed' : 'pointer',
                    background: aiLoading || !aiField || !aiInput.trim() ? 'var(--bg-2)' : 'var(--ink)',
                    color: aiLoading || !aiField || !aiInput.trim() ? 'var(--muted)' : 'var(--bg)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {aiLoading ? (
                    <>
                      <span style={{
                        width: 16,
                        height: 16,
                        border: '2px solid currentColor',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        display: 'inline-block',
                      }}/>
                      AI is generating topics...
                    </>
                  ) : (
                    <>
                      <Ic d={ICONS.sparkle} size={16}/>
                      Generate Thesis Topics
                    </>
                  )}
                </button>
              </div>

              {/* Error */}
              {aiError && (
                <div style={{ padding: '16px 20px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', fontSize: 14, marginBottom: 24 }}>
                  ⚠️ {aiError}
                </div>
              )}

              {/* Results */}
              {aiResults.length > 0 && (
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
                      <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{aiField} · {aiLevel}</div>
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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
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
                          onToggleSave={() => toggleSaveTopic(topic.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
