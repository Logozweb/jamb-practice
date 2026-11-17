/**
 * JAMB Past Questions API Service
 * Integrates with ALOC (Academic Learning Online Challenge) JAMB Past Questions API
 * Supports both ALOC Station (modern aloc.com.ng / dev.aloc.com.ng) and legacy (questions.aloc.com.ng)
 */

// Helper to sanitize HTML tags and decode basic entities from API responses while preserving line breaks
export function cleanHtml(rawHtml) {
  if (!rawHtml) return '';
  let str = String(rawHtml);

  // 1. Clean broken raw-data typos like 'hbr>ave' -> 'have' or 'hbr>'
  str = str.replace(/hbr>ave/gi, 'have');
  str = str.replace(/\bh?br>/gi, '');

  // 2. Decode numerical HTML entities (both hexadecimal and decimal)
  str = str.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    try {
      return String.fromCodePoint(parseInt(hex, 16));
    } catch {
      return '';
    }
  });
  str = str.replace(/&#([0-9]+);/g, (_, dec) => {
    try {
      return String.fromCodePoint(parseInt(dec, 10));
    } catch {
      return '';
    }
  });

  // 3. Named HTML and mathematical/scientific entities
  const entityMap = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&#039;': "'",
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&times;': '×',
    '&divide;': '÷',
    '&minus;': '−',
    '&plusmn;': '±',
    '&radic;': '√',
    '&deg;': '°',
    '&pi;': 'π',
    '&le;': '≤',
    '&ge;': '≥',
    '&ne;': '≠',
    '&infin;': '∞',
    '&asymp;': '≈',
    '&isin;': '∈',
    '&cap;': '∩',
    '&cup;': '∪',
    '&alpha;': 'α',
    '&beta;': 'β',
    '&theta;': 'θ',
    '&lambda;': 'λ',
    '&mu;': 'μ',
    '&omega;': 'ω',
    '&Delta;': 'Δ',
    '&sum;': '∑',
    '&int;': '∫',
    '&frac12;': '½',
    '&frac14;': '¼',
    '&frac34;': '¾',
    '&frac13;': '⅓',
    '&frac23;': '⅔',
    '&ndash;': '-',
    '&mdash;': '--',
    '&hellip;': '...'
  };
  for (const [ent, val] of Object.entries(entityMap)) {
    str = str.split(ent).join(val);
  }

  // 4. Handle fractions represented as <sup>a</sup>/<sub>b</sub>
  str = str.replace(/<sup>1<\/sup>\s*\/\s*<sub>2<\/sub>/gi, '½');
  str = str.replace(/<sup>1<\/sup>\s*\/\s*<sub>4<\/sub>/gi, '¼');
  str = str.replace(/<sup>3<\/sup>\s*\/\s*<sub>4<\/sub>/gi, '¾');
  str = str.replace(/<sup>1<\/sup>\s*\/\s*<sub>3<\/sub>/gi, '⅓');
  str = str.replace(/<sup>2<\/sup>\s*\/\s*<sub>3<\/sub>/gi, '⅔');

  // 5. Convert <sup> to Unicode superscripts / mathematical exponents
  const superMap = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '−': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
    'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ', 'a': 'ᵃ', 'b': 'ᵇ',
    'o': 'ᵒ', 'r': 'ʳ', 't': 'ᵗ'
  };
  str = str.replace(/<sup>(.*?)<\/sup>/gi, (_, content) => {
    const trimmed = content.trim();
    if (trimmed === '-1/4' || trimmed === '−1/4') return '⁻¼';
    if (trimmed === '1/4') return '¼';
    if (trimmed === '-1/2' || trimmed === '−1/2') return '⁻½';
    if (trimmed === '1/2') return '½';
    if (trimmed === '-3/4' || trimmed === '−3/4') return '⁻¾';
    if (trimmed === '3/4') return '¾';
    if (trimmed === 'o' || trimmed === '0') return '°';
    const chars = trimmed.split('');
    if (chars.every(c => superMap[c])) {
      return chars.map(c => superMap[c]).join('');
    }
    return '^(' + trimmed + ')';
  });

  // 6. Convert <sub> to Unicode subscripts
  const subMap = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '−': '₋', '=': '₌', '(': '₍', ')': '₎',
    'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ', 'n': 'ₙ'
  };
  str = str.replace(/<sub>(.*?)<\/sub>/gi, (_, content) => {
    const trimmed = content.trim();
    const chars = trimmed.split('');
    if (chars.every(c => subMap[c])) {
      return chars.map(c => subMap[c]).join('');
    }
    return '_(' + trimmed + ')';
  });

  // 7. Structural HTML tags to linebreaks
  str = str.replace(/<br\s*\/?>/gi, '\n');
  str = str.replace(/<\/p>/gi, '\n\n');
  str = str.replace(/<\/div>/gi, '\n');
  str = str.replace(/<li[^>]*>/gi, '\n• ');

  // 8. Strip remaining HTML tags iteratively until none remain (prevents incomplete multi-character injection)
  let previous;
  do {
    previous = str;
    str = str.replace(/<[^>]*>/g, '');
  } while (str !== previous);

  // Strip any residual unclosed/dangling angle brackets
  str = str.replace(/[<>]/g, '');

  // 9. Clean excessive horizontal spaces, preserving newlines
  str = str.replace(/[ \t]+/g, ' ');
  str = str.replace(/\n\s*\n\s*\n+/g, '\n\n');

  return str.trim();
}

