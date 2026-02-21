import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  User,
  Search,
  Eye,
  X,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Trophy,
  UserMinus,
  UserPlus,
  Loader2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  PlusCircle,
  ShieldCheck, // Added for Reseller status
  Settings, // Added for Tab icon
} from "lucide-react";

const API_URL =
  "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // --- Pagination & Meta States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, lastPage: 1, limit: 10 });
  const [isLoading, setIsLoading] = useState(false);

  // --- Adjustment Form States ---
  const [deductAmount, setDeductAmount] = useState("");
  const [deductReason, setDeductReason] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * 1. CORE FETCH FUNCTION
   */
  const fetchUsers = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users`, {
        params: {
          page: page,
          limit: 10,
          search: search,
        },
      });

      if (res.data && Array.isArray(res.data.data)) {
        setUsers(res.data.data);
        setMeta(res.data.meta);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 2. SEARCH DEBOUNCE EFFECT
   */
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  /**
   * 3. PAGINATION EFFECT
   */
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchUsers(newPage, searchTerm);
  };

  const handleViewUser = async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/users/${userId}`);
      setSelectedUser(res.data);
      setActiveTab("overview");
      setDeductAmount("");
      setDeductReason("");
      setDepositAmount("");
      setDepositNote("");
    } catch (error) {
      console.error("Error fetching user details", error);
    }
  };

  // --- NEW: ROLE MANAGEMENT INTEGRATION ---
  // --- NEW: ROLE MANAGEMENT INTEGRATION ---
  const handleToggleReseller = async () => {
    const isCurrentlyReseller = selectedUser.isReseller === true;

    // logic for removing reseller
    if (isCurrentlyReseller) {
      if (!window.confirm("Reseller အဖြစ်မှ ပယ်ဖျက်ရန် သေချာပါသလား?")) return;

      setIsProcessing(true);
      try {
        await axios.patch(`${API_URL}/users/${selectedUser.id}/role`, {
          role: "USER",
          commission: 0, // Reset commission when removing role
        });
        alert("✅ Reseller အဖြစ်မှ ပယ်ဖျက်ပြီးပါပြီ");
        handleViewUser(selectedUser.id);
        fetchUsers(currentPage, searchTerm);
      } catch (err) {
        alert(
          "Error: " +
            (err.response?.data?.message || "လုပ်ဆောင်ချက် မအောင်မြင်ပါ"),
        );
      } finally {
        setIsProcessing(false);
      }
    }
    // logic for promoting to reseller
    else {
      const commissionInput = window.prompt(
        "ကော်မရှင်နှုန်း ထည့်သွင်းပါ (ဥပမာ - 10)",
        "10",
      );

      // If user clicks cancel
      if (commissionInput === null) return;

      const commissionValue = parseFloat(commissionInput);
      if (isNaN(commissionValue) || commissionValue < 0) {
        return alert("မှန်ကန်သော ကော်မရှင်နှုန်းကို ဂဏန်းဖြင့် ထည့်သွင်းပါ");
      }

      setIsProcessing(true);
      try {
        await axios.patch(`${API_URL}/users/${selectedUser.id}/role`, {
          role: "RESELLER",
          commission: commissionValue,
        });
        alert(
          `✅ Reseller အဖြစ် ခန့်အပ်မှု အောင်မြင်ပါသည် (${commissionValue}%)`,
        );
        handleViewUser(selectedUser.id);
        fetchUsers(currentPage, searchTerm);
      } catch (err) {
        alert(
          "Error: " +
            (err.response?.data?.message || "လုပ်ဆောင်ချက် မအောင်မြင်ပါ"),
        );
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!depositAmount) return;
    setIsProcessing(true);
    try {
      await axios.post(`${API_URL}/add-balance`, {
        userId: selectedUser.id,
        amount: Number(depositAmount),
        reason: depositNote || "Admin Manual Deposit",
      });
      alert("✅ ငွေဖြည့်သွင်းမှု အောင်မြင်ပါသည်");
      handleViewUser(selectedUser.id);
      fetchUsers(currentPage, searchTerm);
    } catch (err) {
      alert(
        "Error: " +
          (err.response?.data?.message || "လုပ်ဆောင်ချက် မအောင်မြင်ပါ"),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeductSubmit = async (e) => {
    e.preventDefault();
    if (!deductAmount || !deductReason) return;
    if (!window.confirm(`နှုတ်ယူရန် သေချာပါသလား?`)) return;

    setIsProcessing(true);
    try {
      await axios.post(`${API_URL}/deduct-balance`, {
        userId: selectedUser.id,
        amount: Number(deductAmount),
        reason: deductReason,
      });
      alert("✅ ငွေနှုတ်ယူမှု အောင်မြင်ပါသည်");
      handleViewUser(selectedUser.id);
      fetchUsers(currentPage, searchTerm);
    } catch (err) {
      alert(
        "Error: " +
          (err.response?.data?.message || "လုပ်ဆောင်ချက် မအောင်မြင်ပါ"),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
      case "WIN":
        return "bg-emerald-100 text-emerald-600";
      case "PENDING":
        return "bg-amber-100 text-amber-600";
      case "REJECTED":
      case "LOSE":
        return "bg-rose-100 text-rose-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6 max-h-screen overflow-hidden p-2">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2 text-gray-800">
            <User className="text-blue-600" size={28} />
            User Database
          </h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
            Total Results: {meta.total}
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search across all pages..."
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- MAIN TABLE AREA --- */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-[76vh] overflow-hidden">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm shadow-sm">
              <tr className="text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Current Funds</th>
                <th className="px-8 py-6">Registration</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-blue-600"
                      size={32}
                    />
                    <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">
                      Fetching Data...
                    </p>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-blue-50/20 transition-all group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black relative">
                          {u.firstName?.[0] || "?"}
                          {/* Reseller Badge in Table */}
                          {u.role === "RESELLER" && (
                            <div className="absolute -top-1 -right-1 bg-amber-400 text-white p-0.5 rounded-full border-2 border-white">
                              <ShieldCheck size={10} />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-base flex items-center gap-1.5">
                            {u.firstName}
                            {u.role === "RESELLER" && (
                              <span className="text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md font-black tracking-tighter uppercase">
                                Reseller
                              </span>
                            )}
                          </span>
                          <span className="text-blue-500 text-xs font-semibold">
                            @{u.username || "unknown"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-black text-gray-900 text-lg">
                        {Number(u.balance).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-1.5 font-bold">
                        MMK
                      </span>
                    </td>
                    <td className="px-8 py-5 text-gray-400 text-xs font-bold italic">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleViewUser(u.id)}
                        className="p-3 text-blue-600 bg-blue-50 rounded-2xl transition-all inline-flex items-center gap-2 hover:bg-blue-600 hover:text-white"
                      >
                        <Eye size={18} />
                        <span className="text-xs font-black uppercase">
                          Detail
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-8 py-20 text-center text-gray-300 font-bold uppercase tracking-widest"
                  >
                    No Users Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION FOOTER --- */}
        {meta.lastPage > 1 && (
          <div className="px-8 py-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 z-30">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Showing Page <span className="text-gray-900">{meta.page}</span> of{" "}
              <span className="text-gray-900">{meta.lastPage}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-blue-600 hover:text-white disabled:opacity-20 transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-1.5">
                {[...Array(meta.lastPage)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                        : "bg-white border border-gray-200 text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === meta.lastPage || isLoading}
                className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-blue-600 hover:text-white disabled:opacity-20 transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- USER DETAIL MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-200">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-xl">
                  {selectedUser.firstName?.[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">
                    {selectedUser.firstName}
                  </h3>
                  <p className="text-sm text-blue-500 font-bold italic tracking-wide">
                    @{selectedUser.username || "unknown"} • ID:{" "}
                    {selectedUser.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-4 bg-white hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all shadow-sm"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex px-8 border-b overflow-x-auto bg-white sticky top-0 z-10">
              {[
                { id: "overview", label: "Overview", icon: Wallet },
                { id: "deposit", label: "Add Funds", icon: UserPlus },
                { id: "deduct", label: "Deduct Funds", icon: UserMinus },
                { id: "bets", label: "Bet Logs", icon: Trophy },
                { id: "admin", label: "Manage Role", icon: Settings }, // Added Tab
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-b-4 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/30 custom-scrollbar">
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                  <div className="bg-gray-900 p-8 rounded-[2rem] text-white shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3">
                      Wallet Balance
                    </p>
                    <h2 className="text-3xl font-black">
                      {Number(selectedUser.balance).toLocaleString()}{" "}
                      <span className="text-sm font-light">MMK</span>
                    </h2>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-emerald-50 shadow-sm flex flex-col justify-center">
                    <ArrowDownLeft
                      className="text-emerald-500 mb-2"
                      size={24}
                    />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Deposited
                    </p>
                    <h3 className="text-xl font-black text-gray-800">
                      {selectedUser.totalDeposit?.toLocaleString() || 0}
                    </h3>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-rose-50 shadow-sm flex flex-col justify-center">
                    <ArrowUpRight className="text-rose-500 mb-2" size={24} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Withdrawn
                    </p>
                    <h3 className="text-xl font-black text-gray-800">
                      {selectedUser.totalWithdraw?.toLocaleString() || 0}
                    </h3>
                  </div>
                </div>
              )}

              {/* ROLE MANAGEMENT TAB CONTENT */}
              {/* ROLE MANAGEMENT TAB CONTENT */}
              {activeTab === "admin" && (
                <div className="max-w-xl mx-auto animate-in zoom-in-95">
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl text-center">
                    <div
                      className={`w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-3xl ${
                        selectedUser.role === "RESELLER"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <ShieldCheck size={40} />
                    </div>
                    <h4 className="text-xl font-black text-gray-900">
                      Account Privileges
                    </h4>

                    {/* Dynamic Text Based on Role */}
                    {/* Dynamic Text Based on Role */}
                    <p className="text-gray-500 text-sm mt-2 mb-2 font-medium">
                      {selectedUser.isReseller
                        ? "လက်ရှိတွင် ဤအသုံးပြုသူသည် Reseller ဖြစ်ပါသည်။"
                        : "ဤအသုံးပြုသူသည် Standard User ဖြစ်ပါသည်။ Reseller အဖြစ်သို့ တိုးမြှင့်နိုင်ပါသည်။"}
                    </p>

                    {/* Show Commission if Reseller */}
                    {selectedUser.isReseller && (
                      <div className="mb-8 inline-block bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                        Commission Rate: {selectedUser.commission || 0}%
                      </div>
                    )}

                    <button
                      onClick={handleToggleReseller}
                      disabled={isProcessing}
                      className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg ${
                        selectedUser.isReseller
                          ? "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"
                          : "bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white"
                      }`}
                    >
                      {isProcessing ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <>
                          <Settings size={18} />
                          {selectedUser.isReseller
                            ? "Remove Reseller Status"
                            : "Promote to Reseller"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "deposit" && (
                <div className="max-w-xl mx-auto animate-in zoom-in-95">
                  <div className="bg-white rounded-[2.5rem] border border-emerald-100 p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                        <PlusCircle size={24} />
                      </div>
                      <h4 className="text-xl font-black text-gray-900">
                        Add Balance
                      </h4>
                    </div>
                    <form onSubmit={handleDepositSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          Deposit Amount
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            placeholder="0"
                            className="w-full px-6 py-4 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl outline-none font-mono text-2xl font-black text-emerald-600"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-emerald-200">
                            MMK
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          Note (Optional)
                        </label>
                        <input
                          type="text"
                          className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none font-bold text-gray-700"
                          value={depositNote}
                          onChange={(e) => setDepositNote(e.target.value)}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <>
                            <UserPlus size={18} /> Add Balance
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === "deduct" && (
                <div className="max-w-xl mx-auto animate-in zoom-in-95">
                  <div className="bg-white rounded-[2.5rem] border border-rose-100 p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                        <ShieldAlert size={24} />
                      </div>
                      <h4 className="text-xl font-black text-gray-900">
                        Adjustment Panel
                      </h4>
                    </div>
                    <form onSubmit={handleDeductSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          Reduction Amount
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            className="w-full px-6 py-4 bg-rose-50/30 border-2 border-rose-100 rounded-2xl outline-none font-mono text-2xl font-black text-rose-600"
                            value={deductAmount}
                            onChange={(e) => setDeductAmount(e.target.value)}
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-rose-200">
                            MMK
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          Reason
                        </label>
                        <textarea
                          required
                          rows="3"
                          className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none font-bold text-gray-700"
                          value={deductReason}
                          onChange={(e) => setDeductReason(e.target.value)}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <>
                            <UserMinus size={18} /> Confirm Reduction
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === "bets" && (
                <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden animate-in fade-in">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      <tr>
                        <th className="p-5">Type</th>
                        <th className="p-5">Number</th>
                        <th className="p-5">Bet</th>
                        <th className="p-5">Status</th>
                        <th className="p-5 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs font-bold text-gray-700">
                      {selectedUser.bets?.map((bet) => (
                        <tr
                          key={bet.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-5 font-black uppercase">
                            {bet.type}
                          </td>
                          <td className="p-5 text-lg font-black">
                            {bet.number}
                          </td>
                          <td className="p-5">
                            {Number(bet.amount).toLocaleString()}
                          </td>
                          <td className="p-5">
                            <span
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${getStatusColor(bet.status)}`}
                            >
                              {bet.status}
                            </span>
                          </td>
                          <td className="p-5 text-right text-gray-400">
                            {new Date(bet.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
