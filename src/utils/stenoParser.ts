import type { ParsedStroke } from '../types/steno';

// Standard 23-key Steno Machine Key IDs:
// Number bar: '#'
// Left Bank: 'S1' (top S), 'S2' (bottom S), 'T-', 'K-', 'P-', 'W-', 'H-', 'R-'
// Vowel Bank: 'A', 'O', '*', 'E', 'U'
// Right Bank: '-F', '-R', '-P', '-B', '-L', '-G', '-T', '-S', '-D', '-Z'

export interface StenoKeyDef {
  id: string;
  label: string;
  qwerty: string;
  finger: string;
  hand: 'left' | 'vowel-left' | 'center' | 'vowel-right' | 'right';
}

export const STENO_TOP_ROW: StenoKeyDef[] = [
  { id: 'S1', label: 'S', qwerty: 'Q', finger: 'L Pinky', hand: 'left' },
  { id: 'T-', label: 'T', qwerty: 'W', finger: 'L Ring', hand: 'left' },
  { id: 'P-', label: 'P', qwerty: 'E', finger: 'L Middle', hand: 'left' },
  { id: 'H-', label: 'H', qwerty: 'R', finger: 'L Index', hand: 'left' },
  { id: '*', label: '*', qwerty: 'T/Y', finger: 'Index', hand: 'center' },
  { id: '-F', label: 'F', qwerty: 'U', finger: 'R Index', hand: 'right' },
  { id: '-P', label: 'P', qwerty: 'I', finger: 'R Middle', hand: 'right' },
  { id: '-L', label: 'L', qwerty: 'O', finger: 'R Ring', hand: 'right' },
  { id: '-T', label: 'T', qwerty: 'P', finger: 'R Pinky', hand: 'right' },
  { id: '-D', label: 'D', qwerty: '[', finger: 'R Pinky', hand: 'right' },
];

export const STENO_BOTTOM_ROW: StenoKeyDef[] = [
  { id: 'S2', label: 'S', qwerty: 'A', finger: 'L Pinky', hand: 'left' },
  { id: 'K-', label: 'K', qwerty: 'S', finger: 'L Ring', hand: 'left' },
  { id: 'W-', label: 'W', qwerty: 'D', finger: 'L Middle', hand: 'left' },
  { id: 'R-', label: 'R', qwerty: 'F', finger: 'L Index', hand: 'left' },
  { id: '*2', label: '*', qwerty: 'G/H', finger: 'Index', hand: 'center' },
  { id: '-R', label: 'R', qwerty: 'J', finger: 'R Index', hand: 'right' },
  { id: '-B', label: 'B', qwerty: 'K', finger: 'R Middle', hand: 'right' },
  { id: '-G', label: 'G', qwerty: 'L', finger: 'R Ring', hand: 'right' },
  { id: '-S', label: 'S', qwerty: ';', finger: 'R Pinky', hand: 'right' },
  { id: '-Z', label: 'Z', qwerty: "'", finger: 'R Pinky', hand: 'right' },
];

export const STENO_VOWEL_ROW: StenoKeyDef[] = [
  { id: 'A', label: 'A', qwerty: 'C', finger: 'L Thumb', hand: 'vowel-left' },
  { id: 'O', label: 'O', qwerty: 'V', finger: 'L Thumb', hand: 'vowel-left' },
  { id: 'E', label: 'E', qwerty: 'N', finger: 'R Thumb', hand: 'vowel-right' },
  { id: 'U', label: 'U', qwerty: 'M', finger: 'R Thumb', hand: 'vowel-right' },
];

