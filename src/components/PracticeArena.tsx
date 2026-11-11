import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  RotateCcw,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Shuffle,
  HelpCircle,
  Flame,
  Heart,
  Star,
  ArrowRight,
} from 'lucide-react';
import type { DrillItem, PaperTapeEntry } from '../types/steno';
import { StenoKeyboard } from './StenoKeyboard';
import { parseOutline } from '../utils/stenoParser';

interface PracticeArenaProps {
  drillId?: string;
  title: string;
  subtitle?: string;
  items: DrillItem[];
  reverseDict: Map<string, string[]>;
  hearts: number;
  maxHearts: number;
  onLoseHeart?: () => void;
  onRefillHearts?: () => void;
  onRecordTape: (entry: PaperTapeEntry) => void;
  onRecordMastery: (word: string, outline: string, correct: boolean, durationMs: number) => void;
  onCompleteSession?: (summary: {
    drillId: string;
    xpEarned: number;
    gemsEarned: number;
    stars: number;
    wpm: number;
    accuracy: number;
    maxCombo: number;
  }) => void;
  onBackToPath?: () => void;
  onInspectWord?: (word: string) => void;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({
  drillId = 'custom',
  title,
  subtitle,
  items,
  reverseDict,
  hearts,
  maxHearts,
  onLoseHeart,
  onRefillHearts,
  onRecordTape,
  onRecordMastery,
  onCompleteSession,
  onBackToPath,
  onInspectWord,
}) => {
  const [drillItems, setDrillItems] = useState<DrillItem[]>(items.slice(0, 25));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [hintMode, setHintMode] = useState<'always' | 'on-hesitate' | 'hidden'>('always');
  const [showFingerHints, setShowFingerHints] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeStrokeIdx, setActiveStrokeIdx] = useState(0);

  // Timing & Gamification State
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [wordStart, setWordStart] = useState<number>(Date.now());
  const [completedCount, setCompletedCount] = useState(0);
  const [cleanCount, setCleanCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [floatingXp, setFloatingXp] = useState<{ id: number; text: string } | null>(null);
  const [hadErrorOnCurrent, setHadErrorOnCurrent] = useState(false);
  const [hesitated, setHesitated] = useState(false);
  const [recentErrorWord, setRecentErrorWord] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDrillItems(items.slice(0, 25));
    setCurrentIndex(0);
    setInputValue('');
    setSessionStart(null);
    setWordStart(Date.now());
    setCompletedCount(0);
    setCleanCount(0);
    setCombo(0);
    setMaxCombo(0);
    setSessionXp(0);
    setHadErrorOnCurrent(false);
    setIsFinished(false);
    setActiveStrokeIdx(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [items, title]);

  useEffect(() => {
    setHesitated(false);
    setActiveStrokeIdx(0);
    const t = setTimeout(() => {
      setHesitated(true);
    }, 2000);
    return () => clearTimeout(t);
  }, [currentIndex, drillItems]);

  const currentItem = drillItems[currentIndex] || drillItems[0];

  // Mechanical Typewriter / Bell sound synthesis
  const playSound = (type: 'correct' | 'combo' | 'error' | 'fanfare') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const now = ctx.currentTime;

      if (type === 'correct' || type === 'combo') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(type === 'combo' ? 740 : 480, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'fanfare') {
        // Carriage return bell chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1180, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch {
      // Ignore audio errors
    }
  };

