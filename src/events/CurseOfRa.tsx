import { useEffect, useRef } from "react";
import styles from "./CurseOfRa.module.css";

interface Props {
  onFinish: (result: "neutral") => void;
}

const GLYPHS = Array.from({ length: 256 }, (_, i) => String.fromCodePoint(0x13000 + i));

export function CurseOfRa({ onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const FONT_SIZE = 36; // larger glyphs
    const cols = Math.floor(canvas.width / FONT_SIZE);
    const drops = Array.from({ length: cols }, () => -Math.floor(Math.random() * 30));

    ctx.font = `${FONT_SIZE}px "Noto Sans Egyptian Hieroglyphs", serif`;

    const id = setInterval(() => {
      ctx.fillStyle = "rgba(13, 13, 26, 0.07)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        if (drops[i] < 0) { drops[i] += 0.5; continue; }

        const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        ctx.fillStyle = "#fffde7";
        ctx.fillText(char, i * FONT_SIZE, Math.floor(drops[i]) * FONT_SIZE);

        if (Math.floor(drops[i]) * FONT_SIZE > canvas.height) {
          drops[i] = Math.random() > 0.7 ? 0 : -Math.floor(Math.random() * 20);
        } else {
          drops[i] += 0.7;
        }
      }
    }, 40);

    return () => { clearInterval(id); window.removeEventListener("resize", resize); };
  }, []);

  // 10-second auto-resolve
  useEffect(() => {
    const id = setTimeout(() => onFinish("neutral"), 10000);
    return () => clearTimeout(id);
  }, [onFinish]);

  return (
    <div className={styles.page}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.content}>
        <div className={styles.title}>☥ CURSE OF RA ☥</div>
      </div>
    </div>
  );
}