export const LEFT_CHORD_MEANINGS: Record<string, string> = {
  'S': 's-',
  'T': 't-',
  'K': 'k- / hard c',
  'P': 'p-',
  'W': 'w-',
  'H': 'h-',
  'R': 'r-',
  'ST': 'st-',
  'SK': 'sk-',
  'SP': 'sp-',
  'SH': 'sh-',
  'SR': 'v-',
  'TK': 'd-',
  'TP': 'f-',
  'TP*': 'ph-',
  'TW': 'tw- / chw-',
  'TH': 'th-',
  'TR': 'tr-',
  'KP': 'x-',
  'KW': 'qu-',
  'KH': 'ch-',
  'PW': 'b-',
  'PH': 'm-',
  'PR': 'pr-',
  'WH': 'wh-',
  'WR': 'wr-',
  'HR': 'l-',
  'STK': 'des- / dis-',
  'STR': 'str-',
  'SKR': 'skr-',
  'SPW': 'int- / ent-',
  'SPH': 'sm-',
  'SPR': 'spr-',
  'TKW': 'div-',
  'TKR': 'dr-',
  'TPH': 'n-',
  'TPR': 'fr-',
  'KPH': 'com-',
  'KPR': 'compr-',
  'KWH': 'y-',
  'KWR': '(linker / y-)',
  'PWR': 'br-',
  'SKWR': 'j- / soft g',
  'TKPW': 'g-',
  'PWHR': 'bl-',
  'STKPW': 'z-',
  'TKPWR': 'gr-',
  'TKPWHR': 'gl-',
  'STPH': 'sn-',
  'SKW': 'squ-',
  'SHR': 'sl-',
  'TPHR': 'fl-',
  'PHR': 'pl-',
  'KHR': 'cl-',
};

export const VOWEL_CHORD_MEANINGS: Record<string, string> = {
  'A': 'short a (/æ/ as in cat)',
  'E': 'short e (/ɛ/ as in pet)',
  'EU': 'short i (/ɪ/ as in sit) or -y',
  'O': 'short o (/ɑ/ as in lot)',
  'U': 'short u (/ʌ/ as in hut)',
  'AEU': 'long a (/eɪ/ as in pay)',
  'AOE': 'long e (/i/ as in heed)',
  'AOEU': 'long i (/aɪ/ as in sigh)',
  'OE': 'long o (/oʊ/ as in low)',
  'AOU': 'long u (/ju/ or /u/ as in cute/luce)',
  'AO': 'oo sound (/u/ or /ʊ/ as in boot/book)',
  'OU': 'ow sound (/aʊ/ as in cow)',
  'OEU': 'oy sound (/ɔɪ/ as in coin)',
  'AU': 'aw sound (/ɔ/ as in caught)',
  'AE': 'vowel disambiguator (long a / long e)',
};

export const RIGHT_CHORD_MEANINGS: Record<string, string> = {
  'F': '-f / -v / -s',
  'R': '-r',
  'P': '-p',
  'B': '-b',
  'L': '-l',
  'G': '-g / -ing',
  'T': '-t',
  'S': '-s',
  'D': '-d / -ed',
  'Z': '-z / -s',
  'FR': '-fer / -ver',
  'FP': '-ch / -sp',
  'FL': '-fl / -vl / -ful',
  'FT': '-ft / -st',
  'RP': '-rp',
  'RB': '-rb / -sh',
  'RL': '-rl',
  'RT': '-rt',
  'RD': '-rd',
  'PB': '-n',
  'PL': '-m',
  'PT': '-pt',
  'BL': '-ble / -bl',
  'BG': '-k',
  'LG': '-lch / -lk (*LG)',
  'LT': '-lt / -let',
  'LD': '-ld',
  'GT': '-xt',
  'GS': '-shun (-tion/-sion)',
  'FRB': '-rv',
  'PBG': '-ng / -nj',
  'PBT': '-nt',
  'PBS': '-ns / -nce',
  'PBD': '-nd',
  'BGT': '-kt',
  'BGS': '-x / -kshun',
  'FRPB': '-rch / -nch',
  'FRPBLG': '-nch',
  'PBLG': '-j / -dge',
  'PLT': '-ment / -mt',
  'FPL': '-sm',
  'RBS': '-shus (-cious/-tious)',
  'RBL': '-shal (-cial/-tial)',
  'BLT': '-bility',
  'FBG': '-fk / -vk',
  'RPG': '-nk',
};

/**
 * Parses a single steno stroke (e.g. "STPHAOEUPBG", "TKPW-G", "#KWH*ES")
 * into left bank, vowels, asterisk, right bank, and active key IDs.
 */
