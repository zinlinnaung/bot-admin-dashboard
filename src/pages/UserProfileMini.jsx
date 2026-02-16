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
  ShoppingBag,
  CreditCard,
  Store,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";

const API_BASE_URL =
  "https://telegram-ecommerce-bot-backend-production.up.railway.app";

const UserProfileMini = () => {
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("profile"); // profile, shop, topup

  // TopUp Form State
  const [topupForm, setTopupForm] = useState({
    amount: "",
    method: "KPay",
    refId: "",
  });

  const tg = window.Telegram?.WebApp;

  // 1. Fetch Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const telegramId = tg?.initDataUnsafe?.user?.id || "6503912648";

      // Get user internal ID first
      const userRes = await axios.get(
        `${API_BASE_URL}/admin/by-telegram/${telegramId}`,
      );

      // Fetch full details and products
      const [detailsRes, prodRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/users/${userRes.data.id}`),
        axios.get(`${API_BASE_URL}/admin/products`),
      ]);

      setUserData(detailsRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error("API Fetch Error:", err);
      tg?.showAlert("Data ဆွဲယူရာတွင် အမှားအယွင်းရှိနေပါသည်။");
    } finally {
      setLoading(false);
    }
  }, [tg]);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.headerColor = "#4f46e5";
    }
    fetchData();
  }, [fetchData, tg]);

  // 2. Handle Purchase Logic
  const handlePurchase = async (product) => {
    if (userData.balance < product.price) {
      tg?.showAlert("လက်ကျန်ငွေ မလုံလောက်ပါ။ ငွေအရင်ဖြည့်ပါ။");
      setCurrentView("topup");
      return;
    }

    const playerId = window.prompt(
      `${product.name} အတွက် Game Player ID ထည့်ပါ:`,
    );
    if (!playerId) return;

    try {
      tg?.MainButton.setText("Processing...").show();
      const payload = {
        userId: userData.id,
        productId: product.id,
        amount: product.price,
        playerId: playerId,
        nickname: tg?.initDataUnsafe?.user?.username || "Unknown",
        status: "PENDING",
      };

      await axios.post(`${API_BASE_URL}/purchases`, payload);
      tg?.showAlert(
        "ဝယ်ယူမှုအောင်မြင်ပါသည်။ Admin အတည်ပြုချက်ကို စောင့်ဆိုင်းပေးပါ။",
      );
      fetchData();
      setCurrentView("profile");
    } catch (err) {
      tg?.showAlert("ဝယ်ယူမှု မအောင်မြင်ပါ။");
    } finally {
      tg?.MainButton.hide();
    }
  };

  // 3. Handle Top-Up Submission
  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    if (!topupForm.amount || !topupForm.refId) {
      tg?.showAlert("အချက်အလက်များ ပြည့်စုံစွာဖြည့်ပေးပါ");
      return;
    }

    try {
      setLoading(true);
      const telegramId = tg?.initDataUnsafe?.user?.id || "6503912648";

      const payload = {
        telegramId: telegramId.toString(),
        amount: Number(topupForm.amount),
        method: topupForm.method,
        transactionId: topupForm.refId,
      };

      // Ensure your backend has this endpoint in WalletController
      await axios.post(`${API_BASE_URL}/wallet/deposit`, payload);

      tg?.showAlert("ငွေဖြည့်သွင်းမှု တောင်းဆိုချက် ပေးပို့ပြီးပါပြီ။");
      setTopupForm({ amount: "", method: "KPay", refId: "" });
      setCurrentView("profile");
      fetchData();
    } catch (err) {
      tg?.showAlert("Request ပို့ရာတွင် အမှားအယွင်းရှိပါသည်။");
    } finally {
      setLoading(false);
    }
  };

  // --- Sub-Components (Views) ---

  const ProfileView = () => (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Balance Card */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-1 opacity-80">
          Available Balance
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black tracking-tighter">
            {Number(userData?.balance || 0).toLocaleString()}
          </span>
          <span className="text-sm font-bold opacity-70 tracking-widest uppercase">
            MMK
          </span>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setCurrentView("topup")}
            className="flex-1 bg-white text-indigo-600 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm active:scale-95 transition-transform"
          >
            <PlusCircle size={18} /> Top Up
          </button>
          <button
            onClick={() => setCurrentView("shop")}
            className="flex-1 bg-indigo-500 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm active:scale-95 transition-transform"
          >
            <ShoppingBag size={18} /> Shop
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[300px]">
        <h3 className="font-black text-gray-800 flex items-center gap-2 mb-6">
          <History size={18} className="text-indigo-600" /> Recent Activity
        </h3>
        <div className="space-y-6">
          {getFilteredTransactions(userData).length > 0 ? (
            getFilteredTransactions(userData).map((tx, idx) => (
              <TransactionItem key={idx} tx={tx} />
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 font-bold text-sm">
              မှတ်တမ်းမရှိသေးပါ။
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ShopView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-black text-2xl flex items-center gap-2 text-gray-900">
          <Store className="text-indigo-600" size={28} /> Store
        </h3>
        <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full uppercase">
          {products.length} Items
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 font-black text-xl">
              {product.name.substring(0, 1).toUpperCase()}
            </div>
            <h4 className="font-bold text-gray-900 text-sm leading-tight h-10 line-clamp-2">
              {product.name}
            </h4>
            <p className="text-indigo-600 font-black text-lg mt-2">
              {Number(product.price).toLocaleString()}{" "}
              <span className="text-[10px]">MMK</span>
            </p>
            <button
              onClick={() => handlePurchase(product)}
              className="w-full mt-4 bg-gray-900 text-white py-3 rounded-xl text-xs font-black active:bg-indigo-600 transition-colors shadow-lg shadow-gray-200"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const TopUpView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 bg-emerald-50 rounded-[1.2rem] flex items-center justify-center text-emerald-600">
            <CreditCard size={28} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-xl leading-tight">
              Add Funds
            </h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Manual Deposit
            </p>
          </div>
        </div>

        <form onSubmit={handleTopUpSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">
              Payment Method
            </label>
            <select
              value={topupForm.method}
              onChange={(e) =>
                setTopupForm({ ...topupForm, method: e.target.value })
              }
              className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-4 px-5 font-bold text-gray-800 mt-2 outline-none transition-all appearance-none"
            >
              <option value="KPay">KBZ Pay</option>
              <option value="WavePay">Wave Pay</option>
              <option value="CBBank">CB Bank</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">
              Amount (MMK)
            </label>
            <input
              type="number"
              placeholder="Min: 1,000"
              value={topupForm.amount}
              onChange={(e) =>
                setTopupForm({ ...topupForm, amount: e.target.value })
              }
              className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-4 px-5 font-bold text-gray-800 mt-2 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">
              Transaction Ref ID
            </label>
            <input
              type="text"
              placeholder="e.g. 987654"
              value={topupForm.refId}
              onChange={(e) =>
                setTopupForm({ ...topupForm, refId: e.target.value })
              }
              className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-4 px-5 font-bold text-gray-800 mt-2 outline-none transition-all"
            />
          </div>

          <div className="bg-amber-50 p-5 rounded-3xl border border-amber-100">
            <div className="flex gap-3 text-amber-700 items-start">
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
              <p className="text-[11px] font-bold leading-relaxed">
                အချက်အလက်များမှန်ကန်စွာဖြည့်ပေးပါ။ Admin မှ စစ်ဆေးပြီးပါက ၅
                မိနစ်အတွင်း Balance ထဲသို့ ပေါင်းထည့်ပေးမည်ဖြစ်ပါသည်။
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 active:scale-95 transition-transform mt-2"
          >
            Confirm Deposit
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Navbar */}
      <div className="p-4 flex items-center gap-4 bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
        {currentView !== "profile" ? (
          <button
            onClick={() => setCurrentView("profile")}
            className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">
            {userData?.firstName?.charAt(0) || "U"}
          </div>
        )}
        <div className="flex-1">
          <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">
            {currentView === "profile" ? "Player Dashboard" : currentView}
          </p>
          <h2 className="font-black text-gray-900 leading-tight">
            {currentView === "profile"
              ? userData?.firstName || "Loading..."
              : "Go Back Home"}
          </h2>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Synchronizing...
            </p>
          </div>
        ) : (
          <>
            {currentView === "profile" && <ProfileView />}
            {currentView === "shop" && <ShopView />}
            {currentView === "topup" && <TopUpView />}
          </>
        )}
      </div>

      {/* Modern Bottom Navigation */}
      <div className="fixed bottom-8 left-8 right-8 h-20 bg-gray-900/95 backdrop-blur-lg rounded-[2.5rem] flex items-center justify-around px-8 shadow-2xl z-50 border border-white/10">
        <TabButton
          active={currentView === "profile"}
          icon={<UserCircle size={24} />}
          label="Home"
          onClick={() => setCurrentView("profile")}
        />
        <TabButton
          active={currentView === "shop"}
          icon={<Store size={24} />}
          label="Store"
          onClick={() => setCurrentView("shop")}
        />
        <TabButton
          active={currentView === "topup"}
          icon={<CreditCard size={24} />}
          label="Wallet"
          onClick={() => setCurrentView("topup")}
        />
      </div>
    </div>
  );
};

// --- Helper UI Components ---

const TabButton = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? "text-indigo-400 scale-110" : "text-gray-500"}`}
  >
    {icon}
    <span
      className={`text-[8px] font-black uppercase tracking-widest ${active ? "opacity-100" : "opacity-50"}`}
    >
      {label}
    </span>
  </button>
);

