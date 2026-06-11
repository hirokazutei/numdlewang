import { useEffect, useRef, useState } from "react";
import styles from "./CurseOfRa.module.css";

interface Props {
  onFinish: (result: "neutral") => void;
}

// Approved hieroglyph range U+13000–U+130FF (human/god figures)
const GLYPHS = Array.from({ length: 256 }, (_, i) => String.fromCodePoint(0x13000 + i));

export function CurseOfRa({ onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeLeft, setTimeLeft] = useState(10);

  // Matrix rain
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d")!;
    const FONT_SIZE = 22;
    const cols = Math.floor(canvas.width / FONT_SIZE);
    const drops = Array.from({ length: cols }, () => -Math.floor(Math.random() * 30));

    ctx.font = `${FONT_SIZE}px "Noto Sans Egyptian Hieroglyphs", serif`;

    const id = setInterval(() => {
      // Fade existing characters
      ctx.fillStyle = "rgba(13, 13, 26, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        if (drops[i] < 0) { drops[i] += 0.5; continue; }

        const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const x = i * FONT_SIZE;
        const y = Math.floor(drops[i]) * FONT_SIZE;

        // Bright head
        ctx.fillStyle = "#fffde7";
        ctx.fillText(char, x, y);

        // Reset column after passing bottom
        if (y > canvas.height) {
          drops[i] = Math.random() > 0.7 ? 0 : -Math.floor(Math.random() * 20);
        } else {
          drops[i] += 0.7;
        }
      }
    }, 40);

    return () => { clearInterval(id); window.removeEventListener("resize", resize); };
  }, []);

  // 10-second countdown
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id);
          setTimeout(() => onFinish("neutral"), 600);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onFinish]);

  return (
    <div className={styles.page}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.content}>
        <div className={styles.title}>☥ CURSE OF RA ☥</div>
        <div className={styles.subtitle}>The ancient gods demand tribute</div>
        <div className={styles.countdown}>{timeLeft}</div>
        <div className={styles.note}>neutral — ½ point</div>
      </div>
    </div>
  );
}
