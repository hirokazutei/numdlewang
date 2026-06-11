import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import type { Round } from "../gameLogic";
import styles from "./HelpfulKnower.module.css";

interface Props {
  round: Round;
  onFinish: (correct: boolean) => void;
}

function resolveCorrect(round: Round, chosen: number): boolean {
  if (round.correctIndex !== null) return chosen === round.correctIndex;
  return round.seededCorrect;
}

export function HelpfulKnower({ round, onFinish }: Props) {
  const [showKnower, setShowKnower] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const hint = round.knowerHint ?? 0;

  useEffect(() => {
    const t = setTimeout(() => setShowKnower(true), 600);
    return () => clearTimeout(t);
  }, []);

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
      <div className={styles.prompt}>Pick a number</div>

      <div className={styles.tokens}>
        {round.guesses.map((g, i) => (
          <div key={i} className={styles.tokenWrap}>
            {showKnower && hint === i && (
              <div className={styles.knowerBox}>
                <span className={styles.finger}>👉</span>
                {i === 0 && (
                  <div className={styles.speech}>
                    psst! I'm the Amazing Numbler Knower! I know the numbler. Pick this one! Trust me!
                  </div>
                )}
              </div>
            )}
            <button
              className={`${styles.token} ${chosen === i ? styles.selected : ""} ${chosen !== null && chosen !== i ? styles.dimmed : ""}`}
              onClick={() => handlePick(i)}
              disabled={chosen !== null}
            >
              {g.value}
            </button>
          </div>
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
