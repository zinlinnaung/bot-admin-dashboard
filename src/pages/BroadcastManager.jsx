import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Send,
  MessageSquare,
  Users,
  Bell,
  Clock,
  Trash2,
  Eye,
  AlertTriangle,
  Loader2,
  MousePointer2,
  BarChart3,
  Smartphone,
  CheckCircle2,
  Info,
  Zap, // Added for Callback icon
} from "lucide-react";

const API_URL = "https://vpnbot-production-e78a.up.railway.app/admin";

export default function BroadcastManager() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Form State
  const [message, setMessage] = useState("");
  const [btnText, setBtnText] = useState("");
  const [btnUrl, setBtnUrl] = useState("");
  const [targetType, setTargetType] = useState("ALL"); // ALL, WINNERS, LOSERS

  // --- ADDED FOR CALLBACK ---
  const [isCallback, setIsCallback] = useState(false);

  useEffect(() => {
    fetchBroadcastHistory();
  }, []);

  const fetchBroadcastHistory = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/broadcasts/history`);
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!message) return;

    const confirmSend = window.confirm(
      `Confirm sending this broadcast to ${targetType.toLowerCase()} users?`,
    );
    if (!confirmSend) return;

    setIsSending(true);
    try {
      await axios.post(`${API_URL}/broadcast`, {
        message,
        // Backend က array မျှော်လင့်ထားရင် ဒီလို formatting လုပ်ပေးရပါမယ်
        buttons: btnText
          ? [
              [
                {
                  text: btnText,
                  [isCallback ? "callback_data" : "url"]: btnUrl,
                },
              ],
            ]
          : [],
        target: targetType,
      });
      alert("Broadcast started successfully!");
      setMessage("");
      setBtnText("");
      setBtnUrl("");
      fetchBroadcastHistory();
    } catch (err) {
      alert("Broadcast failed to initialize.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans pb-20">
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* --- STATS OVERVIEW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Target Reach
              </p>
              <h3 className="text-2xl font-black">1,240 Users</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Avg. Success Rate
              </p>
              <h3 className="text-2xl font-black">98.2%</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <BarChart3 size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Last 24h Sent
              </p>
              <h3 className="text-2xl font-black">3 Rounds</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- COMPOSER SECTION --- */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h2 className="font-black text-xl tracking-tight">
                    New Broadcast
                  </h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
                    Notification Engine
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-6">
                {/* Target Selector */}
                <div className="grid grid-cols-3 gap-3">
                  {["ALL", "WINNERS", "LOSERS"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTargetType(type)}
                      className={`py-3 rounded-2xl text-[10px] font-black transition-all border ${
                        targetType === type
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-white text-slate-400 border-slate-200 hover:border-indigo-400"
                      }`}
                    >
                      {type} USERS
                    </button>
                  ))}
                </div>

                {/* Message Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Message Content (HTML Supported)
                  </label>
                  <textarea
                    rows="5"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="🎉 Congratulations! You won the lucky draw..."
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-medium text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
                  />
                </div>

                {/* Action Button Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Button Text
                    </label>
                    <div className="relative">
                      <MousePointer2
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                        size={16}
                      />
                      <input
                        type="text"
                        value={btnText}
                        onChange={(e) => setBtnText(e.target.value)}
                        placeholder="e.g. Check Prize"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isCallback ? "Callback Data" : "Redirect URL"}
                      </label>
                      {/* --- ADDED CALLBACK TOGGLE --- */}
                      <button
                        type="button"
                        onClick={() => setIsCallback(!isCallback)}
                        className={`text-[9px] font-black px-2 py-0.5 rounded-md border transition-colors flex items-center gap-1 ${
                          isCallback
                            ? "bg-amber-500 border-amber-500 text-white"
                            : "bg-white border-slate-200 text-slate-400"
                        }`}
                      >
                        <Zap size={10} fill={isCallback ? "white" : "none"} />
                        {isCallback ? "CALLBACK ACTIVE" : "USE CALLBACK"}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={btnUrl}
                      onChange={(e) => setBtnUrl(e.target.value)}
                      placeholder={
                        isCallback
                          ? "e.g. claim_reward_123"
                          : "https://t.me/..."
                      }
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSending || !message}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  {isSending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                  Dispatch Notification
                </button>
              </form>
            </div>
          </div>

          {/* --- LIVE PREVIEW --- */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden h-full min-h-[500px]">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Smartphone size={120} />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-8 opacity-50">
                  <Eye size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Telegram Preview
                  </span>
                </div>

                {/* Telegram Message Bubble */}
                <div className="bg-white text-slate-800 p-4 rounded-2xl rounded-tl-none self-start max-w-[90%] shadow-lg space-y-3">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message || (
                      <span className="text-slate-300 italic">
                        Your message will appear here...
                      </span>
                    )}
                  </div>
                  {btnText && (
                    <div className="pt-2">
                      <div className="w-full py-2.5 bg-[#f0f2f5] hover:bg-[#e4e6e9] text-[#2481cc] rounded-lg text-center text-xs font-bold border-b-2 border-slate-200 transition-all cursor-default flex items-center justify-center gap-2">
                        {isCallback && <Zap size={12} fill="#2481cc" />}
                        {btnText}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-10">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-400">
                      <AlertTriangle size={14} />
                      <span className="text-[10px] font-black uppercase">
                        Safety Check
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                      Ensure your message complies with Telegram's Anti-Spam
                      policy. Use HTML tags like <b>&lt;b&gt;</b> for bold
                      cautiously.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- BROADCAST HISTORY --- */}
          <div className="lg:col-span-12">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-slate-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Dispatch Log
                  </span>
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5 text-left">Message Snippet</th>
                    <th className="px-8 py-5 text-left">Target</th>
                    <th className="px-8 py-5 text-center">Status</th>
                    <th className="px-8 py-5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {history.length > 0 ? (
                    history.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/50 transition-all group"
                      >
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-slate-700 truncate max-w-xs">
                            {log.message}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[10px] font-black px-3 py-1 bg-slate-100 rounded-full text-slate-500">
                            {log.target}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center">
                            <span className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Completed
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-20 text-center text-slate-300"
                      >
                        <Info className="mx-auto mb-2 opacity-20" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          No broadcast history available
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
