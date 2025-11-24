/**
 * Estimates the number of syllables in a word using heuristic rules.
 */
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

export interface ReadabilityMetrics {
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  complexWordCount: number;
}

/**
 * Calculates Flesch-Kincaid Grade Level and Reading Ease.
 */
export function calculateReadability(text: string): ReadabilityMetrics {
  if (!text || text.trim().length === 0) {
    return {
      fleschKincaidGrade: 0,
      fleschReadingEase: 0,
      wordCount: 0,
      sentenceCount: 0,
      avgSentenceLength: 0,
      complexWordCount: 0,
    };
  }

  // Basic tokenization
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const sentenceCount = sentences.length;
  
  const words = text.match(/\b\w+\b/g) || [];
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      fleschKincaidGrade: 0,
      fleschReadingEase: 0,
      wordCount: 0,
      sentenceCount: 0,
      avgSentenceLength: 0,
      complexWordCount: 0,
    };
  }

  let syllableCount = 0;
  let complexWordCount = 0;

  words.forEach(word => {
    const s = countSyllables(word);
    syllableCount += s;
    if (s >= 3) complexWordCount++;
  });

  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;

  // Flesch-Kincaid Grade Level Formula
  // 0.39 * (total words / total sentences) + 11.8 * (total syllables / total words) - 15.59
  const fleschKincaidGrade = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;

  // Flesch Reading Ease Formula
  // 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
  let fleschReadingEase = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  // Clamp between 0 and 100
  fleschReadingEase = Math.max(0, Math.min(100, fleschReadingEase));

  return {
    fleschKincaidGrade: parseFloat(fleschKincaidGrade.toFixed(1)),
    fleschReadingEase: parseFloat(fleschReadingEase.toFixed(1)),
    wordCount,
    sentenceCount,
    avgSentenceLength: parseFloat(avgSentenceLength.toFixed(1)),
    complexWordCount,
  };
}

export function getGradeLabel(score: number): string {
  if (score <= 5) return 'Easy (Grades 1-5)';
  if (score <= 8) return 'Standard (Grades 6-8)';
  if (score <= 12) return 'Complex (High School)';
  return 'Very Complex (College+)';
}

export function getScoreColor(score: number, type: 'grade' | 'ease'): string {
  if (type === 'grade') {
    if (score <= 6) return 'text-green-600';
    if (score <= 9) return 'text-yellow-600';
    return 'text-red-600';
  } else {
    // Higher is better for ease
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }
}