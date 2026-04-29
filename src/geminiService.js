// ═══════════════════════════════════════════════════════════════════════════
// Gemini AI Service for KhetLab
// Provides AI-powered thesis topic suggestions and research gap analysis
// ═══════════════════════════════════════════════════════════════════════════

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Generate AI-powered thesis topic suggestions based on user preferences
 */
export async function generateThesisTopics(field, interests, level = 'MSc') {
  const prompt = `You are an expert agricultural research advisor helping a ${level} student find a thesis topic.

FIELD: ${field}
STUDENT INTERESTS: ${interests}

Please provide 5 specific, researchable thesis topic suggestions. For each topic:
1. Give a clear, academic title
2. Explain the research gap (why this needs study)
3. Suggest specific objectives (3-4 bullet points)
4. Mention methodology approach
5. Indicate difficulty level (Easy/Medium/Hard)
6. Estimate paper count available on Google Scholar (realistic number like 12-45)
7. Estimate recent year range (e.g., "2019-2024")
8. Provide 3 suggested thesis titles for that topic
9. Explain why this topic is valuable (1 sentence)
10. Give a brief 2-sentence description

Format your response as a JSON array with this structure:
[
  {
    "id": "ai_topic_1",
    "title": "Thesis title here",
    "description": "Brief 2-sentence description",
    "researchGap": "Explanation of the gap - classify as High, Medium, or Low",
    "objectives": ["Objective 1", "Objective 2", "Objective 3"],
    "methodology": "Brief methodology description",
    "difficulty": "Medium",
    "noveltyScore": 8,
    "paperCount": 24,
    "yearRange": "2019-2024",
    "suggestedTitles": ["Title 1", "Title 2", "Title 3"],
    "whyValuable": "Why this research matters for Indian agriculture"
  }
]

Make topics specific to Indian agriculture context. Ensure topics are original and not over-researched. Classify researchGap strictly as only "High", "Medium", or "Low". Return only valid JSON.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return parseAlternativeResponse(text);
  } catch (error) {
    console.error('Gemini API Error:', error);
    return generateFallbackTopics(field, interests, level);
  }
}

/**
 * Analyze research gap for a specific topic using AI
 */
export async function analyzeResearchGap(topic, field) {
  const prompt = `Analyze the research gap for this agricultural thesis topic:

TOPIC: "${topic}"
FIELD: ${field}

Provide a detailed analysis in this JSON format:
{
  "existingResearch": "Summary of what research already exists",
  "researchGap": "Specific gap this thesis would fill",
  "significance": "Why this research matters",
  "feasibility": "How feasible this is for a thesis (High/Medium/Low)",
  "suggestedScope": "Recommended scope for this study",
  "expectedOutcomes": "What the student might discover"
}

Focus on Indian agricultural context. Return only valid JSON.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Research Gap Analysis Error:', error);
    return null;
  }
}

/**
 * AI-powered research paper summarization
 */
export async function summarizePapers(papers, query) {
  const paperTexts = papers.slice(0, 3).map(p => 
    `Title: ${p.title}\nAbstract: ${p.abstract?.slice(0, 300) || 'No abstract'}\nYear: ${p.year || 'Unknown'}`
  ).join('\n\n---\n\n');

  const prompt = `Based on these research papers about "${query}", provide:

PAPERS:
${paperTexts}

Please provide:
1. Key research trends (3-4 bullet points)
2. Research gaps identified
3. Suggestions for future research
4. Methodology patterns observed

Format as a JSON object with these keys: trends, gaps, futureResearch, methodologies.
Return only valid JSON.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Paper Summarization Error:', error);
    return null;
  }
}

/**
 * Generate personalized thesis title suggestions
 */
export async function generateThesisTitles(field, specificArea, approach) {
  const prompt = `Generate 5 creative but academic thesis titles for:

FIELD: ${field}
SPECIFIC AREA: ${specificArea}
APPROACH: ${approach}

Create titles that are:
- Specific and researchable
- Academic in tone
- Include crop/organism name
- Mention key variable
- Suitable for Indian context

Return as JSON array: ["Title 1", "Title 2", ...]`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 512,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('Title Generation Error:', error);
    return [];
  }
}

/**
 * Fallback topic generator when API fails
 */
function generateFallbackTopics(field, interests, level) {
  return [
    {
      id: "ai_fallback_1",
      title: `Comparative Study of Different ${field} Approaches in ${interests}`,
      description: `A systematic comparison of various methodologies within ${field} focusing on ${interests} to identify the most effective approach for Indian conditions.`,
      researchGap: "Medium",
      objectives: [
        "Compare existing methodologies",
        "Identify best practices",
        "Develop recommendations"
      ],
      methodology: "Comparative analysis with field trials",
      difficulty: "Medium",
      noveltyScore: 7,
      paperCount: 18,
      yearRange: "2018-2024",
      suggestedTitles: [
        `Comparative Analysis of ${interests} Methods in ${field}`,
        `Evaluating Different Approaches to ${interests} in Indian Agriculture`,
        `Performance Assessment of ${field} Techniques for ${interests}`
      ],
      whyValuable: `This research will help farmers and researchers choose the most effective approach for ${interests} in ${field}.`
    },
    {
      id: "ai_fallback_2",
      title: `Optimization of ${interests} in ${field} Systems`,
      description: `Investigating optimal parameters and combinations for improving ${interests} outcomes within ${field} production systems under Indian agro-climatic conditions.`,
      researchGap: "High",
      objectives: [
        "Identify optimal parameters",
        "Test different combinations",
        "Validate results"
      ],
      methodology: "Experimental design with RBD/CRD",
      difficulty: "Hard",
      noveltyScore: 8,
      paperCount: 12,
      yearRange: "2020-2024",
      suggestedTitles: [
        `Optimizing ${interests} Parameters in ${field} Production`,
        `Standardization of ${interests} Protocols for ${field}`,
        `Response Surface Methodology for ${interests} Optimization in ${field}`
      ],
      whyValuable: `Optimizing ${interests} will lead to higher productivity and sustainability in ${field}.`
    }
  ];
}

/**
 * Parse alternative text responses
 */
function parseAlternativeResponse(text) {
  // Extract topics from non-JSON response
  const lines = text.split('\n');
  const topics = [];
  let currentTopic = {};
  
  for (const line of lines) {
    if (line.match(/^\d+\.|^Topic \d+/i)) {
      if (currentTopic.title) {
        topics.push(currentTopic);
      }
      currentTopic = {
        title: line.replace(/^\d+\.|^Topic \d+[:\.]\s*/i, '').trim(),
        objectives: [],
        difficulty: "Medium",
        noveltyScore: 7
      };
    } else if (line.toLowerCase().includes('objective')) {
      const obj = line.replace(/.*objective[:\s]*/i, '').trim();
      if (obj) currentTopic.objectives.push(obj);
    } else if (line.toLowerCase().includes('gap')) {
      currentTopic.researchGap = line.replace(/.*gap[:\s]*/i, '').trim();
    } else if (line.toLowerCase().includes('method')) {
      currentTopic.methodology = line.replace(/.*method[:\s]*/i, '').trim();
    }
  }
  
  if (currentTopic.title) {
    topics.push(currentTopic);
  }
  
  return topics.length > 0 ? topics : generateFallbackTopics('', '', '');
}

export default {
  generateThesisTopics,
  analyzeResearchGap,
  summarizePapers,
  generateThesisTitles,
};
