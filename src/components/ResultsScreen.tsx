import { useEffect, useState } from "react";
import type { GameConfig } from "../gameLogic";
import styles from "./ResultsScreen.module.css";

interface Props {
  config: GameConfig;
  puzzleNumber: number;
  results: boolean[];
  isPastPuzzle?: boolean;
}

const MAX_CIRCLES = 50;

function buildShareText(puzzleNumber: number, correct: number, total: number, results: boolean[]) {
  const circles = results
    .slice(0, MAX_CIRCLES)
    .map((r) => (r ? "⬣" : "⬡"))
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
  const correct = config.scoreGlitch ? config.glitchCorrect : results.filter(Boolean).length;
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
            <span className={styles.correctNum}>{correct}</span>
            <span className={styles.slash}>/</span>
            <span className={styles.totalNum}>{total}</span>
            <span className={styles.label}> Correct</span>
          </div>
        </>
      )}

      <div className={styles.circles}>
        {displayCircles.map((r, i) => (
          <span key={i} className={r ? styles.filled : styles.empty}>
            ⬣
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
