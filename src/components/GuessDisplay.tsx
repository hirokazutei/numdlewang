import type { GuessItem } from "../gameLogic";
import styles from "./GuessDisplay.module.css";

interface Props {
  guesses: GuessItem[];
}

export function GuessDisplay({ guesses }: Props) {
  return (
    <div className={styles.row}>
      {guesses.map((g, i) => (
        <span key={i} className={`${styles.token} ${styles[g.type]}`}>
          {g.value}
        </span>
      ))}
    </div>
  );
}
