import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import type { GuessItem, Round } from "../gameLogic";
import { getDateString, hashString } from "../seed";
import styles from "./NundleStorm.module.css";

interface Props {
  round: Round;
  onFinish: (correct: boolean) => void;
}

// Mirrors game distribution for replacement items
const MATH_SYMS = ["√", "∛", "!", "∑", "∏", "∂", "∫", "∞", "≈", "±", "÷", "×"];
const LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const FOOD_JP = ["寿司","ラーメン","天ぷら","餃子","たこ焼き","うどん","そば","刺身","豆腐","納豆","おにぎり","カレー"];
const GLYPHS = [..."𓀀𓀁𓀂𓀃𓀄𓀅𓀆𓀇𓀈𓀉𓀊𓀋𓀌𓀍𓀎𓀏𓀐𓀑𓀒𓀓𓀤𓀥𓀦𓀧𓁴𓁵𓁶𓁷𓁸𓁹𓁺𓁻"];

function randomGuessItem(): GuessItem {
  const r = Math.random();
  if (r < 0.03) return { type: "math",      value: MATH_SYMS[Math.floor(Math.random() * MATH_SYMS.length)] };
  if (r < 0.06) return { type: "letter",    value: LETTERS[Math.floor(Math.random() * LETTERS.length)] };
  if (r < 0.08) return { type: "hieroglyph",value: GLYPHS[Math.floor(Math.random() * GLYPHS.length)] };
  if (r < 0.10) return { type: "food",      value: FOOD_JP[Math.floor(Math.random() * FOOD_JP.length)] };
  return { type: "number", value: String(1 + Math.floor(Math.random() * 9998)) };
}

type NumItem = GuessItem & { uid: number };

export function NundleStorm({ round, onFinish }: Props) {
  const initial = (round.stormNumbers ?? round.guesses).map((g, i) => ({ ...g, uid: i }));
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
    clickedValsRef.current = [...clickedValsRef.current, nums[idx].value];
    const newItem = { ...randomGuessItem(), uid: uidCounter };
    setUidCounter(c => c + 1);
    setNums(prev => { const n = [...prev]; n[idx] = newItem; return n; });
  }

  const typeClass: Record<string, string> = {
    math: styles.math, letter: styles.letter,
    hieroglyph: styles.hieroglyph, food: styles.food, number: styles.num,
  };

  return (
    <div className={styles.page}>
      <div className={styles.title}>⚡ NUNDLE STORM ⚡</div>
      <div className={styles.timer} style={{ color: timeLeft <= 3 ? "#f87171" : "#fbbf24" }}>
        {timeLeft}s
      </div>
      <div className={styles.grid}>
        {nums.map((g, idx) => (
          <button
            key={g.uid}
            className={`${styles.btn} ${typeClass[g.type] ?? styles.num}`}
            onClick={() => handleClick(idx)}
          >
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
