import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Check,
  X,
  RefreshCw,
  Gamepad2,
  User,
  Clock,
  Copy,
  ChevronLeft,
  ChevronRight,
  Hash,
  ArrowUpRight,
} from "lucide-react";

export default function GameOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("PENDING");

  // Pagination States
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, lastPage: 1 });
  const limit = 10;

  const API_URL =
    "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin";

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders`, {
        params: { status: filter, page: page, limit: limit },
      });
      setOrders(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [filter, page]);

  const handleOrderAction = async (id, action) => {
    const confirmMsg =
      action === "approve"
        ? "ဒီ Order ကို Done အဖြစ် သတ်မှတ်မလား?"
        : "ဒီ Order ကို Reject လုပ်ပြီး ငွေပြန်အမ်းမလား?";

    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.post(`${API_URL}/${action}-order/${id}`);
      fetchOrders();
    } catch (err) {
      alert(
        "Error: " +
          (err.response?.data?.message || "လုပ်ဆောင်ချက် မအောင်မြင်ပါ"),
      );
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-[91vh] flex flex-col p-4 md:p-8 bg-gray-50/30 max-w-[1600px] mx-auto overflow-hidden font-sans">
      {/* 1. Enhanced Header Section */}
      <div className="flex-shrink-0 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-indigo-200 shadow-lg">
                <Gamepad2 className="text-white" size={24} />
              </div>
              Game Top-up Orders
            </h2>
            <p className="text-gray-500 font-medium ml-12">
              Manage and track real-time gaming transactions
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex gap-1">
              {["PENDING", "COMPLETED", "REJECTED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                    filter === s
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="w-[1px] h-6 bg-gray-100 mx-1"></div>
            <button
              onClick={fetchOrders}
              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Professional Table Section */}
      <div className="flex-1 min-h-0 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-gray-50/80 backdrop-blur-md">
                <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-100">
                  Product & Date
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-100">
                  Game Identifier
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-100">
                  Customer Details
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-100 text-center">
                  Amount
                </th>
                {filter === "PENDING" && (
                  <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-100 text-right">
                    Approval Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-indigo-50/30 transition-all duration-150 group"
                >
                  {/* Product Column */}
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-base group-hover:text-indigo-700 transition-colors">
                        {order.product?.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-gray-400 mt-1.5">
                        <Clock size={13} className="text-gray-300" />
                        <span className="text-xs font-medium uppercase tracking-wider">
                          {new Date(order.createdAt).toLocaleDateString()} •{" "}
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Game ID Column - UX Focus */}
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center bg-gray-50 self-start pr-2 rounded-lg border border-gray-100 group-hover:border-indigo-100 group-hover:bg-white transition-all">
                        <div className="bg-gray-100 p-1.5 rounded-l-lg text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500">
                          <Hash size={14} />
                        </div>
                        <code className="px-3 font-mono font-bold text-indigo-600 text-sm tracking-tight">
                          {order.playerId}
                        </code>
                        <button
                          onClick={() => copyToClipboard(order.playerId)}
                          className="p-1 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all active:scale-90"
                        >
                          <Copy size={13} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 ml-1">
                        {order.nickname && (
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {order.nickname}
                          </span>
                        )}
                        {order.serverId && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                            SRV: {order.serverId}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Customer Column */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                          <User size={18} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">
                          {order.user?.firstName || "User"}
                        </span>
                        <span className="text-[11px] font-medium text-gray-400">
                          ID: {order.user?.telegramId}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Price Column */}
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex flex-col items-center justify-center bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all">
                      <span className="text-lg font-black text-indigo-600 group-hover:text-white leading-none">
                        {Number(order.amount).toLocaleString()}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 group-hover:text-indigo-100 mt-1 uppercase tracking-tighter">
                        MMK Currency
                      </span>
                    </div>
                  </td>

                  {/* Actions Column */}
                  {filter === "PENDING" && (
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleOrderAction(order.id, "approve")}
                          className="group/btn h-11 w-11 flex items-center justify-center bg-white border-2 border-emerald-100 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-sm hover:shadow-emerald-200 hover:shadow-lg transition-all duration-300"
                        >
                          <Check size={20} strokeWidth={3} />
                        </button>
                        <button
                          onClick={() => handleOrderAction(order.id, "reject")}
                          className="group/btn h-11 w-11 flex items-center justify-center bg-white border-2 border-rose-100 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300 shadow-sm hover:shadow-rose-100 hover:shadow-lg"
                        >
                          <X size={20} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. Modern Pagination Footer */}
        <div className="flex-shrink-0 px-8 py-5 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <ArrowUpRight size={16} />
            </div>
            <p className="text-sm font-medium text-gray-500">
              Viewing{" "}
              <span className="text-gray-900 font-bold">{orders.length}</span>{" "}
              entries on this page
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 hover:bg-gray-100 rounded-xl disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>

            <div className="flex items-center px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-3">
                Page
              </span>
              <span className="text-sm font-black text-indigo-600">{page}</span>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-sm font-bold text-gray-500">
                {meta.lastPage}
              </span>
            </div>

            <button
              onClick={() => setPage((p) => Math.min(meta.lastPage, p + 1))}
              disabled={page === meta.lastPage}
              className="p-2.5 hover:bg-gray-100 rounded-xl disabled:opacity-30 transition-all"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar CSS */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}
