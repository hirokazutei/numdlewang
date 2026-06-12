import { useState } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import type { Round, SpecialEventType } from "../gameLogic";
import { createRng } from "../seed";
import { NundleStorm } from "../events/NundleStorm";
import { EnterNumber } from "../events/EnterNumber";
import { VoiceEvent } from "../events/VoiceEvent";
import { TakePicture } from "../events/TakePicture";
import { HelpfulKnower } from "../events/HelpfulKnower";
import { Wanganum } from "../events/Wanganum";
import { CurseOfRa } from "../events/CurseOfRa";
import { SixOrSeven } from "../events/SixOrSeven";
import { NineEleven } from "../events/NineEleven";
import styles from "./RoundPage.module.css";

interface Props {
  round: Round;
  index: number;
  total: number;
  onAdvance: (result: boolean | "neutral" | "nine-eleven") => void;
  forcedEvent?: SpecialEventType | null;
  onRotateStart?: () => void;
  onRotateEnd?: () => void;
}

const TYPE_CLASS: Record<string, string> = {
  math: styles.math,
  letter: styles.letter,
  hieroglyph: styles.hieroglyph,
  number: styles.number,
  food: styles.food,
};

function resolveCorrect(round: Round, chosen: number): boolean {
  if (round.correctIndex !== null) return chosen === round.correctIndex;
  return round.seededCorrect;
}

// Build a dev-friendly version of the round for a forced event
function applyForcedEvent(round: Round, eventType: SpecialEventType): Round {
  const rng = createRng("dev-" + eventType);
  const base = { ...round, specialEvent: eventType };
  switch (eventType) {
    case "nundle-storm":
      return { ...base, stormNumbers: Array.from({ length: 20 }, () => ({ type: "number" as const, value: String(Math.floor(rng() * 999) + 1) })) };
    case "wanganum":
      return { ...base, wanganumDuration: 8000 }; // 8s in dev mode
    case "helpful-knower": {
      const dirs = ["top", "right", "bottom", "left"] as const;
      return {
        ...base,
        knowerHint: Math.floor(Math.random() * Math.max(base.guesses.length, 1)),
        knowerDirection: dirs[Math.floor(Math.random() * dirs.length)],
      };
    }
    case "voice":
    case "take-picture":
      return { ...base, eventWin: true };
    case "curse-of-ra":
      return base;
    case "six-or-seven":
      return { ...base, correctIndex: Math.floor(Math.random() * 2) as 0 | 1 };
    case "nine-eleven":
      return base;
    default:
      return base;
  }
}

export function RoundPage({ round, index, total, onAdvance, forcedEvent, onRotateStart, onRotateEnd }: Props) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const effectiveRound = forcedEvent ? applyForcedEvent(round, forcedEvent) : round;
  const eventType = effectiveRound.specialEvent;

  function handleAdvance(result: boolean | "neutral" | "nine-eleven") {
    setAdvancing(true);
    setTimeout(() => onAdvance(result), 420);
  }

  function handlePick(i: number) {
    if (chosen !== null) return;
    const result = resolveCorrect(effectiveRound, i);
    setChosen(i);
    setCorrect(result);
    if (result) confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ["#a78bfa", "#34d399", "#fbbf24", "#f87171", "#60a5fa"] });
    setTimeout(() => { setAdvancing(true); setTimeout(() => onAdvance(result), 420); }, 1400);
  }

  const revealed = chosen !== null;
  const won = revealed && correct === true;
  const manyGuesses = effectiveRound.guesses.length > 2;

  return (
    <div className={`${styles.page} ${advancing ? styles.rotateOut : styles.rotateIn}`}>
      <div className={styles.inner}>

        {/* ── Special events ───────────────────────────────────── */}
        {eventType === "nundle-storm" && (
          <NundleStorm round={effectiveRound} onFinish={handleAdvance} />
        )}
        {eventType === "enter-number" && (
          <EnterNumber round={effectiveRound} onFinish={handleAdvance} />
        )}
        {eventType === "voice" && (
          <VoiceEvent round={effectiveRound} onFinish={handleAdvance} />
        )}
        {eventType === "take-picture" && (
          <TakePicture round={effectiveRound} onFinish={handleAdvance} />
        )}
        {eventType === "helpful-knower" && (
          <HelpfulKnower round={effectiveRound} onFinish={handleAdvance} />
        )}
        {eventType === "wanganum" && (
          <Wanganum
            duration={effectiveRound.wanganumDuration ?? 8000}
            roundLabel={`Round ${index + 1} / ${total}`}
            onFinish={handleAdvance}
            onRotateStart={onRotateStart}
            onRotateEnd={onRotateEnd}
          />
        )}

        {/* ── Normal round ─────────────────────────────────────── */}
        {!eventType && (
          <>
            <div className={styles.result}>
              {!revealed && <span className={styles.prompt}>Pick a number</span>}
            </div>

            {revealed && createPortal(
              <div className={`${styles.resultOverlay} ${won ? styles.won : styles.lost}`}>
                {won ? "numdlewang! 🎉" : "numblewrong. 😢"}
              </div>,
              document.body
            )}

            <div className={`${styles.tokens} ${manyGuesses ? styles.tokensMany : ""}`}>
              {effectiveRound.guesses.map((g, i) => (
                <button
                  key={i}
                  className={`${styles.token} ${TYPE_CLASS[g.type] ?? ""} ${chosen === i ? styles.selected : ""} ${revealed && chosen !== i ? styles.dimmed : ""}`}
                  onClick={() => handlePick(i)}
                  disabled={revealed}
                >
                  {g.value}
                </button>
              ))}
            </div>

            <div className={styles.progress}>Round {index + 1} / {total}</div>
          </>
        )}

        {eventType === "curse-of-ra" && (
          <CurseOfRa onFinish={handleAdvance} />
        )}
        {eventType === "six-or-seven" && (
          <SixOrSeven round={effectiveRound} onFinish={handleAdvance} />
        )}
        {eventType === "nine-eleven" && (
          <NineEleven onFinish={handleAdvance} />
        )}

        {/* Show progress for non-fullscreen special events */}
        {eventType && eventType !== "wanganum" && eventType !== "curse-of-ra" && (
          <div className={styles.progress}>Round {index + 1} / {total}</div>
        )}
      </div>
    </div>
  );
}
