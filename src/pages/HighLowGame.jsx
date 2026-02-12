import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, RotateCcw, ChevronLeft } from "lucide-react";
import confetti from "canvas-confetti";

// API URL ကို လူကြီးမင်းရဲ့ Backend URL ပြောင်းပေးရန်
const API_BASE_URL =
  "https://telegram-ecommerce-bot-backend-production.up.railway.app";

const HighLowGame = () => {
  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState("");
  const [gameState, setGameState] = useState("BETTING"); // BETTING, ROLLING, RESULT
  const [showResultText, setShowResultText] = useState(false);
  const [resultNum, setResultNum] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Telegram WebApp Object
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand(); // Screen အပြည့်ချဲ့ခြင်း
    }
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const userId = tg?.initDataUnsafe?.user?.id; // Test အတွက် ID တစ်ခုခုထည့်ထားနိုင်သည်
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`);
      const data = await response.json();
      setBalance(Number(data.balance));

      // URL ကနေ amount ပါလာရင် auto set လုပ်မယ်
      const params = new URLSearchParams(window.location.search);
      const urlAmount = params.get("amount");
      if (urlAmount) setBetAmount(urlAmount);
    } catch (error) {
      console.error("Failed to fetch balance", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (choice) => {
    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount <= 0)
      return alert("ပမာဏ မှန်ကန်စွာရိုက်ထည့်ပါ။");
    if (amount > balance) return alert("လက်ကျန်ငွေ မလုံလောက်ပါ။");

    setGameState("ROLLING");
    setShowResultText(false);

    try {
      const response = await fetch(`${API_BASE_URL}/game/high-low/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: tg?.initDataUnsafe?.user?.id.toString() || "YOUR_TEST_ID",
          amount: amount,
          choice: choice,
        }),
      });

      if (!response.ok) throw new Error("Server error");
      const data = await response.json();

      // ၁.၈ စက္ကန့် ဂဏန်းလှည့်ပြမယ်
      setTimeout(() => {
        setResultNum(data.resultNum);
        setBalance(data.newBalance);
        setGameState("RESULT");

        // ၀.၈ စက္ကန့်ကြာမှ စာသားပေါ်မယ်
        setTimeout(() => {
          setLastResult(data);
          setShowResultText(true);
          if (data.isWin) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
          }
        }, 800);
      }, 1800);
    } catch (error) {
      alert("Error: " + error.message);
      setGameState("BETTING");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center p-4 font-sans select-none">
      {/* Header & Balance */}
      <div className="w-full max-w-md mt-4 flex justify-between items-center bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Wallet className="text-amber-500" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
              My Balance
            </span>
            <span className="text-xl font-mono font-black tracking-tighter">
              {balance.toLocaleString()}{" "}
              <span className="text-[12px] text-amber-500">MMK</span>
            </span>
          </div>
        </div>
        <button
          onClick={() => tg?.close()}
          className="p-2 bg-white/5 rounded-full"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="w-full max-w-md mt-8">
        {/* Game Display Area */}
        <div className="bg-[#151515] rounded-[3rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="bg-black rounded-[2rem] p-12 mb-8 border border-white/5 flex flex-col items-center justify-center relative z-10">
            <AnimatePresence mode="wait">
              {gameState === "ROLLING" ? (
                <motion.div
                  key="roll"
                  className="text-8xl font-mono font-black text-amber-500"
                >
                  <SlotNumber />
                </motion.div>
              ) : (
                <motion.div
                  key="res"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <span
                    className={`text-9xl font-mono font-black transition-colors duration-500 ${showResultText ? (lastResult?.isWin ? "text-emerald-500" : "text-rose-500") : "text-white"}`}
                  >
                    {resultNum < 10 ? `0${resultNum}` : resultNum}
                  </span>

                  {showResultText && (
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="mt-4"
                    >
                      <span
                        className={`px-4 py-1 rounded-full text-xs font-black tracking-[0.2em] uppercase ${lastResult?.isWin ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}
                      >
                        {resultNum >= 50 ? "HIGH" : "LOW"} —{" "}
                        {lastResult?.isWin ? "WINNER" : "LOSER"}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Section */}
          <div className="space-y-4">
            {gameState === "BETTING" ? (
              <>
                <div className="relative">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Enter Bet Amount"
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-5 text-center text-2xl font-mono font-bold focus:outline-none focus:border-amber-500/50 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handlePlay("LOW")}
                    className="bg-rose-600 hover:bg-rose-500 py-5 rounded-[1.5rem] font-black text-lg shadow-[0_6px_0_rgb(159,18,57)] active:shadow-none active:translate-y-1 transition-all uppercase tracking-widest"
                  >
                    Low
                  </button>
                  <button
                    onClick={() => handlePlay("HIGH")}
                    className="bg-emerald-600 hover:bg-emerald-500 py-5 rounded-[1.5rem] font-black text-lg shadow-[0_6px_0_rgb(5,150,105)] active:shadow-none active:translate-y-1 transition-all uppercase tracking-widest"
                  >
                    High
                  </button>
                </div>
              </>
            ) : showResultText ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div
                  className={`p-5 rounded-2xl text-center font-black text-xl border ${lastResult?.isWin ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"}`}
                >
                  {lastResult?.isWin
                    ? `+ ${lastResult.payout.toLocaleString()}`
                    : `- ${parseInt(betAmount).toLocaleString()}`}{" "}
                  <span className="text-sm">MMK</span>
                </div>
                <button
                  onClick={() => setGameState("BETTING")}
                  className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw size={20} /> TRY AGAIN
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 font-black animate-pulse uppercase tracking-[0.3em] text-sm">
                  Waiting for result...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <p className="mt-8 text-gray-600 text-[10px] uppercase tracking-widest font-bold">
        Secure Transaction • Provably Fair
      </p>
    </div>
  );
};

// Rolling Animation Component
const SlotNumber = () => {
  const [num, setNum] = useState(0);
  useEffect(() => {
    const interval = setInterval(
      () => setNum(Math.floor(Math.random() * 100)),
      50,
    );
    return () => clearInterval(interval);
  }, []);
  return <>{num < 10 ? `0${num}` : num}</>;
};

export default HighLowGame;
