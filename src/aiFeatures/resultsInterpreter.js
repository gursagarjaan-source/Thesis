const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const round = (value, digits = 3) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(digits) : 'NA';
};

const findRow = (result, name) => {
  const rows = Array.isArray(result?.anova) ? result.anova : [];
  return rows.find((row) => String(row.source || '').toLowerCase().includes(name));
};

const localInterpretation = ({ result, toolTitle, opts }) => {
  const treatment = findRow(result, 'treatment');
  const replication = findRow(result, 'replication');
  const means = Array.isArray(result?.means) ? result.means : [];
  const best = means.reduce((top, item) => (!top || Number(item.mean) > Number(top.mean) ? item : top), null);
  const design = opts?.design || 'selected design';

  if (treatment) {
    const treatmentText = Number(treatment.p) < 0.05
      ? `Treatment effects were statistically significant (F = ${round(treatment.f)}, p = ${round(treatment.p, 4)}), indicating meaningful variation among treatments.`
      : `Treatment effects were not statistically significant at the 5% level (F = ${round(treatment.f)}, p = ${round(treatment.p, 4)}).`;
    const blockText = replication?.f != null
      ? `Block or replication variation was also estimated (F = ${round(replication.f)}, p = ${round(replication.p, 4)}), which helps separate field variability from treatment response.`
      : '';
    const bestText = best
      ? `The highest observed mean was recorded for ${best.label} (${round(best.mean)}), so it should be considered the leading treatment before drawing agronomic conclusions.`
      : '';

    return [
      `${toolTitle} was analysed using ${design}.`,
      treatmentText,
      blockText,
      bestText,
      `The coefficient of variation was ${round(result.CV, 2)}%, with CD at 5% of ${round(result.CD_5)}, so treatment comparisons should be interpreted against this precision level.`
    ].filter(Boolean).join(' ');
  }

  return `${toolTitle} completed successfully. Review the main table values, compare the strongest response groups, and report the result together with the sample size, selected method, and any practical field interpretation.`;
};

const buildPrompt = ({ result, toolTitle, opts }) => `You are an agricultural statistics assistant.

Write a concise thesis-style interpretation for this result. Avoid inventing data. Mention statistical significance, best treatment or main pattern, and one practical agronomy implication.

Tool: ${toolTitle}
Options: ${JSON.stringify(opts)}
Result JSON: ${JSON.stringify(result)}

Return one short paragraph only.`;

const interpretWithGemini = async (payload) => {
  if (!GEMINI_API_KEY) return null;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(payload) }] }],
      generationConfig: { temperature: 0.35, maxOutputTokens: 450 }
    })
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
};

const interpretWithPuter = async (payload) => {
  if (typeof window === 'undefined' || !window.puter?.ai?.chat) return null;
  const response = await window.puter.ai.chat(buildPrompt(payload));
  return typeof response === 'string' ? response.trim() : response?.message?.content?.trim() || null;
};

export const interpretResults = async (payload) => {
  try {
    const puterText = await interpretWithPuter(payload);
    if (puterText) return puterText;

    const geminiText = await interpretWithGemini(payload);
    if (geminiText) return geminiText;
  } catch (error) {
    console.warn('AI interpretation failed, using local interpretation:', error);
  }

  return localInterpretation(payload);
};
