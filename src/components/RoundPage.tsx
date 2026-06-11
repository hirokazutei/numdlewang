import { useState } from "react";
import confetti from "canvas-confetti";
import type { Round } from "../gameLogic";
import styles from "./RoundPage.module.css";

interface Props {
  round: Round;
  index: number;
  total: number;
  onAdvance: (correct: boolean) => void;
}

const TYPE_CLASS: Record<string, string> = {
  math: styles.math,
  letter: styles.letter,
  hieroglyph: styles.hieroglyph,
  number: styles.number,
  food: styles.food,
};

function resolveCorrect(round: Round, chosen: number): boolean {
  if (round.correctIndex !== null) return chosen === round.correctIndex;
  return round.seededCorrect;
}

export function RoundPage({ round, index, total, onAdvance }: Props) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [advancing, setAdvancing] = useState(false);

  function handlePick(i: number) {
    if (chosen !== null) return;
    const result = resolveCorrect(round, i);
    setChosen(i);
    setCorrect(result);

    if (result) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#a78bfa", "#34d399", "#fbbf24", "#f87171", "#60a5fa"],
      });
    }

    setTimeout(() => {
      setAdvancing(true);
      setTimeout(() => onAdvance(result), 420);
    }, 1400);
  }

  const revealed = chosen !== null;
  const won = revealed && correct === true;
  const lost = revealed && correct === false;
  const manyGuesses = round.guesses.length > 2;

  return (
    <div className={`${styles.page} ${advancing ? styles.rotateOut : styles.rotateIn}`}>
      {/* .inner uses margin:auto to center when short, scrolls naturally when tall */}
      <div className={styles.inner}>
        <div className={`${styles.result} ${won ? styles.won : ""} ${lost ? styles.lost : ""}`}>
          {!revealed && <span className={styles.prompt}>Pick a number</span>}
          {won && <span>numdlewang! 🎉</span>}
          {lost && <span>numblewrong. :(</span>}
        </div>

        <div className={`${styles.tokens} ${manyGuesses ? styles.tokensMany : ""}`}>
          {round.guesses.map((g, i) => (
            <button
              key={i}
              className={`
                ${styles.token}
                ${TYPE_CLASS[g.type] ?? ""}
                ${chosen === i ? styles.selected : ""}
                ${revealed && chosen !== i ? styles.dimmed : ""}
              `}
              onClick={() => handlePick(i)}
              disabled={revealed}
            >
              {g.value}
            </button>
          ))}
        </div>

        <div className={styles.progress}>
          Round {index + 1} / {total}
        </div>
      </div>
    </div>
  );
}
