import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import type { GameConfig } from "../gameLogic";
import styles from "./ResultsScreen.module.css";

interface Props {
  config: GameConfig;
  puzzleNumber: number;
  results: (boolean | "neutral" | "nine-eleven")[];
  isPastPuzzle?: boolean;
}

const MAX_CIRCLES = 50;

const ALL_CELEBRATION_WORDS = [
  "yay!", "good job!", "wow!", "wonderful", "incredible",
  "congratulations!", "so happy for you!", "good boy",
  "amazing!", "fantastic!", "spectacular!", "you did it!",
  "hooray!", "bravo!", "top marks!", "glorious!",
];

const CELEBRATION_EMOJIS = "🎉 🎊 🥳 ✨ 🎆 🎇 🪅 🎈 🎉 🎊 🥳 ✨ 🎆 🎇 🥳 🎈";

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomWordState() {
  return {
    word: ALL_CELEBRATION_WORDS[Math.floor(Math.random() * ALL_CELEBRATION_WORDS.length)],
    x: randBetween(3, 82),
    y: randBetween(4, 80),
    size: randBetween(0.9, 1.6),
  };
}

function FloatingWord() {
  const [visible, setVisible] = useState(true);
  const [state, setState] = useState(randomWordState);

  useEffect(() => {
    const FADE = 500;
    const cycleDuration = 2000 + Math.random() * 2000;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setState(randomWordState());
        setVisible(true);
      }, FADE);
    }, cycleDuration + FADE);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className={styles.celebrationWord}
      style={{
        left: `${state.x}%`,
        top: `${state.y}%`,
        fontSize: `${state.size}rem`,
        opacity: visible ? 1 : 0,
      }}
    >
      {state.word}
    </span>
  );
}

const THANKS_VARIATIONS = [
  "Now the numbers can finally sleep.",
  "Now the numbers must go back to their own planet.",
  "Now the numbers will always live in your heart.",
  "Now the numbers are free.",
  "Now the numbers have found their purpose.",
  "The numbers were always meant to be played.",
  "The numbers have spoken. You have listened.",
  "Somewhere, a number just sighed with relief.",
  "The numbers will remember this.",
  "A great number has been numbled today.",
  "The numbers were here. Now they are gone. As all things must be.",
  "The numbers have been acceptably numbled.",
  "All those numbers, just waiting to be numbled.",
];

function resultSymbol(r: boolean | "neutral" | "nine-eleven"): string {
  if (r === true) return "⬣";
  if (r === "nine-eleven") return "✈︎";
  if (r === "neutral") return "☥";
  return "⬡";
}

function getCaption(correct: number, total: number): string {
  if (total === 0) return "Aaaaand that's Numdlewang!";
  const pct = correct / total;
  if (pct === 0) return "The numdles... you got them all wrongdle...";
  if (pct <= 0.33) return "The average toddler will statistically score higher.";
  if (pct <= 0.65) return "Aaaaand that's Numdlewang!";
  if (pct < 1) return "There are some good numdle genes in you!";
  return "You are the knower! Congrats for knowing!";
}

function buildEveryoneWonShareText(puzzleNumber: number): string {
  return `numdlewang #${puzzleNumber}\n${CELEBRATION_EMOJIS}\nEveryone has numdlewon!\n${CELEBRATION_EMOJIS}\nYou are perfect the way you are.\nExcept for the parts that are wrong.\nhttps://numdlewang.help`;
}

function buildShareText(puzzleNumber: number, correct: number | string, total: number, results: (boolean | "neutral" | "nine-eleven")[], actualCorrect: number, actualTotal: number) {
  const circles = results
    .slice(0, MAX_CIRCLES)
    .map(resultSymbol)
    .join("");
  const suffix = results.length > MAX_CIRCLES ? `…(${results.length})` : "";
  const caption = getCaption(actualCorrect, actualTotal);
  return `numdlewang #${puzzleNumber}\n${correct}/${total}: ${circles}${suffix}\n${caption}\nhttps://numdlewang.help`;
}

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const ms = midnight.getTime() - now.getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ResultsScreen({ config, puzzleNumber, results, isPastPuzzle }: Props) {
  const actualCorrect = results.reduce<number>(
    (sum, r) => sum + (r === true ? 1 : r === "neutral" ? 0.5 : 0), 0
  );
  const correctRaw = config.scoreGlitch ? config.glitchCorrect : actualCorrect;
  const correct = Number.isInteger(correctRaw) ? correctRaw : correctRaw;
  const total = config.scoreGlitch ? config.glitchTotal : config.roundCount;

  const [countdown, setCountdown] = useState(
    config.timerGlitch ? config.glitchTime : getTimeUntilMidnight()
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (config.timerGlitch) return;
    const id = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, [config.timerGlitch]);

  useEffect(() => {
    if (!config.everyone_won) return;
    const fire = () => confetti({
      particleCount: 70,
      spread: 80,
      origin: { x: Math.random(), y: 0.15 + Math.random() * 0.5 },
      colors: ["#a78bfa", "#34d399", "#fbbf24", "#f87171", "#60a5fa"],
    });
    fire(); fire();
    const id = setInterval(() => { fire(); setTimeout(fire, 350); }, 2000);
    return () => clearInterval(id);
  }, [config.everyone_won]);

  async function handleCopy() {
    const text = config.everyone_won
      ? buildEveryoneWonShareText(puzzleNumber)
      : buildShareText(puzzleNumber, correct, total, results, actualCorrect, config.roundCount);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const displayCircles = results.slice(0, MAX_CIRCLES);
  const overflow = results.length > MAX_CIRCLES ? results.length - MAX_CIRCLES : 0;

  if (config.everyone_won) {
    return (
      <div className={styles.screen}>
        {Array.from({ length: 8 }, (_, i) => <FloatingWord key={i} />)}
        <h2 className={styles.wonMessage}>Everyone has numdlewon!</h2>
        <button className={styles.copyBtn} onClick={handleCopy}>
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
        {isPastPuzzle ? (
          <p className={styles.timer}>This was a past puzzle.</p>
        ) : (
          <p className={styles.timer}>
            Next Puzzle available in <span className={styles.time}>{countdown}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <h2 className={styles.score}>numdlewang #{puzzleNumber}</h2>
      <div className={styles.fraction}>
        <span className={styles.correctNum}>
          {Number.isInteger(correct) ? correct : correct.toFixed(1)}
        </span>
        <span className={styles.slash}>/</span>
        <span className={styles.totalNum}>{total}</span>
        <span className={styles.label}> Correct</span>
      </div>

      <div className={styles.circles}>
        {displayCircles.map((r, i) => (
          <span
            key={i}
            className={r === true ? styles.filled : r === "neutral" ? styles.neutral : r === "nine-eleven" ? styles.nineEleven : styles.empty}
          >
            {resultSymbol(r)}
          </span>
        ))}
        {overflow > 0 && <span className={styles.overflow}>…+{overflow}</span>}
      </div>

      <button className={styles.copyBtn} onClick={handleCopy}>
        {copied ? "Copied!" : "Copy to Clipboard"}
      </button>

      <p className={styles.thanks}>Thank you for the numbers.</p>
      <p className={styles.thanks}>{THANKS_VARIATIONS[puzzleNumber % THANKS_VARIATIONS.length]}</p>
      {isPastPuzzle ? (
        <p className={styles.timer}>This was a past puzzle.</p>
      ) : (
        <p className={styles.timer}>
          Next Puzzle available in <span className={styles.time}>{countdown}</span>
        </p>
      )}
    </div>
  );
}
