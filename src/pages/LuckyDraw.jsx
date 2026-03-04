import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Trophy,
  Ticket,
  Search,
  Trash2,
  ShieldAlert,
  Target,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Plus,
  User,
  RefreshCcw,
  Layers,
  Zap,
  TicketPercent,
  UserMinus,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

const API_URL = "https://vpnbot-production-e78a.up.railway.app/admin";

export default function LuckyDrawManager() {
  const [participants, setParticipants] = useState([]);
  const [riggedWinners, setRiggedWinners] = useState([]);
  const [activeTab, setActiveTab] = useState("participants");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, lastPage: 1 });

  // Rigged Autocomplete
  const [riggedSearch, setRiggedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [newPrize, setNewPrize] = useState("");

  /** 1. System Actions */
  const handleFullReset = async () => {
    const confirm = window.prompt(
      "Type 'RESET' to wipe all data (Entries & Rigged):",
    );
    if (confirm !== "RESET") return;

    setIsProcessing(true);
    try {
      await axios.delete(`${API_URL}/lucky-draw/reset-all`);
      fetchParticipants(1, "");
      fetchRiggedWinners();
      alert("System has been fully cleared.");
    } catch (err) {
      alert("Reset failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetLoser = async (id, name) => {
    if (!window.confirm(`Confirm giving 5% Discount Coupon to ${name}?`))
      return;

    setIsProcessing(true);
    try {
      await axios.post(`${API_URL}/lucky-draw/participants/${id}/set-loser`);
      alert("Coupon granted successfully!");
      fetchParticipants(currentPage, searchTerm);
    } catch (err) {
      alert("Operation failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  /** 2. Fetching Logic */
  const fetchParticipants = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/lucky-draw/participants`, {
        params: { page, limit: 10, search },
      });

      // ဒီနေရာမှာ Logic ကို စစ်ပေးပါ
      // ၁။ ဒေတာက Array တိုက်ရိုက်လာရင် res.data ကို ယူမယ်
      // ၂။ ဒေတာက { data: [], meta: {} } ပုံစံနဲ့လာရင် res.data.data ကို ယူမယ်
      const fetchedData = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setParticipants(fetchedData);

      // Meta data အတွက်လည်း အလားတူစစ်ပေးပါ
      if (res.data?.meta) {
        setMeta(res.data.meta);
      } else {
        setMeta({ total: fetchedData.length, lastPage: 1 });
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setParticipants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRiggedWinners = async () => {
    try {
      const res = await axios.get(`${API_URL}/lucky-draw/rigged`);
      setRiggedWinners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setRiggedWinners([]);
    }
  };

  useEffect(() => {
    if (activeTab === "participants") {
      const delay = setTimeout(
        () => fetchParticipants(currentPage, searchTerm),
        400,
      );
      return () => clearTimeout(delay);
    } else {
      fetchRiggedWinners();
    }
  }, [searchTerm, activeTab, currentPage]);

  // Autocomplete Logic
  useEffect(() => {
    if (riggedSearch.length > 1 && !selectedUser) {
      const filtered = participants.filter(
        (p) =>
          p.user?.username
            ?.toLowerCase()
            .includes(riggedSearch.toLowerCase()) ||
          p.accName?.toLowerCase().includes(riggedSearch.toLowerCase()),
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [riggedSearch, participants, selectedUser]);

  const handleAddRigged = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newPrize) return;
    setIsProcessing(true);
    try {
      await axios.post(`${API_URL}/lucky-draw/rigged`, {
        telegramId: selectedUser.user.telegramId.toString(),
        prizeType: newPrize,
      });
      setSelectedUser(null);
      setRiggedSearch("");
      setNewPrize("");
      fetchRiggedWinners();
      alert("Target locked successfully!");
    } catch (err) {
      alert("Error setting target.");
    } finally {
      setIsProcessing(false);
    }
  };

  const participantCount = meta.total || 0;
  const progressPercent = Math.min((participantCount / 200) * 100, 100);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans pb-20">
      {/* --- TOP BAR --- */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="font-black tracking-tight text-lg">
              LUCKY CONTROL
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleFullReset}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all"
            >
              <RefreshCcw
                size={14}
                className={isProcessing ? "animate-spin" : ""}
              />
              Emergency Reset
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 mt-4">
        {/* --- STATUS OVERVIEW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Ticket size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Total Entries
              </p>
              <h3 className="text-2xl font-black">{participantCount}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Trophy size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Predefined Targets
              </p>
              <h3 className="text-2xl font-black">{riggedWinners.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Pool Capacity
                </p>
                <span className="text-xs font-bold text-indigo-600">
                  {participantCount}/200
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(79,70,229,0.3)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN TABS --- */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 w-fit mx-auto shadow-sm">
          <button
            onClick={() => setActiveTab("participants")}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === "participants" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <Layers size={14} /> Entries
          </button>
          <button
            onClick={() => setActiveTab("rigged")}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === "rigged" ? "bg-rose-600 text-white shadow-lg shadow-rose-200" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <Target size={14} /> Rigged System
          </button>
        </div>

        {activeTab === "participants" ? (
          /* --- PARTICIPANTS SECTION --- */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Quick search entries..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-5 text-center w-16">#</th>
                    <th className="px-8 py-5 text-left">Player Info</th>
                    <th className="px-8 py-5 text-left">Game Identity</th>
                    <th className="px-8 py-5 text-left">Prize Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-indigo-600" />
                      </td>
                    </tr>
                  ) : (
                    participants.map((p, idx) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 transition-all group"
                      >
                        <td className="px-8 py-5 text-center font-mono text-xs text-slate-400">
                          {(currentPage - 1) * 10 + (idx + 1)}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 tracking-tight">
                              #{p.ticketId}
                            </span>
                            <span className="text-[11px] text-indigo-500 font-bold flex items-center gap-1">
                              <User size={10} /> @{p.user?.username || "Guest"}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              <Gamepad2 size={16} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-700">
                                {p.accName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {p.playerId} ({p.serverId})
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          {p.prize === "5% Discount Coupon" ? (
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full w-fit">
                              <TicketPercent size={12} />
                              <span className="text-[10px] font-black uppercase">
                                5% Coupon
                              </span>
                            </div>
                          ) : p.isWinner ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full w-fit">
                                <Sparkles size={12} />
                                <span className="text-[10px] font-black uppercase">
                                  {p.prize}
                                </span>
                              </div>
                              {p.isClaimed && (
                                <span className="text-[9px] text-emerald-500 font-bold ml-2">
                                  ✓ CLAIMED
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-2">
                              In Pool
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            {!p.isWinner &&
                              p.prize !== "5% Discount Coupon" && (
                                <button
                                  onClick={() =>
                                    handleSetLoser(p.id, p.accName)
                                  }
                                  className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
                                  title="Set as Loser (Give 5% Coupon)"
                                >
                                  <UserMinus size={18} />
                                </button>
                              )}
                            <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600 transition-all shadow-sm">
                              <ExternalLink size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  Page {currentPage} of {meta.lastPage}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => c - 1)}
                    className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:border-indigo-600"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={currentPage >= meta.lastPage}
                    onClick={() => setCurrentPage((c) => c + 1)}
                    className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:border-indigo-600"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- RIGGED SECTION --- */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-rose-600 mb-1">
                  <Target size={20} />
                  <h3 className="font-black text-lg">Target Configuration</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Pre-select winners for specific prizes.
                </p>
              </div>

              <form onSubmit={handleAddRigged} className="space-y-5">
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                    Search User
                  </label>
                  <div className="relative">
                    <User
                      className={`absolute left-4 top-1/2 -translate-y-1/2 ${selectedUser ? "text-emerald-500" : "text-slate-300"}`}
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Username or Ticket..."
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-rose-500/20"
                      value={
                        selectedUser
                          ? `@${selectedUser.user.username}`
                          : riggedSearch
                      }
                      onChange={(e) => {
                        setRiggedSearch(e.target.value);
                        setSelectedUser(null);
                      }}
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                      {suggestions.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(p);
                            setSuggestions([]);
                          }}
                          className="w-full px-5 py-3 text-left hover:bg-slate-50 flex flex-col border-b last:border-0"
                        >
                          <span className="text-sm font-black">
                            @{p.user.username}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {p.accName} • {p.ticketId}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                    Select Prize Pool
                  </label>
                  <select
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none appearance-none cursor-pointer"
                    value={newPrize}
                    onChange={(e) => setNewPrize(e.target.value)}
                  >
                    <option value="">Prize Type...</option>
                    <option value="1049_DIA">Grand Prize (1049💎)</option>
                    <option value="WEEKLY_PASS">Weekly Pass</option>
                    <option value="11_DIA">11 Diamonds</option>
                  </select>
                </div>

                <button
                  disabled={isProcessing || !selectedUser || !newPrize}
                  className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.1em] shadow-lg shadow-rose-200 hover:bg-rose-700 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Plus size={16} />
                  )}{" "}
                  Lock Target
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Active Rigged Queue
                  </span>
                  <div className="flex items-center gap-2 text-rose-500 px-3 py-1 bg-rose-50 rounded-full text-[10px] font-black uppercase">
                    <AlertCircle size={12} /> Live Override
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody className="divide-y divide-slate-50">
                      {riggedWinners.length > 0 ? (
                        riggedWinners.map((w) => (
                          <tr
                            key={w.id}
                            className="hover:bg-rose-50/10 transition-all"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-slate-100 rounded-xl text-slate-400">
                                  <User size={18} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-mono text-xs font-bold text-slate-500">
                                    ID: {w.telegramId.toString()}
                                  </span>
                                  <span className="text-sm font-black text-slate-800 tracking-tight">
                                    System Assigned
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="px-4 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 w-fit">
                                <Trophy size={12} /> {w.prizeType}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button
                                onClick={() =>
                                  axios
                                    .delete(
                                      `${API_URL}/lucky-draw/rigged/${w.id}`,
                                    )
                                    .then(() => fetchRiggedWinners())
                                }
                                className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-100 rounded-2xl transition-all"
                              >
                                <Trash2 size={20} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-32 text-center opacity-20">
                            <Target className="mx-auto" size={48} />
                            <p className="mt-4 text-[10px] font-black uppercase tracking-widest">
                              No Active Overrides
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
