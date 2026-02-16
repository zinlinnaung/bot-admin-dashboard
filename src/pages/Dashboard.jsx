import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  ArrowUpCircle,
  TrendingUp,
  DollarSign,
  Activity,
  Wallet,
  Trophy,
  Loader2,
  Settings2,
  ShieldCheck,
  Percent,
  Clock, // Added Icon
} from "lucide-react";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [stats, setStats] = useState({
    userCount: 0,
    deposits: [],
    withdrawals: [],
    todayRevenue: 0,
    todayWithdraw: 0,
    netProfit: 0,
  });

  // 💡 Bet Settings States
  const [settings, setSettings] = useState({
    winRatio: 40,
    minBet: 500,
    maxBet: 100000,
    payoutMultiplier: 1.8,
  });

  const [loading, setLoading] = useState(true);
  const [settleLoading, setSettleLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Result Settle States
  const [winNum, setWinNum] = useState("");
  const [gameType, setGameType] = useState("2D");
  // ✅ NEW: Session State added
  const [session, setSession] = useState("MORNING");

  const fetchData = async () => {
    try {
      // Fetch Stats & Settings together
      const [statsRes, settingsRes] = await Promise.all([
        axios.get(
          "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin/dashboard-stats",
        ),
        axios.get(
          "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin/settings",
        ),
      ]);

      setStats(statsRes.data);
      if (settingsRes.data) {
        setSettings({
          winRatio: parseInt(settingsRes.data.winRatio || 40),
          minBet: parseInt(settingsRes.data.minBet || 500),
          maxBet: parseInt(settingsRes.data.maxBet || 100000),
          payoutMultiplier: parseFloat(
            settingsRes.data.payoutMultiplier || 1.8,
          ),
        });
      }
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSettleResult = async () => {
    if (!winNum) return alert("ပေါက်ဂဏန်း ရိုက်ထည့်ပါ");

    // ✅ Updated confirmation text to include Session
    const confirmText = `${gameType} (${session}) ပေါက်ဂဏန်း [ ${winNum} ] အတည်ပြုပါသလား?`;
    if (!window.confirm(confirmText)) return;

    setSettleLoading(true);
    try {
      const res = await axios.post(
        "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin/settle-result",
        {
          type: gameType,
          winNumber: winNum,
          session: session, // ✅ Sending session to backend
        },
      );

      if (res.data.success) {
        // ✅ Handle winCount safely
        alert(
          `အောင်မြင်သည်! 🎉\nပေါက်သူစုစုပေါင်း: ${res.data.winCount || 0} ဦး`,
        );
        setWinNum("");
      } else {
        alert(res.data.message);
      }

      fetchData();
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message || "Result ထုတ်ပြန်ခြင်း မအောင်မြင်ပါ";
      alert(`Error: ${msg}`);
    } finally {
      setSettleLoading(false);
    }
  };

  // 💡 Save Bet Settings
  const handleUpdateSettings = async () => {
    setSaveLoading(true);
    try {
      await axios.post(
        "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin/update-settings",
        settings,
      );
      alert("ဂိမ်း Settings များ အောင်မြင်စွာ Update လုပ်ပြီးပါပြီ ✅");
    } catch (error) {
      alert("Settings update လုပ်ရာတွင် အမှားအယွင်းရှိနေပါသည်");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto bg-gray-50/50">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Financial Intelligence
          </h1>
          <p className="text-gray-500 mt-1">
            Real-time system monitoring & risk management control.
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-xs font-bold border border-emerald-100 uppercase tracking-wider">
          System Online
        </div>
      </div>

      {/* Financial Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={`${(stats.todayRevenue || 0).toLocaleString()} MMK`}
          icon={DollarSign}
          color="bg-indigo-600"
        />
        <StatCard
          title="Today's Payouts"
          value={`${(stats.todayWithdraw || 0).toLocaleString()} MMK`}
          icon={ArrowUpCircle}
          color="bg-rose-500"
        />
        <StatCard
          title="Net Profit"
          value={`${(stats.netProfit || 0).toLocaleString()} MMK`}
          icon={TrendingUp}
          color={stats.netProfit >= 0 ? "bg-emerald-500" : "bg-red-600"}
        />
        <StatCard
          title="Total Users"
          value={stats.userCount}
          icon={Users}
          color="bg-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 🏆 Result Announcement Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-amber-100 rounded-2xl">
                <Trophy className="text-amber-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Announce Game Results
              </h3>
            </div>

            {/* ✅ Changed to grid-cols-4 to fit Session input */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 ml-1">
                  Game Type
                </label>
                <select
                  value={gameType}
                  onChange={(e) => setGameType(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-gray-700 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="2D">2D Game</option>
                  <option value="3D">3D Game</option>
                </select>
              </div>

              {/* ✅ NEW: Session Selector */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 ml-1">
                  Session
                </label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-gray-700 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="MORNING">Morning (12:01)</option>
                  <option value="EVENING">Evening (04:30)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 ml-1">
                  Winning Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 84"
                  value={winNum}
                  onChange={(e) => setWinNum(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-gray-700 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSettleResult}
                  disabled={settleLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {settleLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Settle"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 💡 ⚙️ High-Low Bet Settings Panel */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-2xl">
                  <Settings2 className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    High-Low Risk Control
                  </h3>
                  <p className="text-xs text-gray-400">
                    Manage win ratio and bet limits
                  </p>
                </div>
              </div>
              <button
                onClick={handleUpdateSettings}
                disabled={saveLoading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2"
              >
                {saveLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Win Ratio Slider */}
              <div className="space-y-4 bg-gray-50 p-6 rounded-3xl">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-sm font-bold text-gray-600">
                    <Percent size={16} /> Win Ratio (RTP)
                  </span>
                  <span className="text-indigo-600 font-black text-xl">
                    {settings.winRatio}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.winRatio}
                  onChange={(e) =>
                    setSettings({ ...settings, winRatio: e.target.value })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <p className="text-[10px] text-gray-400 font-medium">
                  * 30-40% is recommended for consistent house profit.
                </p>
              </div>

              {/* Payout Multiplier */}
              <div className="space-y-4 bg-gray-50 p-6 rounded-3xl">
                <span className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <TrendingUp size={16} /> Payout Multiplier
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={settings.payoutMultiplier}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payoutMultiplier: e.target.value,
                    })
                  }
                  className="w-full bg-white border-none rounded-xl px-4 py-3 text-gray-700 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Min Bet */}
              <div className="space-y-4 bg-gray-50 p-6 rounded-3xl">
                <span className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <Wallet size={16} /> Minimum Bet (MMK)
                </span>
                <input
                  type="number"
                  value={settings.minBet}
                  onChange={(e) =>
                    setSettings({ ...settings, minBet: e.target.value })
                  }
                  className="w-full bg-white border-none rounded-xl px-4 py-3 text-gray-700 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Max Bet */}
              <div className="space-y-4 bg-gray-50 p-6 rounded-3xl">
                <span className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <ShieldCheck size={16} /> Maximum Bet (MMK)
                </span>
                <input
                  type="number"
                  value={settings.maxBet}
                  onChange={(e) =>
                    setSettings({ ...settings, maxBet: e.target.value })
                  }
                  className="w-full bg-white border-none rounded-xl px-4 py-3 text-gray-700 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel: System Health & Pending Actions */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-indigo-400">
              <Activity size={18} /> System Status
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-3xl border border-white/10">
                <span className="text-sm text-gray-300">New Deposits</span>
                <span className="bg-indigo-500 px-3 py-1 rounded-xl text-xs font-black">
                  {stats.deposits?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-3xl border border-white/10">
                <span className="text-sm text-gray-300">Withdraw Requests</span>
                <span className="bg-rose-500 px-3 py-1 rounded-xl text-xs font-black">
                  {stats.withdrawals?.length || 0}
                </span>
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                  <span>Risk Level</span>
                  <span
                    className={
                      settings.winRatio > 50
                        ? "text-rose-400"
                        : "text-emerald-400"
                    }
                  >
                    {settings.winRatio > 50 ? "High Risk" : "Stable"}
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      settings.winRatio > 50 ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${settings.winRatio}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <button className="w-full mt-8 py-4 bg-white text-gray-900 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all">
              Manage Transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
