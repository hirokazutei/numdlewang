import { useState } from "react";
import confetti from "canvas-confetti";
import type { Round } from "../gameLogic";
import { createRng } from "../seed";
import styles from "./VoiceEvent.module.css";

interface Props {
  round: Round;
  onFinish: (correct: boolean) => void;
}

type Phase = "idle" | "listening" | "heard" | "denied";

export function VoiceEvent({ round, onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [heardNumber, setHeardNumber] = useState("");

  async function startListening() {
    setPhase("listening");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try Web Speech Recognition if available
      const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
      let resolved = false;

      function finish() {
        if (resolved) return;
        resolved = true;
        stream.getTracks().forEach(t => t.stop());
        const rng = createRng(String(Date.now()));
        const n = String(Math.floor(rng() * 9999));
        setHeardNumber(n);
        setPhase("heard");
        const correct = round.eventWin ?? true;
        if (correct) confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 }, colors: ["#a78bfa", "#34d399", "#fbbf24"] });
        setTimeout(() => onFinish(correct), 2000);
      }

      if (SR) {
        const recognition = new SR();
        recognition.lang = "en-US";
        recognition.onresult = finish;
        recognition.onerror = finish;
        recognition.onend = finish;
        recognition.start();
        setTimeout(finish, 4000); // timeout after 4s
      } else {
        setTimeout(finish, 2500); // no SR, just wait
      }
    } catch {
      setPhase("denied");
      setTimeout(() => onFinish(false), 1500);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.title}>Say a Number</div>

      {phase === "idle" && (
        <>
          <div className={styles.icon}>🎤</div>
          <p className={styles.prompt}>Grant microphone access and say any number.</p>
          <button className={styles.btn} onClick={startListening}>Allow Microphone</button>
        </>
      )}

      {phase === "listening" && (
        <>
          <div className={styles.icon + " " + styles.pulse}>🎤</div>
          <p className={styles.prompt}>Listening…</p>
          <div className={styles.waves}>
            <span /><span /><span /><span /><span />
          </div>
        </>
      )}

      {phase === "heard" && (
        <>
          <div className={styles.icon}>🎤</div>
          <p className={styles.heard}>I heard… <strong>{heardNumber}</strong></p>
          <div className={round.eventWin ? styles.won : styles.lost}>
            {round.eventWin ? "numdlewang! 🎉" : "numblewrong. :("}
          </div>
        </>
      )}

      {phase === "denied" && (
        <>
          <div className={styles.icon}>🚫</div>
          <p className={styles.denied}>Microphone denied.</p>
          <div className={styles.lost}>numblewrong. :(</div>
        </>
      )}
    </div>
  );
}
