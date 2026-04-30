import { buildPrompt } from '../prompts/thesisTopicPrompt';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const CLIMATE_BY_STATE = {
  Punjab: { type: 'sub-tropical semi-arid', rain: 'moderate monsoon', pH: '7.5-8.5', soil: 'alluvial sandy loam to loam', def: 'zinc, iron, organic carbon' },
  Haryana: { type: 'semi-arid', rain: 'low to moderate', pH: '7.8-8.6', soil: 'alluvial loam', def: 'zinc, iron, organic carbon' },
  'Uttar Pradesh': { type: 'sub-tropical', rain: 'moderate monsoon', pH: '6.8-8.2', soil: 'alluvial loam', def: 'zinc, sulphur, organic carbon' },
  Rajasthan: { type: 'arid to semi-arid', rain: 'low and erratic', pH: '7.8-8.7', soil: 'sandy loam', def: 'zinc, iron, nitrogen' },
  Maharashtra: { type: 'tropical semi-arid', rain: 'moderate monsoon', pH: '6.5-8.0', soil: 'black cotton and medium deep soils', def: 'zinc, sulphur, boron' },
};

export const getClimateContext = (state) => CLIMATE_BY_STATE[state] || CLIMATE_BY_STATE.Punjab;

const extractJsonArray = (text) => {
  const match = text?.match(/\[[\s\S]*\]/);
  if (!match) return null;
  return JSON.parse(match[0]);
};

const normalizeGeneratedTopic = (topic, index, fallbackQuery) => ({
  rank: Number(topic.rank) || index + 1,
  title: topic.title || `Feasibility study of ${fallbackQuery} under Punjab conditions`,
  oneliner: topic.oneliner || topic.description || 'This experiment tests a practical treatment combination under local agricultural conditions.',
  gap: String(topic.gap || topic.researchGap || 'medium').toLowerCase().includes('high') ? 'high' : 'medium',
  gapReason: topic.gapReason || topic.researchGap || 'This topic has local relevance, but the exact treatment combination is not well documented for the selected region.',
  gapNote: topic.gapNote || `Limited papers are available for this exact ${fallbackQuery} combination in India.`,
  treats: Array.isArray(topic.treats) && topic.treats.length ? topic.treats : [
    { t: 'T1: Recommended treatment package', ctrl: false },
    { t: 'T2: Reduced dose treatment package', ctrl: false },
    { t: 'T0: Control (untreated)', ctrl: true },
  ],
  design: topic.design || 'RBD',
  reps: Number(topic.reps) || 3,
  plotSize: topic.plotSize || 'One uniform plot or plant unit per replication',
  obs: Array.isArray(topic.obs) && topic.obs.length ? topic.obs : ['Growth parameters', 'Yield', 'Quality parameters', 'Benefit cost ratio'],
  duration: topic.duration || 'One crop season',
  cost: topic.cost || 'Rs 12000-18000',
  costBreak: topic.costBreak || 'Inputs, field operations, and basic laboratory analysis',
  novelty: Math.max(1, Math.min(10, Number(topic.novelty) || 7)),
  difficulty: topic.difficulty || 'Medium',
  diffReason: topic.diffReason || 'Requires standard field layout and routine observations.',
  vars: Array.isArray(topic.vars) && topic.vars.length ? topic.vars : ['Locally recommended cultivar', 'Farmer preferred cultivar'],
  funding: topic.funding || 'University self-funded or departmental research support',
  profNote: topic.profNote || 'Keep treatments realistic and make sure observations match the thesis timeline.',
  papers: Number(topic.papers) || Number(topic.paperCount) || 30,
  query: topic.query || fallbackQuery,
});

