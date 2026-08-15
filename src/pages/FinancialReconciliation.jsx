import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api-auth";

export default function FinancialReconciliation() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/admin/financial-reconciliation`)
      .then((response) => setData(response.data))
      .catch((err) =>
        setError(
          err.response?.status === 403
            ? "Owner သို့မဟုတ် Finance admin သာကြည့်နိုင်ပါသည်။"
            : "Financial audit ရယူ၍မရပါ။",
        ),
      );
  }, []);
  if (error)
    return <div className="rounded-xl bg-red-50 p-5 text-red-700">{error}</div>;
  if (!data) return <div className="p-5">Wallet ledger စစ်ဆေးနေပါသည်…</div>;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Financial Reconciliation</h1>
        <p className="text-gray-500">
          Report only — customer balance ကို အလိုအလျောက်မပြောင်းပါ
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Users checked", data.usersChecked],
          ["Matched", data.matchedUsers],
          ["Need review", data.mismatchedUsers],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
        {data.warning}
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-3">Customer</th>
              <th className="p-3">Current balance</th>
              <th className="p-3">Ledger balance</th>
              <th className="p-3">Difference</th>
              <th className="p-3">Entries</th>
            </tr>
          </thead>
          <tbody>
            {data.mismatches.map((row) => (
              <tr key={row.userId} className="border-b">
                <td className="p-3">
                  <b>{row.firstName || "Unknown"}</b>
                  <div className="text-xs text-gray-400">{row.telegramId}</div>
                </td>
                <td className="p-3">{row.balance.toLocaleString()} MMK</td>
                <td className="p-3">
                  {row.ledgerBalance.toLocaleString()} MMK
                </td>
                <td className="p-3 font-bold text-rose-600">
                  {row.difference.toLocaleString()} MMK
                </td>
                <td className="p-3">{row.ledgerEntries}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
