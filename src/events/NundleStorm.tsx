import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import type { Round } from "../gameLogic";
import { getDateString, hashString } from "../seed";
import styles from "./NundleStorm.module.css";

interface Props {
  round: Round;
  onFinish: (correct: boolean) => void;
}

export function NundleStorm({ round, onFinish }: Props) {
  const numbers = round.stormNumbers ?? round.guesses;
  const [visible, setVisible] = useState(() => new Set(numbers.map((_, i) => i)));
  const [timeLeft, setTimeLeft] = useState(10);
  const [result, setResult] = useState<boolean | null>(null);

  const finishedRef = useRef(false);
  const clickedRef = useRef<number[]>([]);
  const visibleRef = useRef(new Set(numbers.map((_, i) => i)));

  function resolve(clicked: number[]) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const clickStr = clicked.map(i => numbers[i]?.value ?? i).join(",");
    const correct = hashString(getDateString() + clickStr) % 2 === 0;
    setResult(correct);
    if (correct) confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ["#a78bfa", "#34d399", "#fbbf24"] });
    setTimeout(() => onFinish(correct), 1600);
  }

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(id); resolve(clickedRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick(i: number) {
    if (finishedRef.current || !visibleRef.current.has(i)) return;
    visibleRef.current.delete(i);
    const newClicked = [...clickedRef.current, i];
    clickedRef.current = newClicked;
    setVisible(new Set(visibleRef.current));
    if (visibleRef.current.size === 0) resolve(newClicked);
  }

  return (
    <div className={styles.page}>
      <div className={styles.title}>⚡ NUNDLE STORM ⚡</div>
      <div className={styles.timer} style={{ color: timeLeft <= 3 ? "#f87171" : "#fbbf24" }}>
        {timeLeft}s
      </div>
      <div className={styles.grid}>
        {numbers.map((g, i) =>
          visible.has(i) ? (
            <button key={i} className={styles.num} onClick={() => handleClick(i)}>
              {g.value}
            </button>
          ) : (
            <div key={i} className={styles.gone} />
          )
        )}
      </div>
      {result !== null && (
        <div className={result ? styles.won : styles.lost}>
          {result ? "numdlewang! 🎉" : "numblewrong. :("}
        </div>
      )}
    </div>
  );
}
