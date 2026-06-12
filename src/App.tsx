import { useState, useEffect, useCallback } from "react";
import { buildGameConfig, type SpecialEventType } from "./gameLogic";
import { getDateString, getPuzzleNumber } from "./seed";
import { loadCookie, saveCookie } from "./cookie";
import { RoundPage } from "./components/RoundPage";
import { ResultsScreen } from "./components/ResultsScreen";
import { LandingPage } from "./LandingPage";
import "./App.css";

const params = new URLSearchParams(window.location.search);
const DEV = params.has("dev");

function getInitialSeed(): string {
  if (DEV) return params.get("seed") ?? getDateString();
  return getDateString();
}

function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function App() {
  const [screen, setScreen] = useState<"landing" | "game">("landing");
  const [seed, setSeed] = useState(getInitialSeed);
  const [results, setResults] = useState<(boolean | "neutral" | "nine-eleven")[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [done, setDone] = useState(false);
  const [devForceEvent, setDevForceEvent] = useState<SpecialEventType | null>(null);
  const [headerRotating, setHeaderRotating] = useState(false);

  const config = buildGameConfig(seed);

  // Parse seed as a date if it looks like YYYY-MM-DD
  const seedDate = /^\d{4}-\d{2}-\d{2}$/.test(seed)
    ? (() => { const [y, m, d] = seed.split("-").map(Number); return new Date(y, m - 1, d); })()
    : null;
  const puzzleNumber = DEV ? 0 : getPuzzleNumber(seedDate ?? undefined);
  const isPastPuzzle = !!seedDate && seed !== getDateString();
  const isRealDay = !DEV;

  const resetGame = useCallback((newSeed: string) => {
    setSeed(newSeed);
    setResults([]);
    setCurrentRound(0);
    setDone(false);
  }, []);

  useEffect(() => {
    if (DEV) return;
    if (config.everyone_won) {
      setDone(true);
      saveCookie({ date: seed, results: [], seen: true });
      return;
    }
    const saved = loadCookie(seed);
    if (saved) {
      setResults(saved.results);
      if (saved.seen) {
        setDone(true);
      } else {
        setCurrentRound(saved.results.length);
      }
    }
  }, [seed]);

  function handleAdvance(correct: boolean | "neutral" | "nine-eleven") {
    const next = [...results, correct];
    setResults(next);
    const isLast = next.length === config.roundCount;
    if (isLast) {
      setDone(true);
      if (isRealDay) saveCookie({ date: seed, results: next, seen: true });
    } else {
      setCurrentRound(next.length);
      if (isRealDay) saveCookie({ date: seed, results: next, seen: false });
    }
  }

  const round = config.rounds[currentRound];

  if (screen === "landing") {
    return (
      <LandingPage
        onPlay={(date) => {
          if (date) setSeed(date);
          else setSeed(getDateString());
          setResults([]);
          setCurrentRound(0);
          setDone(false);
          setScreen("game");
        }}
      />
    );
  }

  return (
    <div className="app">
      <header className={`header ${headerRotating ? "header-rotating" : ""}`}>
        <h1 className="title">numdlewang</h1>
        <span className="puzzle-num">{DEV ? "dev" : `#${puzzleNumber}`}</span>
      </header>

      {DEV && (
        <>
          <div className="dev-bar">
            <span className="dev-seed">seed: <code>{seed}</code></span>
            <button className="dev-btn" onClick={() => resetGame(randomSeed())}>🎲 Roll</button>
            <button className="dev-btn" onClick={() => resetGame(getDateString())}>📅 Today</button>
            {done && <button className="dev-btn" onClick={() => resetGame(seed)}>↺ Replay</button>}
          </div>
          <div className="dev-bar dev-events">
            <span className="dev-seed">force event:</span>
            {(["nundle-storm", "enter-number", "voice", "take-picture", "helpful-knower", "wanganum", "curse-of-ra", "six-or-seven", "nine-eleven"] as SpecialEventType[]).map(e => (
              <button
                key={e}
                className={`dev-btn ${devForceEvent === e ? "dev-btn-active" : ""}`}
                onClick={() => setDevForceEvent(devForceEvent === e ? null : e)}
              >
                {e === "nundle-storm" ? "⚡ Storm" : e === "enter-number" ? "✏️ Enter" : e === "voice" ? "🎤 Voice" : e === "take-picture" ? "📷 Camera" : e === "helpful-knower" ? "👉 Knower" : e === "wanganum" ? "🌀 Wang" : e === "curse-of-ra" ? "☥ Ra" : e === "six-or-seven" ? "6/7" : "9/11"}
              </button>
            ))}
          </div>
        </>
      )}

      <main className="main">
        {done || config.everyone_won ? (
          <ResultsScreen config={config} puzzleNumber={puzzleNumber} results={results} isPastPuzzle={isPastPuzzle} />
        ) : round ? (
          <RoundPage
            key={`${seed}-${currentRound}-${devForceEvent ?? ""}`}
            round={round}
            index={currentRound}
            total={config.roundCount}
            onAdvance={handleAdvance}
            forcedEvent={DEV ? devForceEvent : null}
            onRotateStart={() => setHeaderRotating(true)}
            onRotateEnd={() => setHeaderRotating(false)}
          />
        ) : null}
      </main>
    </div>
  );
}
