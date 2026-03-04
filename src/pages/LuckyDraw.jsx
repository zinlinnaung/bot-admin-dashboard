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
  XCircle,
  User,
  Check,
  RefreshCcw,
  Users,
  Layers,
  ArrowUpRight,
  Zap,
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
  const dropdownRef = useRef(null);

  /** 1. System Actions */
  const handleFullReset = async () => {
    const confirm = window.prompt(
      "Type 'RESET' to wipe all data (Entries & Rigged):",
    );
    if (confirm !== "RESET") return;

    setIsProcessing(true);
    try {
      await axios.delete(`${API_URL}/lucky-draw/reset-all`);
      setParticipants([]);
      setRiggedWinners([]);
      alert("System Reset Successfully.");
    } catch (err) {
      alert("Reset Error");
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
      const data = Array.isArray(res.data) ? res.data : res.data?.data;
      setParticipants(data || []);
      setMeta(res.data?.meta || { total: data?.length || 0, lastPage: 1 });
    } catch (err) {
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
    if (riggedSearch.length > 0 && !selectedUser) {
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

  useEffect(() => {
    if (activeTab === "participants") {
      const delay = setTimeout(
        () => fetchParticipants(currentPage, searchTerm),
        400,
      );
      return () => clearTimeout(delay);
    } else {
      fetchRiggedWinners();
      if (participants.length === 0) fetchParticipants(1, "");
    }
  }, [searchTerm, activeTab, currentPage]);

  /** 3. Rigged Submission */
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
      alert("Target added successfully!");
    } catch (err) {
      alert("Error setting target");
    } finally {
      setIsProcessing(false);
    }
  };

  const participantCount = meta.total || 0;
  const progressPercent = Math.min((participantCount / 200) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* --- DASHBOARD HEADER --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
              <Zap size={28} fill="white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Lucky Draw Pro
              </h1>
              <p className="text-sm text-slate-400 font-semibold uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} /> Automation Engine
              </p>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-[11px] font-black uppercase text-slate-500 tracking-tighter">
              <span>Pool Progress</span>
              <span
                className={
                  participantCount >= 200 ? "text-rose-500" : "text-indigo-600"
                }
              >
                {participantCount} / 200
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-out ${participantCount >= 200 ? "bg-rose-500" : "bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]"}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center items-center gap-3">
          <button
            onClick={handleFullReset}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 transition-all active:scale-95"
          >
            <RefreshCcw
              size={16}
              className={isProcessing ? "animate-spin" : ""}
            />{" "}
            Reset System
          </button>
        </div>
      </div>

      {/* --- NAVIGATION TABS --- */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-200/50 p-1.5 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab("participants")}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === "participants" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Entry Management
          </button>
          <button
            onClick={() => setActiveTab("rigged")}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === "rigged" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Predefined Logic
          </button>
        </div>
      </div>

      {activeTab === "participants" ? (
        /* --- PARTICIPANTS UI --- */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative group">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Filter by MLBB ID, Nickname or Ticket..."
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm font-bold text-sm focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-10 py-6 text-center">#</th>
                    <th className="px-10 py-6">Identity</th>
                    <th className="px-10 py-6">Game Account</th>
                    <th className="px-10 py-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan="4" className="py-24 text-center">
                        <Loader2
                          className="animate-spin mx-auto text-indigo-600"
                          size={32}
                        />
                      </td>
                    </tr>
                  ) : participants.length > 0 ? (
                    participants.map((p, idx) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/50 group transition-all"
                      >
                        <td className="px-10 py-6 text-center text-slate-300 font-mono">
                          {(currentPage - 1) * 10 + (idx + 1)}
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 text-base">
                              #{p.ticketId}
                            </span>
                            <span className="text-[11px] text-indigo-500 font-black">
                              @{p.user?.username || "GUEST"}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-700 flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                              <Gamepad2 size={14} className="text-slate-400" />{" "}
                              {p.accName}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              ID: {p.playerId} ({p.serverId})
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          {p.isWinner ? (
                            <div className="flex flex-col gap-1.5">
                              <span className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border border-amber-100 w-fit">
                                <Sparkles size={12} fill="currentColor" />{" "}
                                {p.prize}
                              </span>
                              {p.isClaimed && (
                                <span className="text-[9px] text-emerald-500 font-bold ml-1 uppercase">
                                  Claimed
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-[9px] font-black uppercase">
                              Participating
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-32 text-center text-slate-300 font-black uppercase text-xs tracking-widest"
                      >
                        No matching entries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-10 py-6 bg-slate-50/50 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase">
                Page {currentPage} of {meta.lastPage}
              </span>
              <div className="flex gap-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((c) => c - 1)}
                  className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:shadow-md transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  disabled={currentPage >= meta.lastPage}
                  onClick={() => setCurrentPage((c) => c + 1)}
                  className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:shadow-md transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- RIGGED UI --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div
            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 h-fit"
            ref={dropdownRef}
          >
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <Target className="text-rose-600" /> Pre-Assign
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-semibold">
                Select a user to force a win.
              </p>
            </div>

            <form onSubmit={handleAddRigged} className="space-y-6">
              <div className="relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] mb-2 block ml-1">
                  Search Participant
                </label>
                <div className="relative">
                  <User
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${selectedUser ? "text-emerald-500" : "text-slate-400"}`}
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="@username"
                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none transition-all ${selectedUser ? "ring-2 ring-emerald-500 bg-emerald-50/20" : "focus:ring-2 focus:ring-rose-500"}`}
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
                  <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95">
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(p);
                          setSuggestions([]);
                        }}
                        className="w-full px-5 py-3 text-left hover:bg-slate-50 flex flex-col border-b border-slate-50 last:border-0"
                      >
                        <span className="text-sm font-black text-slate-800">
                          @{p.user.username}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                          {p.accName} • {p.ticketId}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] mb-2 block ml-1">
                  Award Prize
                </label>
                <select
                  className="..."
                  value={newPrize}
                  onChange={(e) => setNewPrize(e.target.value)}
                >
                  <option value="">Select Prize...</option>
                  <option value="1049_DIA">1st Prize (1049 Diamonds)</option>
                  <option value="WEEKLY_PASS">2nd Prize (Weekly Pass)</option>
                  <option value="11_DIA">3rd Prize (11 Diamonds)</option>
                </select>
              </div>

              <button
                disabled={isProcessing || !selectedUser || !newPrize}
                className="w-full py-5 bg-rose-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-rose-200 disabled:opacity-50 hover:bg-rose-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Plus size={16} />
                )}{" "}
                Assign Target
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
            <div className="bg-slate-50/80 px-10 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert size={16} className="text-rose-500" /> Active
                Rigged List
              </h3>
              <span className="text-[10px] font-bold text-slate-400">
                {riggedWinners.length} Targets
              </span>
            </div>
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-50">
                {riggedWinners.length > 0 ? (
                  riggedWinners.map((w) => (
                    <tr
                      key={w.id}
                      className="hover:bg-rose-50/20 transition-all"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-400">
                            <User size={16} />
                          </div>
                          <span className="font-bold text-slate-700 font-mono text-sm tracking-tighter">
                            {w.telegramId.toString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase border border-rose-100 flex items-center gap-2 w-fit">
                          <Trophy size={10} /> {w.prizeType}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button
                          onClick={() =>
                            axios
                              .delete(`${API_URL}/lucky-draw/rigged/${w.id}`)
                              .then(() => fetchRiggedWinners())
                          }
                          className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-100 rounded-2xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-40 text-center opacity-20">
                      <Target className="mx-auto" size={48} />
                      <p className="mt-4 text-xs font-black uppercase tracking-widest">
                        No predefined targets
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