const fallbackTopics = ({ field, customField, state, methodology, customMeth, level }) => {
  const fieldName = customField || field || 'Agriculture';
  const methodName = customMeth || methodology || 'field experiment';
  const baseCrop = fieldName.toLowerCase().includes('hort') ? 'guava (Psidium guajava L.)' : fieldName.toLowerCase().includes('agron') ? 'wheat (Triticum aestivum L.)' : 'tomato (Solanum lycopersicum L.)';

  return [
    {
      rank: 1,
      title: `Evaluation of ${methodName} on growth, yield and quality of ${baseCrop} under ${state} conditions`,
      oneliner: `Tests whether ${methodName} can improve crop performance with practical farmer-level inputs.`,
      gap: 'high',
      gapReason: `Region-specific evidence from ${state} is still limited for this treatment combination. Most available studies report broader crop responses without matching local soil and climate constraints.`,
      gapNote: `Only about 18-30 papers are expected for this exact ${state} combination.`,
      treats: [
        { t: `T1: ${methodName} at recommended dose`, ctrl: false },
        { t: `T2: ${methodName} at 75% recommended dose`, ctrl: false },
        { t: `T3: ${methodName} combined with organic input`, ctrl: false },
        { t: 'T0: Control (untreated)', ctrl: true },
      ],
      design: 'RBD',
      reps: 3,
      plotSize: 'One uniform plot per replication',
      obs: ['Plant height', 'Yield per plot', 'Quality parameters', 'Benefit cost ratio'],
      duration: 'One crop season',
      cost: 'Rs 12000-18000',
      costBreak: 'Field inputs, labour, sampling, and basic lab analysis',
      novelty: 8,
      difficulty: level === 'PhD' ? 'Medium' : 'Low',
      diffReason: 'Uses standard field equipment and can be completed within one crop season.',
      vars: ['Locally recommended cultivar', 'Farmer preferred cultivar'],
      funding: 'PAU self-funded / departmental support',
      profNote: 'Make sure the treatment doses are agronomically defensible before final approval.',
      papers: 28,
      query: `${baseCrop.split(' ')[0]} ${methodName} ${state} yield`,
    },
    {
      rank: 2,
      title: `Effect of integrated nutrient and management practices on productivity and economics of ${baseCrop}`,
      oneliner: 'Compares low-cost integrated practices for yield, quality and farm profitability.',
      gap: 'medium',
      gapReason: `Integrated management is researched, but locally adapted cost-focused combinations for ${state} need clearer experimental evidence.`,
      gapNote: 'About 35-50 papers may exist, but fewer match this exact treatment set.',
      treats: [
        { t: 'T1: Recommended fertilizer dose', ctrl: false },
        { t: 'T2: Recommended fertilizer + biofertilizer', ctrl: false },
        { t: 'T3: Organic amendment + reduced fertilizer dose', ctrl: false },
        { t: 'T0: Control (no added treatment)', ctrl: true },
      ],
      design: 'RBD',
      reps: 3,
      plotSize: 'Gross plot size as per crop spacing',
      obs: ['Growth characters', 'Yield attributes', 'Soil nutrient status', 'Economics'],
      duration: 'One Rabi or Kharif season',
      cost: 'Rs 10000-16000',
      costBreak: 'Fertilizers, bio-inputs, soil testing, and field operations',
      novelty: 7,
      difficulty: 'Low',
      diffReason: 'All materials are normally available at agriculture universities.',
      vars: ['Recommended local variety'],
      funding: 'Self-funded MSc trial',
      profNote: 'Avoid too many treatments if land or replication space is limited.',
      papers: 42,
      query: `${baseCrop.split(' ')[0]} integrated nutrient management economics`,
    },
  ].map((topic, index) => normalizeGeneratedTopic(topic, index, `${fieldName} ${methodName}`));
};

export async function generateV3ThesisTopics(payload) {
  const prompt = buildPrompt({ ...payload, climateCtx: getClimateContext(payload.state) });

  try {
    if (typeof window !== 'undefined' && window.puter?.ai?.chat) {
      const response = await window.puter.ai.chat(prompt);
      const text = typeof response === 'string' ? response : response?.message?.content;
      const parsed = extractJsonArray(text);
      if (parsed?.length) return parsed.map((topic, index) => normalizeGeneratedTopic(topic, index, payload.customMeth || payload.methodology));
    }

    if (GEMINI_API_KEY) {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.55, maxOutputTokens: 4096 }
        })
      });
      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = extractJsonArray(text);
        if (parsed?.length) return parsed.map((topic, index) => normalizeGeneratedTopic(topic, index, payload.customMeth || payload.methodology));
      }
    }
  } catch (error) {
    console.warn('V3 thesis generation failed, using fallback topics:', error);
  }

  return fallbackTopics(payload);
}
