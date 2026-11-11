export interface DrillItem {
  word: string;
  outline: string;
}

export interface ChapterDrill {
  id: string;
  title: string;
  count: number;
  items: DrillItem[];
}

export interface ChapterSection {
  heading: string;
  paragraphs: string[];
  tables: string[][][];
  drills: {
    id: string;
    title: string;
    file: string;
  }[];
}

export interface Chapter {
  number: number;
  title: string;
  fullTitle: string;
  sections: ChapterSection[];
  drills: ChapterDrill[];
}

export interface TheoryReference {
  leftHand: string[][];
  rightHand: string[][];
  shortVowels: string[][];
  shortVowelsR: string[][];
  longVowels: string[][];
  longVowelsR: string[][];
  glossary: { term: string; definition: string }[];
}

export interface CurriculumData {
  chapters: Chapter[];
  reference: TheoryReference;
}

export interface ParsedStroke {
  raw: string;
  hasNumber: boolean;
  left: string;
  vowels: string;
  hasAsterisk: boolean;
  right: string;
  activeKeys: Set<string>;
  leftSound?: string;
  vowelSound?: string;
  rightSound?: string;
}

export interface PaperTapeEntry {
  id: string;
  timestamp: number;
  word: string;
  outline: string;
  correct: boolean;
  durationMs: number;
}

export interface WordMastery {
  word: string;
  outline: string;
  attempts: number;
  correct: number;
  bestTimeMs: number;
  lastPracticed: number;
  nextReview: number;
  streak: number;
}

export interface GamificationStats {
  xp: number;
  dailyXp: number;
  dailyGoalXp: number;
  lastActiveDate: string; // YYYY-MM-DD
  streakDays: number;
  gems: number;
  hearts: number;
  maxHearts: number;
  bestCombo: number;
  completedDrills: Record<string, { stars: number; bestWpm: number; bestAcc: number }>;
  unlockedBadges: string[];
}

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: string;
}