export function parseStenoStroke(stroke: string): ParsedStroke {
  const raw = stroke.trim();
  let s = raw;

  const hasNumber = s.startsWith('#');
  if (hasNumber) {
    s = s.slice(1);
  }

  // Match standard steno order:
  // Left: S T K P W H R
  // Center/Vowels: A O * E U or explicit '-'
  // Right: F R P B L G T S D Z
  const match = s.match(/^([STKPWHR]*)([AO]*)(-|\*)?([EU]*)([FRPBLGTSDZ]*)$/);

  let left = '';
  let vowels = '';
  let hasAsterisk = false;
  let right = '';

  if (match) {
    left = match[1] || '';
    const vLeft = match[2] || '';
    const sep = match[3] || '';
    const vRight = match[4] || '';
    right = match[5] || '';
    vowels = vLeft + vRight;
    hasAsterisk = sep === '*';
  } else {
    // Fallback parser if stroke has unusual order
    const starIdx = s.indexOf('*');
    const dashIdx = s.indexOf('-');
    hasAsterisk = starIdx !== -1;
    const sepIdx = starIdx !== -1 ? starIdx : dashIdx;
    if (sepIdx !== -1) {
      const before = s.slice(0, sepIdx);
      const after = s.slice(sepIdx + 1);
      left = before.replace(/[AO]/g, '');
      vowels = (before.match(/[AO]/g) || []).join('') + (after.match(/[EU]/g) || []).join('');
      right = after.replace(/[EU]/g, '');
    } else {
      left = s;
    }
  }

  const activeKeys = new Set<string>();
  if (hasNumber) activeKeys.add('#');

  for (const ch of left) {
    if (ch === 'S') {
      activeKeys.add('S1');
      activeKeys.add('S2');
    } else {
      activeKeys.add(`${ch}-`);
    }
  }

  for (const ch of vowels) {
    activeKeys.add(ch);
  }

  if (hasAsterisk) {
    activeKeys.add('*');
    activeKeys.add('*2');
  }

  for (const ch of right) {
    activeKeys.add(`-${ch}`);
  }

  const leftKey = hasAsterisk && LEFT_CHORD_MEANINGS[`${left}*`] ? `${left}*` : left;
  const leftSound = left ? (LEFT_CHORD_MEANINGS[leftKey] || `${left.toLowerCase()}-`) : undefined;
  const vowelSound = vowels ? (VOWEL_CHORD_MEANINGS[vowels] || vowels) : undefined;
  const rightSound = right
    ? RIGHT_CHORD_MEANINGS[right] || `-${right.toLowerCase()}`
    : undefined;

  return {
    raw,
    hasNumber,
    left,
    vowels,
    hasAsterisk,
    right,
    activeKeys,
    leftSound,
    vowelSound,
    rightSound,
  };
}

/**
 * Splits a multi-stroke outline (e.g. "KOPL/PHREU/KAEUT") into individual parsed strokes.
 */
export function parseOutline(outline: string): ParsedStroke[] {
  return outline
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseStenoStroke);
}

/**
 * Converts a Set of pressed StenoKeyIds into a canonical raw steno string.
 */
export function keysToStenoString(pressed: Set<string>): string {
  if (pressed.size === 0) return '';
  let out = '';
  if (pressed.has('#')) out += '#';

  const leftOrder = [
    ['S1', 'S2', 'S'],
    ['T-', 'T'],
    ['K-', 'K'],
    ['P-', 'P'],
    ['W-', 'W'],
    ['H-', 'H'],
    ['R-', 'R'],
  ];

  let leftStr = '';
  if (pressed.has('S1') || pressed.has('S2')) leftStr += 'S';
  for (const [keyId, ch] of leftOrder.slice(1)) {
    if (pressed.has(keyId)) leftStr += ch;
  }

  let vLeft = '';
  if (pressed.has('A')) vLeft += 'A';
  if (pressed.has('O')) vLeft += 'O';

  const hasStar = pressed.has('*') || pressed.has('*2');

  let vRight = '';
  if (pressed.has('E')) vRight += 'E';
  if (pressed.has('U')) vRight += 'U';

  const rightOrder: [string, string][] = [
    ['-F', 'F'],
    ['-R', 'R'],
    ['-P', 'P'],
    ['-B', 'B'],
    ['-L', 'L'],
    ['-G', 'G'],
    ['-T', 'T'],
    ['-S', 'S'],
    ['-D', 'D'],
    ['-Z', 'Z'],
  ];

  let rightStr = '';
  for (const [keyId, ch] of rightOrder) {
    if (pressed.has(keyId)) rightStr += ch;
  }

  out += leftStr + vLeft;
  if (hasStar) {
    out += '*';
  } else if (vLeft === '' && vRight === '' && rightStr !== '') {
    out += '-';
  }
  out += vRight + rightStr;
  return out;
}
