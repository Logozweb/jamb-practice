/**
 * Examination Question Shuffling Utility
 * Implements an unbiased Fisher-Yates (Knuth) shuffle algorithm.
 * Keeps questions that share identical reading passages contiguous as a unit,
 * while randomizing the order of clusters and standalone questions every exam take.
 */

export function fisherYatesShuffle(array) {
  if (!array || array.length <= 1) return array ? [...array] : [];
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffles an array of examination questions per exam take.
 * If questions share a common reading comprehension passage, they stay grouped
 * together contiguously (with their own internal order randomized) so students
 * read the passage once for its questions, while standalone questions and passage
 * clusters are completely randomized across the paper.
 */
export function shuffleQuestions(questions) {
  if (!questions || questions.length <= 1) return questions ? [...questions] : [];

  const passageGroups = new Map();
  const independentItems = [];

  for (const q of questions) {
    const pText = q.passage?.text || (typeof q.passage === 'string' ? q.passage : null);
    const passageKey = pText ? pText.trim().slice(0, 100) : null;

    if (passageKey) {
      if (!passageGroups.has(passageKey)) {
        passageGroups.set(passageKey, []);
      }
      passageGroups.get(passageKey).push(q);
    } else {
      independentItems.push(q);
    }
  }

  const clusters = [];
  // Each passage group is a cluster
  for (const group of passageGroups.values()) {
    clusters.push(fisherYatesShuffle(group));
  }
  // Each independent question is its own cluster
  for (const item of independentItems) {
    clusters.push([item]);
  }

  // Shuffle the clusters so their order is different on every exam take
  return fisherYatesShuffle(clusters).flat();
}
