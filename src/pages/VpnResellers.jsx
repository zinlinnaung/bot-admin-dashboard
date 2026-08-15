import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api-auth";

const money = (value) => `${Number(value || 0).toLocaleString()} MMK`;

export default function VpnResellers() {
  const [data, setData] = useState({ summary: {}, accounts: [] });
  const [error, setError] = useState("");
  const load = () =>
    axios
      .get(`${API_BASE_URL}/admin/vpn-resellers`)
      .then((r) => setData(r.data))
      .catch((e) =>
        setError(e.response?.data?.message || "Reseller data မရပါ။"),
      );
  useEffect(load, []);
  const post = async (url, body = {}) => {
    setError("");
    try {
      await axios.post(`${API_BASE_URL}${url}`, body);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "လုပ်ဆောင်မှု မအောင်မြင်ပါ။");
    }
  };
  const patch = async (url, body) => {
    setError("");
    try {
      await axios.patch(`${API_BASE_URL}${url}`, body);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "ပြင်ဆင်မှု မအောင်မြင်ပါ။");
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">VPN Resellers</h1>
        <p className="text-slate-500">
          လျှောက်လွှာ၊ wallet၊ key limit နှင့် reseller အခြေအနေ စီမံခန့်ခွဲရန်
        </p>
      </div>
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>
      )}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(data.summary || {}).map(([key, value]) => (
          <div key={key} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm uppercase text-slate-500">{key}</p>
            <p className="text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-4">Customer</th>
              <th>အခြေအနေ</th>
              <th>Wallet / Orders</th>
              <th>ဈေး / Limit</th>
              <th className="p-4">လုပ်ဆောင်ချက်</th>
            </tr>
          </thead>
          <tbody>
            {data.accounts.map((a) => (
              <ResellerRow key={a.id} account={a} post={post} patch={patch} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResellerRow({ account: a, post, patch }) {
  const [wholesalePrice, setWholesale] = useState(a.wholesalePrice);
  const [suggestedRetailPrice, setRetail] = useState(a.suggestedRetailPrice);
  const [dailyKeyLimit, setLimit] = useState(a.dailyKeyLimit);
  return (
    <tr className="border-t align-top">
      <td className="p-4">
        <b>{a.user.firstName || "User"}</b>
        <p>@{a.user.username || "-"}</p>
        <p>{a.user.telegramId}</p>
      </td>
      <td className="py-4 font-bold">{a.status}</td>
      <td className="py-4">
        {money(a.balance)}
        <p>{a.orders} orders</p>
      </td>
      <td className="py-4">
        <input
          className="mb-1 w-24 rounded border p-1"
          type="number"
          value={wholesalePrice}
          onChange={(e) => setWholesale(e.target.value)}
        />
        <input
          className="mb-1 block w-24 rounded border p-1"
          type="number"
          value={suggestedRetailPrice}
          onChange={(e) => setRetail(e.target.value)}
        />
        <input
          className="block w-24 rounded border p-1"
          type="number"
          value={dailyKeyLimit}
          onChange={(e) => setLimit(e.target.value)}
        />
      </td>
      <td className="p-4 space-x-2 space-y-2">
        {a.status === "PENDING" && (
          <>
            <button
              className="rounded bg-emerald-600 px-3 py-2 text-white"
              onClick={() => post(`/admin/vpn-resellers/${a.id}/approve`)}
            >
              Approve
            </button>
            <button
              className="rounded bg-red-600 px-3 py-2 text-white"
              onClick={() =>
                post(`/admin/vpn-resellers/${a.id}/reject`, {
                  note: "Admin rejected",
                })
              }
            >
              Reject
            </button>
          </>
        )}
        {a.status === "ACTIVE" && (
          <button
            className="rounded bg-amber-600 px-3 py-2 text-white"
            onClick={() =>
              patch(`/admin/vpn-resellers/${a.id}/status`, {
                status: "SUSPENDED",
              })
            }
          >
            Suspend
          </button>
        )}
        {a.status === "SUSPENDED" && (
          <button
            className="rounded bg-emerald-600 px-3 py-2 text-white"
            onClick={() =>
              patch(`/admin/vpn-resellers/${a.id}/status`, { status: "ACTIVE" })
            }
          >
            Resume
          </button>
        )}
        <button
          className="rounded bg-blue-600 px-3 py-2 text-white"
          onClick={() =>
            patch(`/admin/vpn-resellers/${a.id}/limits`, {
              wholesalePrice: Number(wholesalePrice),
              suggestedRetailPrice: Number(suggestedRetailPrice),
              dailyKeyLimit: Number(dailyKeyLimit),
            })
          }
        >
          Save limits
        </button>
      </td>
    </tr>
  );
}