// Strip redundant leading "A. " or "A) " or "(A) " from option text so it doesn't duplicate the UI letter badge
export function cleanOptionText(text, letter) {
  if (!text) return '';
  const clean = cleanHtml(text);
  const regex = new RegExp(`^\\s*\\(?\\[?${letter}[\\.\\)\\:\\-]\\s*`, 'i');
  return clean.replace(regex, '').trim();
}

// Check if a section string contains a worked mathematical solution rather than an exam instruction
function isWorkedSolution(text) {
  if (!text) return false;
  const s = String(text).trim();
  // Multiple equal signs indicating step-by-step mathematical working: e.g. = ... = ... =
  const equalCount = (s.match(/=/g) || []).length;
  if (equalCount >= 2) return true;
  if (/^(solution|soln|ans|working|steps|explanation)\s*[:\-]/i.test(s)) return true;
  if (/\b(hence|therefore|thus)\s+the\s+(answer|correct option)\b/i.test(s)) return true;
  return false;
}

// Check if a section string is an instructional directive
function isSectionInstruction(text) {
  if (!text) return false;
  const s = String(text).trim().toLowerCase();
  return (
    s.startsWith('in each of') ||
    s.startsWith('choose the') ||
    s.startsWith('read the') ||
    s.startsWith('from the words') ||
    s.startsWith('which of the following') ||
    s.includes('questions ') ||
    s.includes('answer the question')
  );
}

// Ensure the topic badge remains a neat, concise label (never an entire 500-word paragraph)
function cleanTopicTitle(rawTopic, defaultName = 'Authentic Past Question') {
  if (!rawTopic) return defaultName;
  const clean = cleanHtml(rawTopic);
  if (clean.length > 30 || clean.includes('\n') || isWorkedSolution(clean)) {
    return defaultName;
  }
  return clean;
}

// Convert letter answer ('a', 'b', 'c', 'd' or 'A', 'B', 'C', 'D' or 0, 1, 2, 3) to index (0, 1, 2, 3)
export function letterToIndex(ans) {
  if (typeof ans === 'number') return ans;
  if (!ans) return 0;
  const clean = String(ans).trim().toUpperCase();
  const mapping = { A: 0, B: 1, C: 2, D: 3, '0': 0, '1': 1, '2': 2, '3': 3 };
  return mapping[clean] !== undefined ? mapping[clean] : 0;
}

// Map subject IDs between our app and ALOC API naming
export const ALOC_SUBJECT_MAP = {
  english: 'english-language',
  mathematics: 'mathematics',
  physics: 'physics',
  chemistry: 'chemistry',
  biology: 'biology',
  economics: 'economics',
  government: 'government',
  literature: 'literature-in-english',
  commerce: 'commerce',
  crk: 'christian-religious-studies',
  crs: 'christian-religious-studies',
  geography: 'geography',
  accounting: 'accounting'
};

