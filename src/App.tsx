import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Keyboard,
  Search,
  Brain,
  Compass,
  Flame,
  ChevronRight,
  Loader2,
  Heart,
} from 'lucide-react';
import type {
  CurriculumData,
  DrillItem,
  PaperTapeEntry,
  WordMastery,
  ChapterDrill,
  GamificationStats,
} from './types/steno';
import { PracticeArena } from './components/PracticeArena';
import { PaperTape } from './components/PaperTape';
import { DictionaryExplorer } from './components/DictionaryExplorer';
import { TheoryReferenceView } from './components/TheoryReferenceView';
import { ChapterReader } from './components/ChapterReader';
import { LearningPath } from './components/LearningPath';
import {
  createInitialGamificationStats,
  getLevelFromXp,
  getTodayDateString,
} from './utils/gamification';

type NavTab = 'path' | 'curriculum' | 'practice' | 'reference' | 'dictionary' | 'srs';

export function App() {
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  const [forwardDict, setForwardDict] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<NavTab>('path');
  const [selectedChapterNum, setSelectedChapterNum] = useState<number>(5);
  const [activeDrillId, setActiveDrillId] = useState<string>('5-cvc');
  const [activeDrillTitle, setActiveDrillTitle] = useState<string>(
    'Basic single syllable words drill'
  );
  const [activeDrillSubtitle, setActiveDrillSubtitle] = useState<string>('Chapter 5');
  const [activeDrillItems, setActiveDrillItems] = useState<DrillItem[]>([]);
  const [dictSearchQuery, setDictSearchQuery] = useState<string>('complicate');

  const [completedChapters, setCompletedChapters] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('lapwing_completed_chapters');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [masteryMap, setMasteryMap] = useState<Record<string, WordMastery>>(() => {
    try {
      const saved = localStorage.getItem('lapwing_word_mastery');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [gameStats, setGameStats] = useState<GamificationStats>(() => {
    try {
      const saved = localStorage.getItem('lapwing_gamification_stats');
      if (saved) {
        const parsed: GamificationStats = JSON.parse(saved);
        const today = getTodayDateString();
        if (parsed.lastActiveDate !== today) {
          parsed.dailyXp = 0;
          parsed.lastActiveDate = today;
          parsed.hearts = parsed.maxHearts || 5;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return createInitialGamificationStats();
  });

  const [paperTape, setPaperTape] = useState<PaperTapeEntry[]>([]);
  const [serverSynced, setServerSynced] = useState(false);

  // Sync helper to persist progress to server Docker volume (/app/data/user-progress.json)
  const syncToServer = (payload: {
    completedChapters?: number[];
    masteryMap?: Record<string, WordMastery>;
    gameStats?: GamificationStats;
  }) => {
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => {
        if (r.ok) setServerSynced(true);
      })
      .catch(() => {
        // Ignore in pure Vite dev mode if /api/progress isn't mounted
      });
  };

  const saveGameStats = (updater: (prev: GamificationStats) => GamificationStats) => {
    setGameStats((prev) => {
      const next = updater(prev);
      localStorage.setItem('lapwing_gamification_stats', JSON.stringify(next));
      syncToServer({ gameStats: next });
      return next;
    });
  };

  useEffect(() => {
    async function loadAllData() {
      try {
        const [currRes, dictRes, progRes] = await Promise.all([
          fetch('/data/curriculum.json'),
          fetch('/data/lapwing-base.json'),
          fetch('/api/progress').catch(() => null),
        ]);
        const currData: CurriculumData = await currRes.json();
        const dictData: Record<string, string> = await dictRes.json();

        setCurriculum(currData);
        setForwardDict(dictData);

        if (progRes && progRes.ok) {
          try {
            const serverProg = await progRes.json();
            setServerSynced(true);
            if (Array.isArray(serverProg.completedChapters) && serverProg.completedChapters.length > 0) {
              setCompletedChapters(serverProg.completedChapters);
              localStorage.setItem(
                'lapwing_completed_chapters',
                JSON.stringify(serverProg.completedChapters)
              );
            }
            if (serverProg.masteryMap && Object.keys(serverProg.masteryMap).length > 0) {
              setMasteryMap(serverProg.masteryMap);
              localStorage.setItem(
                'lapwing_word_mastery',
                JSON.stringify(serverProg.masteryMap)
              );
            }
            if (serverProg.gameStats && typeof serverProg.gameStats.xp === 'number') {
              setGameStats(serverProg.gameStats);
              localStorage.setItem(
                'lapwing_gamification_stats',
                JSON.stringify(serverProg.gameStats)
              );
            }
          } catch {
            // ignore if dev server returned HTML
          }
        }

        const ch5 = currData.chapters.find((c) => c.number === 5) || currData.chapters[0];
        if (ch5 && ch5.drills.length > 0) {
          setActiveDrillId(ch5.drills[0].id);
          setActiveDrillTitle(ch5.drills[0].title);
          setActiveDrillSubtitle(`Chapter ${ch5.number}: ${ch5.title}`);
          setActiveDrillItems(ch5.drills[0].items);
        }
      } catch (err) {
        console.error('Failed to load Lapwing data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  const reverseDict = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const [outline, translation] of Object.entries(forwardDict)) {
      if (!translation || translation.startsWith('=') || translation.startsWith('{')) continue;
      const key = translation.toLowerCase().trim();
      if (!key) continue;
      const existing = map.get(key);
      if (existing) {
        existing.push(outline);
      } else {
        map.set(key, [outline]);
      }
    }
    for (const [, outlines] of map.entries()) {
      outlines.sort((a: string, b: string) => {
        const strokesA = a.split('/').length;
        const strokesB = b.split('/').length;
        if (strokesA !== strokesB) return strokesA - strokesB;
        return a.length - b.length;
      });
    }
    return map;
  }, [forwardDict]);

  const handleToggleCompleteChapter = (chNum: number) => {
    setCompletedChapters((prev) => {
      const isAdding = !prev.includes(chNum);
      const next = isAdding ? [...prev, chNum] : prev.filter((n) => n !== chNum);
      localStorage.setItem('lapwing_completed_chapters', JSON.stringify(next));
      syncToServer({ completedChapters: next });

      if (isAdding) {
        saveGameStats((st) => {
          const unlocked = new Set(st.unlockedBadges);
          if ([1, 2, 3, 4, 5].every((n) => next.includes(n))) {
            unlocked.add('unit_1_done');
          }
          return {
            ...st,
            xp: st.xp + 15,
            dailyXp: st.dailyXp + 15,
            gems: st.gems + 5,
            unlockedBadges: Array.from(unlocked),
          };
        });
      }
      return next;
    });
  };

  const handleRecordMastery = (
    word: string,
    outline: string,
    correct: boolean,
    durationMs: number
  ) => {
    setMasteryMap((prev) => {
      const existing = prev[word] || {
        word,
        outline,
        attempts: 0,
        correct: 0,
        bestTimeMs: durationMs,
        lastPracticed: 0,
        nextReview: 0,
        streak: 0,
      };

      const isFastAndClean = correct && durationMs < 2400;
      const newStreak = isFastAndClean ? existing.streak + 1 : 0;
      const intervalMinutes = isFastAndClean ? Math.pow(3, newStreak) * 2 : 1;
      const now = Date.now();

      const updated: WordMastery = {
        word,
        outline,
        attempts: existing.attempts + 1,
        correct: existing.correct + (correct ? 1 : 0),
        bestTimeMs: Math.min(existing.bestTimeMs, durationMs),
        lastPracticed: now,
        nextReview: now + intervalMinutes * 60 * 1000,
        streak: newStreak,
      };

      const next = { ...prev, [word]: updated };
      localStorage.setItem('lapwing_word_mastery', JSON.stringify(next));
      syncToServer({ masteryMap: next });
      return next;
    });
  };

  const handleLoseHeart = () => {
    saveGameStats((st) => ({
      ...st,
      hearts: Math.max(0, st.hearts - 1),
    }));
  };

  const handleRefillHearts = () => {
    saveGameStats((st) => ({
      ...st,
      hearts: st.maxHearts,
    }));
  };

  const handleCompleteDrillSession = (summary: {
    drillId: string;
    xpEarned: number;
    gemsEarned: number;
    stars: number;
    wpm: number;
    accuracy: number;
    maxCombo: number;
  }) => {
    saveGameStats((st) => {
      const prevDrill = st.completedDrills[summary.drillId];
      const updatedDrill = {
        stars: Math.max(prevDrill?.stars || 0, summary.stars),
        bestWpm: Math.max(prevDrill?.bestWpm || 0, summary.wpm),
        bestAcc: Math.max(prevDrill?.bestAcc || 0, summary.accuracy),
      };

      const newDailyXp = st.dailyXp + summary.xpEarned;
      const unlocked = new Set(st.unlockedBadges);
      unlocked.add('first_chord');
      if (summary.maxCombo >= 10) unlocked.add('combo_10');
      if (summary.maxCombo >= 25) unlocked.add('combo_25');
      if (summary.accuracy === 100) unlocked.add('sniper_100');
      if (summary.wpm >= 40) unlocked.add('speed_40');
      if (summary.wpm >= 80) unlocked.add('speed_80');
      if (newDailyXp >= st.dailyGoalXp) unlocked.add('daily_goal');

      return {
        ...st,
        xp: st.xp + summary.xpEarned,
        dailyXp: newDailyXp,
        gems: st.gems + summary.gemsEarned,
        bestCombo: Math.max(st.bestCombo, summary.maxCombo),
        completedDrills: {
          ...st.completedDrills,
          [summary.drillId]: updatedDrill,
        },
        unlockedBadges: Array.from(unlocked),
      };
    });
  };

  const handleRecordTape = (entry: PaperTapeEntry) => {
    setPaperTape((prev) => [entry, ...prev.slice(0, 79)]);
  };

  const handleStartChapterDrill = (chapterNum: number, drill: ChapterDrill) => {
    const ch = curriculum?.chapters.find((c) => c.number === chapterNum);
    setSelectedChapterNum(chapterNum);
    setActiveDrillId(drill.id);
    setActiveDrillTitle(drill.title);
    setActiveDrillSubtitle(ch ? `Chapter ${ch.number}: ${ch.title}` : `Chapter ${chapterNum}`);
    setActiveDrillItems(drill.items);
    setActiveTab('practice');
  };

  const handleStartCustomDrill = (title: string, items: DrillItem[]) => {
    setActiveDrillId('custom');
    setActiveDrillTitle(title);
    setActiveDrillSubtitle('Targeted Chord Practice');
    setActiveDrillItems(items);
    setActiveTab('practice');
  };

  const handleInspectWordInDict = (word: string) => {
    setDictSearchQuery(word);
    setActiveTab('dictionary');
  };

  const srsItems = useMemo(() => {
    const all = Object.values(masteryMap);
    return all.sort((a, b) => {
      const accA = a.correct / Math.max(1, a.attempts);
      const accB = b.correct / Math.max(1, b.attempts);
      if (accA !== accB) return accA - accB;
      return b.bestTimeMs - a.bestTimeMs;
    });
  }, [masteryMap]);

  if (loading || !curriculum) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 font-mono">
        <Loader2 className="w-7 h-7 text-[#1a1917] animate-spin" />
        <div className="text-xs font-bold uppercase tracking-widest text-[#1a1917]">
          LOADING LAPWING STENOGRAPHIC MANUAL & 114,885 DICTIONARY ENTRIES...
        </div>
      </div>
    );
  }

  const currentChapter =
    curriculum.chapters.find((c) => c.number === selectedChapterNum) || curriculum.chapters[0];
  const levelInfo = getLevelFromXp(gameStats.xp);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Classic Editorial Masthead Header */}
      <header className="sticky top-0 z-30 bg-[#fbf8f1] border-b-2 border-[#1a1917] px-4 sm:px-6 py-2.5 shadow-[0_2px_0_#cfc6b4]">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Editorial Title */}
          <div
            onClick={() => setActiveTab('path')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-9 h-9 bg-[#1a1917] text-[#fbf8f1] flex items-center justify-center font-display font-bold text-lg border border-[#1a1917]">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base sm:text-lg tracking-tight text-[#1a1917]">
                  THE LAPWING MANUAL
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#ebe4d5] text-[#1a1917] border border-[#1a1917]">
                  GRADE {levelInfo.level} · {levelInfo.rankTitle.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#5a554c] hidden sm:block">
                MACHINE SHORTHAND SYLLABUS & EXAMINER · PLOVER COMPATIBLE
              </p>
            </div>
          </div>

          {/* Index Card Navigation Tabs */}
          <nav className="flex flex-wrap items-center gap-1.5 font-mono">
            {[
              { id: 'path', label: 'SYLLABUS PATH', icon: Compass },
              { id: 'practice', label: 'PRACTICE ROOM', icon: Keyboard },
              { id: 'curriculum', label: 'TEXTBOOK', icon: BookOpen },
              { id: 'reference', label: 'TABLES', icon: Compass },
              { id: 'dictionary', label: 'LEXICON', icon: Search },
              {
                id: 'srs',
                label: `SRS LEDGER (${Object.keys(masteryMap).length})`,
                icon: Brain,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as NavTab)}
                  className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 border-1.5 border-[#1a1917] transition-all cursor-pointer ${
                    active
                      ? 'bg-[#1a1917] text-[#fbf8f1] shadow-[2px_2px_0_#8c8578]'
                      : 'bg-[#f4efe6] text-[#1a1917] hover:bg-[#ebe4d5]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Operator Status Ledger Strip */}
          <div className="hidden xl:flex items-center gap-3 text-xs font-mono font-bold bg-[#f4efe6] border-1.5 border-[#1a1917] px-3 py-1.5">
            <div className="flex items-center gap-1 text-[#b83a24]" title="Day Streak">
              <Flame className="w-3.5 h-3.5 fill-[#b83a24]" />
              <span>{gameStats.streakDays}D</span>
            </div>
            <span className="text-[#cfc6b4]">|</span>
            <div className="text-[#1e4d3b]" title="Total Merit Points">
              <span>{gameStats.xp} PTS</span>
            </div>
            <span className="text-[#cfc6b4]">|</span>
            <div className="text-[#9e6608]" title="Merit Seals">
              <span>★ {gameStats.gems}</span>
            </div>
            <span className="text-[#cfc6b4]">|</span>
            <div className="flex items-center gap-1 text-[#8f2917]" title="Accuracy Lives">
              <Heart className="w-3.5 h-3.5 fill-[#8f2917]" />
              <span>{gameStats.hearts}</span>
            </div>
            {serverSynced && (
              <>
                <span className="text-[#cfc6b4]">|</span>
                <span className="text-[10px] text-[#1e4d3b]" title="Synced to Homelab Volume">
                  DISK SYNC ✓
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: 26 Chapters Index (Shown in Textbook & Practice Room tabs) */}
        {(activeTab === 'curriculum' || activeTab === 'practice') && (
          <aside className="lg:col-span-3 xl:col-span-3 flex flex-col gap-3 ledger-box p-3.5 max-h-[calc(100vh-110px)] sticky top-20 overflow-hidden">
            <div className="flex items-center justify-between px-1 pb-2 border-b-2 border-[#1a1917] font-mono">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1917]">
                TABLE OF CONTENTS
              </span>
              <span className="text-[11px] text-[#1e4d3b] font-bold">
                {completedChapters.length}/26 READ
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono">
              {curriculum.chapters.map((ch) => {
                const isSelected = ch.number === selectedChapterNum;
                const isDone = completedChapters.includes(ch.number);
                return (
                  <div key={ch.number} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChapterNum(ch.number);
                        if (activeTab !== 'curriculum' && ch.drills.length > 0) {
                          handleStartChapterDrill(ch.number, ch.drills[0]);
                        }
                      }}
                      className={`w-full text-left px-2.5 py-2 text-xs transition-all flex items-center justify-between gap-2 border cursor-pointer ${
                        isSelected
                          ? 'bg-[#ebe4d5] border-[#1a1917] text-[#1a1917] font-bold'
                          : 'border-transparent hover:bg-[#f4efe6] text-[#1a1917]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 text-[10px] font-bold flex items-center justify-center shrink-0 border border-[#1a1917] ${
                            isDone
                              ? 'bg-[#1e4d3b] text-[#fbf8f1]'
                              : isSelected
                              ? 'bg-[#1a1917] text-[#fbf8f1]'
                              : 'bg-[#fbf8f1] text-[#5a554c]'
                          }`}
                        >
                          {isDone ? '✓' : ch.number}
                        </span>
                        <span className="truncate">{ch.title}</span>
                      </div>
                      <span className="text-[10px] text-[#5a554c] shrink-0">
                        {ch.drills.length}d
                      </span>
                    </button>

                    {isSelected && ch.drills.length > 0 && (
                      <div className="ml-5 mt-1 mb-1.5 pl-2.5 border-l-2 border-[#1a1917] space-y-1">
                        {ch.drills.map((d) => {
                          const isDrillActive =
                            activeTab === 'practice' && activeDrillTitle === d.title;
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => handleStartChapterDrill(ch.number, d)}
                              className={`w-full text-left px-2 py-1 text-[11px] flex items-center justify-between gap-1 cursor-pointer ${
                                isDrillActive
                                  ? 'bg-[#1e4d3b] text-[#fbf8f1] font-bold'
                                  : 'text-[#5a554c] hover:text-[#1a1917] hover:bg-[#f4efe6]'
                              }`}
                            >
                              <span className="truncate">{d.title}</span>
                              <ChevronRight className="w-3 h-3 shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main
          className={
            activeTab === 'curriculum' || activeTab === 'practice'
              ? 'lg:col-span-9 xl:col-span-9'
              : 'lg:col-span-12'
          }
        >
          {activeTab === 'path' && (
            <LearningPath
              chapters={curriculum.chapters}
              completedChapters={completedChapters}
              stats={gameStats}
              onOpenLesson={(chNum) => {
                setSelectedChapterNum(chNum);
                setActiveTab('curriculum');
              }}
              onStartDrill={handleStartChapterDrill}
              onRefillHearts={handleRefillHearts}
            />
          )}

          {activeTab === 'curriculum' && (
            <ChapterReader
              chapter={currentChapter}
              completedChapters={completedChapters}
              onToggleCompleteChapter={handleToggleCompleteChapter}
              onStartDrill={(drill) => handleStartChapterDrill(currentChapter.number, drill)}
              onStartCustomDrill={handleStartCustomDrill}
            />
          )}

          {activeTab === 'practice' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-8">
                <PracticeArena
                  drillId={activeDrillId}
                  title={activeDrillTitle}
                  subtitle={activeDrillSubtitle}
                  items={activeDrillItems}
                  reverseDict={reverseDict}
                  hearts={gameStats.hearts}
                  maxHearts={gameStats.maxHearts}
                  onLoseHeart={handleLoseHeart}
                  onRefillHearts={handleRefillHearts}
                  onRecordTape={handleRecordTape}
                  onRecordMastery={handleRecordMastery}
                  onCompleteSession={handleCompleteDrillSession}
                  onBackToPath={() => setActiveTab('path')}
                  onInspectWord={handleInspectWordInDict}
                />
              </div>
              <div className="xl:col-span-4">
                <PaperTape
                  entries={paperTape}
                  onClear={() => setPaperTape([])}
                  onSelectEntry={(outline) => {
                    setDictSearchQuery(outline);
                    setActiveTab('dictionary');
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'reference' && (
            <TheoryReferenceView
              reference={curriculum.reference}
              onStartCustomDrill={handleStartCustomDrill}
            />
          )}

          {activeTab === 'dictionary' && (
            <DictionaryExplorer
              forwardDict={forwardDict}
              reverseDict={reverseDict}
              onPracticeWords={handleStartCustomDrill}
              initialQuery={dictSearchQuery}
            />
          )}

          {activeTab === 'srs' && (
            <div className="ledger-box p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1a1917] pb-4">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5a554c]">
                    SPACED REPETITION REGISTER
                  </div>
                  <h2 className="text-2xl font-bold text-[#1a1917] mt-0.5">
                    Chord Mastery & Hesitation Ledger
                  </h2>
                </div>

                {srsItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const drillList = srsItems
                        .slice(0, 35)
                        .map((m) => ({ word: m.word, outline: m.outline }));
                      handleStartCustomDrill('SRS Weakest Outlines Review', drillList);
                    }}
                    className="px-4 py-2 mech-btn bg-[#1e4d3b] text-[#fbf8f1] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    DRILL {Math.min(35, srsItems.length)} WEAKEST OUTLINES
                  </button>
                )}
              </div>

              {srsItems.length === 0 ? (
                <div className="p-12 text-center space-y-2 font-mono text-[#5a554c]">
                  <div className="text-sm font-bold text-[#1a1917]">
                    [NO OUTLINES RECORDED IN LEDGER YET]
                  </div>
                  <p className="text-xs max-w-md mx-auto">
                    Complete any drill in the Practice Room using Plover to log your per-word speed
                    and accuracy.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border-2 border-[#1a1917]">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b-2 border-[#1a1917] bg-[#ebe4d5] text-[#1a1917] uppercase text-[10px]">
                        <th className="py-2.5 px-3 border-r border-[#cfc6b4]">WORD</th>
                        <th className="py-2.5 px-3 border-r border-[#cfc6b4]">LAPWING OUTLINE</th>
                        <th className="py-2.5 px-3 border-r border-[#cfc6b4]">ATTEMPTS</th>
                        <th className="py-2.5 px-3 border-r border-[#cfc6b4]">CLEAN RATE</th>
                        <th className="py-2.5 px-3 border-r border-[#cfc6b4]">BEST TIME</th>
                        <th className="py-2.5 px-3">MERIT STREAK</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#cfc6b4] bg-[#fbf8f1]">
                      {srsItems.map((item) => {
                        const acc = Math.round((item.correct / Math.max(1, item.attempts)) * 100);
                        return (
                          <tr key={item.word} className="hover:bg-[#f4efe6]">
                            <td className="py-2 px-3 font-bold text-[#1a1917] border-r border-[#e5dec9]">
                              {item.word}
                            </td>
                            <td className="py-2 px-3 font-bold text-[#1e4d3b] border-r border-[#e5dec9]">
                              {item.outline}
                            </td>
                            <td className="py-2 px-3 text-[#5a554c] border-r border-[#e5dec9]">
                              {item.attempts}
                            </td>
                            <td className="py-2 px-3 border-r border-[#e5dec9]">
                              <span
                                className={`px-1.5 py-0.5 font-bold border border-[#1a1917] ${
                                  acc >= 90
                                    ? 'bg-[#e3efe9] text-[#1e4d3b]'
                                    : acc >= 70
                                    ? 'bg-[#f7eedc] text-[#9e6608]'
                                    : 'bg-[#f9e6e2] text-[#b83a24]'
                                }`}
                              >
                                {acc}%
                              </span>
                            </td>
                            <td className="py-2 px-3 text-[#5a554c] border-r border-[#e5dec9]">
                              {(item.bestTimeMs / 1000).toFixed(2)}s
                            </td>
                            <td className="py-2 px-3 text-[#b87d14] font-bold">
                              {'★'.repeat(Math.min(5, item.streak)) || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
