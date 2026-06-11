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

type Dir = "top" | "right" | "bottom" | "left";

const FINGER: Record<Dir, string> = {
  top: "👇",    // above → pointing down
  right: "👈",  // right → pointing left
  bottom: "👆", // below → pointing up
  left: "👉",   // left → pointing right
};

const SPEECH_STYLE: Record<Dir, React.CSSProperties> = {
  top:    { bottom: "8%",  left:  "2%",  maxWidth: 200 },
  right:  { top:   "30%", left:  "2%",  maxWidth: 200 },
  bottom: { top:   "8%",  right: "2%",  maxWidth: 200 },
  left:   { top:   "30%", right: "2%",  maxWidth: 200 },
};

export function HelpfulKnower({ round, onFinish }: Props) {
  const [showKnower, setShowKnower] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const hint = round.knowerHint ?? 0;
  const dir: Dir = round.knowerDirection ?? "top";

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

  // Inline style for the directional finger box relative to the token
  function fingerBoxStyle(i: number): React.CSSProperties {
    if (hint !== i) return {};
    switch (dir) {
      case "top":    return { position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" };
      case "bottom": return { position: "absolute", top:    "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" };
      case "left":   return { position: "absolute", right:  "calc(100% + 6px)", top:  "50%", transform: "translateY(-50%)" };
      case "right":  return { position: "absolute", left:   "calc(100% + 6px)", top:  "50%", transform: "translateY(-50%)" };
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.prompt}>Pick a number</div>

      <div className={styles.tokens}>
        {round.guesses.map((g, i) => (
          <div key={i} className={styles.tokenWrap}>
            {showKnower && hint === i && (
              <div style={fingerBoxStyle(i)} className={styles.finger}>
                {FINGER[dir]}
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

      {/* Floating speech bubble on screen edge */}
      {showKnower && (
        <div className={styles.speech} style={{ position: "fixed", ...SPEECH_STYLE[dir] }}>
          psst! I'm the Amazing Numbler Knower! I know the numbler. Pick this one! Trust me!
        </div>
      )}

      {result !== null && (
        <div className={result ? styles.won : styles.lost}>
          {result ? "numdlewang! 🎉" : "numblewrong. :("}
        </div>
      )}
    </div>
  );
}
