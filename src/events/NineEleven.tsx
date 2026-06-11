import { useState, useEffect } from "react";
import styles from "./NineEleven.module.css";

interface Props {
  onFinish: (result: "neutral") => void;
}

export function NineEleven({ onFinish }: Props) {
  const [phase, setPhase] = useState<"flying" | "memorial">("flying");
  const [taunt, setTaunt] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase("memorial"), 3200);
    return () => clearTimeout(t);
  }, []);

  function handleSceneClick() {
    if (phase !== "flying") return;
    setTaunt(true);
    setTimeout(() => setTaunt(false), 1800);
  }

  return (
    <div className={styles.page}>
      {phase === "flying" && (
        <div className={styles.scene} onClick={handleSceneClick}>
          {taunt && <div className={styles.taunt}>You cannot change the past!</div>}
          <div className={styles.planeLeft}>✈️</div>
          <div className={styles.towers}>
            <div className={styles.tower}>9</div>
            <div className={styles.tower}>11</div>
          </div>
          <div className={styles.planeRight}>
            <span className={styles.flipped}>✈️</span>
          </div>
        </div>
      )}

      {phase === "memorial" && (
        <div className={styles.memorial}>
          <div className={styles.icons}>🇺🇸 😢</div>
          <p className={styles.caption}>Will you promise to remember?</p>
          <button className={styles.promiseBtn} onClick={() => onFinish("neutral")}>
            I will remember.
          </button>
        </div>
      )}
    </div>
  );
}
