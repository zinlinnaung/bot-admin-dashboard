import { useEffect, useState } from "react";
import axios from "axios";
import { Activity, Copy, Database, Loader2, Shield, Wifi } from "lucide-react";
import { API_BASE_URL } from "../api-auth";

const statusText = {
  ACTIVE: "Active",
  DATA_LIMIT_REACHED: "Data Limit Full",
  DELETED: "Closed",
};

export default function VpnUsageCheck() {
  const [key, setKey] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = new URLSearchParams(window.location.search).get("t");

  const loadToken = async (value) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/vpn-usage/${encodeURIComponent(value)}`);
      setResult(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Usage information could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) void loadToken(token);
  }, [token]);

  const checkKey = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_BASE_URL}/vpn-usage/check`, { accessKey: key.trim() });
      const { token: safeToken, ...usage } = response.data;
      setResult(usage);
      setKey("");
      window.history.replaceState({}, "", `/vpn-check?t=${encodeURIComponent(safeToken)}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "VPN key was not found.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    alert("Safe usage link copied");
  };

  const percentage = result?.percentage ?? 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center space-y-3">
          <div className="inline-flex p-4 rounded-3xl bg-cyan-400/10 border border-cyan-300/20">
            <Shield className="text-cyan-300" size={42} />
          </div>
          <h1 className="text-3xl font-black">VPN Usage Checker</h1>
          <p className="text-slate-400">Outline VPN data usage and expiration status</p>
        </header>

        {!token && !result && (
          <form onSubmit={checkKey} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <label className="block text-sm font-bold text-slate-300">Paste your VPN key</label>
            <textarea
              value={key}
              onChange={(event) => setKey(event.target.value)}
              placeholder="ss://..."
              required
              rows={4}
              className="w-full rounded-2xl bg-slate-900 border border-white/10 p-4 text-sm outline-none focus:border-cyan-400 resize-none"
            />
            <p className="text-xs text-slate-500">Your VPN key is checked over HTTPS and is never stored by this page.</p>
            <button disabled={loading} className="w-full rounded-2xl bg-cyan-400 text-slate-950 py-4 font-black flex justify-center items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : <><Activity size={20} /> Check Usage</>}
            </button>
          </form>
        )}

        {loading && token && <div className="flex justify-center py-16"><Loader2 className="animate-spin text-cyan-300" size={40} /></div>}
        {error && <div className="bg-rose-500/10 border border-rose-400/30 text-rose-200 rounded-2xl p-4 text-center">{error}</div>}

        {result && (
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start gap-4">
              <div><p className="text-slate-400 text-sm">Package</p><h2 className="text-xl font-black">{result.productName}</h2></div>
              {result.status !== "EXPIRED" && (
                <span className={`px-4 py-2 rounded-full text-xs font-black ${result.status === "ACTIVE" ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"}`}>
                  {statusText[result.status] || result.status}
                </span>
              )}
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2"><span>Data usage</span><span className="font-bold">{result.usageGB} GB{result.limitGB ? ` / ${result.limitGB} GB` : ""}</span></div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full rounded-full ${percentage >= 90 ? "bg-rose-400" : percentage >= 75 ? "bg-amber-400" : "bg-cyan-400"}`} style={{ width: `${Math.max(1, percentage)}%` }} /></div>
              <p className="text-right text-xs text-slate-400 mt-2">{result.percentage === null ? "Unlimited" : `${result.percentage}% used`}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-900/70 rounded-2xl p-4"><Wifi className="text-cyan-300 mb-2" /><p className="text-slate-400">Used</p><b>{result.usageGB} GB</b></div>
              <div className="bg-slate-900/70 rounded-2xl p-4"><Database className="text-emerald-300 mb-2" /><p className="text-slate-400">Data limit</p><b>{result.limitGB ? `${result.limitGB} GB` : "Unlimited"}</b></div>
            </div>

            {token && <button onClick={copyLink} className="w-full border border-white/15 rounded-2xl py-3 font-bold flex justify-center items-center gap-2"><Copy size={18} /> Copy safe usage link</button>}
            <p className="text-center text-xs text-slate-500">Last checked: {new Date(result.checkedAt).toLocaleString()}</p>
          </section>
        )}

        <footer className="text-center text-sm text-cyan-300 font-bold pt-4">Sent by Proto-X AI 🤖⚡✨</footer>
      </div>
    </main>
  );
}
