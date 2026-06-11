import { useState } from "react";
import confetti from "canvas-confetti";
import type { Round } from "../gameLogic";
import styles from "./SixOrSeven.module.css";

interface Props {
  round: Round;
  onFinish: (result: boolean | "neutral") => void;
}

function resolveCorrect(round: Round, chosen: number): boolean {
  if (round.correctIndex !== null) return chosen === round.correctIndex;
  return round.seededCorrect;
}

export function SixOrSeven({ round, onFinish }: Props) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);

  function handlePick(i: number) {
    if (chosen !== null) return;
    const correct = resolveCorrect(round, i);
    setChosen(i);
    setResult(correct);
    if (correct) confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ["#a78bfa", "#34d399", "#fbbf24"] });
    setTimeout(() => onFinish(correct), 1600);
  }

  return (
    <div className={styles.page}>
      <p className={styles.prompt}>Pick a number</p>
      <div className={styles.choices}>
        {(["6", "7"] as const).map((num, i) => (
          <button
            key={num}
            className={`${styles.choice} ${i === 0 ? styles.bobA : styles.bobB} ${chosen === i ? styles.selected : ""} ${chosen !== null && chosen !== i ? styles.dimmed : ""}`}
            onClick={() => handlePick(i)}
            disabled={chosen !== null}
          >
            {num}
          </button>
        ))}
      </div>
      {result !== null && (
        <div className={result ? styles.won : styles.lost}>
          {result ? "numdlewang! 🎉" : "numblewrong. :("}
        </div>
      )}
    </div>
  );
}
