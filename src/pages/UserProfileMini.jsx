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
  const [currentView, setCurrentView] = useState("profile");

  const [topupForm, setTopupForm] = useState({
    amount: "",
    method: "KPay",
    refId: "",
  });

  const tg = window.Telegram?.WebApp;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const telegramId = tg?.initDataUnsafe?.user?.id || "6503912648";
      const userRes = await axios.get(
        `${API_BASE_URL}/admin/by-telegram/${telegramId}`,
      );
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
      await axios.post(`${API_BASE_URL}/purchases`, {
        userId: userData.id,
        productId: product.id,
        amount: product.price,
        playerId: playerId,
        nickname: tg?.initDataUnsafe?.user?.username || "Unknown",
        status: "PENDING",
      });
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

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    if (!topupForm.amount || !topupForm.refId) {
      tg?.showAlert("အချက်အလက်များ ပြည့်စုံစွာဖြည့်ပေးပါ");
      return;
    }
    try {
      setLoading(true);
      const telegramId = tg?.initDataUnsafe?.user?.id || "6503912648";
      await axios.post(`${API_BASE_URL}/wallet/deposit`, {
        telegramId: telegramId.toString(),
        amount: Number(topupForm.amount),
        method: topupForm.method,
        transactionId: topupForm.refId,
      });
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

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
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
            {currentView}
          </p>
          <h2 className="font-black text-gray-900 leading-tight">
            {userData?.firstName || "User"}
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
            {currentView === "profile" && (
              <ProfileView userData={userData} setView={setCurrentView} />
            )}
            {currentView === "shop" && (
              <ShopView products={products} onPurchase={handlePurchase} />
            )}
            {currentView === "topup" && (
              <TopUpView
                form={topupForm}
                setForm={setTopupForm}
                onSubmit={handleTopUpSubmit}
              />
            )}
          </>
        )}
      </div>

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

// --- COMPONENT DEFINITIONS (MOVED OUTSIDE TO PREVENT KEYSTROKE DISABLE ISSUE) ---

const ProfileView = ({ userData, setView }) => (
  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
      <p className="text-indigo-100 text-xs font-black uppercase mb-1 opacity-80">
        Available Balance
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-black tracking-tighter">
          {Number(userData?.balance || 0).toLocaleString()}
        </span>
        <span className="text-sm font-bold opacity-70 uppercase">MMK</span>
      </div>
      <div className="flex gap-3 mt-8">
        <button
          onClick={() => setView("topup")}
          className="flex-1 bg-white text-indigo-600 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm active:scale-95 transition-transform"
        >
          <PlusCircle size={18} /> Top Up
        </button>
        <button
          onClick={() => setView("shop")}
          className="flex-1 bg-indigo-500 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm active:scale-95 transition-transform"
        >
          <ShoppingBag size={18} /> Shop
        </button>
      </div>
    </div>
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[300px]">
      <h3 className="font-black text-gray-800 flex items-center gap-2 mb-6">
        <History size={18} className="text-indigo-600" /> Recent Activity
      </h3>
      <div className="space-y-6">
        {getFilteredTransactions(userData).map((tx, idx) => (
          <TransactionItem key={idx} tx={tx} />
        ))}
      </div>
    </div>
  </div>
);

const ShopView = ({ products, onPurchase }) => (
  <div className="grid grid-cols-2 gap-4 pb-20 animate-in fade-in slide-in-from-right-4 duration-500">
    {products.map((product) => (
      <div
        key={product.id}
        className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md"
      >
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 font-black text-xl">
          {product.name.charAt(0).toUpperCase()}
        </div>
        <h4 className="font-bold text-gray-900 text-sm h-10 line-clamp-2">
          {product.name}
        </h4>
        <p className="text-indigo-600 font-black text-lg mt-2">
          {Number(product.price).toLocaleString()} MMK
        </p>
        <button
          onClick={() => onPurchase(product)}
          className="w-full mt-4 bg-gray-900 text-white py-3 rounded-xl text-xs font-black active:bg-indigo-600"
        >
          Buy Now
        </button>
      </div>
    ))}
  </div>
);

const TopUpView = ({ form, setForm, onSubmit }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
    <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-14 w-14 bg-emerald-50 rounded-[1.2rem] flex items-center justify-center text-emerald-600">
          <CreditCard size={28} />
        </div>
        <h3 className="font-black text-gray-900 text-xl leading-tight">
          Add Funds
        </h3>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
            Payment Method
          </label>
          <select
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
            className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-4 px-5 font-bold text-gray-800 mt-2 outline-none"
          >
            <option value="KPay">KBZ Pay</option>
            <option value="WavePay">Wave Pay</option>
            <option value="CBBank">CB Bank</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
            Amount (MMK)
          </label>
          <input
            type="number"
            placeholder="Min: 1,000"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-4 px-5 font-bold text-gray-800 mt-2 outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
            Transaction Ref ID
          </label>
          <input
            type="text"
            placeholder="e.g. 987654"
            value={form.refId}
            onChange={(e) => setForm({ ...form, refId: e.target.value })}
            className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-4 px-5 font-bold text-gray-800 mt-2 outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black active:scale-95 transition-transform mt-2"
        >
          Confirm Deposit
        </button>
      </form>
    </div>
  </div>
);

// --- HELPERS ---

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
        className={`h-12 w-12 rounded-2xl flex items-center justify-center ${tx.listType === "in" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}
      >
        {tx.listType === "in" ? (
          <ArrowDownLeft size={20} />
        ) : (
          <ArrowUpRight size={20} />
        )}
      </div>
      <div>
        <p className="font-black text-gray-800 text-sm">{tx.label}</p>
        <p className="text-[10px] text-gray-400 font-bold">
          {new Date(tx.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
    <p
      className={`font-black text-base ${tx.listType === "in" ? "text-emerald-600" : "text-gray-900"}`}
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
    label: p.product?.name || "Purchase",
  }));
  return [...deposits, ...purchases]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);
};

export default UserProfileMini;
