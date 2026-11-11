import React, { useState, useMemo } from 'react';
import { Search, Play, Eraser, Keyboard, ArrowRight } from 'lucide-react';
import { StenoKeyboard } from './StenoKeyboard';
import { keysToStenoString, parseOutline } from '../utils/stenoParser';
import type { DrillItem } from '../types/steno';

interface DictionaryExplorerProps {
  forwardDict: Record<string, string>;
  reverseDict: Map<string, string[]>;
  onPracticeWords: (title: string, items: DrillItem[]) => void;
  initialQuery?: string;
}

export const DictionaryExplorer: React.FC<DictionaryExplorerProps> = ({
  forwardDict,
  reverseDict,
  onPracticeWords,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery || 'complicate');
  const [selectedOutline, setSelectedOutline] = useState<string>('KOPL/PHREU/KAEUT');
  const [activeStrokeIdx, setActiveStrokeIdx] = useState(0);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [sandboxKeys, setSandboxKeys] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setSandboxMode(false);
    }
  }, [initialQuery]);

  const sandboxRawChord = useMemo(() => keysToStenoString(sandboxKeys), [sandboxKeys]);
  const sandboxTranslation = useMemo(() => {
    if (!sandboxRawChord) return null;
    return forwardDict[sandboxRawChord] || null;
  }, [sandboxRawChord, forwardDict]);

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q) return [];

    const results: { word: string; outlines: string[]; exact: boolean }[] = [];
    const lowerQ = q.toLowerCase();

    if (reverseDict.has(lowerQ)) {
      const outs = reverseDict.get(lowerQ)!;
      results.push({ word: lowerQ, outlines: outs, exact: true });
    }

    const upperQ = q.toUpperCase();
    if (forwardDict[upperQ]) {
      const trans = forwardDict[upperQ];
      results.push({ word: trans, outlines: [upperQ], exact: true });
    }

    for (const [word, outlines] of reverseDict.entries()) {
      if (results.length >= 35) break;
      if (word === lowerQ) continue;
      if (word.startsWith(lowerQ)) {
        results.push({ word, outlines, exact: false });
      }
    }

    if (results.length < 25) {
      for (const [word, outlines] of reverseDict.entries()) {
        if (results.length >= 35) break;
        if (word === lowerQ || word.startsWith(lowerQ)) continue;
        if (word.includes(lowerQ)) {
          results.push({ word, outlines, exact: false });
        }
      }
    }

    return results;
  }, [query, reverseDict, forwardDict]);

  React.useEffect(() => {
    if (!sandboxMode && searchResults.length > 0 && searchResults[0].outlines.length > 0) {
      setSelectedOutline(searchResults[0].outlines[0]);
      setActiveStrokeIdx(0);
    }
  }, [searchResults, sandboxMode]);

  const handleToggleSandboxKey = (keyId: string) => {
    setSandboxMode(true);
    setSandboxKeys((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  };

  const strokes = useMemo(
    () => parseOutline(sandboxMode ? sandboxRawChord : selectedOutline),
    [sandboxMode, sandboxRawChord, selectedOutline]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Lexicon Card Catalog */}
      <div className="lg:col-span-5 flex flex-col gap-4 ledger-box p-4 sm:p-5">
        <div className="border-b-2 border-[#1a1917] pb-3">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5a554c]">
            INDEX CATALOG · 114,885 ENTRIES
          </div>
          <h2 className="text-xl font-bold text-[#1a1917] mt-0.5">
            Lapwing Lexicon & Reverse Lookup
          </h2>
        </div>

        <div className="relative font-mono">
          <Search className="w-4 h-4 text-[#5a554c] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSandboxMode(false);
            }}
            placeholder="Search English word or Steno stroke..."
            className="w-full pl-10 pr-4 py-2 bg-[#fbf8f1] border-2 border-[#1a1917] text-sm text-[#1a1917] placeholder:text-[#8c8578] focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[460px] pr-1">
          {searchResults.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#5a554c]">
              [NO MATCHING ENTRIES IN LAPWING-BASE.JSON]
            </div>
          ) : (
            searchResults.map((res) => (
              <div
                key={`${res.word}-${res.outlines[0]}`}
                className="p-3 bg-[#f4efe6] border-1.5 border-[#1a1917]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#1a1917] text-sm font-mono">{res.word}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onPracticeWords(`Lexicon Drill: "${res.word}"`, [
                        ...res.outlines.map((o) => ({ word: res.word, outline: o })),
                        ...res.outlines.map((o) => ({ word: res.word, outline: o })),
                      ])
                    }
                    className="text-[10px] font-mono font-bold bg-[#1e4d3b] text-[#fbf8f1] px-2 py-0.5 border border-[#1a1917] flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" /> DRILL
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 font-mono">
                  {res.outlines.map((out, idx) => {
                    const active = !sandboxMode && selectedOutline === out;
                    return (
                      <button
                        key={out}
                        type="button"
                        onClick={() => {
                          setSandboxMode(false);
                          setSelectedOutline(out);
                          setActiveStrokeIdx(0);
                        }}
                        className={`px-2 py-1 text-xs font-bold border border-[#1a1917] transition-all flex items-center gap-1.5 cursor-pointer ${
                          active
                            ? 'bg-[#1a1917] text-[#fbf8f1]'
                            : 'bg-[#fbf8f1] text-[#1a1917] hover:bg-[#ebe4d5]'
                        }`}
                      >
                        <span>{out}</span>
                        {idx === 0 && res.outlines.length > 1 && (
                          <span className="text-[9px] uppercase px-1 bg-[#1e4d3b] text-[#fbf8f1]">
                            BRIEF
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Mechanical Chord Plate & Manual Key Punch Sandbox */}
      <div className="lg:col-span-7 flex flex-col gap-4 ledger-box p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#1a1917] pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5a554c]">
              {sandboxMode ? 'MANUAL KEY PUNCH SANDBOX' : 'CHORD ANATOMY SPECIMEN'}
            </span>
            <h3 className="text-lg font-bold font-mono text-[#1a1917] flex items-center gap-2 mt-0.5">
              {sandboxMode ? (
                <>
                  <span className="text-[#b83a24]">{sandboxRawChord || '[DEPRESS KEYS]'}</span>
                  <ArrowRight className="w-4 h-4 text-[#5a554c]" />
                  <span className="text-[#1e4d3b]">
                    {sandboxTranslation ? `"${sandboxTranslation}"` : 'UNMAPPED'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[#b83a24]">{selectedOutline}</span>
                  <ArrowRight className="w-4 h-4 text-[#5a554c]" />
                  <span className="text-[#1e4d3b]">
                    "{forwardDict[selectedOutline] || query}"
                  </span>
                </>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <button
              type="button"
              onClick={() => {
                setSandboxMode((m) => !m);
                if (!sandboxMode) setSandboxKeys(new Set());
              }}
              className={`px-3 py-1.5 mech-btn text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                sandboxMode
                  ? 'bg-[#b87d14] text-[#fbf8f1]'
                  : 'bg-[#ebe4d5] text-[#1a1917]'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              {sandboxMode ? 'EXIT SANDBOX' : 'MANUAL KEY SANDBOX'}
            </button>

            {sandboxMode && sandboxKeys.size > 0 && (
              <button
                type="button"
                onClick={() => setSandboxKeys(new Set())}
                className="px-2.5 py-1.5 mech-btn bg-[#fbf8f1] text-xs font-bold text-[#1a1917] flex items-center gap-1 cursor-pointer"
              >
                <Eraser className="w-3.5 h-3.5" /> CLEAR
              </button>
            )}
          </div>
        </div>

        {/* Multi-stroke selector */}
        {!sandboxMode && strokes.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 bg-[#ebe4d5] p-3 border-1.5 border-[#1a1917] font-mono">
            <span className="text-xs font-bold text-[#5a554c] mr-1">STROKE SEQUENCE:</span>
            {strokes.map((st, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveStrokeIdx(idx)}
                className={`px-3 py-1 text-xs font-bold border border-[#1a1917] cursor-pointer ${
                  activeStrokeIdx === idx
                    ? 'bg-[#1a1917] text-[#fbf8f1]'
                    : 'bg-[#fbf8f1] text-[#1a1917]'
                }`}
              >
                #{idx + 1}: {st.raw}
              </button>
            ))}
          </div>
        )}

        <div className="my-auto py-2">
          <StenoKeyboard
            outline={sandboxMode ? sandboxRawChord : selectedOutline}
            activeStrokeIndex={activeStrokeIdx}
            interactiveKeys={sandboxMode ? sandboxKeys : undefined}
            onToggleKey={handleToggleSandboxKey}
            showFingerHints={true}
          />
        </div>

        <div className="bg-[#ebe4d5] border-1.5 border-[#1a1917] p-3 text-xs font-mono text-[#1a1917]">
          <strong>NOTE:</strong> Click any physical keycap on the stenograph above to toggle keys
          and test raw chords against the 114,885-entry Lapwing dictionary.
        </div>
      </div>
    </div>
  );
};
