export function buildPrompt({ field, customField, state, climateCtx, methodology, customMeth, level, pov }) {
  const fieldName = customField || field;
  const methName = customMeth || methodology;

  return `
You are Dr. Arvind Kumar, senior professor at PAU Ludhiana, guiding a ${level} student.

Student details:
- Field: ${fieldName}
- Location: ${state}
- Climate: ${climateCtx.type}, ${climateCtx.rain} rainfall, pH ${climateCtx.pH}
- Soil: ${climateCtx.soil}, deficient in: ${climateCtx.def}
- Preferred methodology: ${methName}
- Perspective: ${pov === 'prof' ? 'Professor - focus on novelty, publishability, approvability' : 'Student - focus on feasibility, low cost, available equipment'}

Generate exactly 5 thesis topics. Return ONLY a JSON array with no markdown.

Each topic must be an object with these exact keys:
{
  "rank": 1,
  "title": "Formal thesis title 15-25 words, crop scientific name in parentheses",
  "oneliner": "One sentence, plain language, what the experiment tests",
  "gap": "high or medium",
  "gapReason": "Why this gap exists in ${state} specifically - 2-3 sentences",
  "gapNote": "Honest paper count note",
  "treats": [
    { "t": "T1: description", "ctrl": false },
    { "t": "T0: Control description", "ctrl": true }
  ],
  "design": "CRD or RBD or Split-plot",
  "reps": 3,
  "plotSize": "e.g. 1 tree per plot (8-10 yr old)",
  "obs": ["observation 1", "observation 2"],
  "duration": "e.g. One Rabi season (Nov-Apr)",
  "cost": "e.g. Rs 12000-18000",
  "costBreak": "Where money goes",
  "novelty": 8,
  "difficulty": "Low or Medium or High",
  "diffReason": "Why this difficulty",
  "vars": ["variety 1", "variety 2"],
  "funding": "Funding source",
  "profNote": "One honest warning from professor perspective",
  "papers": 45,
  "query": "google scholar search string 5-7 words"
}

Rules:
- Never suggest crops that do not grow in ${state}
- Treatments must always include one control (ctrl: true)
- novelty is out of 10, 7+ means publishable in national journal
- difficulty: Low = one season, standard equipment / Medium = two seasons or some lab / High = specialized lab or imported reagents
- papers is your honest Google Scholar estimate for the query
`;
}
