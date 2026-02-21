import React, { useState } from "react";
import axios from "axios";
import { UserMinus, Search, AlertCircle, Loader2 } from "lucide-react";

const API_URL =
  "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin";

export default function DeductBalance() {
  const [telegramId, setTelegramId] = useState("");
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // ၁။ User ကို Telegram ID ဖြင့် ရှာဖွေခြင်း
  const handleSearchUser = async () => {
    if (!telegramId) return;
    setSearching(true);
    setUser(null);
    try {
      const res = await axios.get(`${API_URL}/by-telegram/${telegramId}`);
      setUser(res.data);
    } catch (err) {
      alert("User ရှာမတွေ့ပါ သို့မဟုတ် ID မှားယွင်းနေပါသည်");
    } finally {
      setSearching(false);
    }
  };

  // ၂။ ငွေနှုတ်ယူခြင်း လုပ်ဆောင်ချက်
  const handleDeduct = async (e) => {
    e.preventDefault();
    if (!user || !amount || !reason) return;

    if (
      !window.confirm(
        `သေချာပါသလား? ${user.firstName} ထံမှ ${Number(amount).toLocaleString()} MMK နှုတ်ယူပါမည်။`,
      )
    )
      return;

    setLoading(true);
    try {
      await axios.post(`${API_URL}/deduct-balance`, {
        userId: user.id,
        amount: Number(amount),
        reason: reason,
      });

      alert("ငွေနှုတ်ယူမှု အောင်မြင်ပါသည်");
      // Reset Form
      setAmount("");
      setReason("");
      handleSearchUser(); // Balance အသစ်ကို ပြန်ပြရန်
    } catch (err) {
      alert(err.response?.data?.message || "Error processing deduction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <UserMinus className="text-rose-500" /> Deduct Balance
        </h2>
        <p className="text-gray-500 text-sm">
          အသုံးပြုသူ၏ လက်ကျန်ငွေထဲမှ Manual နှုတ်ယူရန်
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <label className="text-sm font-bold text-gray-700">
          Search User by Telegram ID
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="e.g. 512345678"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none transition"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
            />
          </div>
          <button
            onClick={handleSearchUser}
            disabled={searching}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50"
          >
            {searching ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Search"
            )}
          </button>
        </div>
      </div>

      {/* User Info & Deduct Form */}
      {user && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 bg-rose-50/50 border-b border-rose-100 flex justify-between items-center">
            <div>
              <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">
                Target User
              </p>
              <h3 className="text-lg font-bold text-gray-800">
                {user.firstName} {user.username ? `(@${user.username})` : ""}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">
                Current Balance
              </p>
              <p className="text-lg font-black text-gray-900">
                {Number(user.balance).toLocaleString()} MMK
              </p>
            </div>
          </div>

          <form onSubmit={handleDeduct} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Deduct Amount (MMK)
              </label>
              <input
                type="number"
                required
                placeholder="နှုတ်ယူမည့် ပမာဏ ရိုက်ထည့်ပါ"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none transition font-mono text-lg text-rose-600"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Reason / Description
              </label>
              <textarea
                required
                rows="3"
                placeholder="User ထံပို့မည့် အကြောင်းပြချက် ရေးပေးပါ (ဥပမာ- ဒိုင်အမှားပြင်ဆင်ခြင်း)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none transition"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3">
              <AlertCircle className="text-amber-500 shrink-0" size={20} />
              <p className="text-xs text-amber-700 leading-relaxed">
                <b>သတိပြုရန်:</b> ဤလုပ်ဆောင်ချက်သည် User ၏ လက်ကျန်ငွေကို
                တိုက်ရိုက်လျှော့ချမည်ဖြစ်ပြီး ၎င်းထံသို့ အကြောင်းကြားစာ (Bot
                Message) တစ်ခါတည်း ပေးပို့မည်ဖြစ်ပါသည်။
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 shadow-lg shadow-rose-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Confirm & Deduct Balance"
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
