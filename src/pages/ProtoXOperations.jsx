import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api-auth";

export default function ProtoXOperations() {
  const [analytics, setAnalytics] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [analyticsResponse, ticketsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/proto-x/analytics`),
        axios.get(`${API_BASE_URL}/admin/proto-x/tickets`),
      ]);
      setAnalytics(analyticsResponse.data);
      setTickets(ticketsResponse.data);
      setError("");
    } catch {
      setError("Proto-X အချက်အလက်များကို ယခု မရယူနိုင်သေးပါ။");
    }
  }, []);

  useEffect(() => {
    // Data is loaded once when this admin view opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const updateTicket = async (id, status) => {
    await axios.patch(`${API_BASE_URL}/admin/proto-x/tickets/${id}`, { status });
    await load();
  };

  if (error) return <div className="rounded-xl bg-red-50 p-5 text-red-700">{error}</div>;
  if (!analytics) return <div className="p-5">တင်နေသည်…</div>;

  const cards = [
    ["မေးခွန်း (၃၀ ရက်)", analytics.total],
    ["မဖြေရှင်းနိုင်သေး", analytics.unresolved],
    ["အသုံးဝင်", analytics.helpful],
    ["Support ဖွင့်ထား", analytics.openTickets],
  ];

  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold">Proto-X AI လုပ်ငန်းစင်တာ</h1><p className="text-gray-500">AI အရည်အသွေးနှင့် customer support အခြေအနေ</p></div>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(([label, value]) => <div key={label} className="rounded-xl bg-white p-5 shadow"><div className="text-sm text-gray-500">{label}</div><div className="mt-2 text-3xl font-bold">{value}</div></div>)}
      </div>
      <section className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-4 text-xl font-bold">မဖြေရှင်းနိုင်သော နောက်ဆုံးမေးခွန်းများ</h2>
        {analytics.recentFailures.length === 0 ? <p className="text-gray-500">မရှိသေးပါ။</p> : analytics.recentFailures.map((item) => <div key={item.id} className="border-b py-3"><div>{item.question}</div><div className="text-xs text-gray-500">Telegram {item.telegramId} · {item.source}</div></div>)}
      </section>
      <section className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-4 text-xl font-bold">Support tickets</h2>
        {tickets.length === 0 ? <p className="text-gray-500">Ticket မရှိသေးပါ။</p> : tickets.map((ticket) => <div key={ticket.id} className="flex items-center justify-between gap-4 border-b py-3"><div><div className="font-semibold">#{ticket.id} {ticket.subject}</div><div className="text-sm text-gray-500">{ticket.user?.firstName || ticket.user?.username || ticket.user?.telegramId} · {ticket.status}</div></div><select value={ticket.status} onChange={(event) => updateTicket(ticket.id, event.target.value)} className="rounded border p-2"><option value="OPEN">ဖွင့်ထား</option><option value="IN_PROGRESS">ဆောင်ရွက်နေ</option><option value="RESOLVED">ပြီးစီး</option></select></div>)}
      </section>
    </div>
  );
}
