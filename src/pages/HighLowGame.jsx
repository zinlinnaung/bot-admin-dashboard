import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, RotateCcw, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

const SETTINGS = {
  MIN_BET: 500,
  MAX_BET: 100000,
  MULTIPLIER: 1.9, // Dice games usually have slightly higher payouts
  BASE_WIN_RATIO: 45,
};

// Component for a single Die face
const Die = ({ value, rolling }) => {
  const dotPattern = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  return (
    <motion.div
      animate={
        rolling
          ? {
              rotate: [0, 90, 180, 270, 360],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }
          : { rotate: 0, y: 0 }
      }
      transition={
        rolling
          ? { duration: 0.2, repeat: Infinity }
          : { type: "spring", stiffness: 300 }
      }
      className="w-16 h-16 bg-white rounded-xl shadow-inner border-b-4 border-gray-300 flex items-center justify-center p-2 relative"
    >
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {(dotPattern[value] || []).includes(i) && (
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full shadow-sm" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const DiceGame = () => {
  const [balance, setBalance] = useState(50000);
  const [betAmount, setBetAmount] = useState("");
  const [gameState, setGameState] = useState("BETTING"); // BETTING, ROLLING, RESULT
  const [dice, setDice] = useState([1, 1]);
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const rollDice = (choice) => {
    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount < SETTINGS.MIN_BET)
      return setError(`Min: ${SETTINGS.MIN_BET}`);
    if (amount > balance) return setError("Low balance!");

    setError("");
    setGameState("ROLLING");
    setBalance((prev) => prev - amount);

    // Roll duration
    setTimeout(() => {
      calculateOutcome(choice, amount);
    }, 1800);
  };

  const calculateOutcome = (choice, amount) => {
    const randomChance = Math.floor(Math.random() * 100);
    const isWin = randomChance < SETTINGS.BASE_WIN_RATIO;

    // Logic for 1-12 range
    let total;
    if (isWin) {
      total =
        choice === "HIGH"
          ? Math.floor(Math.random() * 6) + 7
          : Math.floor(Math.random() * 6) + 1;
    } else {
      total =
        choice === "HIGH"
          ? Math.floor(Math.random() * 6) + 1
          : Math.floor(Math.random() * 6) + 7;
    }

    // Split total into two dice faces (Visual only)
    let d1, d2;
    if (total === 1) {
      d1 = 1;
      d2 = 0;
    } // Special case for "1"
    else {
      d1 = Math.min(6, Math.max(1, Math.floor(total / 2)));
      d2 = total - d1;
      // If d2 > 6 (e.g. total 12), re-balance
      if (d2 > 6) {
        d1 += d2 - 6;
        d2 = 6;
      }
    }

    setDice([d1, d2]);
    const payout = isWin ? amount * SETTINGS.MULTIPLIER : 0;

    if (isWin) {
      setBalance((prev) => prev + payout);
      confetti({
        particleCount: 150,
        spread: 60,
        colors: ["#fbbf24", "#34d399"],
      });
    }

    setLastResult({ total, isWin, payout, choice });
    setGameState("RESULT");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
      {/* Wallet Header */}
      <div className="w-full max-w-sm bg-neutral-900 p-4 rounded-2xl mb-8 flex justify-between border border-neutral-800 shadow-2xl">
        <div className="flex items-center gap-3">
          <Wallet className="text-amber-400" />
          <span className="font-mono text-xl font-bold">
            {balance.toLocaleString()}{" "}
            <span className="text-xs text-neutral-500">MMK</span>
          </span>
        </div>
      </div>

      {/* Table Area */}
      <div className="w-full max-w-sm bg-emerald-900 rounded-[2.5rem] p-8 border-8 border-amber-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Felt Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:20px_20px]" />

        <div className="flex justify-center gap-6 mb-10">
          <Die value={dice[0]} rolling={gameState === "ROLLING"} />
          <Die value={dice[1]} rolling={gameState === "ROLLING"} />
        </div>

        <div className="text-center mb-8">
          <AnimatePresence mode="wait">
            {gameState === "ROLLING" ? (
              <motion.div
                key="roll"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-amber-400 font-bold italic animate-pulse"
              >
                SHAKING...
              </motion.div>
            ) : lastResult ? (
              <motion.div
                key="res"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="text-4xl font-black mb-1">
                  {lastResult.total}
                </div>
                <div
                  className={`text-sm font-bold uppercase tracking-widest ${lastResult.isWin ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {lastResult.total <= 6 ? "LOW" : "HIGH"} -{" "}
                  {lastResult.isWin ? "YOU WIN!" : "YOU LOST"}
                </div>
              </motion.div>
            ) : (
              <div className="text-neutral-300 font-medium">Place your bet</div>
            )}
          </AnimatePresence>
        </div>

        {/* Input & Buttons */}
        <div className="space-y-4 relative z-10">
          {gameState === "BETTING" && (
            <>
              <div className="relative">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Bet Amount"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-center text-xl font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {error && (
                  <p className="text-rose-400 text-xs mt-1 absolute w-full text-center font-bold">
                    {error}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => rollDice("LOW")}
                  className="bg-rose-600 hover:bg-rose-500 py-4 rounded-xl font-black shadow-[0_4px_0_rgb(159,18,57)] active:shadow-none active:translate-y-1 transition-all"
                >
                  LOW (1-6)
                </button>
                <button
                  onClick={() => rollDice("HIGH")}
                  className="bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black shadow-[0_4px_0_rgb(30,58,138)] active:shadow-none active:translate-y-1 transition-all"
                >
                  HIGH (7-12)
                </button>
              </div>
            </>
          )}

          {gameState === "RESULT" && (
            <button
              onClick={() => setGameState("BETTING")}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-[0_4px_0_rgb(180,83,9)] active:shadow-none active:translate-y-1 transition-all"
            >
              <RotateCcw size={20} /> TRY AGAIN
            </button>
          )}
        </div>
      </div>

      {/* Rules */}
      <div className="mt-8 text-neutral-500 text-xs flex gap-4 uppercase font-bold tracking-tighter">
        <span>Multiplier: {SETTINGS.MULTIPLIER}x</span>
        <span>•</span>
        <span>Fair Play Guaranteed</span>
      </div>
    </div>
  );
};

export default DiceGame;
