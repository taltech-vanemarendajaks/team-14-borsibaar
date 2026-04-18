"use client";

import { useState } from "react";

type Item = {
  name: string;
  price: number;
};

const ITEMS: Item[] = [
  { name: "Beer (0.5L)", price: 6 },
  { name: "Cocktail", price: 10 },
  { name: "Vodka shot", price: 4 },
  { name: "Burger", price: 12 },
  { name: "Coffee", price: 3 },
  { name: "Pizza slice", price: 5 },
];

function randomItem(): Item {
  return ITEMS[Math.floor(Math.random() * ITEMS.length)];
}

export default function GuessThePricePage() {
  const [item, setItem] = useState<Item>(() => randomItem());
  const [guess, setGuess] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);

  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const correctPrice = item.price;

  const startNewRound = () => {
    setItem(randomItem());
    setGuess("");
  };

  const submitGuess = () => {
    if (gameOver) return;

    const num = Number(guess);

    if (Number.isNaN(num)) {
      setResult("Enter a valid number");
      return;
    }

    const isCorrect = num === correctPrice;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setResult("Correct!");

      if (newStreak >= 3) {
        setGameOver(true);
        return;
      }

      startNewRound();
    } else {
      setStreak(0);
      setResult(`Wrong. Correct: €${correctPrice}`);

      // IMPORTANT: restart game immediately on wrong guess
      startNewRound();
    }
  };

  const resetGame = () => {
    setItem(randomItem());
    setGuess("");
    setResult(null);
    setStreak(0);
    setGameOver(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <h1 className="text-3xl mb-2">Guess The Price</h1>

      <p className="text-xs text-white/60">
        3 rounds. Get all guesses right and win snacks.
      </p>
      <p className="text-sm text-white/60 mb-4">
        Streak: {streak} / 3
      </p>

      <div className="w-full max-w-md rounded-xl bg-gray-900 p-6 text-center">

        <p className="text-lg mb-4">Item:</p>

        <p className="text-2xl font-semibold mb-6">{item.name}</p>

        <input
          type="number"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          className="w-full p-2 rounded bg-black border border-white/20 text-white mb-4"
          placeholder="Your guess (€)"
        />

        <button
          onClick={submitGuess}
          disabled={gameOver}
          className="w-full bg-pink-600 hover:bg-pink-700 py-2 rounded mb-3 disabled:opacity-50"
        >
          Submit
        </button>

        {gameOver && (
          <button
            onClick={resetGame}
            className="w-full bg-green-600 hover:bg-green-700 py-2 rounded mb-3"
          >
            New game
          </button>
        )}

        {result && (
          <p className="mt-4 text-sm text-white/70">{result}</p>
        )}

        {gameOver && (
          <p className="mt-4 text-xl text-green-400 font-light">
            🏆 You won snacks!
          </p>
        )}
      </div>
    </div>
  );
}