import { useState, useEffect, useMemo } from "react";
import { createRng } from "../seed";
import styles from "./Wanganum.module.css";

interface Props {
  duration: number; // ms
  onFinish: (correct: boolean) => void;
}

export function Wanganum({ duration, onFinish }: Props) {
  const [msLeft, setMsLeft] = useState(duration);
  const [phase, setPhase] = useState<"rotating" | "done" | "interrupted">("rotating");

  // Background numbers seeded from duration
  const bgItems = useMemo(() => {
    const rng = createRng(String(duration));
    return Array.from({ length: 24 }, (_, i) => ({
      value: String(Math.floor(rng() * 9999)),
      x: Math.floor(rng() * 85),
      y: Math.floor(rng() * 85),
      size: 1.2 + rng() * 2.8,
      speed: 2 + rng() * 8,
      reverse: rng() > 0.5,
      opacity: 0.08 + rng() * 0.12,
      id: i,
    }));
  }, [duration]);

  useEffect(() => {
    if (phase !== "rotating") return;
    const TICK = 100;
    const id = setInterval(() => {
      setMsLeft(t => {
        if (t <= TICK) {
          clearInterval(id);
          setPhase("done");
          setTimeout(() => onFinish(true), 2200);
          return 0;
        }
        return t - TICK;
      });
    }, TICK);
    return () => clearInterval(id);
  }, [phase, onFinish]);

  function handleInterrupt() {
    if (phase !== "rotating") return;
    setPhase("interrupted");
    setTimeout(() => onFinish(false), 1200);
  }

  const secs = Math.ceil(msLeft / 1000);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div className={styles.page}>
      {/* Floating background numbers */}
      {bgItems.map(item => (
        <div
          key={item.id}
          className={styles.bgNum}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.size}rem`,
            opacity: item.opacity,
            animationDuration: `${item.speed}s`,
            animationDirection: item.reverse ? "reverse" : "normal",
          }}
        >
          {item.value}
        </div>
      ))}

      {/* Rotating UI layer */}
      <div
        className={styles.rotating}
        style={{ animationPlayState: phase !== "rotating" ? "paused" : "running" }}
      >
        <div className={styles.title}>Let's rotate the board!</div>
        <div className={styles.timer}>{mm}:{ss}</div>
        {phase === "rotating" && (
          <button className={styles.interruptBtn} onClick={handleInterrupt}>
            Interrupt
          </button>
        )}
      </div>

      {phase === "done" && (
        <div className={styles.doneText}>
          Everything has been sufficiently rotated.
        </div>
      )}

      {phase === "interrupted" && (
        <div className={styles.lost}>numblewrong. :(</div>
      )}
    </div>
  );
}
