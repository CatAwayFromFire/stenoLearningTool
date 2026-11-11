import React, { useState } from 'react';
import { Search, Play } from 'lucide-react';
import type { TheoryReference, DrillItem } from '../types/steno';
import { StenoKeyboard } from './StenoKeyboard';

interface TheoryReferenceViewProps {
  reference: TheoryReference;
  onStartCustomDrill: (title: string, items: DrillItem[]) => void;
}

export const TheoryReferenceView: React.FC<TheoryReferenceViewProps> = ({
  reference,
  onStartCustomDrill,
}) => {
  const [activeTab, setActiveTab] = useState<'left' | 'vowels' | 'right' | 'glossary'>('left');
  const [filterText, setFilterText] = useState('');
  const [previewChord, setPreviewChord] = useState<{
    chord: string;
    sound: string;
    examples: string;
  }>({
    chord: 'SKWR',
    sound: 'j-',
    examples: 'jam SKWRAPL, roger RO/SKWRER',
  });

  const parseExampleItems = (exampleStr: string, fallbackChord: string): DrillItem[] => {
    const pairs = exampleStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const items: DrillItem[] = [];
    for (const p of pairs) {
      const tokens = p.split(/\s+/);
      if (tokens.length >= 2) {
        const outline = tokens[tokens.length - 1];
        const word = tokens.slice(0, tokens.length - 1).join(' ');
        items.push({ word, outline });
      }
    }
    if (items.length === 0) {
      items.push({ word: fallbackChord.toLowerCase(), outline: fallbackChord });
    }
    return items;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 7 Cols: Ruled Appendix D Tables */}
      <div className="lg:col-span-7 flex flex-col gap-4 ledger-box p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1a1917] pb-3">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5a554c]">
              APPENDIX D · STANDARD TABLES
            </div>
            <h2 className="text-xl font-bold text-[#1a1917] mt-0.5">
              Complete Lapwing Chord Reference
            </h2>
          </div>

          <div className="relative w-full sm:w-56 font-mono">
            <Search className="w-3.5 h-3.5 text-[#5a554c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter chords or sounds..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#fbf8f1] border-2 border-[#1a1917] text-xs text-[#1a1917] placeholder:text-[#8c8578] focus:outline-none"
            />
          </div>
        </div>

        {/* Category Index Tabs */}
        <div className="flex flex-wrap gap-1.5 font-mono">
          {[
            { id: 'left', label: `INITIAL CONSONANTS (${reference.leftHand.length})` },
            { id: 'vowels', label: 'VOWEL SYSTEM (20)' },
            { id: 'right', label: `FINAL CHORDS (${reference.rightHand.length})` },
            { id: 'glossary', label: `GLOSSARY (${reference.glossary.length})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`px-3 py-1.5 text-xs font-bold border-1.5 border-[#1a1917] cursor-pointer ${
                activeTab === t.id
                  ? 'bg-[#1a1917] text-[#fbf8f1]'
                  : 'bg-[#ebe4d5] text-[#1a1917] hover:bg-[#dfd7c6]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto max-h-[500px] border-2 border-[#1a1917] bg-[#fbf8f1]">
          {(activeTab === 'left' || activeTab === 'right') && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b-2 border-[#1a1917] bg-[#ebe4d5] text-[#1a1917] uppercase text-[10px]">
                  <th className="py-2 px-2.5 border-r border-[#cfc6b4]">CHORD</th>
                  <th className="py-2 px-2.5 border-r border-[#cfc6b4]">SOUND</th>
                  <th className="py-2 px-2.5 border-r border-[#cfc6b4]">BASIS</th>
                  <th className="py-2 px-2.5 border-r border-[#cfc6b4]">SPECIMENS</th>
                  <th className="py-2 px-2 text-right">DRILL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cfc6b4]">
                {(activeTab === 'left' ? reference.leftHand : reference.rightHand)
                  .filter((row) =>
                    row.some((c) => c.toLowerCase().includes(filterText.toLowerCase()))
                  )
                  .map((row, idx) => {
                    const [chord, rep, notes, examples] = row;
                    const isSelected = previewChord.chord === chord;
                    return (
                      <tr
                        key={`${chord}-${idx}`}
                        onClick={() =>
                          setPreviewChord({ chord, sound: rep, examples: examples || '' })
                        }
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#efe6d5]' : 'hover:bg-[#f4efe6]'
                        }`}
                      >
                        <td className="py-2 px-2.5 font-bold text-[#b83a24] border-r border-[#e5dec9]">
                          {chord}
                        </td>
                        <td className="py-2 px-2.5 font-bold text-[#1a1917] border-r border-[#e5dec9]">
                          {rep}
                        </td>
                        <td className="py-2 px-2.5 text-[#5a554c] border-r border-[#e5dec9]">
                          {notes}
                        </td>
                        <td className="py-2 px-2.5 text-[#1e4d3b] border-r border-[#e5dec9]">
                          {examples}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const items = parseExampleItems(examples || '', chord);
                              onStartCustomDrill(`Reference Drill: ${chord} (${rep})`, [
                                ...items,
                                ...items,
                                ...items,
                              ]);
                            }}
                            className="px-2 py-0.5 bg-[#1e4d3b] text-[#fbf8f1] border border-[#1a1917] inline-flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" /> RUN
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}

          {activeTab === 'vowels' && (
            <div className="p-3 space-y-5 font-mono">
              {[
                { title: 'SHORT VOWELS', rows: reference.shortVowels },
                { title: 'LONG VOWELS', rows: reference.longVowels },
                { title: 'SHORT VOWELS WITH -R', rows: reference.shortVowelsR },
                { title: 'LONG VOWELS WITH -R', rows: reference.longVowelsR },
              ].map((group) => (
                <div key={group.title} className="border-1.5 border-[#1a1917] bg-[#f4efe6]">
                  <h4 className="text-xs font-bold uppercase tracking-widest bg-[#ebe4d5] text-[#1a1917] px-3 py-1.5 border-b border-[#1a1917]">
                    {group.title}
                  </h4>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#cfc6b4] text-[#5a554c] text-[10px] uppercase">
                        <th className="py-1.5 px-3">VOWEL SOUND</th>
                        <th className="py-1.5 px-3">SPECIMEN</th>
                        <th className="py-1.5 px-3">OUTLINE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dfd7c6]">
                      {group.rows.map((r, i) => {
                        const [sound, exWord, , outline] = r;
                        return (
                          <tr
                            key={i}
                            onClick={() =>
                              setPreviewChord({
                                chord: outline,
                                sound,
                                examples: `${exWord} ${outline}`,
                              })
                            }
                            className="hover:bg-[#efe6d5] cursor-pointer"
                          >
                            <td className="py-2 px-3 font-bold text-[#1a1917]">{sound}</td>
                            <td className="py-2 px-3 text-[#5a554c]">{exWord}</td>
                            <td className="py-2 px-3 font-bold text-[#b83a24]">{outline}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'glossary' && (
            <div className="p-3 space-y-2.5">
              {reference.glossary
                .filter(
                  (g) =>
                    g.term.toLowerCase().includes(filterText.toLowerCase()) ||
                    g.definition.toLowerCase().includes(filterText.toLowerCase())
                )
                .map((g) => (
                  <div
                    key={g.term}
                    className="p-3 bg-[#f4efe6] border-1.5 border-[#1a1917]"
                  >
                    <div className="font-bold font-mono text-[#b83a24] text-sm uppercase">
                      {g.term}
                    </div>
                    <p className="text-sm text-[#1a1917] mt-1 leading-relaxed">{g.definition}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Right 5 Cols: Mechanical Preview Plate */}
      <div className="lg:col-span-5 flex flex-col gap-4 ledger-box p-4 sm:p-5 h-fit sticky top-20">
        <div className="flex items-center justify-between border-b-2 border-[#1a1917] pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5a554c]">
              SELECTED CHORD SPECIMEN
            </span>
            <h3 className="text-xl font-bold font-mono text-[#1a1917] mt-0.5 flex items-center gap-2">
              <span className="text-[#b83a24]">{previewChord.chord}</span>
              <span className="text-[#5a554c]">→</span>
              <span className="text-[#1e4d3b]">{previewChord.sound}</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              const items = parseExampleItems(previewChord.examples, previewChord.chord);
              onStartCustomDrill(`Reference Drill: ${previewChord.chord} (${previewChord.sound})`, [
                ...items,
                ...items,
                ...items,
              ]);
            }}
            className="px-3 py-1.5 mech-btn bg-[#1e4d3b] text-[#fbf8f1] font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" /> PRACTICE
          </button>
        </div>

        <StenoKeyboard outline={previewChord.chord} showFingerHints={true} compact={true} />

        {previewChord.examples && (
          <div className="bg-[#ebe4d5] border-1.5 border-[#1a1917] p-3 text-xs font-mono">
            <div className="text-[#5a554c] font-bold mb-2 uppercase">
              SPECIMEN OUTLINES (CLICK TO VISUALIZE):
            </div>
            <div className="flex flex-wrap gap-2">
              {parseExampleItems(previewChord.examples, previewChord.chord).map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setPreviewChord({
                      chord: ex.outline,
                      sound: ex.word,
                      examples: previewChord.examples,
                    })
                  }
                  className="px-2.5 py-1 bg-[#fbf8f1] hover:bg-[#f4efe6] border border-[#1a1917] text-[#1a1917] text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{ex.word}</span>
                  <span className="text-[#1e4d3b] font-bold">{ex.outline}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
