import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import type { Round } from "../gameLogic";
import styles from "./TakePicture.module.css";

interface Props {
  round: Round;
  onFinish: (correct: boolean) => void;
}

type Phase = "idle" | "live" | "result" | "denied";

export function TakePicture({ round, onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [caption, setCaption] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setPhase("live");

      setTimeout(() => {
        stream.getTracks().forEach(t => t.stop());
        const correct = round.eventWin ?? true;
        setCaption(correct ? "That's a good numdle!" : "your face is not numdlewang.");
        setPhase("result");
        if (correct) confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 }, colors: ["#a78bfa", "#34d399", "#fbbf24"] });
        setTimeout(() => onFinish(correct), 2500);
      }, 2000);
    } catch {
      setPhase("denied");
      setTimeout(() => onFinish(false), 1500);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.title}>Take a Picture</div>

      {phase === "idle" && (
        <>
          <div className={styles.icon}>📷</div>
          <p className={styles.prompt}>Turn on your camera to submit your answer.</p>
          <button className={styles.btn} onClick={startCamera}>Allow Camera</button>
        </>
      )}

      {(phase === "live" || phase === "result") && (
        <div className={styles.videoWrap}>
          <video ref={videoRef} className={styles.video} muted playsInline autoPlay />
          {phase === "result" && (
            <div className={`${styles.caption} ${round.eventWin ? styles.captionWin : styles.captionLose}`}>
              {caption}
            </div>
          )}
        </div>
      )}

      {phase === "denied" && (
        <>
          <div className={styles.icon}>🚫</div>
          <p className={styles.denied}>Camera denied.</p>
          <div className={styles.lost}>numblewrong. :(</div>
        </>
      )}
    </div>
  );
}
