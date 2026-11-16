import { englishQuestions } from './english';
import { mathematicsQuestions } from './mathematics';
import { physicsQuestions } from './physics';
import { chemistryQuestions } from './chemistry';
import { biologyQuestions } from './biology';
import { economicsQuestions } from './economics';
import { governmentQuestions } from './government';
import { literatureQuestions } from './literature';
import { commerceQuestions } from './commerce';
import { fisherYatesShuffle } from '../../utils/shuffle';

export const QUESTION_BANKS = {
  english: englishQuestions,
  mathematics: mathematicsQuestions,
  physics: physicsQuestions,
  chemistry: chemistryQuestions,
  biology: biologyQuestions,
  economics: economicsQuestions,
  government: governmentQuestions,
  literature: literatureQuestions,
  commerce: commerceQuestions
};

/**
 * Returns a randomized question pool for a given subject.
 * If targetCount is requested (e.g. 40 or 60 questions for full JAMB simulation),
 * it ensures an expanded pool with unique identifiers so candidates experience the exact full exam volume.
 */
export function getQuestionsForSubject(subjectId, targetCount = null, year = 'all') {
  const basePool = QUESTION_BANKS[subjectId] || [];
  if (basePool.length === 0) return [];

  let filtered = [...basePool];
  if (year !== 'all') {
    filtered = filtered.filter(q => q.year.toString() === year.toString());
    if (filtered.length === 0) filtered = [...basePool]; // fallback if specific year is empty
  }

  // Shuffle base pool with unbiased Fisher-Yates shuffle
  const shuffled = fisherYatesShuffle(filtered);

  if (!targetCount || targetCount <= shuffled.length) {
    return shuffled.slice(0, targetCount || shuffled.length);
  }

  // For authentic 40/60 question simulation length, expand pool seamlessly
  const expanded = [];
  let index = 0;
  while (expanded.length < targetCount) {
    const original = shuffled[index % shuffled.length];
    expanded.push({
      ...original,
      id: `${original.id}_dup${Math.floor(index / shuffled.length)}_${expanded.length + 1}`
    });
    index++;
  }

  return fisherYatesShuffle(expanded);
}
