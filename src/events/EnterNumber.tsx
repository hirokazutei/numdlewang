import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import type { Round } from "../gameLogic";
import { getDateString, hashString } from "../seed";
import styles from "./EnterNumber.module.css";

interface Props {
  round: Round;
  onFinish: (correct: boolean) => void;
}

export function EnterNumber({ onFinish }: Props) {
  const [input, setInput] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [phase, setPhase] = useState<"idle" | "scrambling" | "done">("idle");
  const [result, setResult] = useState<boolean | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleSubmit() {
    if (phase !== "idle" || !input.trim()) return;
    setPhase("scrambling");

    let ticks = 0;
    intervalRef.current = setInterval(() => {
      setDisplayValue(String(Math.floor(Math.random() * 99999)));
      ticks++;
      if (ticks >= 12) {
        clearInterval(intervalRef.current!);
        const correct = hashString(input + getDateString()) % 2 === 0;
        setDisplayValue(String(hashString(input) % 9000 + 1000));
        setResult(correct);
        setPhase("done");
        if (correct) confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ["#a78bfa", "#34d399", "#fbbf24"] });
        setTimeout(() => onFinish(correct), 1600);
      }
    }, 80);
  }

  return (
    <div className={styles.page}>
      <div className={styles.title}>Enter a Number</div>
      <div className={styles.subtitle}>Any number. Any text. We'll figure it out.</div>

      {phase === "idle" && (
        <>
          <input
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="your number here..."
            autoFocus
          />
          <button className={styles.btn} onClick={handleSubmit} disabled={!input.trim()}>
            Submit
          </button>
        </>
      )}

      {phase === "scrambling" && (
        <div className={styles.scrambling}>{displayValue || "..."}</div>
      )}

      {phase === "done" && (
        <>
          <div className={styles.processed}>{displayValue}</div>
          <div className={result ? styles.won : styles.lost}>
            {result ? "numdlewang! 🎉" : "numblewrong. :("}
          </div>
        </>
      )}
    </div>
  );
}
