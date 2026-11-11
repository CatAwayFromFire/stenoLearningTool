import React from 'react';
import { Trash2 } from 'lucide-react';
import type { PaperTapeEntry } from '../types/steno';
import { parseOutline } from '../utils/stenoParser';

interface PaperTapeProps {
  entries: PaperTapeEntry[];
  onClear: () => void;
  onSelectEntry?: (outline: string) => void;
}

const TAPE_COLS = [
  '#',
  'S',
  'T',
  'K',
  'P',
  'W',
  'H',
  'R',
  'A',
  'O',
  '*',
  'E',
  'U',
  '-F',
  '-R',
  '-P',
  '-B',
  '-L',
  '-G',
  '-T',
  '-S',
  '-D',
  '-Z',
];

export const PaperTape: React.FC<PaperTapeProps> = ({
  entries,
  onClear,
  onSelectEntry,
}) => {
  return (
    <div className="flex flex-col h-full ledger-box overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#1a1917] bg-[#ebe4d5]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#5a554c] block">
            RECORDER ROLL
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a1917] font-display">
            Stenograph Paper Tape
          </h3>
        </div>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="text-[#5a554c] hover:text-[#b83a24] transition-colors p-1.5 border border-[#1a1917] bg-[#fbf8f1] cursor-pointer"
            title="Tear off tape"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Column Rulings Header */}
      <div className="px-3 py-1.5 bg-[#f2ebd9] border-b-2 border-[#1a1917] font-mono text-[10px] font-bold text-[#5a554c] flex items-center justify-between">
        <span className="tracking-[0.11em]">#STKPWHRAO*EUFRPBLGTSDZ</span>
        <span>TRANSLATION</span>
      </div>

      {/* Paper Roll Feed with classic vertical pink/blue guide lines */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#d8cfbe] max-h-[450px] bg-[#fdfaf2]">
        {entries.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[#5a554c]">
            [PAPER ROLL IDLE — STROKE ANY WORD IN PLOVER TO ADVANCE TAPE]
          </div>
        ) : (
          entries.map((entry) => {
            const strokes = parseOutline(entry.outline);
            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry?.(entry.outline)}
                className="px-3 py-2 hover:bg-[#efe8d8] cursor-pointer transition-colors flex flex-col gap-1 border-l-4 border-r-4 border-[#e5c5c0]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#1a1917] flex items-center gap-1.5">
                    <span
                      className={`inline-block w-2 h-2 border border-[#1a1917] ${
                        entry.correct ? 'bg-[#1e4d3b]' : 'bg-[#b83a24]'
                      }`}
                    />
                    {entry.word}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#1a1917] bg-[#ebe4d5] px-1.5 py-0.5 border border-[#1a1917]">
                    {entry.outline}
                  </span>
                </div>

                {/* Render 23-column steno paper tape row for each stroke */}
                {strokes.map((st, sIdx) => {
                  const rowChars = TAPE_COLS.map((col) => {
                    if (col === '#') return st.hasNumber ? '#' : '·';
                    if (col === '*') return st.hasAsterisk ? '*' : '·';
                    if (col === 'A' || col === 'O' || col === 'E' || col === 'U') {
                      return st.vowels.includes(col) ? col : '·';
                    }
                    if (col.startsWith('-')) {
                      const rCh = col.slice(1);
                      return st.right.includes(rCh) ? rCh : '·';
                    }
                    return st.left.includes(col) ? col : '·';
                  });

                  return (
                    <div
                      key={sIdx}
                      className="font-mono text-[11px] tracking-[0.11em] bg-[#f7f2e4] px-2 py-0.5 border border-[#dfd7c6]"
                    >
                      {rowChars.map((ch, cIdx) => {
                        if (ch === '·') {
                          return (
                            <span key={cIdx} className="text-[#cfc6b4]">
                              ·
                            </span>
                          );
                        }
                        let color = 'text-[#1e4d3b] font-bold';
                        if (cIdx === 0) color = 'text-[#6e3b6e] font-bold';
                        else if (cIdx >= 8 && cIdx <= 12)
                          color =
                            cIdx === 10
                              ? 'text-[#b83a24] font-bold'
                              : 'text-[#9e6608] font-bold';
                        else if (cIdx >= 13) color = 'text-[#23476e] font-bold';
                        return (
                          <span key={cIdx} className={color}>
                            {ch}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
