import React, { useState } from 'react';
import {
  Play,
  BookOpen,
  Star,
  Lock,
  CheckCircle2,
  Flame,
  Trophy,
  Heart,
  Target,
} from 'lucide-react';
import type { Chapter, ChapterDrill, GamificationStats } from '../types/steno';
import {
  CURRICULUM_UNITS,
  BADGE_DEFINITIONS,
  getLevelFromXp,
} from '../utils/gamification';

interface LearningPathProps {
  chapters: Chapter[];
  completedChapters: number[];
  stats: GamificationStats;
  onOpenLesson: (chapterNum: number) => void;
  onStartDrill: (chapterNum: number, drill: ChapterDrill) => void;
  onRefillHearts: () => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  chapters,
  completedChapters,
  stats,
  onOpenLesson,
  onStartDrill,
  onRefillHearts,
}) => {
  const [selectedNodeNum, setSelectedNodeNum] = useState<number | null>(5);
  const levelInfo = getLevelFromXp(stats.xp);
  const dailyPercent = Math.min(100, Math.round((stats.dailyXp / stats.dailyGoalXp) * 100));

  const totalDrillsCount = chapters.reduce((acc, c) => acc + c.drills.length, 0);
  const completedDrillsCount = Object.keys(stats.completedDrills).length;
  const overallProgressPercent = Math.min(
    100,
    Math.round(
      ((completedChapters.length * 2 + completedDrillsCount) /
        Math.max(1, chapters.length * 2 + totalDrillsCount)) *
        100
    )
  );

  const frontierChapter =
    chapters.find((c) => !completedChapters.includes(c.number) && c.number >= 4)?.number ||
    chapters.find((c) => !completedChapters.includes(c.number))?.number ||
    1;

  const getUnitHeaderColor = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-[#1e4d3b] text-[#fbf8f1]';
      case 'indigo':
        return 'bg-[#23476e] text-[#fbf8f1]';
      case 'amber':
        return 'bg-[#8f5d0a] text-[#fbf8f1]';
      case 'sky':
        return 'bg-[#255459] text-[#fbf8f1]';
      case 'purple':
        return 'bg-[#543054] text-[#fbf8f1]';
      default:
        return 'bg-[#8f2917] text-[#fbf8f1]';
    }
  };

  // Gentle editorial S-curve offsets
  const snakeOffsets = [
    'translate-x-0',
    '-translate-x-8',
    '-translate-x-12',
    '-translate-x-4',
    'translate-x-6',
    'translate-x-12',
    'translate-x-6',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left/Center 8 Cols: Classic Manual Syllabus & Winding Station Path */}
      <div className="lg:col-span-8 flex flex-col gap-8">
        {/* Overall Master Progress Ledger */}
        <div className="ledger-box p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#5a554c]">
                CURRICULUM EXAMINATION LEDGER · LAPWING THEORY
              </div>
              <h2 className="text-xl font-bold text-[#1a1917] mt-0.5">
                {completedChapters.length} of 26 Chapters · {completedDrillsCount} of{' '}
                {totalDrillsCount} Drills Passed
              </h2>
            </div>
            <div className="px-3 py-1 bg-[#1e4d3b] text-[#fbf8f1] border-2 border-[#1a1917] font-mono text-xs font-bold shadow-[2px_2px_0_#1a1917]">
              {overallProgressPercent}% COMPLETE
            </div>
          </div>

          {/* Ruled Mechanical Progress Bar */}
          <div className="w-full h-5 bg-[#ebe4d5] border-2 border-[#1a1917] p-0.5 relative">
            <div
              className="h-full bg-[#1e4d3b] transition-all duration-500"
              style={{ width: `${Math.max(3, overallProgressPercent)}%` }}
            />
          </div>
        </div>

        {/* Render each Unit Plate + Winding Chapter Stations */}
        {CURRICULUM_UNITS.map((unit) => {
          const headerClass = getUnitHeaderColor(unit.color);
          const unitChapters = chapters.filter((c) => unit.chapters.includes(c.number));
          const unitDoneCount = unitChapters.filter((c) =>
            completedChapters.includes(c.number)
          ).length;

          return (
            <div key={unit.id} className="flex flex-col items-center">
              {/* Classic Printed Section Plate */}
              <div className="w-full ledger-box overflow-hidden mb-8">
                <div
                  className={`${headerClass} px-5 py-3 border-b-2 border-[#1a1917] flex items-center justify-between`}
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-widest">
                    SECTION 0{unit.id} · {unitDoneCount}/{unitChapters.length} COMPLETED
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenLesson(unit.chapters[0])}
                    className="px-3 py-1 bg-[#fbf8f1] text-[#1a1917] border border-[#1a1917] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:bg-[#ebe4d5]"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Read Textbook
                  </button>
                </div>
                <div className="p-4 sm:p-5 bg-[#fbf8f1]">
                  <h3 className="text-xl font-bold text-[#1a1917]">{unit.title}</h3>
                  <p className="text-sm text-[#5a554c] mt-1">{unit.subtitle}</p>
                </div>
              </div>

              {/* Winding Skill Stations */}
              <div className="flex flex-col items-center gap-5 w-full py-2 relative">
                {unitChapters.map((ch, idx) => {
                  const isCompleted = completedChapters.includes(ch.number);
                  const isFrontier = ch.number === frontierChapter;
                  const isSelected = selectedNodeNum === ch.number;

                  const totalChapterStars = ch.drills.length * 3;
                  const earnedStars = ch.drills.reduce((sum, d) => {
                    const res = stats.completedDrills[d.id];
                    return sum + (res ? res.stars : 0);
                  }, 0);

                  const offsetClass = snakeOffsets[(ch.number - 1) % snakeOffsets.length];

                  return (
                    <div
                      key={ch.number}
                      className={`flex flex-col items-center relative transition-transform ${offsetClass}`}
                    >
                      {/* "CURRENT LESSON" Stamp on Frontier Node */}
                      {isFrontier && !isSelected && (
                        <div className="mb-2 px-3 py-0.5 bg-[#b83a24] text-[#fbf8f1] border-2 border-[#1a1917] font-mono font-bold text-[10px] uppercase tracking-widest shadow-[2px_2px_0_#1a1917]">
                          CURRENT STATION
                        </div>
                      )}

                      {/* Tactile Typewriter Key / Brass Seal Station Node */}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedNodeNum((prev) => (prev === ch.number ? null : ch.number))
                        }
                        className={`w-20 h-20 rounded-full border-3 border-[#1a1917] flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-[#1e4d3b] text-[#fbf8f1] shadow-[0_5px_0_#1a1917]'
                            : isFrontier || isSelected
                            ? 'bg-[#b87d14] text-[#fbf8f1] shadow-[0_5px_0_#1a1917] scale-105'
                            : 'bg-[#fbf8f1] text-[#1a1917] hover:bg-[#ebe4d5] shadow-[0_5px_0_#1a1917]'
                        }`}
                      >
                        <span className="text-[9px] font-mono uppercase tracking-widest opacity-80">
                          CH.
                        </span>
                        {isCompleted ? (
                          <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                        ) : (
                          <span className="font-mono font-bold text-xl leading-none">
                            {String(ch.number).padStart(2, '0')}
                          </span>
                        )}
                      </button>

                      {/* 3-Star Merit Stamp under Node */}
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3].map((starIdx) => {
                          const filled =
                            isCompleted ||
                            earnedStars >= Math.ceil((totalChapterStars * starIdx) / 3);
                          return (
                            <Star
                              key={starIdx}
                              className={`w-3.5 h-3.5 ${
                                filled
                                  ? 'text-[#b87d14] fill-[#b87d14]'
                                  : 'text-[#bfb6a4] fill-[#e6decb]'
                              }`}
                            />
                          );
                        })}
                      </div>

                      {/* Chapter Title Label */}
                      <div className="mt-1 text-center max-w-[220px]">
                        <div className="text-xs font-mono font-bold text-[#1a1917] leading-tight">
                          {ch.title}
                        </div>
                      </div>

                      {/* Index Card Popover when Station is Clicked */}
                      {isSelected && (
                        <div className="mt-3 w-80 sm:w-96 ledger-box p-4 z-20">
                          <div className="flex items-center justify-between border-b-2 border-[#1a1917] pb-2.5 mb-3">
                            <div>
                              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5a554c]">
                                CHAPTER {ch.number} · {earnedStars}/{totalChapterStars} MERIT STARS
                              </span>
                              <h4 className="text-base font-bold text-[#1a1917]">{ch.title}</h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => onOpenLesson(ch.number)}
                              className="px-2.5 py-1.5 mech-btn bg-[#ebe4d5] text-[#1a1917] font-mono text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5" /> Theory
                            </button>
                          </div>

                          <div className="space-y-2">
                            {ch.drills.map((d) => {
                              const drillStat = stats.completedDrills[d.id];
                              return (
                                <button
                                  key={d.id}
                                  type="button"
                                  onClick={() => onStartDrill(ch.number, d)}
                                  className="w-full p-2.5 bg-[#f4efe6] hover:bg-[#e6decb] border-1.5 border-[#1a1917] flex items-center justify-between text-left transition-colors cursor-pointer"
                                >
                                  <div className="min-w-0 pr-2">
                                    <div className="text-xs font-bold text-[#1a1917] truncate font-mono">
                                      {d.title}
                                    </div>
                                    <div className="text-[10px] text-[#5a554c] font-mono flex items-center gap-2 mt-0.5">
                                      <span>{d.count} words</span>
                                      {drillStat && (
                                        <span className="text-[#1e4d3b] font-bold">
                                          Record: {drillStat.bestWpm} WPM ({drillStat.bestAcc}%)
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <div className="flex">
                                      {[1, 2, 3].map((s) => (
                                        <Star
                                          key={s}
                                          className={`w-3 h-3 ${
                                            (drillStat?.stars || 0) >= s
                                              ? 'text-[#b87d14] fill-[#b87d14]'
                                              : 'text-[#cfc6b4]'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="px-2 py-1 bg-[#1e4d3b] text-[#fbf8f1] border border-[#1a1917] font-mono font-bold text-[10px] flex items-center gap-1">
                                      <Play className="w-2.5 h-2.5 fill-current" /> START
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Ruled Connector Line */}
                      {idx < unitChapters.length - 1 && (
                        <div
                          className={`w-0.5 h-6 mt-2 ${
                            isCompleted ? 'bg-[#1e4d3b]' : 'bg-[#1a1917]'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right 4 Cols: Stenographer's Record Card (Rank, Daily Quota, Accuracy Tokens & Merits) */}
      <div className="lg:col-span-4 flex flex-col gap-5 sticky top-20">
        {/* Operator Rank & Experience Card */}
        <div className="ledger-box p-5 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#1a1917] pb-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5a554c]">
                STENOGRAPHER GRADE · LEVEL {levelInfo.level}
              </div>
              <div className="text-lg font-bold text-[#1a1917] mt-0.5">{levelInfo.rankTitle}</div>
            </div>
            <div className="text-right font-mono">
              <div className="text-sm font-bold text-[#1e4d3b]">{stats.xp} PTS</div>
              <div className="text-[10px] text-[#5a554c]">
                {levelInfo.currentLevelXp}/{levelInfo.nextLevelXp} TO LV.{levelInfo.level + 1}
              </div>
            </div>
          </div>

          {/* Level XP Bar */}
          <div className="w-full h-3.5 bg-[#ebe4d5] border-1.5 border-[#1a1917] p-0.5">
            <div
              className="h-full bg-[#23476e] transition-all duration-500"
              style={{ width: `${Math.max(4, levelInfo.progressPercent)}%` }}
            />
          </div>

          {/* 3-Box Ledger Grid: Streak, Merits, Lives */}
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
            <div className="bg-[#f4efe6] border-1.5 border-[#1a1917] p-2.5 text-center">
              <div className="text-base font-bold text-[#b83a24] flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-[#b83a24]" />
                {stats.streakDays}
              </div>
              <div className="text-[10px] uppercase text-[#5a554c]">Day Streak</div>
            </div>

            <div className="bg-[#f4efe6] border-1.5 border-[#1a1917] p-2.5 text-center">
              <div className="text-base font-bold text-[#b87d14]">★ {stats.gems}</div>
              <div className="text-[10px] uppercase text-[#5a554c]">Merit Seals</div>
            </div>

            <div className="bg-[#f4efe6] border-1.5 border-[#1a1917] p-2.5 text-center">
              <div className="text-base font-bold text-[#8f2917] flex items-center justify-center gap-1">
                <Heart className="w-4 h-4 fill-[#8f2917]" />
                {stats.hearts}/{stats.maxHearts}
              </div>
              <div className="text-[10px] uppercase text-[#5a554c]">Lives</div>
            </div>
          </div>

          {stats.hearts < stats.maxHearts && (
            <button
              type="button"
              onClick={onRefillHearts}
              className="w-full py-2 mech-btn bg-[#f9e6e2] text-[#8f2917] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Restore 5 Accuracy Lives
            </button>
          )}
        </div>

        {/* Daily Practice Quota */}
        <div className="ledger-box p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#cfc6b4] pb-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#1a1917] flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#1e4d3b]" />
              Daily Practice Quota
            </h3>
            <span className="text-xs font-mono font-bold text-[#1e4d3b]">
              {stats.dailyXp} / {stats.dailyGoalXp} PTS
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-4 bg-[#ebe4d5] border-1.5 border-[#1a1917] p-0.5">
              <div
                className="h-full bg-[#1e4d3b] transition-all duration-500"
                style={{ width: `${Math.max(4, dailyPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-[#5a554c]">
              <span>Unbroken Clean Streak Record:</span>
              <strong className="text-[#1a1917]">{stats.bestCombo} Words</strong>
            </div>
          </div>
        </div>

        {/* Official Merit Stamps / Certifications */}
        <div className="ledger-box p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#cfc6b4] pb-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#1a1917] flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#b87d14]" />
              Proficiency Stamps ({stats.unlockedBadges.length}/{BADGE_DEFINITIONS.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {BADGE_DEFINITIONS.map((b) => {
              const unlocked = stats.unlockedBadges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`p-2.5 border-1.5 border-[#1a1917] flex flex-col justify-between ${
                    unlocked
                      ? 'bg-[#f7eedc] text-[#1a1917]'
                      : 'bg-[#ebe4d5]/60 text-[#8c8578] opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase leading-tight">
                      {b.title}
                    </span>
                    {unlocked ? (
                      <span className="text-[10px] font-mono font-bold px-1 bg-[#1e4d3b] text-[#fbf8f1]">
                        OK
                      </span>
                    ) : (
                      <Lock className="w-3 h-3 shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#5a554c] leading-snug mt-1">
                    {b.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