// Transform a single ALOC raw question object into our standard structure
function formatSingleQuestion(item, idx) {
  let options = [];

  // Support both modern ALOC Station 'options' and legacy 'option' / 'option_a'
  const optObj = item.options || item.option;
  if (optObj && typeof optObj === 'object') {
    options = [
      cleanOptionText(optObj.a || optObj.A || 'Option A', 'A'),
      cleanOptionText(optObj.b || optObj.B || 'Option B', 'B'),
      cleanOptionText(optObj.c || optObj.C || 'Option C', 'C'),
      cleanOptionText(optObj.d || optObj.D || 'Option D', 'D')
    ];
  } else {
    options = [
      cleanOptionText(item.option_a || 'Option A', 'A'),
      cleanOptionText(item.option_b || 'Option B', 'B'),
      cleanOptionText(item.option_c || 'Option C', 'C'),
      cleanOptionText(item.option_d || 'Option D', 'D')
    ];
  }

  // Handle section: distinguish between Reading Passage, Section Instruction, and Worked Solution
  let passage = null;
  let explanation = cleanHtml(item.solution || item.explanation || '');
  let topic = cleanTopicTitle(item.metadata?.topic || item.metadata?.subtopic || item.topic);

  const rawSection = item.section;
  if (rawSection) {
    if (typeof rawSection === 'object') {
      // Modern ALOC object: { instruction, passage }
      const pText = cleanHtml(rawSection.passage || rawSection.text);
      const pTitle = cleanHtml(rawSection.instruction || rawSection.title) || 'Reading Comprehension Passage';
      if (pText) {
        passage = { title: pTitle, text: pText };
        topic = cleanTopicTitle(topic || item.topic, 'Comprehension');
      }
    } else if (typeof rawSection === 'string') {
      const sectionCleaned = cleanHtml(rawSection);

      if (isWorkedSolution(sectionCleaned)) {
        // Some ALOC math questions mistakenly place the step-by-step solution inside the section column.
        // Save it as explanation so it is shown in Practice Mode / Review, NOT spoiled during active exam.
        if (!explanation || explanation.length < sectionCleaned.length) {
          explanation = sectionCleaned;
        }
        topic = cleanTopicTitle(topic || item.topic, 'Mathematics');
      } else if (sectionCleaned.length > 25 || isSectionInstruction(sectionCleaned)) {
        // Legitimate Reading Passage or Section Instruction (e.g. English comprehension passage)
        const isInst = isSectionInstruction(sectionCleaned);
        passage = {
          title: isInst ? 'Section Instruction' : 'Reading Comprehension Passage',
          text: sectionCleaned
        };
        topic = cleanTopicTitle(topic || item.topic, isInst ? 'Section Question' : 'Comprehension');
      } else {
        // Short section name (e.g. "Indices", "Vocabulary")
        topic = cleanTopicTitle(topic || sectionCleaned, 'Authentic Past Question');
      }
    }
  }

  // Handle passage from item.passage
  if (!passage && item.passage) {
    if (typeof item.passage === 'object') {
      passage = {
        title: cleanHtml(item.passage.title || item.passage.instruction || 'Reading Comprehension Passage'),
        text: cleanHtml(item.passage.text || item.passage.body || '')
      };
    } else if (typeof item.passage === 'string' && item.passage.length > 20) {
      passage = {
        title: 'Reading Comprehension Passage',
        text: cleanHtml(item.passage)
      };
    }
  }

  // Answer extraction supporting modern ALOC Station (correctAnswer: 'B') and legacy (answer: 'B')
  const rawAnswer = item.correctAnswer || item.answer || item.solution_letter || item.correct_answer;
  const answerIndex = letterToIndex(rawAnswer);

  // If explanation is still empty, provide clean default
  if (!explanation) {
    const letter = ['A', 'B', 'C', 'D'][answerIndex] || 'A';
    explanation = `Official UTME past examination answer is Option ${letter}.`;
  }

  return {
    id: `aloc_${item.id || idx}_${Date.now()}`,
    year: item.year || item.examyear || 2023,
    topic: topic || 'Authentic Past Question',
    passage,
    question: cleanHtml(item.text || item.question || 'UTME Examination Question'),
    options,
    answer: answerIndex,
    explanation,
    image: item.imageUrl || item.image || item.diagram || null,
    difficulty: item.metadata?.difficultyScore ? (item.metadata.difficultyScore > 2 ? 'hard' : 'medium') : 'medium',
    source: 'ALOC Past Questions API'
  };
}

/**
 * Fetch a single batch of questions (max 15 as allowed by ALOC API)
 */
