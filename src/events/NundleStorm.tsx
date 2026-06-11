import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import type { Round } from "../gameLogic";
import { getDateString, hashString } from "../seed";
import styles from "./NundleStorm.module.css";

interface Props {
  round: Round;
  onFinish: (correct: boolean) => void;
}

type NumItem = { value: string; uid: number };

function randomNum(): string {
  return String(1 + Math.floor(Math.random() * 9998));
}

export function NundleStorm({ round, onFinish }: Props) {
  const initial = (round.stormNumbers ?? round.guesses).map((g, i) => ({ value: g.value, uid: i }));
  const [nums, setNums] = useState<NumItem[]>(initial);
  const [uidCounter, setUidCounter] = useState(initial.length);
  const [timeLeft, setTimeLeft] = useState(10);
  const [result, setResult] = useState<boolean | null>(null);

  const finishedRef = useRef(false);
  const clickedValsRef = useRef<string[]>([]);

  function resolve(vals: string[]) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const correct = hashString(getDateString() + vals.join(",")) % 2 === 0;
    setResult(correct);
    if (correct) confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ["#a78bfa", "#34d399", "#fbbf24"] });
    setTimeout(() => onFinish(correct), 1600);
  }

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(id); resolve(clickedValsRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick(idx: number) {
    if (finishedRef.current) return;
    // Track the clicked value for win seed
    clickedValsRef.current = [...clickedValsRef.current, nums[idx].value];
    // Replace with a fresh random number
    const newUid = uidCounter;
    setUidCounter(c => c + 1);
    setNums(prev => {
      const next = [...prev];
      next[idx] = { value: randomNum(), uid: newUid };
      return next;
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.title}>⚡ NUNDLE STORM ⚡</div>
      <div className={styles.timer} style={{ color: timeLeft <= 3 ? "#f87171" : "#fbbf24" }}>
        {timeLeft}s
      </div>
      <div className={styles.grid}>
        {nums.map((g, idx) => (
          <button key={g.uid} className={styles.num} onClick={() => handleClick(idx)}>
            {g.value}
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
