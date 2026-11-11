import React, { useState } from 'react';
import { Play, CheckCircle2, ExternalLink, ChevronRight } from 'lucide-react';
import type { Chapter, ChapterDrill, DrillItem } from '../types/steno';
import { StenoKeyboard } from './StenoKeyboard';

interface ChapterReaderProps {
  chapter: Chapter;
  completedChapters: number[];
  onToggleCompleteChapter: (chNum: number) => void;
  onStartDrill: (drill: ChapterDrill) => void;
  onStartCustomDrill: (title: string, items: DrillItem[]) => void;
}

export const ChapterReader: React.FC<ChapterReaderProps> = ({
  chapter,
  completedChapters,
  onToggleCompleteChapter,
  onStartDrill,
  onStartCustomDrill,
}) => {
  const [inspectedChord, setInspectedChord] = useState<string>(
    chapter.drills[0]?.items[0]?.outline || 'KAT'
  );
  const [inspectedWord, setInspectedWord] = useState<string>(
    chapter.drills[0]?.items[0]?.word || 'cat'
  );

  React.useEffect(() => {
    if (chapter.drills.length > 0 && chapter.drills[0].items.length > 0) {
      setInspectedChord(chapter.drills[0].items[0].outline);
      setInspectedWord(chapter.drills[0].items[0].word);
    }
  }, [chapter]);

  const isCompleted = completedChapters.includes(chapter.number);

  const handleRowClick = (row: string[]) => {
    for (const cell of row) {
      const cleaned = cell.trim();
      if (
        /^[#STKPWHRAO*EUFRPBLGTSDZ/-]{1,25}$/.test(cleaned) &&
        /[STKPWHRAO*EUFRPBLGTSDZ]/.test(cleaned)
      ) {
        setInspectedChord(cleaned);
        setInspectedWord(row[0] === cleaned ? row[1] || cleaned : row[0]);
        return;
      }
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left 7 Cols: Classic Printed Textbook Chapter */}
      <div className="xl:col-span-7 flex flex-col gap-5">
        {/* Chapter Title Plate */}
        <div className="ledger-box p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="px-2 py-0.5 bg-[#1a1917] text-[#fbf8f1] font-bold uppercase tracking-wider">
                CHAPTER {String(chapter.number).padStart(2, '0')} OF 26
              </span>
              <a
                href={`https://lapwing.aerick.ca/Chapter-${String(chapter.number).padStart(
                  2,
                  '0'
                )}.html`}
                target="_blank"
                rel="noreferrer"
                className="text-[#5a554c] hover:text-[#1a1917] underline flex items-center gap-1"
              >
                <span>Source Edition (lapwing.aerick.ca)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1917] mt-2">
              {chapter.fullTitle}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => onToggleCompleteChapter(chapter.number)}
            className={`px-3.5 py-2 mech-btn font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer ${
              isCompleted
                ? 'bg-[#1e4d3b] text-[#fbf8f1]'
                : 'bg-[#ebe4d5] text-[#1a1917]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isCompleted ? 'CHAPTER READ ✓' : 'MARK AS READ'}
          </button>
        </div>

        {/* Chapter Drills Box */}
        {chapter.drills.length > 0 && (
          <div className="ledger-box p-4 bg-[#ebe4d5]">
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#1a1917] mb-3 border-b border-[#1a1917] pb-1.5 flex items-center justify-between">
              <span>ASSIGNED CHAPTER EXERCISES ({chapter.drills.length})</span>
              <span>CLICK TO OPEN IN PRACTICE ROOM</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {chapter.drills.map((drill) => (
                <button
                  key={drill.id}
                  type="button"
                  onClick={() => onStartDrill(drill)}
                  className="p-3 mech-btn bg-[#fbf8f1] hover:bg-[#f4efe6] text-left flex items-center justify-between cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs sm:text-sm font-bold text-[#1a1917] font-mono truncate">
                      {drill.title}
                    </div>
                    <div className="text-[11px] text-[#5a554c] mt-0.5 font-mono">
                      {drill.count} words · e.g. {drill.items[0]?.word} ({drill.items[0]?.outline})
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-[#1e4d3b] text-[#fbf8f1] font-mono text-[10px] font-bold flex items-center gap-1 shrink-0">
                    <Play className="w-2.5 h-2.5 fill-current" /> DRILL
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Textbook Prose & Reference Tables */}
        <div className="space-y-5">
          {chapter.sections.map((sec, sIdx) => (
            <div key={`${sec.heading}-${sIdx}`} className="ledger-box p-5 sm:p-6 space-y-3.5">
              <div className="border-b-2 border-[#1a1917] pb-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#1a1917]">
                  § {sIdx + 1}. {sec.heading}
                </h2>
              </div>

              <div className="space-y-3 text-base text-[#1a1917] leading-relaxed">
                {sec.paragraphs.map((p, pIdx) => {
                  if (p.startsWith('### ')) {
                    return (
                      <h3
                        key={pIdx}
                        className="text-xs font-mono font-bold uppercase tracking-widest text-[#8f2917] pt-2"
                      >
                        {p.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (p.startsWith('CODE: ')) {
                    return (
                      <pre
                        key={pIdx}
                        className="p-3 bg-[#ebe4d5] border-1.5 border-[#1a1917] font-mono text-xs text-[#1a1917] overflow-x-auto"
                      >
                        {p.replace('CODE: ', '')}
                      </pre>
                    );
                  }
                  if (p.startsWith('• ')) {
                    return (
                      <div key={pIdx} className="pl-3 flex items-start gap-2 text-[#1a1917]">
                        <span className="font-mono font-bold text-[#8f2917]">—</span>
                        <span>{p.slice(2)}</span>
                      </div>
                    );
                  }
                  return <p key={pIdx}>{p}</p>;
                })}
              </div>

              {/* Ruled Reference Tables */}
              {sec.tables.map((table, tIdx) => (
                <div
                  key={tIdx}
                  className="overflow-x-auto border-2 border-[#1a1917] bg-[#fbf8f1] mt-3"
                >
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b-2 border-[#1a1917] bg-[#ebe4d5] text-[#1a1917] uppercase text-[10px]">
                        {table[0]?.map((th, i) => (
                          <th key={i} className="py-2 px-3 border-r border-[#cfc6b4] last:border-r-0">
                            {th || `COL ${i + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#cfc6b4]">
                      {table.slice(1).map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          onClick={() => handleRowClick(row)}
                          className="hover:bg-[#efe6d5] cursor-pointer transition-colors"
                          title="Click to inspect outline on the steno keyboard"
                        >
                          {row.map((cell, cIdx) => {
                            const isSteno =
                              /^[#STKPWHRAO*EUFRPBLGTSDZ/-]{1,20}$/.test(cell.trim()) &&
                              /[STKPWHRAO*EUFRPBLGTSDZ]/.test(cell.trim());
                            return (
                              <td
                                key={cIdx}
                                className={`py-2 px-3 border-r border-[#e5dec9] last:border-r-0 ${
                                  isSteno
                                    ? 'font-bold text-[#1e4d3b]'
                                    : 'text-[#1a1917]'
                                }`}
                              >
                                {cell}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right 5 Cols: Sticky Mechanical Chord Plate & Word Specimen List */}
      <div className="xl:col-span-5">
        <div className="sticky top-20 flex flex-col gap-4">
          <div className="ledger-box p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b-2 border-[#1a1917] pb-2.5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5a554c]">
                  FIGURE 1 · CHORD DIAGRAM
                </span>
                <div className="text-lg font-bold font-mono text-[#1a1917] flex items-center gap-2 mt-0.5">
                  <span>"{inspectedWord}"</span>
                  <ChevronRight className="w-4 h-4 text-[#5a554c]" />
                  <span className="text-[#b83a24]">{inspectedChord}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onStartCustomDrill(`Specimen Drill: "${inspectedWord}" (${inspectedChord})`, [
                    { word: inspectedWord, outline: inspectedChord },
                    { word: inspectedWord, outline: inspectedChord },
                    { word: inspectedWord, outline: inspectedChord },
                    { word: inspectedWord, outline: inspectedChord },
                    { word: inspectedWord, outline: inspectedChord },
                  ])
                }
                className="px-3 py-1.5 mech-btn bg-[#1e4d3b] text-[#fbf8f1] font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" /> DRILL WORD
              </button>
            </div>

            <StenoKeyboard outline={inspectedChord} showFingerHints={true} compact={true} />

            {/* Chapter Vocabulary Index Cards */}
            {chapter.drills.length > 0 && (
              <div className="pt-2 border-t-2 border-[#1a1917]">
                <div className="text-xs font-mono font-bold text-[#5a554c] mb-2 flex items-center justify-between uppercase">
                  <span>CHAPTER SPECIMEN WORDS (CLICK TO INSPECT):</span>
                  <span>{Math.min(28, chapter.drills[0].items.length)} ITEMS</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {chapter.drills[0].items.slice(0, 28).map((item, idx) => {
                    const active = inspectedChord === item.outline && inspectedWord === item.word;
                    return (
                      <button
                        key={`${item.word}-${idx}`}
                        type="button"
                        onClick={() => {
                          setInspectedWord(item.word);
                          setInspectedChord(item.outline);
                        }}
                        className={`px-2 py-1 font-mono text-xs border border-[#1a1917] transition-all flex items-center gap-1.5 cursor-pointer ${
                          active
                            ? 'bg-[#1a1917] text-[#fbf8f1] font-bold'
                            : 'bg-[#f4efe6] text-[#1a1917] hover:bg-[#ebe4d5]'
                        }`}
                      >
                        <span>{item.word}</span>
                        <span
                          className={`text-[10px] font-bold ${
                            active ? 'text-[#f7eedc]' : 'text-[#1e4d3b]'
                          }`}
                        >
                          {item.outline}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
