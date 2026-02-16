import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  UserCircle,
  Loader2,
} from "lucide-react";

const API_BASE_URL =
  "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin";

const UserProfileMini = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ၁။ Telegram WebApp SDK Initialize လုပ်ခြင်း
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand(); // Screen အပြည့်ချဲ့ခြင်း
    }

    // ၂။ Telegram User ID ရယူခြင်း (Development အတွက် dummy ID တစ်ခု ထည့်ထားပေးပါသည်)
    const telegramId = tg?.initDataUnsafe?.user?.id; // Test ID

    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Backend API သို့ ချိတ်ဆက်ခြင်း
        const response = await axios.get(
          `${API_BASE_URL}/by-telegram/${telegramId}`,
        );

        // User Details အပြည့်အစုံရရန် နောက်တစ်ကြိမ် ခေါ်ခြင်း (Transactions ပါဝင်ရန်)
        const detailsResponse = await axios.get(
          `${API_BASE_URL}/users/${response.data.id}`,
        );

        setUserData(detailsResponse.data);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("User data ဆွဲယူ၍ မရနိုင်ပါ။");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-rose-500 font-bold">{error}</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-[14px]">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100 overflow-hidden">
            <UserCircle size={28} />
          </div>
          <div>
            <h2 className="font-black text-gray-900 text-lg leading-tight">
              {userData?.firstName || userData?.username || "User"}
            </h2>
            <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">
              ID: {userData?.telegramId}
            </p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 opacity-80 mb-1">
              <Wallet size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Available Balance
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black">
                {Number(userData?.balance || 0).toLocaleString()}
              </span>
              <span className="text-xs font-bold opacity-70">MMK</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Wallet size={100} />
          </div>
        </div>
      </div>

      {/* Recent Transactions (Combine Deposits & Withdraws) */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex-1">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <History size={16} className="text-indigo-600" /> Recent Activity
          </h3>
        </div>

        <div className="space-y-4">
          {/* ငွေသွင်းမှတ်တမ်းများ */}
          {userData?.deposits?.slice(0, 3).map((dep) => (
            <TransactionItem
              key={`dep-${dep.id}`}
              type="in"
              note="ငွေဖြည့်သွင်းမှု"
              date={new Date(dep.createdAt).toLocaleDateString()}
              amount={dep.amount}
              status={dep.status}
            />
          ))}

          {/* ဝယ်ယူမှုမှတ်တမ်းများ */}
          {userData?.purchases?.slice(0, 3).map((order) => (
            <TransactionItem
              key={`order-${order.id}`}
              type="out"
              note={order.product?.name || "Order"}
              date={new Date(order.createdAt).toLocaleDateString()}
              amount={order.amount}
              status={order.status}
            />
          ))}

          {!userData?.deposits?.length && !userData?.purchases?.length && (
            <p className="text-center text-gray-400 py-4">မှတ်တမ်းမရှိသေးပါ။</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Component for Transaction Row
const TransactionItem = ({ type, note, date, amount, status }) => (
  <div className="flex items-center justify-between group border-b border-gray-50 pb-3 last:border-0">
    <div className="flex items-center gap-3">
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center ${
          type === "in"
            ? "bg-emerald-50 text-emerald-600"
            : "bg-rose-50 text-rose-500"
        }`}
      >
        {type === "in" ? (
          <ArrowDownLeft size={18} />
        ) : (
          <ArrowUpRight size={18} />
        )}
      </div>
      <div>
        <p className="font-bold text-gray-800 text-sm leading-tight">{note}</p>
        <p className="text-[10px] text-gray-400 font-medium">
          {date} •{" "}
          <span
            className={
              status === "APPROVED" || status === "COMPLETED"
                ? "text-emerald-500"
                : "text-amber-500"
            }
          >
            {status}
          </span>
        </p>
      </div>
    </div>
    <div
      className={`font-black text-sm ${type === "in" ? "text-emerald-600" : "text-gray-900"}`}
    >
      {type === "in" ? "+" : "-"}
      {Number(amount).toLocaleString()}
    </div>
  </div>
);

export default UserProfileMini;
