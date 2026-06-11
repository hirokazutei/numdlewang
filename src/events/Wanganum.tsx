import { useState, useEffect, useMemo } from "react";
import { createRng } from "../seed";
import styles from "./Wanganum.module.css";

interface Props {
  duration: number;
  roundLabel: string;
  onFinish: (correct: boolean) => void;
  onRotateStart?: () => void;
  onRotateEnd?: () => void;
}

export function Wanganum({ duration, roundLabel, onFinish, onRotateStart, onRotateEnd }: Props) {
  const [phase, setPhase] = useState<"rotating" | "done" | "interrupted">("rotating");

  const bgItems = useMemo(() => {
    const rng = createRng(String(duration));
    return Array.from({ length: 28 }, (_, i) => ({
      value: String(Math.floor(rng() * 9999)),
      x: Math.floor(rng() * 90),
      y: Math.floor(rng() * 90),
      size: 1.0 + rng() * 3.0,
      speed: 3 + rng() * 9,
      reverse: rng() > 0.5,
      opacity: 0.07 + rng() * 0.13,
      id: i,
    }));
  }, [duration]);

  // Signal the app header to start / stop rotating
  useEffect(() => {
    onRotateStart?.();
    return () => onRotateEnd?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "rotating") return;
    const id = setTimeout(() => {
      setPhase("done");
      setTimeout(() => onFinish(true), 2200);
    }, duration);
    return () => clearTimeout(id);
  }, [phase, duration, onFinish]);

  function handleInterrupt() {
    if (phase !== "rotating") return;
    setPhase("interrupted");
    setTimeout(() => onFinish(false), 1200);
  }

  return (
    <div className={styles.overlay}>
      {bgItems.map(item => (
        <div
          key={item.id}
          className={`${styles.bgNum} ${item.reverse ? styles.spinCcw : styles.spinCw}`}
          style={{
            left: `${item.x}%`, top: `${item.y}%`,
            fontSize: `${item.size}rem`, opacity: item.opacity,
            animationDuration: `${item.speed}s`,
          }}
        >
          {item.value}
        </div>
      ))}

      <div
        className={styles.rotating}
        style={{ animationPlayState: phase !== "rotating" ? "paused" : "running" }}
      >
        {/* roundLabel rotates — the real app title (above overlay) rotates via CSS class */}
        <div className={styles.roundLabel}>{roundLabel}</div>
        <div className={styles.eventTitle}>Let's rotate the board!</div>
        {phase === "rotating" && (
          <button className={styles.interruptBtn} onClick={handleInterrupt}>
            Interrupt
          </button>
        )}
      </div>

      {phase === "done" && (
        <div className={styles.doneText}>Everything has been sufficiently rotated.</div>
      )}
      {phase === "interrupted" && (
        <div className={styles.lost}>numblewrong. :(</div>
      )}
    </div>
  );
}
