import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api-auth";

export default function ProtoXOperations() {
  const [analytics, setAnalytics] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [savingId, setSavingId] = useState(null);

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

  const saveCorrectAnswer = async (interaction) => {
    const correctAnswer = (answers[interaction.id] || "").trim();
    if (!correctAnswer) return;
    try {
      setSavingId(interaction.id);
      await axios.post(
        `${API_BASE_URL}/admin/proto-x/interactions/${interaction.id}/answer`,
        { correctAnswer },
      );
      setAnswers((current) => ({ ...current, [interaction.id]: "" }));
      await load();
    } catch {
      setError("အဖြေမှန်ကို မသိမ်းနိုင်သေးပါ။ ပြန်စမ်းပါ။");
    } finally {
      setSavingId(null);
    }
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
        {analytics.recentFailures.length === 0 ? <p className="text-gray-500">မရှိသေးပါ။</p> : analytics.recentFailures.map((item) => (
          <div key={item.id} className="border-b py-4">
            <div className="font-medium">{item.question}</div>
            <div className="mb-3 text-xs text-gray-500">Telegram {item.telegramId} · {item.source}</div>
            <div className="flex flex-col gap-2 md:flex-row">
              <textarea
                value={answers[item.id] || ""}
                onChange={(event) => setAnswers((current) => ({ ...current, [item.id]: event.target.value }))}
                placeholder="Proto-X ပြန်ဖြေရမည့် အဖြေမှန်ကို ရေးပါ…"
                maxLength={3000}
                rows={2}
                className="flex-1 rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => saveCorrectAnswer(item)}
                disabled={savingId === item.id || !(answers[item.id] || "").trim()}
                className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {savingId === item.id ? "သိမ်းနေသည်…" : "အဖြေမှန် သိမ်းမယ်"}
              </button>
            </div>
          </div>
        ))}
      </section>
      <section className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-4 text-xl font-bold">Support tickets</h2>
        {tickets.length === 0 ? <p className="text-gray-500">Ticket မရှိသေးပါ။</p> : tickets.map((ticket) => <div key={ticket.id} className="flex items-center justify-between gap-4 border-b py-3"><div><div className="font-semibold">#{ticket.id} {ticket.subject}</div><div className="text-sm text-gray-500">{ticket.user?.firstName || ticket.user?.username || ticket.user?.telegramId} · {ticket.status}</div></div><select value={ticket.status} onChange={(event) => updateTicket(ticket.id, event.target.value)} className="rounded border p-2"><option value="OPEN">ဖွင့်ထား</option><option value="IN_PROGRESS">ဆောင်ရွက်နေ</option><option value="RESOLVED">ပြီးစီး</option></select></div>)}
      </section>
    </div>
  );
}
