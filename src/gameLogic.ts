import { createRng } from "./seed";

export type SymbolType = "number" | "math" | "letter" | "hieroglyph" | "food";
export type SpecialEventType = "nundle-storm" | "enter-number" | "voice" | "take-picture" | "helpful-knower" | "wanganum";

export interface GuessItem {
  type: SymbolType;
  value: string;
}

export interface Round {
  guesses: GuessItem[];
  correctIndex: number | null;
  seededCorrect: boolean;
  // Special event fields (present when specialEvent is set)
  specialEvent?: SpecialEventType;
  stormNumbers?: GuessItem[];   // nundle-storm: the pool of numbers
  wanganumDuration?: number;    // wanganum: ms until auto-win (5000–180000)
  knowerHint?: number;          // helpful-knower: index the finger points to
  eventWin?: boolean;           // voice/take-picture: seeded 80% win
}

export interface GameConfig {
  roundCount: number;
  everyone_won: boolean;
  rounds: Round[];
  scoreGlitch: boolean;
  timerGlitch: boolean;
  glitchCorrect: number;
  glitchTotal: number;
  glitchTime: string;
  thanksVariant: "mine" | "yours"; // 20% chance of "yours"
}

const MATH_SYMBOLS = ["√", "∛", "!", "∑", "∏", "∂", "∫", "∞", "≈", "±", "÷", "×"];

// Japanese food — language: Japanese, topic: food
const JAPANESE_FOOD = [
  "寿司", "ラーメン", "天ぷら", "餃子", "お好み焼き",
  "焼き鳥", "たこ焼き", "うどん", "そば", "味噌汁",
  "刺身", "豆腐", "納豆", "おにぎり", "カレー",
  "唐揚げ", "すき焼き", "しゃぶしゃぶ", "茶碗蒸し", "抹茶",
  "桜餅", "大福", "たい焼き", "わらびもち", "あんみつ",
  "おでん", "チャーハン", "牛丼", "親子丼", "かつ丼",
  "海鮮丼", "鍋", "焼肉", "冷奴", "みたらし団子",
  "甘酒", "梅干し", "煮物", "厚焼き卵", "もんじゃ焼き",
];

// Approved hieroglyph set per spec — human figures, animals, birds, plants, geography
function _glyphRange(start: number, end: number): string[] {
  return Array.from({ length: end - start + 1 }, (_, i) => String.fromCodePoint(start + i));
}

const HIEROGLYPH_CHARS: string[] = [
  ..._glyphRange(0x13000, 0x130FF), // 𓀀–𓁿  human figures (256)
  ...[..."𓂀𓂏𓂈𓂉𓂊𓂸𓂹𓂺"],         // scattered arm/hand
  ...[..."𓂜𓂝𓂞𓂟𓂠𓂡𓂢𓂣𓂤𓂥𓂦𓂧𓂨𓂩𓂪𓂫𓂬"], // arm sequence
  ...[..."𓃒𓃓𓃔𓃕𓃖𓃗𓃘𓃙𓃚𓃛𓃜𓃝𓃞𓃟𓃠𓃡𓃢𓃣𓃤𓃥𓃦𓃧𓃨𓃩𓃪𓃫𓃬𓃭𓃮𓃯𓃰𓃱𓃲𓃳𓃴𓃵𓃶𓃷𓃸𓃹𓃺𓃻𓃼𓃽𓃾𓃿𓄀𓄁𓄂𓄃𓄄𓄅𓄆𓄇𓄈𓄉𓄊"], // mammals
  ...[..."𓄯𓄿"],
  ...[..."𓅀𓅁𓅂𓅃𓅄𓅅𓅆𓅇𓅈𓅉𓅊𓅋𓅌𓅍𓅎𓅏𓅐𓅑𓅒𓅓𓅔𓅕𓅖𓅗𓅘𓅙𓅚𓅛𓅜𓅝𓅞𓅟𓅠𓅡𓅢𓅣𓅤𓅥𓅦𓅧𓅨𓅩𓅪𓅫𓅬𓅭𓅮𓅯𓅰𓅱𓅲𓅳𓅴𓅵𓅶𓅷𓅸𓅹𓅺𓅻𓅼𓅽𓅾𓅿𓆀𓆁𓆂𓆃𓆄𓆅𓆆𓆇𓆈𓆉𓆊𓆋𓆌𓆍𓆎𓆏𓆐𓆑𓆒𓆓𓆔𓆕𓆖𓆗𓆘𓆙𓆚𓆛𓆜𓆝𓆞𓆟𓆠𓆡𓆢𓆣𓆤𓆥𓆦𓆧𓆨"], // birds/reptiles/insects/fish
  ...[..."𓆲"],
  ...[..."𓈠𓈡𓈢𓈣𓈤𓈥𓈦𓈧𓈨𓈩𓈪𓈫𓈬𓈭𓈮𓈯𓈰𓈱𓈲𓈳𓈴𓈵𓈶𓈷𓈸𓈹𓈺𓈻𓈼𓈽𓈾𓈿𓉀𓉁𓉂𓉃𓉄𓉅𓉆𓉇𓉈𓉉𓉊𓉋𓉌𓉍𓉎𓉏"], // sky/earth
  ...[..."𓉡𓉢𓉣𓉤"],
];

