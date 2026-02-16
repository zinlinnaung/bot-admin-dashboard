import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  UserCircle,
  Loader2,
  PlusCircle,
  Send,
  Headset,
  Copy,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL =
  "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin";

const UserProfileMini = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const tg = window.Telegram?.WebApp;

  const fetchUserData = useCallback(
    async (isRefresh = false) => {
      try {
        if (!isRefresh) setLoading(true);
        const telegramId = tg?.initDataUnsafe?.user?.id || "6503912648";

        const response = await axios.get(
          `${API_BASE_URL}/by-telegram/${telegramId}`,
        );
        const detailsResponse = await axios.get(
          `${API_BASE_URL}/users/${response.data.id}`,
        );

        setUserData(detailsResponse.data);
        setError(null);
      } catch (err) {
        setError("အချက်အလက်များ ဆွဲယူ၍ မရနိုင်ပါ။");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [tg],
  );

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation(); // App ပိတ်ရင် confirm လုပ်ခိုင်းတာ (Real-world app များတွင် သုံးသည်)
    }
    fetchUserData();
  }, [fetchUserData, tg]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(userData?.telegramId);
    tg?.showAlert("Telegram ID ကို Copy ကူးလိုက်ပါပြီ။");
  };

  if (loading)
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-gray-500 font-medium animate-pulse">
          Loading Profile...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <h1 className="font-black text-gray-800 text-lg">My Account</h1>
        <button
          onClick={() => fetchUserData(true)}
          className="p-2 hover:bg-white rounded-full transition-all"
        >
          <History
            size={20}
            className={refreshing ? "animate-spin" : "text-gray-600"}
          />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Profile Section */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                {tg?.initDataUnsafe?.user?.photo_url ? (
                  <img src={tg.initDataUnsafe.user.photo_url} alt="profile" />
                ) : (
                  <UserCircle size={32} className="text-indigo-600" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-xl leading-tight">
                  {userData?.firstName || "Guest User"}
                </h2>
                <div
                  onClick={handleCopyId}
                  className="flex items-center gap-1 mt-1 text-gray-400 active:text-indigo-500 cursor-pointer transition-colors"
                >
                  <span className="text-xs font-medium">
                    ID: {userData?.telegramId}
                  </span>
                  <Copy size={12} />
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              <span className="text-xs font-bold text-indigo-600 uppercase">
                Pro
              </span>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                Total Balance
              </p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black italic tracking-tight">
                  {Number(userData?.balance || 0).toLocaleString()}
                </span>
                <span className="text-sm font-bold text-indigo-400">MMK</span>
              </div>

              {/* Quick Actions inside Card */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                <button className="flex flex-col items-center gap-1 py-2 hover:bg-slate-800 rounded-xl transition-all">
                  <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <PlusCircle size={18} />
                  </div>
                  <span className="text-[10px] font-bold">Top Up</span>
                </button>
                <button className="flex flex-col items-center gap-1 py-2 hover:bg-slate-800 rounded-xl transition-all">
                  <div className="h-8 w-8 bg-slate-700 rounded-lg flex items-center justify-center">
                    <Send size={18} />
                  </div>
                  <span className="text-[10px] font-bold">Withdraw</span>
                </button>
                <button
                  onClick={() =>
                    tg?.openTelegramLink("https://t.me/your_support")
                  }
                  className="flex flex-col items-center gap-1 py-2 hover:bg-slate-800 rounded-xl transition-all"
                >
                  <div className="h-8 w-8 bg-slate-700 rounded-lg flex items-center justify-center">
                    <Headset size={18} />
                  </div>
                  <span className="text-[10px] font-bold">Support</span>
                </button>
              </div>
            </div>
            {/* Abstract Background Design */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-10 -mt-10"></div>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-gray-800 flex items-center gap-2">
              <History size={18} className="text-indigo-600" /> Recent Activity
            </h3>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-50 rounded-2xl">
            {["all", "deposits", "orders"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl capitalize transition-all ${
                  activeTab === tab
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {/* Combined Logic for Filtered Data */}
            {getFilteredTransactions(userData, activeTab).length > 0 ? (
              getFilteredTransactions(userData, activeTab).map((tx, idx) => (
                <TransactionItem key={idx} tx={tx} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <AlertCircle
                  size={48}
                  strokeWidth={1}
                  className="mb-2 opacity-20"
                />
                <p className="text-sm font-medium">No transactions found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter logic function
const getFilteredTransactions = (data, tab) => {
  if (!data) return [];
  const deposits = (data.deposits || []).map((d) => ({
    ...d,
    listType: "in",
    label: "Deposit",
  }));
  const purchases = (data.purchases || []).map((p) => ({
    ...p,
    listType: "out",
    label: p.product?.name,
  }));

  let combined = [];
  if (tab === "all") combined = [...deposits, ...purchases];
  else if (tab === "deposits") combined = deposits;
  else if (tab === "orders") combined = purchases;

  return combined
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);
};

// Sub-component for Transaction Item
const TransactionItem = ({ tx }) => {
  const isCompleted = tx.status === "APPROVED" || tx.status === "COMPLETED";
  const isRejected = tx.status === "REJECTED";

  return (
    <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div
          className={`h-11 w-11 rounded-2xl flex items-center justify-center ${
            tx.listType === "in"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          {tx.listType === "in" ? (
            <ArrowDownLeft size={20} />
          ) : (
            <ArrowUpRight size={20} />
          )}
        </div>
        <div>
          <p className="font-bold text-gray-800 text-[14px] leading-tight mb-1">
            {tx.label || "System Transaction"}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-bold">
              {new Date(tx.createdAt).toLocaleDateString()}
            </span>
            <div
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                isCompleted
                  ? "bg-emerald-100 text-emerald-700"
                  : isRejected
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {isCompleted && <CheckCircle2 size={8} />}
              {tx.status}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`font-black text-[15px] ${tx.listType === "in" ? "text-emerald-600" : "text-gray-900"}`}
      >
        {tx.listType === "in" ? "+" : "-"}
        {Number(tx.amount).toLocaleString()}
      </div>
    </div>
  );
};

export default UserProfileMini;
