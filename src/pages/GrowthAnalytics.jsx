import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api-auth";

export default function GrowthAnalytics() {
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const load = async () => {
    const [analytics, reviewData] = await Promise.all([
      axios.get(`${API_BASE_URL}/growth/analytics`),
      axios.get(`${API_BASE_URL}/growth/reviews`),
    ]);
    setData(analytics.data); setReviews(reviewData.data);
  };
  useEffect(() => { load().catch(() => setData({ error: true })); }, []);
  const moderate = async (id, approved) => { await axios.patch(`${API_BASE_URL}/growth/reviews/${id}`, { approved }); await load(); };
  if (!data) return <div className="p-5">တင်နေသည်…</div>;
  if (data.error) return <div className="rounded-xl bg-red-50 p-5 text-red-700">Growth analytics ကိုမရယူနိုင်ပါ။</div>;
  const cards = [["Referral starts", data.referrals], ["Rewarded referrals", data.rewarded], ["Open purchase intents", data.openIntents], ["Customer reviews", data.reviews], ["Approved positive reviews", data.approvedReviews]];
  return <div className="space-y-8">
    <div><h1 className="text-3xl font-bold">Customer Growth</h1><p className="text-gray-500">Campaign၊ referral၊ abandoned purchase နှင့် verified reviews</p></div>
    <div className="grid gap-4 md:grid-cols-5">{cards.map(([label, value]) => <div key={label} className="rounded-xl bg-white p-5 shadow"><div className="text-sm text-gray-500">{label}</div><div className="mt-2 text-2xl font-bold">{Number(value || 0).toLocaleString()}</div></div>)}</div>
    <section className="rounded-xl bg-white p-5 shadow"><h2 className="mb-4 text-xl font-bold">Campaign Source Performance</h2><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b"><th className="p-3">Source</th><th>Bot starts</th><th>Trials</th><th>Payment submitted</th><th>Paid users</th><th>Conversion</th><th>Revenue</th></tr></thead><tbody>{data.sources.map((row) => <tr key={row.source} className="border-b"><td className="p-3 font-semibold">{row.source}</td><td>{row.starts}</td><td>{row.trials}</td><td>{row.paymentSubmittedUsers}</td><td>{row.paidUsers}</td><td>{row.starts ? ((row.paidUsers / row.starts) * 100).toFixed(1) : 0}%</td><td>{Number(row.revenueMMK).toLocaleString()} MMK</td></tr>)}{!data.sources.length && <tr><td colSpan="7" className="p-4 text-gray-500">Campaign link data မရှိသေးပါ။ `?start=src_facebook` ပုံစံဖြင့် စတင်အသုံးပြုပါ။</td></tr>}</tbody></table></div></section>
    <section className="rounded-xl bg-white p-5 shadow"><h2 className="mb-4 text-xl font-bold">Customer Reviews</h2><div className="space-y-3">{reviews.map((review) => <div key={review.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><div className="font-semibold">{review.rating === "POSITIVE" ? "👍" : "👎"} {review.user.firstName || review.user.username || "Customer"}</div><div className="text-sm text-gray-500">{review.purchase.product.name} • {new Date(review.createdAt).toLocaleString()}</div></div><div className="flex gap-2"><button onClick={() => moderate(review.id, true)} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white">Public approve</button><button onClick={() => moderate(review.id, false)} className="rounded-lg bg-gray-200 px-3 py-2 text-sm">Hide</button></div></div>)}{!reviews.length && <p className="text-gray-500">Review မရှိသေးပါ။</p>}</div></section>
  </div>;
}
