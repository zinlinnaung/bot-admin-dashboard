import React, { useEffect, useState } from "react";

const TransactionHistory = () => {
  const [groupedTransactions, setGroupedTransactions] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE_URL =
    "https://telegram-ecommerce-bot-backend-production.up.railway.app";

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/transactions`);
      const result = await res.json();

      // Group transactions by telegramId
      const grouped = result.data.reduce((acc, txn) => {
        const key = txn.telegramId;
        if (!acc[key]) {
          acc[key] = {
            username: txn.username || "Unknown User",
            telegramId: txn.telegramId,
            items: [],
          };
        }
        acc[key].items.push(txn);
        return acc;
      }, {});

      setGroupedTransactions(grouped);
    } catch (err) {
      console.error("Failed to fetch", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (telegramId) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [telegramId]: !prev[telegramId],
    }));
  };

  const getTypeBadge = (type) => {
    const styles = {
      DEPOSIT: "bg-green-100 text-green-800 border border-green-200",
      PURCHASE: "bg-blue-100 text-blue-800 border border-blue-200",
      REFUND: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    };
    return styles[type] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  // Filter groups based on search term (username or ID)
  const filteredGroups = Object.values(groupedTransactions).filter(
    (group) =>
      group.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.telegramId.toString().includes(searchTerm),
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-extrabold text-gray-800">
            Transaction History{" "}
            <span className="text-sm font-normal text-gray-500 block md:inline">
              (User Grouped View)
            </span>
          </h2>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by User or ID..."
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 font-medium">
              Loading Records...
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div
                  key={group.telegramId}
                  className="border border-gray-200 rounded-lg transition-all overflow-hidden shadow-sm"
                >
                  {/* User Header (The Fold) */}
                  <button
                    onClick={() => toggleUser(group.telegramId)}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                      expandedUsers[group.telegramId]
                        ? "bg-blue-50"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {group.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {group.username}
                        </h3>
                        <p className="text-xs text-gray-500">
                          ID: {group.telegramId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="bg-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                        {group.items.length} Transactions
                      </span>
                      <span
                        className={`transform transition-transform duration-200 ${expandedUsers[group.telegramId] ? "rotate-180" : ""}`}
                      >
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Expanded Content (The Table) */}
                  {expandedUsers[group.telegramId] && (
                    <div className="overflow-x-auto bg-gray-50 border-t border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Description</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {group.items.map((txn) => (
                            <tr
                              key={txn.id}
                              className="hover:bg-blue-50/30 transition-colors"
                            >
                              <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
                                {new Date(txn.createdAt).toLocaleString()}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase ${getTypeBadge(txn.type)}`}
                                >
                                  {txn.type}
                                </span>
                              </td>
                              <td
                                className={`px-6 py-3 whitespace-nowrap text-sm font-extrabold ${
                                  ["DEPOSIT", "REFUND"].includes(txn.type)
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {["DEPOSIT", "REFUND"].includes(txn.type)
                                  ? "+"
                                  : "-"}{" "}
                                {Number(txn.amount).toLocaleString()} MMK
                              </td>
                              <td className="px-6 py-3 text-xs text-gray-600 italic">
                                {txn.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500 italic">
                No transactions found for "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
