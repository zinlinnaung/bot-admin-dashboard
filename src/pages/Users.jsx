import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Wallet,
  Calendar,
  XCircle,
  Package,
  Eye,
  X,
  Gift,
  Wifi,
} from "lucide-react";

export default function UsersDashboard() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    lastPage: 1,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  // Search and Pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const API_URL = "https://api.prototypeconnect.xyz/admin";

  // Debounce search input to prevent API spam
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch users when page or debounced search changes
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_URL}/users`, {
        params: {
          page: currentPage,
          limit: 10,
          search: debouncedSearch || undefined,
        },
      });

      if (response.data) {
        setUsers(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (err) {
      console.error("Fetch Users Error:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.lastPage) {
      setCurrentPage(newPage);
    }
  };

  const openCustomer = async (user) => {
    setSelectedCustomer(user);
    setCustomerDetails(null);
    setDetailsError("");
    setIsLoadingDetails(true);
    try {
      const response = await axios.get(`${API_URL}/users/${user.id}/purchases`);
      setCustomerDetails(response.data);
    } catch (err) {
      console.error("Fetch customer purchases error:", err);
      setDetailsError("Customer ဝယ်ယူမှုမှတ်တမ်းကို ရယူ၍မရပါ။");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeCustomer = () => {
    setSelectedCustomer(null);
    setCustomerDetails(null);
    setDetailsError("");
  };

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleString("en-GB", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const purchaseLabel = (purchase) => {
    if (purchase.product?.isFreeTrial || purchase.amount === 0) return "Trial";
    return purchase.product?.category || "Product";
  };

  const vpnState = (purchase) => {
    if (purchase.vpnKeyDeletedAt || purchase.deletion) return "Deleted/Ended";
    if (purchase.expiresAt && new Date(purchase.expiresAt) < new Date())
      return "Expired";
    if (purchase.product?.category === "VPN") return "Active";
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
        {/* --- HEADER & SEARCH BAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                User Management
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Total Users:{" "}
                <span className="text-blue-600 font-bold">{meta.total}</span>
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or username..."
              className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-2xl outline-none text-slate-700 font-medium transition-all focus:ring-4 focus:ring-blue-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <XCircle size={18} />
              </button>
            )}
          </div>
        </div>

        {/* --- ERROR STATE --- */}
        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 text-sm font-semibold flex items-center gap-2">
            <XCircle size={18} /> {error}
          </div>
        )}

        {/* --- DATA TABLE --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    User Profile
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Telegram ID
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Wallet Balance
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                    Purchases
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-32 text-center">
                      <Loader2
                        className="animate-spin mx-auto text-blue-500 mb-4"
                        size={40}
                      />
                      <p className="text-sm font-semibold text-slate-400 animate-pulse">
                        Loading user data...
                      </p>
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => openCustomer(user)}
                      className="hover:bg-blue-50/60 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center text-blue-700 font-bold text-lg">
                            {user.firstName
                              ? user.firstName[0].toUpperCase()
                              : "?"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {user.firstName || "Unknown"}
                            </p>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                              @{user.username || "No username"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                          {user.telegramId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Wallet size={16} className="text-emerald-500" />
                          <span className="font-bold">
                            {Number(user.balance).toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 font-bold uppercase">
                            MMK
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                          <Calendar size={16} className="text-slate-400" />
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            openCustomer(user);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-bold hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          <Eye size={16} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-32 text-center">
                      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users size={32} />
                      </div>
                      <p className="text-base font-bold text-slate-600">
                        No users found
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Try adjusting your search query.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- PAGINATION --- */}
          {!isLoading && meta.lastPage > 1 && (
            <div className="mt-auto px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <p className="text-sm font-semibold text-slate-500">
                Showing Page <span className="text-slate-900">{meta.page}</span>{" "}
                of <span className="text-slate-900">{meta.lastPage}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1.5 hidden sm:flex">
                  {[...Array(meta.lastPage)].map((_, i) => {
                    // Simple pagination display logic to prevent too many buttons
                    if (
                      meta.lastPage > 7 &&
                      i !== 0 &&
                      i !== meta.lastPage - 1 &&
                      Math.abs(i + 1 - currentPage) > 1
                    ) {
                      if (
                        i + 1 === currentPage - 2 ||
                        i + 1 === currentPage + 2
                      )
                        return (
                          <span key={i} className="px-2 text-slate-400">
                            ...
                          </span>
                        );
                      return null;
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                          currentPage === i + 1
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === meta.lastPage || isLoading}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex justify-end"
          onClick={closeCustomer}
        >
          <section
            className="w-full max-w-3xl h-full bg-slate-50 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Customer details
                </p>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  {selectedCustomer.firstName || "Unknown User"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  @{selectedCustomer.username || "No username"} ·{" "}
                  {selectedCustomer.telegramId}
                </p>
              </div>
              <button
                onClick={closeCustomer}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {isLoadingDetails ? (
                <div className="py-28 text-center text-slate-500">
                  <Loader2
                    className="animate-spin mx-auto mb-3 text-blue-600"
                    size={36}
                  />
                  Customer history ရယူနေပါသည်…
                </div>
              ) : detailsError ? (
                <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 font-semibold">
                  {detailsError}
                </div>
              ) : customerDetails ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-white border border-slate-100 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Purchases
                      </p>
                      <p className="text-2xl font-black mt-1">
                        {customerDetails.summary.totalPurchases}
                      </p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Total spent
                      </p>
                      <p className="text-2xl font-black mt-1">
                        {customerDetails.summary.totalSpent.toLocaleString()}{" "}
                        <span className="text-xs">MMK</span>
                      </p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 col-span-2 md:col-span-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Balance
                      </p>
                      <p className="text-2xl font-black mt-1">
                        {Number(customerDetails.user.balance).toLocaleString()}{" "}
                        <span className="text-xs">MMK</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 flex items-center gap-2 mb-3">
                      <Package size={20} className="text-blue-600" />{" "}
                      ဝယ်ယူ/အသုံးပြုထားသော Product များ
                    </h3>
                    {customerDetails.purchases.length ? (
                      <div className="space-y-3">
                        {customerDetails.purchases.map((purchase) => {
                          const state = vpnState(purchase);
                          return (
                            <article
                              key={purchase.id}
                              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex gap-3">
                                  <div
                                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${purchase.product?.isFreeTrial || purchase.amount === 0 ? "bg-violet-50 text-violet-600" : "bg-blue-50 text-blue-600"}`}
                                  >
                                    {purchase.product?.isFreeTrial ||
                                    purchase.amount === 0 ? (
                                      <Gift size={21} />
                                    ) : (
                                      <Package size={21} />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-black text-slate-900">
                                      {purchase.product?.name ||
                                        "Deleted product"}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                      #{purchase.id} · {purchaseLabel(purchase)}{" "}
                                      · {formatDate(purchase.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                <div className="sm:text-right">
                                  <p className="font-black text-slate-900">
                                    {purchase.amount.toLocaleString()} MMK
                                  </p>
                                  <span
                                    className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-bold ${purchase.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : purchase.status === "REJECTED" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}
                                  >
                                    {purchase.status}
                                  </span>
                                </div>
                              </div>
                              {(purchase.product?.category === "VPN" ||
                                purchase.expiresAt) && (
                                <div className="mt-4 pt-3 border-t border-slate-100 grid sm:grid-cols-3 gap-2 text-xs">
                                  <span className="flex items-center gap-1.5 text-slate-600">
                                    <Wifi size={14} /> {state}
                                  </span>
                                  <span className="text-slate-600">
                                    Limit:{" "}
                                    {purchase.vpnUsageLimitGB ||
                                      purchase.product?.usageLimitGB ||
                                      "—"}{" "}
                                    GB
                                  </span>
                                  <span className="text-slate-600">
                                    Expire: {formatDate(purchase.expiresAt)}
                                  </span>
                                  {purchase.deletion && (
                                    <span className="sm:col-span-3 text-rose-600 font-semibold">
                                      Ended: {purchase.deletion.reason} ·{" "}
                                      {formatDate(purchase.deletion.deletedAt)}
                                    </span>
                                  )}
                                </div>
                              )}
                              {(purchase.playerId || purchase.nickname) && (
                                <p className="mt-3 text-xs text-slate-600">
                                  Game account: {purchase.nickname || "—"} ·{" "}
                                  {purchase.playerId || "—"}
                                  {purchase.serverId
                                    ? ` (${purchase.serverId})`
                                    : ""}
                                </p>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center text-slate-400">
                        ဒီ customer မှာ ဝယ်ယူမှုမှတ်တမ်းမရှိသေးပါ။
                      </div>
                    )}
                    {customerDetails.summary.totalPurchases >
                      customerDetails.purchases.length && (
                      <p className="text-xs text-slate-400 text-center mt-3">
                        နောက်ဆုံး records 100 ခုအထိ ပြထားပါသည်။
                      </p>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
