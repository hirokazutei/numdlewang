import { useState } from "react";
import type { Round } from "../gameLogic";
import { GuessDisplay } from "./GuessDisplay";
import styles from "./RoundCard.module.css";

interface Props {
  round: Round;
  index: number;
  onComplete: (correct: boolean) => void;
  completed: boolean;
  result: boolean | null;
}

export function RoundCard({ round, index, onComplete, completed, result }: Props) {
  const [revealed, setRevealed] = useState(completed);

  function handleSubmit() {
    if (revealed) return;
    setRevealed(true);
    onComplete(round.correct);
  }

  return (
    <div className={`${styles.card} ${revealed ? (result ? styles.correct : styles.wrong) : ""}`}>
      <div className={styles.label}>Round {index + 1}</div>
      <GuessDisplay guesses={round.guesses} />
      {!revealed ? (
        <button className={styles.btn} onClick={handleSubmit}>
          Submit Guess
        </button>
      ) : (
        <div className={`${styles.result} ${result ? styles.correctText : styles.wrongText}`}>
          {result ? "✓ Correct!" : "✗ Wrong"}
        </div>
      )}
    </div>
  );
}
