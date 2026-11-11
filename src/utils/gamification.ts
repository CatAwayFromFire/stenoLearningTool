import type { BadgeDef, GamificationStats } from '../types/steno';

export interface CurriculumUnit {
  id: number;
  title: string;
  subtitle: string;
  color: 'emerald' | 'indigo' | 'amber' | 'rose' | 'purple' | 'sky';
  chapters: number[];
}

export const CURRICULUM_UNITS: CurriculumUnit[] = [
  {
    id: 1,
    title: 'Unit 1: Steno Foundations & Home Row',
    subtitle: 'Learn how steno works, finger placement, and your first single-syllable CVC chords.',
    color: 'emerald',
    chapters: [1, 2, 3, 4, 5],
  },
  {
    id: 2,
    title: 'Unit 2: Left-Hand Consonants & Vowel Chords',
    subtitle: 'Master missing left-hand consonants (F, Q, M, G, N, Y, Z, V, J) and diphthong/long vowels.',
    color: 'indigo',
    chapters: [6, 7, 8],
  },
  {
    id: 3,
    title: 'Unit 3: Right-Hand Chords & Clusters',
    subtitle: 'Unlock final consonant chords (-v, -m, -k, -n, -j, -ch, -sh) and compound endings (-tion, -ment, -ble).',
    color: 'amber',
    chapters: [9, 10, 11, 12],
  },
  {
    id: 4,
    title: 'Unit 4: Multi-Stroke Words & Syllabic Splitting',
    subtitle: 'Combine prefixes, suffixes, compound words, and KWR linker rules to write any multi-syllable word.',
    color: 'sky',
    chapters: [13, 14, 15],
  },
  {
    id: 5,
    title: 'Unit 5: Speed Building, Top 200 Words & Folding',
    subtitle: 'Accelerate your WPM with high-frequency briefs, R/L/T/E folding, numbers, and punctuation.',
    color: 'purple',
    chapters: [16, 17, 18, 19, 20],
  },
  {
    id: 6,
    title: 'Unit 6: Advanced Theory, Phrasing & Modifiers',
    subtitle: 'Master UK variants, Jeff’s phrasing system, symbols, and full-keyboard text editing.',
    color: 'rose',
    chapters: [21, 22, 23, 24, 25, 26],
  },
];

export const STENO_RANKS = [
  { minLevel: 1, title: 'Novice Chordist', badge: '🌱' },
  { minLevel: 3, title: 'Apprentice Steno', badge: '🪶' },
  { minLevel: 6, title: 'Syllable Weaver', badge: '⚡' },
  { minLevel: 10, title: 'Chord Virtuoso', badge: '🎹' },
  { minLevel: 15, title: 'Court Reporter', badge: '🏛️' },
  { minLevel: 20, title: 'Lapwing Grandmaster', badge: '🦅' },
];

export const BADGE_DEFINITIONS: BadgeDef[] = [
  {
    id: 'first_chord',
    title: 'First Stroke!',
    description: 'Complete your very first practice drill in Plover.',
    icon: '🎉',
  },
  {
    id: 'combo_10',
    title: 'On Fire (10x Combo)',
    description: 'Stroke 10 words in a row without a single mistake.',
    icon: '🔥',
  },
  {
    id: 'combo_25',
    title: 'Unstoppable (25x Combo)',
    description: 'Stroke 25 words in a row cleanly!',
    icon: '⚡',
  },
  {
    id: 'sniper_100',
    title: 'Precision Sniper',
    description: 'Finish a drill with 100% clean accuracy.',
    icon: '🎯',
  },
  {
    id: 'speed_40',
    title: '40 WPM Club',
    description: 'Reach 40+ WPM in any drill.',
    icon: '🚀',
  },
  {
    id: 'speed_80',
    title: '80 WPM Speedster',
    description: 'Reach 80+ WPM in any drill.',
    icon: '🦅',
  },
  {
    id: 'daily_goal',
    title: 'Daily Quest Champion',
    description: 'Hit your 100 XP Daily Goal.',
    icon: '👑',
  },
  {
    id: 'unit_1_done',
    title: 'Foundation Graduate',
    description: 'Complete all chapters in Unit 1 (Chapters 1–5).',
    icon: '🎓',
  },
];

export function getLevelFromXp(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  rankTitle: string;
  rankIcon: string;
} {
  // Each level requires 150 XP * level (or flat 150 XP for fast, rewarding progression)
  const xpPerLevel = 150;
  const level = Math.floor(xp / xpPerLevel) + 1;
  const currentLevelXp = xp % xpPerLevel;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / xpPerLevel) * 100));

  let rank = STENO_RANKS[0];
  for (const r of STENO_RANKS) {
    if (level >= r.minLevel) rank = r;
  }

  return {
    level,
    currentLevelXp,
    nextLevelXp: xpPerLevel,
    progressPercent,
    rankTitle: rank.title,
    rankIcon: rank.badge,
  };
}

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function createInitialGamificationStats(): GamificationStats {
  return {
    xp: 0,
    dailyXp: 0,
    dailyGoalXp: 100,
    lastActiveDate: getTodayDateString(),
    streakDays: 1,
    gems: 50,
    hearts: 5,
    maxHearts: 5,
    bestCombo: 0,
    completedDrills: {},
    unlockedBadges: [],
  };
}