const TransactionItem = ({ tx }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-4">
      <div
        className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${
          tx.listType === "in"
            ? "bg-emerald-50 text-emerald-600"
            : "bg-rose-50 text-rose-500"
        }`}
      >
        {tx.listType === "in" ? (
          <ArrowDownLeft size={20} />
        ) : (
          <ArrowUpRight size={20} />
        )}
      </div>
      <div>
        <p className="font-black text-gray-800 text-sm leading-tight">
          {tx.label}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
              tx.status === "COMPLETED" || tx.status === "APPROVED"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {tx.status || "Success"}
          </span>
          <p className="text-[10px] text-gray-400 font-bold">
            {new Date(tx.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
    <p
      className={`font-black text-base tracking-tight ${tx.listType === "in" ? "text-emerald-600" : "text-gray-900"}`}
    >
      {tx.listType === "in" ? "+" : "-"}
      {Number(tx.amount).toLocaleString()}
    </p>
  </div>
);

const getFilteredTransactions = (data) => {
  if (!data) return [];
  const deposits = (data.deposits || []).map((d) => ({
    ...d,
    listType: "in",
    label: `Deposit via ${d.method}`,
  }));
  const purchases = (data.purchases || []).map((p) => ({
    ...p,
    listType: "out",
    label: p.product?.name || "Product Purchase",
  }));
  return [...deposits, ...purchases]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);
};

export default UserProfileMini;
