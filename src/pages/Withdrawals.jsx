import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, X, RefreshCw, AlertCircle } from "lucide-react";

export default function Withdrawals() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL =
    "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin";

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/dashboard-stats`);
      setData(res.data.withdrawals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id, type) => {
    if (!window.confirm("သေချာပါသလား?")) return;
    try {
      await axios.post(`${API_URL}/${type}-withdraw/${id}`);
      fetchData();
    } catch (err) {
      alert("Error processing request");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Withdrawal Requests</h2>
        <button
          onClick={fetchData}
          className="p-2 bg-white rounded-lg shadow-sm border"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="p-20 text-center text-gray-400 italic"
                >
                  No pending withdrawals.
                </td>
              </tr>
            )}
            {data.map((w) => (
              <tr key={w.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <b>{w.user?.firstName}</b>
                  <br />
                  <span className="text-xs text-gray-400">
                    ID: {w.user?.telegramId}
                  </span>
                </td>
                <td className="px-6 py-4 font-black text-rose-500">
                  {Number(w.amount).toLocaleString()} MMK
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded uppercase">
                    {w.method}
                  </span>
                  <div className="mt-1">{w.accountName}</div>
                  <div className="text-gray-400 font-mono text-xs">
                    {w.phoneNumber}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleAction(w.id, "approve")}
                      className="p-2 bg-emerald-500 text-white rounded-xl"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleAction(w.id, "reject")}
                      className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
