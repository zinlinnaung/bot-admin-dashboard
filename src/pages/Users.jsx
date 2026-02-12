import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Search,
  Eye,
  X,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Trophy,
  AlertCircle,
} from "lucide-react";

// Helper for status badge colors
const getStatusColor = (status) => {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-600";
    case "WIN":
      return "bg-emerald-100 text-emerald-600";
    case "PENDING":
      return "bg-amber-100 text-amber-600";
    case "REJECTED":
      return "bg-rose-100 text-rose-600";
    case "LOSE":
      return "bg-rose-100 text-rose-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // For Modal
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, bets, wallet

  // Fetch All Users List
  useEffect(() => {
    axios
      .get(
        "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin/users",
      )
      .then((res) => setUsers(res.data));
  }, []);

  // Fetch Single User Detail
  const handleViewUser = async (userId) => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `https://telegram-ecommerce-bot-backend-production.up.railway.app/admin/users/${userId}`,
      );
      setSelectedUser(res.data);
      setActiveTab("overview");
    } catch (error) {
      console.error("Error fetching user details", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 relative">
      {/* Header & Search */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User className="text-blue-600" /> User Database
        </h2>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search username..."
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase font-bold">
            <tr>
              <th className="px-6 py-4">User Info</th>
              <th className="px-6 py-4">Balance</th>
              <th className="px-6 py-4">Joined Date</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800">
                      {u.firstName || "No Name"}
                    </span>
                    <span className="text-blue-500 text-xs">
                      @{u.username || "unknown"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 font-black text-emerald-600">
                  {Number(u.balance).toLocaleString()} MMK
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleViewUser(u.id)}
                    className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1 ml-auto"
                  >
                    <Eye size={16} />{" "}
                    <span className="text-xs font-bold">Detail</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= USER DETAIL MODAL ================= */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                  {selectedUser.firstName?.[0] || "U"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedUser.firstName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ID: {selectedUser.id} • @{selectedUser.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-200 rounded-full"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b px-6">
              {[
                { id: "overview", label: "Overview", icon: User },
                { id: "bets", label: "Bet History", icon: Trophy },
                { id: "wallet", label: "Transactions", icon: Wallet },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              {/* --- OVERVIEW TAB --- */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-500 text-white p-6 rounded-2xl shadow-lg">
                    <p className="opacity-80 text-sm font-medium mb-1">
                      Current Balance
                    </p>
                    <h2 className="text-3xl font-bold">
                      {Number(selectedUser.balance).toLocaleString()}{" "}
                      <span className="text-lg">MMK</span>
                    </h2>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                      <ArrowDownLeft size={20} />{" "}
                      <span className="font-bold">Total Deposit</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {selectedUser.totalDeposit?.toLocaleString() || 0} MMK
                    </h3>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-rose-600">
                      <ArrowUpRight size={20} />{" "}
                      <span className="font-bold">Total Withdraw</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {selectedUser.totalWithdraw?.toLocaleString() || 0} MMK
                    </h3>
                  </div>
                </div>
              )}

              {/* --- BET HISTORY TAB --- */}
              {activeTab === "bets" && (
                <div className="bg-white rounded-xl border overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-500 font-semibold">
                      <tr>
                        <th className="p-3">Type</th>
                        <th className="p-3">Number</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Result</th>
                        <th className="p-3 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedUser.bets?.map((bet) => (
                        <tr key={bet.id} className="hover:bg-gray-50">
                          <td className="p-3 font-medium">
                            {bet.type} ({bet.session})
                          </td>
                          <td className="p-3 font-bold text-lg">
                            {bet.number}
                          </td>
                          <td className="p-3">
                            {Number(bet.amount).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(bet.status)}`}
                            >
                              {bet.status}
                            </span>
                          </td>
                          <td className="p-3 text-right text-gray-400 text-xs">
                            {new Date(bet.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {selectedUser.bets?.length === 0 && (
                        <tr>
                          <td
                            colSpan="5"
                            className="p-8 text-center text-gray-400"
                          >
                            No betting history found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* --- TRANSACTIONS TAB --- */}
              {activeTab === "wallet" && (
                <div className="space-y-6">
                  {/* Deposits */}
                  <div>
                    <h4 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
                      <ArrowDownLeft size={16} /> Recent Deposits
                    </h4>
                    <div className="bg-white rounded-xl border overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <tbody className="divide-y">
                          {selectedUser.deposits?.map((dep) => (
                            <tr key={dep.id}>
                              <td className="p-3 font-bold text-emerald-600">
                                +{Number(dep.amount).toLocaleString()}
                              </td>
                              <td className="p-3 text-gray-500">
                                Deposit Request
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(dep.status)}`}
                                >
                                  {dep.status}
                                </span>
                              </td>
                              <td className="p-3 text-right text-gray-400 text-xs">
                                {new Date(dep.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Withdraws */}
                  <div>
                    <h4 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
                      <ArrowUpRight size={16} /> Recent Withdrawals
                    </h4>
                    <div className="bg-white rounded-xl border overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <tbody className="divide-y">
                          {selectedUser.withdraws?.map((wd) => (
                            <tr key={wd.id}>
                              <td className="p-3 font-bold text-rose-600">
                                -{Number(wd.amount).toLocaleString()}
                              </td>
                              <td className="p-3 text-gray-500">
                                {wd.method} - {wd.phoneNumber}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(wd.status)}`}
                                >
                                  {wd.status}
                                </span>
                              </td>
                              <td className="p-3 text-right text-gray-400 text-xs">
                                {new Date(wd.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
