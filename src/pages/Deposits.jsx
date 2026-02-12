import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Image,
  X,
  Check,
  RefreshCw,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";

const API_URL =
  "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin";

export default function Deposits() {
  const [data, setData] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(true); // Toggle State
  const [toggling, setToggling] = useState(false);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/dashboard-stats`);
      setData(res.data.deposits);

      // Settings ကိုပါ တစ်ခါတည်း ဆွဲထုတ်ခြင်း (Optional: stats API မှာ ပါရင် သုံးပါ)
      const settingsRes = await axios.get(`${API_URL}/settings`);
      setIsTopUpOpen(settingsRes.data.isTopUpOpen === "true");
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  // 💡 Toggle Function
  const handleToggleTopUp = async () => {
    setToggling(true);
    const newStatus = !isTopUpOpen;
    try {
      await axios.post(`${API_URL}/toggle-topup`, { status: newStatus });
      setIsTopUpOpen(newStatus);
    } catch (err) {
      alert("Status ပြောင်းလဲရန် မအောင်မြင်ပါ");
    } finally {
      setToggling(false);
    }
  };

  const handleViewImage = async (fileId) => {
    try {
      const res = await axios.get(`${API_URL}/get-image-url/${fileId}`);
      setSelectedImg(res.data.url);
    } catch (err) {
      alert("ပုံဆွဲယူ၍ မရနိုင်ပါ (Telegram File Expired ဖြစ်နိုင်သည်)");
    }
  };

  const handleAction = async (id, type) => {
    if (!window.confirm("သေချာပါသလား?")) return;
    try {
      await axios.post(`${API_URL}/${type}-deposit/${id}`);
      fetchDeposits();
    } catch (err) {
      alert("Error processing request");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Deposit Requests</h2>
          <p className="text-gray-500 text-sm">
            ငွေဖြည့်သွင်းမှု တောင်းဆိုချက်များကို စီမံရန်
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 💡 Toggle UI Section */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border shadow-sm">
            <span
              className={`text-xs font-bold uppercase ${isTopUpOpen ? "text-emerald-600" : "text-rose-600"}`}
            >
              Top-Up: {isTopUpOpen ? "Opened" : "Closed"}
            </span>
            <button
              onClick={handleToggleTopUp}
              disabled={toggling}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isTopUpOpen ? "bg-emerald-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`${
                  isTopUpOpen ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>

          <button
            onClick={fetchDeposits}
            className="p-2.5 bg-white rounded-xl shadow-sm border hover:bg-gray-50 transition"
          >
            <RefreshCw
              size={20}
              className={
                loading ? "animate-spin text-blue-600" : "text-gray-600"
              }
            />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Slip Image</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Check size={40} className="text-gray-200" />
                    <p>စောင့်ဆိုင်းနေသော ငွေဖြည့်သွင်းမှု မရှိပါ။</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {d.user?.firstName || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-emerald-600 font-bold">
                    {Number(d.amount).toLocaleString()} MMK
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewImage(d.proofFileId)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-xs"
                    >
                      <Image size={14} /> VIEW SLIP
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleAction(d.id, "approve")}
                        className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-sm transition"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleAction(d.id, "reject")}
                        className="p-2 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal View Slip */}
      {selectedImg && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <button
              onClick={() => setSelectedImg(null)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/40 transition z-10"
            >
              <X size={20} />
            </button>
            <div className="p-4 bg-gray-50 flex justify-center">
              <img
                src={selectedImg}
                alt="Payment Slip"
                className="max-h-[70vh] rounded-lg shadow-inner object-contain"
              />
            </div>
            <div className="p-5 text-center font-bold text-gray-800 bg-white border-t">
              Payment Evidence (Slip)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
