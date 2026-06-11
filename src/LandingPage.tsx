import { useState, useEffect } from "react";
import styles from "./LandingPage.module.css";
import { getDateString } from "./seed";

const WELCOME_PHRASES = [
  "Welcome to",         // English
  "Bienvenido a",       // Spanish
  "Bienvenue à",        // French
  "Willkommen bei",     // German
  "Benvenuto a",        // Italian
  "Bem-vindo a",        // Portuguese
  "Добро пожаловать",   // Russian
  "ようこそ",            // Japanese
  "欢迎来到",            // Mandarin
  "歡迎嚟到",            // Cantonese
  "환영합니다",           // Korean
  "أهلاً وسهلاً",       // Arabic
  "स्वागत है",          // Hindi
  "Hoş geldiniz",       // Turkish
  "Welkom bij",         // Dutch
  "Witaj w",            // Polish
  "Välkommen till",     // Swedish
  "Velkommen til",      // Norwegian
  "Tervetuloa",         // Finnish
  "Καλώς ήρθατε",       // Greek
  "ברוך הבא",           // Hebrew
  "ยินดีต้อนรับ",        // Thai
  "Chào mừng",          // Vietnamese
  "Selamat datang di",  // Indonesian
  "Selamat datang ke",  // Malay
  "Bun venit la",       // Romanian
  "Vítejte v",          // Czech
  "Üdvözöljük",         // Hungarian
  "Ласкаво просимо",    // Ukrainian
  "Benvingut a",        // Catalan
  "Dobrodošli u",       // Croatian
  "Vitajte v",          // Slovak
  "Добре дошли",        // Bulgarian
  "Добродошли у",       // Serbian
  "Karibu",             // Swahili
  "Welkom by",          // Afrikaans
  "স্বাগতম",            // Bengali
  "خوش آمدید",          // Urdu
  "خوش آمدید به",       // Persian
  "Mirë se vini",       // Albanian
];

// Pool of equations, expressions, hieroglyphics — no bare symbols
const RING_POOL = [
  "3 + 20 = 23", "7 × 8 = 56", "100 − 37 = 63", "144 ÷ 12 = 12",
  "17 × 23 = 391", "999 + 1 = 1000", "256 ÷ 4 = 64", "81 − 45 = 36",
  "5.23%", "12.7%", "99.1%", "0.042%", "73.6%", "3.14%", "50.00%",
  "2^10 = 1024", "3² = 9", "5³ = 125", "2^8 = 256", "4^4 = 256",
  "√144 = 12", "√2 ≈ 1.414", "∛27 = 3", "∜256 = 4", "√π ≈ 1.772",
  "π ≈ 3.14159", "e ≈ 2.71828", "φ ≈ 1.61803", "γ ≈ 0.5772",
  "sin(π/2) = 1", "cos(0°) = 1", "tan(45°) = 1", "sin(30°) = 0.5",
  "cos(π) = −1", "arctan(1) = π/4", "sinh(0) = 0",
  "∫x² dx = x³/3 + C", "∂f/∂x = 0", "lim(x→∞) 1/x = 0",
  "Σ(n=1→∞) 1/n² = π²/6", "∫₀¹ x dx = ½", "∂²u/∂t² = c²∇²u",
  "e^(πi) + 1 = 0", "i² = −1", "0.999... = 1", "∞ + 1 = ∞",
  "a² + b² = c²", "E = mc²", "F = ma", "PV = nRT",
  "5! = 120", "10! = 3628800", "C(5,2) = 10", "n! = n×(n−1)!",
  "log₁₀(1000) = 3", "ln(e) = 1", "log₂(256) = 8", "log₂(1024) = 10",
  "17 mod 5 = 2", "2^31 − 1 = 2147483647", "100 mod 7 = 2",
  "x = (−b ± √Δ) / 2a", "Δ = b² − 4ac", "f(x) = ax² + bx + c",
  "∀x ∈ ℝ: x² ≥ 0", "∃n > 0: n² = n", "A ⊂ B ⊆ C",
  "P(A∩B) = P(A)P(B)", "∇²φ = 0", "⟨ψ|H|ψ⟩ = E",
  "𓀀𓀁𓀂𓀃", "𓁀𓁁𓁂𓁃", "𓀤𓀥𓀦𓀧", "𓁴𓁵𓁶𓁷", "𓁸𓁹𓁺𓁻",
  "42 × 17 = 714", "1 + 1 = 2", "2 + 2 = 4", "3 × 3 = 9",
  "1729 = 12³ + 1³", "6174 − 1467 = 4707", "37 × 3 = 111",
  "∑k² = n(n+1)(2n+1)/6", "nCr = n! / r!(n−r)!",
  "7919 is prime", "2^127 − 1 is prime", "4n + 2 = ?",
];

function buildRingText(ringIndex: number, targetChars: number): string {
  const offset = ringIndex * 11;
  let text = "";
  let i = 0;
  while (text.length < targetChars) {
    text += " · " + RING_POOL[(offset + i) % RING_POOL.length];
    i++;
  }
  // repeat once more for seamless wrap
  return text + text.slice(0, Math.ceil(text.length * 0.3));
}

