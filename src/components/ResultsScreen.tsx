import { useEffect, useState } from "react";
import type { GameConfig } from "../gameLogic";
import styles from "./ResultsScreen.module.css";

interface Props {
  config: GameConfig;
  puzzleNumber: number;
  results: (boolean | "neutral")[];
  isPastPuzzle?: boolean;
}

const MAX_CIRCLES = 50;

function buildShareText(puzzleNumber: number, correct: number | string, total: number, results: (boolean | "neutral")[]) {
  const circles = results
    .slice(0, MAX_CIRCLES)
    .map((r) => r === "neutral" ? "☥" : "⬣")
    .join("");
  const suffix = results.length > MAX_CIRCLES ? `…(${results.length})` : "";
  return `numdlewang #${puzzleNumber} ${correct}/${total}: ${circles}${suffix}\nhttps://numdlewang.help`;
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

  async function handleCopy() {
    const text = buildShareText(puzzleNumber, correct, total, results);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const displayCircles = results.slice(0, MAX_CIRCLES);
  const overflow = results.length > MAX_CIRCLES ? results.length - MAX_CIRCLES : 0;

  return (
    <div className={styles.screen}>
      {config.everyone_won ? (
        <h2 className={styles.wonMessage}>Everyone has numberwon!</h2>
      ) : (
        <>
          <h2 className={styles.score}>
            numdlewang #{puzzleNumber}
          </h2>
          <div className={styles.fraction}>
            <span className={styles.correctNum}>
              {Number.isInteger(correct) ? correct : correct.toFixed(1)}
            </span>
            <span className={styles.slash}>/</span>
            <span className={styles.totalNum}>{total}</span>
            <span className={styles.label}> Correct</span>
          </div>
        </>
      )}

      <div className={styles.circles}>
        {displayCircles.map((r, i) => (
          <span
            key={i}
            className={r === true ? styles.filled : r === "neutral" ? styles.neutral : styles.empty}
          >
            {r === "neutral" ? "☥" : "⬣"}
          </span>
        ))}
        {overflow > 0 && <span className={styles.overflow}>…+{overflow}</span>}
      </div>

      <button className={styles.copyBtn} onClick={handleCopy}>
        {copied ? "Copied!" : "Copy to Clipboard"}
      </button>

      <p className={styles.thanks}>
        Thanks for the numbers! Now the number is{" "}
        <strong>{config.thanksVariant === "yours" ? "yours" : "mine"}!</strong>
      </p>
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
