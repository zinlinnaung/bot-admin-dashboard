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
} from "lucide-react";

const API_BASE_URL =
  "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin";

const UserProfileMini = () => {
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("profile");

  const tg = window.Telegram?.WebApp;

  // ၁။ Data ဆွဲယူခြင်း (User & Products)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const telegramId = tg?.initDataUnsafe?.user?.id || "6503912648";

      const userRes = await axios.get(
        `${API_BASE_URL}/by-telegram/${telegramId}`,
      );
      const [detailsRes, prodRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/users/${userRes.data.id}`),
        axios.get(`${API_BASE_URL}/products`),
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

  // ၂။ ဝယ်ယူခြင်း Logic (API Connection)
  const handlePurchase = async (product) => {
    if (userData.balance < product.price) {
      tg?.showAlert("လက်ကျန်ငွေ မလုံလောက်ပါ။ ငွေအရင်ဖြည့်ပါ။");
      return;
    }

    // Game ID တောင်းသည့် Popup
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

      // Backend ရဲ့ Purchase API သို့ ပို့ခြင်း (မှတ်ချက်- Controller မှာ orders/purchase endpoint ရှိရမည်)
      await axios.post(
        `${API_BASE_URL.replace("/admin", "")}/purchases`,
        payload,
      );

      tg?.showAlert(
        "အော်ဒါတင်ခြင်း အောင်မြင်ပါသည်။ Admin မှ ခဏအတွင်း အတည်ပြုပေးပါမည်။",
      );
      fetchData(); // Balance update ဖြစ်အောင် ပြန်ခေါ်ခြင်း
      setCurrentView("profile");
    } catch (err) {
      tg?.showAlert("ဝယ်ယူမှု မအောင်မြင်ပါ။ နောက်မှ ပြန်ကြိုးစားပါ။");
    } finally {
      tg?.MainButton.hide();
    }
  };

  // ၃။ ငွေဖြည့်ရန် Request ပို့ခြင်း
  const handleTopUpRequest = () => {
    tg?.showAlert(
      "ငွေဖြည့်သွင်းရန်အတွက် Bot ထဲတွင် Screenshot ပေးပို့ပေးပါ။ ဤနေရာတွင် Payment ပြုလုပ်ရန် ပြင်ဆင်နေပါသည်။",
    );
    // ဤနေရာတွင် deposit API သို့ ပို့လိုက ပို့နိုင်သည်
  };

  // View Components
  const ProfileView = () => (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
        <p className="text-indigo-200 text-xs font-bold uppercase mb-1">
          Available Balance
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black">
            {Number(userData?.balance || 0).toLocaleString()}
          </span>
          <span className="text-sm font-bold opacity-80">MMK</span>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setCurrentView("topup")}
            className="flex-1 bg-white/20 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm"
          >
            <PlusCircle size={18} /> Top Up
          </button>
          <button
            onClick={() => setCurrentView("shop")}
            className="flex-1 bg-white text-indigo-600 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm"
          >
            <ShoppingBag size={18} /> Shop Now
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[300px]">
        <h3 className="font-black text-gray-800 flex items-center gap-2 mb-4">
          <History size={18} className="text-indigo-600" /> Recent Activity
        </h3>
        <div className="space-y-4">
          {getFilteredTransactions(userData).map((tx, idx) => (
            <TransactionItem key={idx} tx={tx} />
          ))}
        </div>
      </div>
    </div>
  );

  const ShopView = () => (
    <div className="space-y-4 pb-20">
      <h3 className="font-black text-xl px-2 flex items-center gap-2">
        <Store className="text-indigo-600" /> Digital Store
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm"
          >
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-3 font-black">
              {product.name.substring(0, 2).toUpperCase()}
            </div>
            <h4 className="font-bold text-gray-800 text-sm line-clamp-1">
              {product.name}
            </h4>
            <p className="text-indigo-600 font-black text-md mt-1">
              {Number(product.price).toLocaleString()} MMK
            </p>
            <button
              onClick={() => handlePurchase(product)}
              className="w-full mt-3 bg-gray-900 text-white py-2 rounded-xl text-xs font-bold active:bg-indigo-600 transition-colors"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Navbar */}
      <div className="p-4 flex items-center gap-4 bg-white/50 backdrop-blur-md sticky top-0 z-50 border-b">
        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
          {userData?.firstName?.charAt(0) || "U"}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            User Profile
          </p>
          <h2 className="font-black text-gray-900">
            {userData?.firstName || "Loading..."}
          </h2>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            {currentView === "profile" && <ProfileView />}
            {currentView === "shop" && <ShopView />}
            {currentView === "topup" && (
              <div className="p-6 bg-white rounded-3xl border text-center space-y-4">
                <CreditCard className="mx-auto text-indigo-600" size={48} />
                <h3 className="font-black text-lg">ငွေဖြည့်သွင်းခြင်း</h3>
                <p className="text-sm text-gray-500">
                  လက်ရှိတွင် Admin သို့ တိုက်ရိုက်ဆက်သွယ်၍
                  ငွေဖြည့်သွင်းနိုင်ပါသည်။
                </p>
                <button
                  onClick={handleTopUpRequest}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold"
                >
                  Contact Admin
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Tabs */}
      <div className="fixed bottom-6 left-6 right-6 h-16 bg-gray-900 rounded-[2rem] flex items-center justify-around px-6 shadow-2xl z-50">
        <TabButton
          active={currentView === "profile"}
          icon={<UserCircle size={20} />}
          label="Home"
          onClick={() => setCurrentView("profile")}
        />
        <TabButton
          active={currentView === "shop"}
          icon={<Store size={20} />}
          label="Shop"
          onClick={() => setCurrentView("shop")}
        />
        <TabButton
          active={currentView === "topup"}
          icon={<CreditCard size={20} />}
          label="Topup"
          onClick={() => setCurrentView("topup")}
        />
      </div>
    </div>
  );
};

// Helpers
const TabButton = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 ${active ? "text-indigo-400" : "text-gray-500"}`}
  >
    {icon}
    <span className="text-[9px] font-black uppercase">{label}</span>
  </button>
);

const TransactionItem = ({ tx }) => (
  <div className="flex items-center justify-between p-1">
    <div className="flex items-center gap-3">
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center ${tx.listType === "in" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}
      >
        {tx.listType === "in" ? (
          <ArrowDownLeft size={18} />
        ) : (
          <ArrowUpRight size={18} />
        )}
      </div>
      <div>
        <p className="font-bold text-gray-800 text-sm">{tx.label}</p>
        <p className="text-[10px] text-gray-400 font-bold">
          {new Date(tx.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
    <p
      className={`font-black text-sm ${tx.listType === "in" ? "text-emerald-600" : "text-gray-900"}`}
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
    label: "Deposit",
  }));
  const purchases = (data.purchases || []).map((p) => ({
    ...p,
    listType: "out",
    label: p.product?.name,
  }));
  return [...deposits, ...purchases]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);
};

export default UserProfileMini;
