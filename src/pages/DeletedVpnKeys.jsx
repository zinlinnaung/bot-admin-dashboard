import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api-auth";
import { Loader2, ShieldOff } from "lucide-react";

const formatBytes = (value) => {
  if (!value) return "—";
  return `${(Number(value) / 1_000_000_000).toFixed(2)} GB`;
};

export default function DeletedVpnKeys() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/admin/deleted-vpn-keys?page=${page}&limit=25`)
      .then((response) => setData(response.data))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <ShieldOff className="text-rose-500" /> Deleted VPN Key History
        </h1>
        <p className="text-gray-500 mt-1">
          Outline မှဖျက်ထားသော key အားလုံး၏ မဖျက်နိုင်သည့် audit history
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                {[
                  "Date",
                  "User",
                  "Product",
                  "Outline ID",
                  "Reason",
                  "Usage",
                  "Notice",
                ].map((x) => (
                  <th className="p-4" key={x}>
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="p-4 whitespace-nowrap">
                    {new Date(item.deletedAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {item.purchase?.externalCustomerName ||
                      item.user.firstName ||
                      item.user.username ||
                      item.user.telegramId}
                  </td>
                  <td className="p-4 font-semibold">{item.productName}</td>
                  <td className="p-4 font-mono text-xs">{item.outlineKeyId}</td>
                  <td className="p-4">
                    {item.reason === "EXPIRED" ? "Expired" : "Data Full"}
                  </td>
                  <td className="p-4">{formatBytes(item.usageBytes)}</td>
                  <td className="p-4">
                    {item.purchase?.externalCustomerName
                      ? "— External"
                      : item.notificationSent
                        ? "✅ Sent"
                        : "⚠️ Failed"}
                  </td>
                </tr>
              ))}
              {!data.items.length && (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-400">
                    Deleted key history မရှိသေးပါ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Total: {data.total}</span>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-white rounded-xl disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="px-4 py-2">
            {data.page} / {Math.max(1, data.pages)}
          </span>
          <button
            className="px-4 py-2 bg-white rounded-xl disabled:opacity-40"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
