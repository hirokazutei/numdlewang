import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import type { Round } from "../gameLogic";
import styles from "./TakePicture.module.css";

interface Props {
  round: Round;
  onFinish: (correct: boolean) => void;
}

type Phase = "idle" | "live" | "result" | "denied";

const DETECT_MSGS = [
  "detecting a good numdler...",
  "show me who is a good numdler.",
  "scanning for numdle energy...",
  "analyzing numdle potential...",
  "calibrating the numdle detector...",
  "preparing to judge your face...",
  "computing numdle coefficient...",
];

export function TakePicture({ round, onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [caption, setCaption] = useState("");
  const [msgIdx, setMsgIdx] = useState(0);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const delayRef = useRef(2000 + Math.floor(Math.random() * 3001));

  // Attach stream to video element after React renders the video node
  useEffect(() => {
    if (phase === "live" && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [phase]);

  // Cycle detection messages while live
  useEffect(() => {
    if (phase !== "live") return;
    const id = setInterval(() => setMsgIdx(m => (m + 1) % DETECT_MSGS.length), 700);
    return () => clearInterval(id);
  }, [phase]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setPhase("live"); // video element renders, then useEffect above attaches stream

      setTimeout(() => {
        // Capture frame
        if (videoRef.current && canvasRef.current) {
          const vid = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = vid.videoWidth || 320;
          canvas.height = vid.videoHeight || 240;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.save();
            ctx.scale(-1, 1); // mirror to match display
            ctx.drawImage(vid, -canvas.width, 0);
            ctx.restore();
            setSnapshot(canvas.toDataURL("image/jpeg", 0.85));
          }
        }

        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        const correct = round.eventWin ?? true;
        setCaption(correct ? "That's a good numdle!" : "your face is not numdlewang.");
        setPhase("result");
        if (correct) confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 }, colors: ["#a78bfa", "#34d399", "#fbbf24"] });
        setTimeout(() => onFinish(correct), 2500);
      }, delayRef.current);
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
          <button className={styles.btn} onClick={startCamera}>📷 Allow Camera</button>
        </>
      )}

      {phase === "live" && (
        <div className={styles.videoWrap}>
          <video ref={videoRef} className={styles.video} muted playsInline />
          <div className={styles.detecting}>{DETECT_MSGS[msgIdx]}</div>
        </div>
      )}

      {phase === "result" && (
        <div className={styles.videoWrap}>
          {snapshot
            ? <img src={snapshot} className={styles.video} alt="captured" />
            : <video ref={videoRef} className={styles.video} muted playsInline />
          }
          <div className={`${styles.caption} ${round.eventWin ? styles.captionWin : styles.captionLose}`}>
            {caption}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />

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
