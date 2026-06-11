import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import type { Round } from "../gameLogic";
import { getDateString, hashString } from "../seed";
import styles from "./EnterNumber.module.css";

interface Props {
  round: Round;
  onFinish: (correct: boolean) => void;
}

// Scramble tokens mirror the game's type distribution
const _MATH = ["√","∛","!","∑","∏","∂","∫","∞","≈","±","÷","×"];
const _LETTERS = "abcdefghijklmnopqrstuvwxyz";
const _GLYPHS = [..."𓀀𓀁𓀂𓀃𓀄𓀅𓀆𓀇𓀈𓀉𓀊𓀋𓀌𓀍𓀎𓀏𓀐𓀑𓀒𓀓𓀤𓀥𓀦𓀧"];
const _FOOD = ["寿司","ラーメン","天ぷら","餃子","たこ焼き","うどん","刺身","豆腐"];

function randomScramble(): string {
  const r = Math.random();
  if (r < 0.03) return _MATH[Math.floor(Math.random() * _MATH.length)];
  if (r < 0.06) return _LETTERS[Math.floor(Math.random() * _LETTERS.length)];
  if (r < 0.08) return _GLYPHS[Math.floor(Math.random() * _GLYPHS.length)];
  if (r < 0.10) return _FOOD[Math.floor(Math.random() * _FOOD.length)];
  return String(Math.floor(Math.random() * 9999));
}

function computedOutput(input: string): string {
  const h = hashString(input + getDateString());
  const outputs = [
    String(h % 9000 + 1000),
    `${(h % 100).toFixed(2)}%`,
    `√${h % 999}`,
    `∑(${h % 26})`,
    `π×${h % 99}`,
    `${h % 42}!`,
    String.fromCodePoint(0x13000 + (h % 0xff)),
    `e^${(h % 10) + 1}`,
    `${h % 256} mod 7`,
  ];
  return outputs[h % outputs.length];
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
      setDisplayValue(randomScramble());
      ticks++;
      if (ticks >= 14) {
        clearInterval(intervalRef.current!);
        const correct = hashString(input + getDateString()) % 2 === 0;
        setDisplayValue(computedOutput(input));
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
        <div className={styles.scrambling}>{displayValue || "…"}</div>
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
