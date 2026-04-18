"use client";

import { useRef, useState } from "react";

type GameState =
  | "idle"
  | "waiting"
  | "ready"
  | "win"
  | "fail";

export default function ReactionRush() {
  const [state, setState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [streak, setStreak] = useState(0);
  const [attemptResults, setAttemptResults] = useState<number[]>([]);

  const startTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_ATTEMPTS = 3;
  const LIMIT = 400;

  const startRound = () => {
    setReactionTime(null);
    setState("waiting");

    const delay = 2000 + Math.random() * 3000;

    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setState("ready");
    }, delay);
  };

  const reset = () => {
    setState("idle");
    setReactionTime(null);
    setAttempt(0);
    setStreak(0);
    setAttemptResults([]);
    startTimeRef.current = null;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const endGame = (success: boolean) => {
    setState(success ? "win" : "fail");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    startTimeRef.current = null;
  };

  const handleBoxClick = () => {
    if (state === "idle") {
      setAttempt(1);
      startRound();
      return;
    }

    if (state === "waiting") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      endGame(false);
      return;
    }

    if (state === "ready" && startTimeRef.current) {
      const diff = Date.now() - startTimeRef.current;

      setReactionTime(diff);

      const isFast = diff < LIMIT;

      const newAttempt = attempt + 1;

      setAttemptResults((prev) => [...prev, diff]);

      const newStreak = isFast ? streak + 1 : streak;
      setStreak(newStreak);

      if (!isFast) {
        endGame(false);
        return;
      }

      if (newAttempt >= MAX_ATTEMPTS && newStreak === MAX_ATTEMPTS) {
        endGame(true);
        return;
      }

      setAttempt(newAttempt);
      startRound();
    }
  };

  const boxColor =
    state === "ready"
      ? "bg-green-500"
      : state === "waiting"
      ? "bg-red-500"
      : state === "fail"
      ? "bg-red-700"
      : state === "win"
      ? "bg-green-700"
      : "bg-white/10";

  const showNewGameButton = state === "win" || state === "fail";

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="w-full max-w-md text-center space-y-6">

        <h1 className="text-3xl font-light tracking-wide">
          Reaction Rush
        </h1>

        {/* RULES */}
        <p className="text-xs text-white/60">
          3 rounds. Each reaction must be under 400ms. Any slow or early tap ends the game.
        </p>

        {/* PROGRESS */}
        <div className="text-sm text-white/60">
          Attempt: {attempt} / 3
        </div>

        {/* GAME BOX */}
        <div
          onClick={handleBoxClick}
          className={`
            w-full h-56 flex items-center justify-center rounded-2xl
            select-none cursor-pointer transition-all duration-200
            ${boxColor}
          `}
        >
          {state === "idle" && "Tap to start"}
          {state === "waiting" && "Wait for green..."}
          {state === "ready" && "TAP NOW!"}
          {state === "fail" && "Failed"}
          {state === "win" && "🏆 You won snacks!"}
        </div>

        {/* REACTION HISTORY */}
        {attemptResults.length > 0 && (
          <div className="text-sm text-white/70 space-y-1">
            {attemptResults.map((t, i) => (
              <div key={i}>
                Try {i + 1}: {t} ms {t < LIMIT ? "✅" : "❌"}
              </div>
            ))}
          </div>
        )}

        {/* RESULT INFO */}
        {state === "ready" && reactionTime !== null && (
          <p className="text-lg">{reactionTime} ms</p>
        )}

        {/* NEW GAME BUTTON */}
        {showNewGameButton && (
          <button
            onClick={reset}
            className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-700 transition"
          >
            New game
          </button>
        )}
      </div>
    </div>
  );
}