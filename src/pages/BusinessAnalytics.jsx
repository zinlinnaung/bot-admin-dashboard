import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api-auth";

const formatMoney = (value) => `${Number(value || 0).toLocaleString()} MMK`;

export default function BusinessAnalytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`${API_BASE_URL}/admin/business-analytics`)
      .then((response) => setData(response.data))
      .catch(() => setError("Business analytics ကို မရယူနိုင်သေးပါ။"));
  }, []);

  if (error) return <div className="rounded-xl bg-red-50 p-5 text-red-700">{error}</div>;
  if (!data) return <div className="p-5">တင်နေသည်…</div>;

  const cards = [
    ["နေ့စဉ်ဝင်ငွေ", formatMoney(data.revenue.dailyMMK)],
    ["အပတ်စဉ်ဝင်ငွေ", formatMoney(data.revenue.weeklyMMK)],
    ["လစဉ်ဝင်ငွေ", formatMoney(data.revenue.monthlyMMK)],
    ["Trial → Paid", `${data.trial.conversionRate}%`],
    ["Renewal rate", `${data.customers.renewalRate}%`],
    ["Returning customers", data.customers.returning],
    ["VPN ပျမ်းမျှအသုံးပြုမှု", `${data.operations.averageVpnUsagePercent}%`],
    ["Support ဖြေရှင်းချိန်", `${data.operations.averageSupportResolutionHours} နာရီ`],
    ["Failed orders (၃၀ ရက်)", data.operations.failedOrders30Days],
  ];

  return <div className="space-y-8">
    <div><h1 className="text-3xl font-bold">Business Analytics</h1><p className="text-gray-500">VPN business ရောင်းအား၊ conversion နှင့် customer retention</p></div>
    <div className="grid gap-4 md:grid-cols-3">{cards.map(([label, value]) => <div key={label} className="rounded-xl bg-white p-5 shadow"><div className="text-sm text-gray-500">{label}</div><div className="mt-2 text-2xl font-bold">{value}</div></div>)}</div>
    <section className="rounded-xl bg-white p-5 shadow">
      <h2 className="mb-4 text-xl font-bold">လစဉ် Package ရောင်းအား</h2>
      <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b"><th className="p-3">Package</th><th className="p-3">Category</th><th className="p-3">Orders</th><th className="p-3">Revenue</th></tr></thead><tbody>{data.packages.map((item) => <tr key={item.productId} className="border-b"><td className="p-3 font-medium">{item.name}</td><td className="p-3">{item.category}</td><td className="p-3">{item.orders}</td><td className="p-3">{formatMoney(item.revenueMMK)}</td></tr>)}</tbody></table></div>
    </section>
  </div>;
}