async function fetchSingleAlocBatch(subjectId, limit = 15, year = null, token) {
  const alocSubject = ALOC_SUBJECT_MAP[subjectId] || subjectId;
  const isModernKey = token.startsWith('aloc_') || token.startsWith('alc_');
  const yearParam = year ? `&year=${year}` : '';

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'x-api-key': token,
    'AccessToken': token,
    'Accept': 'application/json'
  };

  const attempts = isModernKey
    ? [
        {
          url: `https://dev.aloc.com.ng/api/v1/questions?subject=${alocSubject}&examType=jamb&limit=${limit}${yearParam}`,
          headers: authHeaders,
          name: 'ALOC Station (dev.aloc.com.ng)'
        },
        {
          url: `/api/aloc/questions?endpoint=modern&subject=${alocSubject}&limit=${limit}${yearParam}`,
          headers: authHeaders,
          name: 'ALOC Station (Local Relay)'
        },
        {
          url: `https://questions.aloc.com.ng/api/v2/m?subject=${alocSubject}&type=utme${yearParam}`,
          headers: authHeaders,
          name: 'ALOC Legacy (questions.aloc.com.ng)'
        }
      ]
    : [
        {
          url: `https://dev.aloc.com.ng/api/v1/questions?subject=${alocSubject}&examType=jamb&limit=${limit}${yearParam}`,
          headers: authHeaders,
          name: 'ALOC Station (dev.aloc.com.ng)'
        },
        {
          url: `/api/aloc/questions?endpoint=modern&subject=${alocSubject}&limit=${limit}${yearParam}`,
          headers: authHeaders,
          name: 'ALOC Station (Local Relay)'
        },
        {
          url: `https://questions.aloc.com.ng/api/v2/m?subject=${alocSubject}&type=utme${yearParam}`,
          headers: authHeaders,
          name: 'ALOC Legacy (questions.aloc.com.ng)'
        },
        {
          url: `/api/aloc/questions?endpoint=legacy&subject=${alocSubject}${yearParam}`,
          headers: authHeaders,
          name: 'ALOC Legacy (Local Relay)'
        }
      ];

  for (const attempt of attempts) {
    try {
      const response = await fetch(attempt.url, {
        method: 'GET',
        headers: {
          ...attempt.headers,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const list = result.data || result.questions || [];
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
      }
    } catch (e) {}
  }

  return [];
}

/**
 * Fetch questions from ALOC API.
 * Because ALOC has a built-in server limit of 15 questions per call,
 * this function automatically queries multiple past examination years
 * to accumulate up to the required count (e.g. 40 or 60 questions).
 */
export async function fetchAlocQuestions(subjectId, count = 40, apiKey = null) {
  const rawToken = apiKey || (typeof localStorage !== 'undefined' ? localStorage.getItem('jamb_aloc_api_key') : '') || '';
  const token = rawToken.trim().replace(/^["']|["']$/g, '');

  // 1. Try our high-speed SQLite-backed local endpoint (serves cached ALOC questions + batches remote requests safely using DB API key)
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000';
    const keyParam = token ? `&apiKey=${encodeURIComponent(token)}` : '';
    const localRes = await fetch(`${baseUrl}/api/aloc/subject-questions?subject=${encodeURIComponent(subjectId)}&count=${count}${keyParam}`);
    if (localRes.ok) {
      const data = await localRes.json();
      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions.map((item, idx) => formatSingleQuestion(item, idx));
      }
    }
  } catch (err) {
    console.warn(`Local ALOC proxy note for ${subjectId}:`, err.message);
  }

  if (!token) {
    throw new Error('No ALOC API key provided. Please enter your API Key from aloc.com.ng.');
  }

  // 2. Direct remote fetch fallback:
  // Quick test check (1 to 15 questions)
  if (count <= 15) {
    const list = await fetchSingleAlocBatch(subjectId, Math.min(count, 15), null, token);
    if (Array.isArray(list) && list.length > 0) {
      return list.map((item, idx) => formatSingleQuestion(item, idx));
    }
  }

  // Multi-batch collection across different JAMB past examination years
  const candidateYears = [null, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013];
  let accumulated = [];
  const seenQuestionSignatures = new Set();

  for (const year of candidateYears) {
    if (accumulated.length >= count) break;
    const batch = await fetchSingleAlocBatch(subjectId, 15, year, token);

    for (const item of batch) {
      const text = item.text || item.question || '';
      const signature = text.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);

      if (text && !seenQuestionSignatures.has(signature)) {
        seenQuestionSignatures.add(signature);
        accumulated.push(item);
        if (accumulated.length >= count) break;
      }
    }

    // Pacing to prevent 429 rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  if (accumulated.length === 0) {
    throw new Error(`Failed to retrieve past questions from ALOC for ${subjectId}.`);
  }

  return accumulated.map((item, idx) => formatSingleQuestion(item, idx));
}

/**
 * Validate an ALOC API key with a test call
 */
export async function testAlocApiKey(apiKey) {
  const cleanKey = (apiKey || '').trim().replace(/^["']|["']$/g, '');
  if (!cleanKey) {
    return { success: false, error: 'Please enter your ALOC API Key.' };
  }

  try {
    const questions = await fetchAlocQuestions('english', 1, cleanKey);
    return {
      success: true,
      count: questions.length,
      provider: cleanKey.startsWith('aloc_') ? 'ALOC Station (dev.aloc.com.ng)' : 'ALOC API',
      sample: questions[0]?.question?.slice(0, 75) + '...'
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