function circlePath(r: number): string {
  return `M ${r} 0 A ${r} ${r} 0 1 1 ${-r} 0 A ${r} ${r} 0 1 1 ${r} 0`;
}

const PAST_PUZZLE_LABELS = [
  "Past Puzzles", "Past Enigmas", "Past Conundrums", "Past Riddles",
  "Past Mysteries", "Past Dilemmas", "Past Quandaries", "Past Predicaments",
  "Past Ordeals", "Past Fiascos", "Past Debacles", "Past Shenanigans",
  "Past Trainwrecks", "Past Mishaps", "Past Disasters", "Past Calamities",
  "Past Blunders", "Past Birthday Parties", "Past Breakups",
  "Past Political Assassinations", "Past Atrocities", "Past Catastrophic Failures",
  "Past Absurdities", "Past Tribulations", "Past Messes", "Past Incidents",
  "Past Crises", "Past Headaches", "Past Affairs", "Past Catastrophes",
];

const RING_CONFIGS = [
  { radius: 145, duration: 48,  reverse: false, color: "rgba(167,139,250,0.22)", fontSize: 48 },
  { radius: 200, duration: 58,  reverse: true,  color: "rgba(192,132,252,0.16)", fontSize: 46 },
  { radius: 260, duration: 70,  reverse: false, color: "rgba(96,165,250,0.18)",  fontSize: 51 },
  { radius: 325, duration: 82,  reverse: true,  color: "rgba(129,183,253,0.14)", fontSize: 49 },
  { radius: 390, duration: 95,  reverse: false, color: "rgba(52,211,153,0.15)",  fontSize: 54 },
  { radius: 465, duration: 110, reverse: true,  color: "rgba(110,231,183,0.12)", fontSize: 52 },
  { radius: 540, duration: 125, reverse: false, color: "rgba(251,191,36,0.12)",  fontSize: 54 },
  { radius: 625, duration: 143, reverse: true,  color: "rgba(253,211,77,0.10)",  fontSize: 55 },
  { radius: 710, duration: 160, reverse: false, color: "rgba(248,113,113,0.10)", fontSize: 57 },
];

// Pre-generate ring texts — 2× circumference ensures full dense coverage
const RING_TEXTS = RING_CONFIGS.map((cfg, i) => {
  const circumference = 2 * Math.PI * cfg.radius;
  const avgCharWidth = cfg.fontSize * 0.62;
  return buildRingText(i, Math.ceil((circumference * 2) / avgCharWidth));
});

interface Props {
  onPlay: (date?: string) => void;
}

export function LandingPage({ onPlay }: Props) {
  const [langIndex, setLangIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickedDate, setPickedDate] = useState(getDateString);
  const [pastLabel] = useState(
    () => PAST_PUZZLE_LABELS[Math.floor(Math.random() * PAST_PUZZLE_LABELS.length)]
  );

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setLangIndex((n) => (n + 1) % WELCOME_PHRASES.length);
        setVisible(true);
      }, 350);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.page}>
      {/* Spinning rings SVG */}
      <svg
        className={styles.ringSvg}
        viewBox="-800 -800 1600 1600"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {RING_CONFIGS.map((cfg, i) => (
            <path key={i} id={`ring-path-${i}`} d={circlePath(cfg.radius)} />
          ))}
        </defs>
        {RING_CONFIGS.map((cfg, i) => (
          <g
            key={i}
            className={cfg.reverse ? styles.ringCcw : styles.ringCw}
            style={{ "--ring-duration": `${cfg.duration}s` } as React.CSSProperties}
          >
            <text
              fill={cfg.color}
              fontSize={cfg.fontSize}
              fontFamily="'Courier New', monospace"
              letterSpacing="1"
            >
              <textPath href={`#ring-path-${i}`}>{RING_TEXTS[i]}</textPath>
            </text>
          </g>
        ))}
      </svg>

      {/* Title block */}
      <div className={styles.titleBlock}>
        <div className={`${styles.welcome} ${visible ? styles.welcomeVisible : styles.welcomeHidden}`}>
          {WELCOME_PHRASES[langIndex]}
        </div>
        <div className={styles.gameTitle}>numdlewang</div>
      </div>

      <button className={styles.playBtn} onClick={() => onPlay()}>
        Play
      </button>

      {!showDatePicker ? (
        <button className={styles.pastBtn} onClick={() => setShowDatePicker(true)}>
          📅 {pastLabel}
        </button>
      ) : (
        <div className={styles.datePicker}>
          <input
            type="date"
            className={styles.dateInput}
            value={pickedDate}
            min="2024-01-01"
            max={getDateString()}
            onChange={(e) => setPickedDate(e.target.value)}
          />
          <button className={styles.goBtn} onClick={() => onPlay(pickedDate)}>Go</button>
          <button className={styles.cancelBtn} onClick={() => setShowDatePicker(false)}>✕</button>
        </div>
      )}
    </div>
  );
}