  const handleRestart = (shuffle = false) => {
    const base = [...items];
    if (shuffle) {
      for (let i = base.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [base[i], base[j]] = [base[j], base[i]];
      }
    }
    setDrillItems(base.slice(0, 25));
    setCurrentIndex(0);
    setInputValue('');
    setSessionStart(null);
    setWordStart(Date.now());
    setCompletedCount(0);
    setCleanCount(0);
    setCombo(0);
    setMaxCombo(0);
    setSessionXp(0);
    setHadErrorOnCurrent(false);
    setIsFinished(false);
    setRecentErrorWord(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const wpm = useMemo(() => {
    if (!sessionStart || completedCount === 0) return 0;
    const elapsedMin = Math.max(0.05, (Date.now() - sessionStart) / 60000);
    return Math.round(completedCount / elapsedMin);
  }, [sessionStart, completedCount, currentIndex]);

  const accuracy = useMemo(() => {
    if (completedCount === 0) return 100;
    return Math.round((cleanCount / completedCount) * 100);
  }, [completedCount, cleanCount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (!currentItem || isFinished) return;

    const now = Date.now();
    if (!sessionStart && rawVal.trim().length > 0) {
      setSessionStart(now);
      setWordStart(now);
    }

    const trimmed = rawVal.trimStart();
    const target = currentItem.word;
    const cleanInput = trimmed.trim();

    if (
      cleanInput === target ||
      cleanInput.toLowerCase() === target.toLowerCase()
    ) {
      const duration = Math.max(150, now - wordStart);
      const isClean = !hadErrorOnCurrent;

      const newCombo = isClean ? combo + 1 : 1;
      const newMaxCombo = Math.max(maxCombo, newCombo);
      const multiplier = newCombo >= 10 ? 3 : newCombo >= 5 ? 2 : 1;
      const gainedXp = (isClean ? 2 : 1) * multiplier;
      const updatedSessionXp = sessionXp + gainedXp;

      setCombo(newCombo);
      setMaxCombo(newMaxCombo);
      setSessionXp(updatedSessionXp);
      setFloatingXp({ id: now, text: `+${gainedXp} PTS${multiplier > 1 ? ` (${multiplier}x)` : ''}` });

      playSound(newCombo >= 5 && newCombo % 5 === 0 ? 'combo' : 'correct');

      onRecordTape({
        id: `${now}-${currentIndex}`,
        timestamp: now,
        word: currentItem.word,
        outline: currentItem.outline,
        correct: isClean,
        durationMs: duration,
      });

      onRecordMastery(currentItem.word, currentItem.outline, isClean, duration);

      const nextCompleted = completedCount + 1;
      const nextClean = cleanCount + (isClean ? 1 : 0);
      setCompletedCount(nextCompleted);
      setCleanCount(nextClean);
      setInputValue('');
      setHadErrorOnCurrent(false);
      setRecentErrorWord(null);
      setWordStart(now);

      if (currentIndex + 1 >= drillItems.length) {
        setIsFinished(true);
        playSound('fanfare');

        const finalAcc = Math.round((nextClean / Math.max(1, nextCompleted)) * 100);
        const elapsedMin = Math.max(0.05, (now - (sessionStart || now - 3000)) / 60000);
        const finalWpm = Math.round(nextCompleted / elapsedMin);
        const stars = finalAcc >= 95 ? 3 : finalAcc >= 80 ? 2 : 1;
        const completionBonusXp = 15 + stars * 5;
        const totalDrillXp = updatedSessionXp + completionBonusXp;
        const gemsEarned = stars * 5 + (newMaxCombo >= 10 ? 5 : 0);

        setSessionXp(totalDrillXp);
        onCompleteSession?.({
          drillId,
          xpEarned: totalDrillXp,
          gemsEarned,
          stars,
          wpm: finalWpm,
          accuracy: finalAcc,
          maxCombo: newMaxCombo,
        });
      } else {
        setCurrentIndex((idx) => idx + 1);
      }
      return;
    }

    if (cleanInput.length > 0 && !target.toLowerCase().startsWith(cleanInput.toLowerCase())) {
      if (!hadErrorOnCurrent) {
        setHadErrorOnCurrent(true);
        setCombo(0);
        playSound('error');
        onLoseHeart?.();
      }
      setRecentErrorWord(cleanInput);
    } else {
      setRecentErrorWord(null);
    }

    setInputValue(trimmed);
  };

  const alternativeOutlines = useMemo(() => {
    if (!currentItem) return [];
    const found = reverseDict.get(currentItem.word.toLowerCase()) || [];
    return found.filter((o) => o !== currentItem.outline).slice(0, 4);
  }, [currentItem, reverseDict]);

  const errorStrokedOutline = useMemo(() => {
    if (!recentErrorWord) return null;
    const found = reverseDict.get(recentErrorWord.toLowerCase());
    return found && found.length > 0 ? found[0] : null;
  }, [recentErrorWord, reverseDict]);

  const shouldShowChord =
    hintMode === 'always' ||
    (hintMode === 'on-hesitate' && (hesitated || hadErrorOnCurrent));

  const strokes = currentItem ? parseOutline(currentItem.outline) : [];
  const progressPercent = Math.min(
    100,
    Math.round(
      ((isFinished ? drillItems.length : currentIndex) / Math.max(1, drillItems.length)) * 100
    )
  );
  const multiplier = combo >= 10 ? 3 : combo >= 5 ? 2 : 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Classic Ledger Top Progress & Metrics Bar */}
      <div className="ledger-box p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {/* Ruled Progress Gauge */}
          <div className="flex-1 h-4 bg-[#ebe4d5] border-2 border-[#1a1917] p-0.5 relative">
            <div
              className="h-full bg-[#1e4d3b] transition-all duration-300"
              style={{ width: `${Math.max(3, progressPercent)}%` }}
            />
          </div>

          <span className="font-mono text-xs font-bold text-[#1a1917] shrink-0">
            {currentIndex}/{drillItems.length} WORDS
          </span>

          {/* Combo Streak Stamp */}
          <div
            className={`px-2.5 py-0.5 border-1.5 border-[#1a1917] font-mono text-xs font-bold flex items-center gap-1.5 ${
              combo >= 5 ? 'bg-[#f7eedc] text-[#9e6608]' : 'bg-[#ebe4d5] text-[#5a554c]'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${combo >= 5 ? 'fill-[#b83a24] text-[#b83a24]' : ''}`} />
            <span>{combo}x</span>
            {multiplier > 1 && (
              <span className="px-1 bg-[#1a1917] text-[#fbf8f1] text-[10px]">
                {multiplier}X PTS
              </span>
            )}
          </div>

          {/* Accuracy Lives */}
          <div className="flex items-center gap-1 bg-[#ebe4d5] border-1.5 border-[#1a1917] px-2.5 py-1">
            {Array.from({ length: maxHearts }).map((_, i) => (
              <Heart
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < hearts
                    ? 'text-[#b83a24] fill-[#b83a24]'
                    : 'text-[#bfb6a4] fill-[#dcd4c2]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Sub-bar: Title, Live Metrics & Mechanical Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#cfc6b4]">
          <div>
            {subtitle && (
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#5a554c] block">
                {subtitle}
              </span>
            )}
            <h2 className="text-base sm:text-lg font-bold text-[#1a1917]">{title}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono">
            <div className="flex items-center gap-2.5 text-xs bg-[#ebe4d5] px-3 py-1 border-1.5 border-[#1a1917]">
              <span className="text-[#1a1917] font-bold">{wpm} WPM</span>
              <span className="text-[#8c8578]">|</span>
              <span className="text-[#1e4d3b] font-bold">{accuracy}% ACC</span>
              <span className="text-[#8c8578]">|</span>
              <span className="text-[#9e6608] font-bold">+{sessionXp} PTS</span>
            </div>

            <button
              onClick={() =>
                setHintMode((m) =>
                  m === 'always' ? 'on-hesitate' : m === 'on-hesitate' ? 'hidden' : 'always'
                )
              }
              className="px-2.5 py-1 mech-btn bg-[#fbf8f1] text-xs font-bold text-[#1a1917] flex items-center gap-1 cursor-pointer"
            >
              {hintMode === 'hidden' ? (
                <EyeOff className="w-3.5 h-3.5 text-[#5a554c]" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-[#1e4d3b]" />
              )}
              <span>
                {hintMode === 'always'
                  ? 'HINTS: ON'
                  : hintMode === 'on-hesitate'
                  ? 'HINTS: 2S'
                  : 'NO HINTS'}
              </span>
            </button>

            <button
              onClick={() => setShowFingerHints((f) => !f)}
              className={`px-2.5 py-1 mech-btn text-xs font-bold cursor-pointer ${
                showFingerHints ? 'bg-[#1e4d3b] text-[#fbf8f1]' : 'bg-[#fbf8f1] text-[#1a1917]'
              }`}
            >
              FINGERS
            </button>

            <button
              onClick={() => setSoundEnabled((s) => !s)}
              className="p-1.5 mech-btn bg-[#fbf8f1] text-[#1a1917] cursor-pointer"
              title="Toggle mechanical key click"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#1e4d3b]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-[#8c8578]" />
              )}
            </button>

            <button
              onClick={() => handleRestart(true)}
              className="p-1.5 mech-btn bg-[#fbf8f1] text-[#1a1917] cursor-pointer"
              title="Shuffle & Restart"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Out of Lives Notice */}
      {hearts === 0 && !isFinished && (
        <div className="ledger-box bg-[#f9e6e2] p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8f2917]">
            <Heart className="w-4 h-4 fill-[#8f2917]" />
            <span>ALL 5 ACCURACY LIVES DEPLETED — STUDY CHORD DIAGRAM OR RESTORE LIVES.</span>
          </div>
          {onRefillHearts && (
            <button
              type="button"
              onClick={onRefillHearts}
              className="px-3 py-1 mech-btn bg-[#b83a24] text-[#fbf8f1] font-mono font-bold text-xs cursor-pointer"
            >
              RESTORE 5 LIVES
            </button>
          )}
        </div>
      )}

      {/* Official Examination Certificate Card when Finished */}
      {isFinished ? (
        <div className="ledger-box p-8 text-center flex flex-col items-center gap-5">
          <div className="px-3 py-1 bg-[#1e4d3b] text-[#fbf8f1] font-mono text-xs font-bold uppercase tracking-widest border border-[#1a1917]">
            EXAMINATION RECORD CERTIFIED
          </div>

          <div className="flex items-center gap-3">
            {[1, 2, 3].map((starIdx) => {
              const earned = (accuracy >= 95 ? 3 : accuracy >= 80 ? 2 : 1) >= starIdx;
              return (
                <Star
                  key={starIdx}
                  className={`w-10 h-10 ${
                    earned
                      ? 'text-[#b87d14] fill-[#b87d14]'
                      : 'text-[#cfc6b4] fill-[#ebe4d5]'
                  }`}
                />
              );
            })}
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#1a1917]">{title}</h3>
            <p className="text-sm text-[#5a554c] mt-1 font-mono">
              {drillItems.length} STENO OUTLINES COMPLETED
            </p>
          </div>

          {/* 4-Box Ledger Report */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl my-1 font-mono">
            <div className="bg-[#f4efe6] border-2 border-[#1a1917] p-3">
              <div className="text-[10px] font-bold uppercase text-[#5a554c]">MERIT POINTS</div>
              <div className="text-xl font-bold text-[#9e6608] mt-0.5">+{sessionXp} PTS</div>
            </div>
            <div className="bg-[#f4efe6] border-2 border-[#1a1917] p-3">
              <div className="text-[10px] font-bold uppercase text-[#5a554c]">ACCURACY</div>
              <div className="text-xl font-bold text-[#1e4d3b] mt-0.5">{accuracy}%</div>
            </div>
            <div className="bg-[#f4efe6] border-2 border-[#1a1917] p-3">
              <div className="text-[10px] font-bold uppercase text-[#5a554c]">SPEED</div>
              <div className="text-xl font-bold text-[#23476e] mt-0.5">{wpm} WPM</div>
            </div>
            <div className="bg-[#f4efe6] border-2 border-[#1a1917] p-3">
              <div className="text-[10px] font-bold uppercase text-[#5a554c]">CLEAN STREAK</div>
              <div className="text-xl font-bold text-[#b83a24] mt-0.5">{maxCombo}x</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-2 font-mono">
            <button
              onClick={() => handleRestart(true)}
              className="px-5 py-2.5 mech-btn bg-[#ebe4d5] text-[#1a1917] font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> REPEAT DRILL
            </button>
            {onBackToPath && (
              <button
                onClick={onBackToPath}
                className="px-6 py-2.5 mech-btn bg-[#1e4d3b] text-[#fbf8f1] font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <span>RETURN TO SYLLABUS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.focus()}
          className="ledger-box p-5 sm:p-6 flex flex-col gap-5 cursor-text"
        >
          {/* Typewriter Copy Strip (Upcoming Words) */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 min-h-[54px] bg-[#f4efe6] border-1.5 border-[#1a1917] p-3">
            {drillItems
              .slice(Math.max(0, currentIndex - 2), currentIndex + 10)
              .map((item, idx) => {
                const actualIdx = Math.max(0, currentIndex - 2) + idx;
                const isPast = actualIdx < currentIndex;
                const isCurrent = actualIdx === currentIndex;

                return (
                  <div
                    key={`${actualIdx}-${item.word}`}
                    className={`px-3 py-1 transition-all flex flex-col items-center font-mono ${
                      isCurrent
                        ? 'bg-[#fbf8f1] border-2 border-[#1a1917] text-[#1a1917] shadow-[2px_2px_0_#1a1917]'
                        : isPast
                        ? 'text-[#8c8578] line-through text-sm'
                        : 'text-[#5a554c] text-sm'
                    }`}
                  >
                    <span className={isCurrent ? 'text-lg font-bold' : ''}>{item.word}</span>
                    {isCurrent && shouldShowChord && (
                      <span className="text-xs font-bold text-[#b83a24] mt-0.5 tracking-wider">
                        {item.outline}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Active Target Card & Plover Input Box */}
          {currentItem && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#ebe4d5] border-2 border-[#1a1917] p-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#5a554c] font-bold">
                    TARGET WORD:
                  </span>
                  <span className="text-2xl font-bold font-mono text-[#1a1917]">
                    {currentItem.word}
                  </span>
                  {floatingXp && (
                    <span
                      key={floatingXp.id}
                      className="px-2 py-0.5 bg-[#f7eedc] border border-[#1a1917] text-[#9e6608] font-mono text-xs font-bold"
                    >
                      {floatingXp.text}
                    </span>
                  )}
                  {onInspectWord && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectWord(currentItem.word);
                      }}
                      className="text-xs font-mono text-[#1a1917] hover:bg-[#dfd7c6] flex items-center gap-1 ml-1 bg-[#fbf8f1] px-2 py-0.5 border border-[#1a1917] cursor-pointer"
                      title="Inspect all outlines in dictionary"
                    >
                      <HelpCircle className="w-3 h-3" /> DICT
                    </button>
                  )}
                </div>

                {/* Target Lapwing Outline + Alternatives */}
                <div className="flex flex-wrap items-center gap-2 mt-1 font-mono">
                  <span className="text-xs text-[#5a554c]">CHORD OUTLINE:</span>
                  {shouldShowChord ? (
                    <span className="px-2.5 py-0.5 bg-[#1e4d3b] text-[#fbf8f1] border border-[#1a1917] text-sm font-bold">
                      {currentItem.outline}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setHesitated(true)}
                      className="px-2 py-0.5 bg-[#fbf8f1] border border-[#1a1917] text-[#5a554c] text-xs hover:text-[#1a1917]"
                    >
                      REVEAL CHORD
                    </button>
                  )}

                  {shouldShowChord && alternativeOutlines.length > 0 && (
                    <span className="text-xs text-[#5a554c]">
                      (ALT: {alternativeOutlines.join(', ')})
                    </span>
                  )}
                </div>
              </div>

              {/* Plover Input Box */}
              <div className="flex flex-col sm:w-72 font-mono">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={`Stroke "${currentItem.word}"...`}
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className={`w-full px-3.5 py-2 bg-[#fbf8f1] border-2 font-mono text-base text-[#1a1917] placeholder:text-[#8c8578] focus:outline-none ${
                      recentErrorWord
                        ? 'border-[#b83a24] bg-[#f9e6e2]'
                        : 'border-[#1a1917] focus:bg-white'
                    }`}
                  />
                  {inputValue && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputValue('');
                        setRecentErrorWord(null);
                        inputRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#1a1917] bg-[#ebe4d5] px-1.5 py-0.5 border border-[#1a1917]"
                    >
                      CLR
                    </button>
                  )}
                </div>

                {/* Live diagnostic if Plover output a different word */}
                {recentErrorWord && (
                  <div className="mt-1.5 text-xs text-[#8f2917] flex items-center justify-between bg-[#f9e6e2] border border-[#b83a24] px-2.5 py-1">
                    <span>
                      WROTE: <strong>"{recentErrorWord}"</strong>
                      {errorStrokedOutline ? ` (${errorStrokedOutline})` : ''}
                    </span>
                    <span className="text-[10px] font-bold">PRESS *</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Multi-stroke selector if word has multiple strokes */}
          {strokes.length > 1 && shouldShowChord && (
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#5a554c]">
              <span>INSPECT STROKE:</span>
              {strokes.map((st, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveStrokeIdx(idx)}
                  className={`px-2.5 py-0.5 font-bold border border-[#1a1917] cursor-pointer ${
                    activeStrokeIdx === idx
                      ? 'bg-[#1a1917] text-[#fbf8f1]'
                      : 'bg-[#fbf8f1] text-[#1a1917]'
                  }`}
                >
                  {idx + 1}: {st.raw}
                </button>
              ))}
            </div>
          )}

          {/* Visual Steno Keyboard */}
          {currentItem && shouldShowChord && (
            <div className="pt-1">
              <StenoKeyboard
                outline={currentItem.outline}
                activeStrokeIndex={activeStrokeIdx}
                showFingerHints={showFingerHints}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