function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function makeNumberValue(rng: () => number): string {
  const roll = rng();
  if (roll < 0.35) return String(Math.floor(rng() * 10));
  if (roll < 0.60) return String(10  + Math.floor(rng() * 90));
  if (roll < 0.75) return String(100 + Math.floor(rng() * 900));
  if (roll < 0.85) return String(1000 + Math.floor(rng() * 9000));
  if (roll < 0.90) return String(10000 + Math.floor(rng() * 90000));
  if (roll < 0.93) return String(100000 + Math.floor(rng() * 900000));
  if (roll < 0.95) return String(1000000 + Math.floor(rng() * 9000000));
  // 5%: 8 digits → Number.MAX_VALUE; use e-notation when too large to represent exactly
  const exp = 7 + Math.floor(rng() * 301); // exponent 7–307
  const mantissa = 1 + rng() * 8.999;
  if (exp < 15) {
    const num = Math.round(mantissa * Math.pow(10, exp));
    if (Number.isSafeInteger(num)) return String(num);
  }
  return `${mantissa.toFixed(3)}e+${exp + 1}`;
}

function makeGuessItem(rng: () => number): GuessItem {
  const roll = rng();
  if (roll < 0.03) {
    return { type: "math", value: MATH_SYMBOLS[Math.floor(rng() * MATH_SYMBOLS.length)] };
  } else if (roll < 0.06) {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return { type: "letter", value: letters[Math.floor(rng() * letters.length)] };
  } else if (roll < 0.08) {
    return { type: "hieroglyph", value: HIEROGLYPH_CHARS[Math.floor(rng() * HIEROGLYPH_CHARS.length)] };
  } else if (roll < 0.10) {
    return { type: "food", value: JAPANESE_FOOD[Math.floor(rng() * JAPANESE_FOOD.length)] };
  } else {
    return { type: "number", value: makeNumberValue(rng) };
  }
}

function makeGuessCount(rng: () => number): number {
  const roll = rng();
  if (roll < 0.02) return 1;
  if (roll < 0.95) return 2;
  return randInt(rng, 3, 256);
}

function makeRoundCount(rng: () => number): number {
  const roll = rng();
  if (roll < 0.02) return 0;
  if (roll < 0.04) return 1;
  if (roll < 0.09) return randInt(rng, 7, 1000);
  return 6;
}

function makeGlitchTime(rng: () => number): string {
  const h = randInt(rng, 0, 99);
  const m = randInt(rng, 0, 99);
  const s = randInt(rng, 0, 99);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function buildGameConfig(dateStr: string): GameConfig {
  const rng = createRng(dateStr);

  const roundCount = makeRoundCount(rng);
  const everyone_won = roundCount === 0;

  const rounds: Round[] = [];
  for (let i = 0; i < roundCount; i++) {
    const guessCount = makeGuessCount(rng);
    const guesses: GuessItem[] = [];
    for (let g = 0; g < guessCount; g++) {
      guesses.push(makeGuessItem(rng));
    }
    const correctIndex = guessCount === 2 ? (rng() < 0.5 ? 0 : 1) : null;
    const seededCorrect = guessCount !== 2 ? rng() < 0.5 : false;

    // 5% chance of a special event — equal probability among 6 types
    let specialEvent: SpecialEventType | undefined;
    let stormNumbers: GuessItem[] | undefined;
    let wanganumDuration: number | undefined;
    let knowerHint: number | undefined;
    let eventWin: boolean | undefined;

    if (rng() < 0.05) {
      const EVENTS: SpecialEventType[] = ["nundle-storm", "enter-number", "voice", "take-picture", "helpful-knower", "wanganum"];
      specialEvent = EVENTS[Math.floor(rng() * EVENTS.length)];
      if (specialEvent === "nundle-storm") {
        const count = 15 + Math.floor(rng() * 11); // 15–25 numbers
        stormNumbers = Array.from({ length: count }, () => ({ type: "number" as const, value: makeNumberValue(rng) }));
      } else if (specialEvent === "wanganum") {
        wanganumDuration = 5000 + Math.floor(rng() * 175001); // 5s–3min
      } else if (specialEvent === "helpful-knower") {
        knowerHint = Math.floor(rng() * Math.max(guesses.length, 1));
      } else if (specialEvent === "voice" || specialEvent === "take-picture") {
        eventWin = rng() < 0.8;
      }
    }

    rounds.push({ guesses, correctIndex, seededCorrect, specialEvent, stormNumbers, wanganumDuration, knowerHint, eventWin });
  }

  const scoreGlitch = rng() < 0.1;
  const timerGlitch = rng() < 0.06;

  const glitchCorrect = randInt(rng, 0, Math.max(roundCount, 1));
  const glitchTotal = randInt(rng, 1, Math.max(roundCount + 3, 4));
  const glitchTime = timerGlitch ? makeGlitchTime(rng) : "";
  const thanksVariant: "mine" | "yours" = rng() < 0.2 ? "yours" : "mine";

  return {
    roundCount,
    everyone_won,
    rounds,
    scoreGlitch,
    timerGlitch,
    glitchCorrect,
    glitchTotal,
    glitchTime,
    thanksVariant,
  };
}
