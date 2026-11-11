import React from 'react';
import {
  STENO_TOP_ROW,
  STENO_BOTTOM_ROW,
  STENO_VOWEL_ROW,
  parseOutline,
} from '../utils/stenoParser';
import type { StenoKeyDef } from '../utils/stenoParser';

interface StenoKeyboardProps {
  outline?: string;
  activeStrokeIndex?: number;
  interactiveKeys?: Set<string>;
  onToggleKey?: (keyId: string) => void;
  showFingerHints?: boolean;
  showQwertyHints?: boolean;
  compact?: boolean;
}

export const StenoKeyboard: React.FC<StenoKeyboardProps> = ({
  outline = '',
  activeStrokeIndex = 0,
  interactiveKeys,
  onToggleKey,
  showFingerHints = false,
  showQwertyHints = false,
  compact = false,
}) => {
  const strokes = outline ? parseOutline(outline) : [];
  const currentStroke = strokes[activeStrokeIndex] || strokes[0];
  const highlightedKeys = interactiveKeys || currentStroke?.activeKeys || new Set<string>();

  const isKeyActive = (id: string) => highlightedKeys.has(id);

  const getKeyColorClasses = (key: StenoKeyDef, active: boolean) => {
    if (!active) {
      return 'bg-[#2c2a27] text-[#e6dfd3] hover:bg-[#3b3834] steno-keycap';
    }
    switch (key.hand) {
      case 'left':
        return 'bg-[#1e4d3b] text-[#fbf8f1] steno-keycap-pressed ring-2 ring-[#1e4d3b]/40';
      case 'vowel-left':
      case 'vowel-right':
        return 'bg-[#b87d14] text-[#fbf8f1] steno-keycap-pressed ring-2 ring-[#b87d14]/40';
      case 'center':
        return 'bg-[#b83a24] text-[#fbf8f1] steno-keycap-pressed ring-2 ring-[#b83a24]/40';
      case 'right':
        return 'bg-[#23476e] text-[#fbf8f1] steno-keycap-pressed ring-2 ring-[#23476e]/40';
    }
  };

  const keyWidth = compact ? 'w-9 sm:w-10' : 'w-11 sm:w-13';
  const topKeyHeight = compact ? 'h-10 sm:h-11' : 'h-12 sm:h-14';
  const bottomKeyHeight = compact ? 'h-11 sm:h-12' : 'h-13 sm:h-15';

  return (
    <div className="flex flex-col items-center select-none">
      {/* Multi-stroke mechanical index tabs */}
      {strokes.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {strokes.map((st, idx) => {
            const isSelected = idx === activeStrokeIndex;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[#8c8578] font-mono font-bold">/</span>}
                <div
                  className={`px-3 py-1 font-mono text-xs sm:text-sm font-bold border-2 border-[#1a1917] transition-all ${
                    isSelected
                      ? 'bg-[#efe6d5] text-[#1a1917] shadow-[2px_2px_0_#1a1917]'
                      : 'bg-[#fbf8f1] text-[#5a554c]'
                  }`}
                >
                  {st.hasNumber && <span className="text-[#6e3b6e]">#</span>}
                  {st.left && <span className="text-[#1e4d3b]">{st.left}</span>}
                  {st.vowels && <span className="text-[#9e6608]">{st.vowels}</span>}
                  {st.hasAsterisk && <span className="text-[#b83a24]">*</span>}
                  {!st.vowels && !st.hasAsterisk && st.right && (
                    <span className="text-[#8c8578]">-</span>
                  )}
                  {st.right && <span className="text-[#23476e]">{st.right}</span>}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Breakdown explanation stamps */}
      {currentStroke && !compact && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3 text-xs font-mono">
          {currentStroke.hasNumber && (
            <span className="px-2.5 py-0.5 bg-[#f2eaf2] border border-[#1a1917] text-[#592859]">
              <strong>#</strong> NUMBER BAR
            </span>
          )}
          {currentStroke.left && (
            <span className="px-2.5 py-0.5 bg-[#e3efe9] border border-[#1a1917] text-[#153b2c]">
              INITIAL <strong>{currentStroke.left}-</strong> = {currentStroke.leftSound}
            </span>
          )}
          {currentStroke.vowels && (
            <span className="px-2.5 py-0.5 bg-[#f7eedc] border border-[#1a1917] text-[#784e06]">
              VOWEL <strong>{currentStroke.vowels}</strong> = {currentStroke.vowelSound}
            </span>
          )}
          {currentStroke.hasAsterisk && (
            <span className="px-2.5 py-0.5 bg-[#f9e6e2] border border-[#1a1917] text-[#8f2917]">
              <strong>*</strong> ASTERISK KEY
            </span>
          )}
          {currentStroke.right && (
            <span className="px-2.5 py-0.5 bg-[#e3ebf3] border border-[#1a1917] text-[#193554]">
              FINAL <strong>-{currentStroke.right}</strong> = {currentStroke.rightSound}
            </span>
          )}
        </div>
      )}

      {/* Physical Stenograph Machine Well */}
      <div className="p-3.5 sm:p-5 bg-[#e6decb] border-2 border-[#1a1917] shadow-[inset_0_2px_5px_rgba(0,0,0,0.12),3px_3px_0_#1a1917]">
        {/* Number Bar */}
        <div className="mb-2 flex justify-center">
          <button
            type="button"
            onClick={() => onToggleKey?.('#')}
            className={`w-full ${
              compact ? 'h-5 text-[10px]' : 'h-6 text-xs'
            } font-mono font-bold tracking-[0.2em] flex items-center justify-center cursor-pointer ${
              isKeyActive('#')
                ? 'bg-[#6e3b6e] text-[#fbf8f1] steno-keycap-pressed'
                : 'bg-[#2c2a27] text-[#b8b0a2] hover:bg-[#3b3834] steno-keycap'
            }`}
          >
            # NUMBER BAR
          </button>
        </div>

        {/* Top Consonant Row (Squared Keycaps) */}
        <div className="flex gap-1 sm:gap-1.5 justify-center mb-1.5">
          {STENO_TOP_ROW.map((k, i) => {
            const active = isKeyActive(k.id);
            const extraMargin = i === 3 || i === 4 ? 'mr-2 sm:mr-3' : '';
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => onToggleKey?.(k.id)}
                className={`${keyWidth} ${topKeyHeight} ${extraMargin} rounded-t-[4px] rounded-b-[2px] font-mono font-bold flex flex-col items-center justify-center relative cursor-pointer ${getKeyColorClasses(
                  k,
                  active
                )}`}
              >
                {showQwertyHints && (
                  <span className="absolute top-0.5 left-1 text-[9px] font-normal opacity-60">
                    {k.qwerty}
                  </span>
                )}
                <span className={compact ? 'text-sm' : 'text-base sm:text-lg'}>{k.label}</span>
                {showFingerHints && !compact && (
                  <span className="text-[8px] opacity-75 tracking-tighter leading-none mt-0.5">
                    {k.finger}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Consonant Row (Rounded Bottom Keycaps like real Steno machine) */}
        <div className="flex gap-1 sm:gap-1.5 justify-center mb-2.5 sm:mb-3">
          {STENO_BOTTOM_ROW.map((k, i) => {
            const active = isKeyActive(k.id);
            const extraMargin = i === 3 || i === 4 ? 'mr-2 sm:mr-3' : '';
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => onToggleKey?.(k.id)}
                className={`${keyWidth} ${bottomKeyHeight} ${extraMargin} rounded-t-[2px] rounded-b-[14px] font-mono font-bold flex flex-col items-center justify-center relative cursor-pointer ${getKeyColorClasses(
                  k,
                  active
                )}`}
              >
                {showQwertyHints && (
                  <span className="absolute top-0.5 left-1 text-[9px] font-normal opacity-60">
                    {k.qwerty}
                  </span>
                )}
                <span className={compact ? 'text-sm' : 'text-base sm:text-lg'}>{k.label}</span>
                {showFingerHints && !compact && (
                  <span className="text-[8px] opacity-75 tracking-tighter leading-none mt-0.5">
                    {k.finger}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Vowel Thumb Row */}
        <div className="flex justify-center items-center gap-1 sm:gap-1.5">
          <div className="flex gap-1 sm:gap-1.5 mr-3 sm:mr-5">
            {STENO_VOWEL_ROW.slice(0, 2).map((k) => {
              const active = isKeyActive(k.id);
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => onToggleKey?.(k.id)}
                  className={`${keyWidth} ${topKeyHeight} rounded-t-[2px] rounded-b-[12px] font-mono font-bold flex flex-col items-center justify-center relative cursor-pointer ${getKeyColorClasses(
                    k,
                    active
                  )}`}
                >
                  {showQwertyHints && (
                    <span className="absolute top-0.5 left-1 text-[9px] font-normal opacity-60">
                      {k.qwerty}
                    </span>
                  )}
                  <span className={compact ? 'text-sm' : 'text-base sm:text-lg'}>{k.label}</span>
                  {showFingerHints && !compact && (
                    <span className="text-[8px] opacity-75 tracking-tighter leading-none mt-0.5">
                      {k.finger}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex gap-1 sm:gap-1.5 ml-3 sm:ml-5">
            {STENO_VOWEL_ROW.slice(2, 4).map((k) => {
              const active = isKeyActive(k.id);
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => onToggleKey?.(k.id)}
                  className={`${keyWidth} ${topKeyHeight} rounded-t-[2px] rounded-b-[12px] font-mono font-bold flex flex-col items-center justify-center relative cursor-pointer ${getKeyColorClasses(
                    k,
                    active
                  )}`}
                >
                  {showQwertyHints && (
                    <span className="absolute top-0.5 left-1 text-[9px] font-normal opacity-60">
                      {k.qwerty}
                    </span>
                  )}
                  <span className={compact ? 'text-sm' : 'text-base sm:text-lg'}>{k.label}</span>
                  {showFingerHints && !compact && (
                    <span className="text-[8px] opacity-75 tracking-tighter leading-none mt-0.5">
                      {k.finger}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
