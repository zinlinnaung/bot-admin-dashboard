import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Copy, ExternalLink, Gift, KeyRound, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { API_BASE_URL } from "../api-auth";

const fmtDate = (value) => value ? new Date(value).toLocaleDateString("en-GB") : "သက်တမ်းမရှိ";

export default function UserProfileMini() {
  const tg = window.Telegram?.WebApp;
  const [profile, setProfile] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [user, growthData] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/me`),
        axios.get(`${API_BASE_URL}/growth/me`),
      ]);
      setProfile(user.data);
      setGrowth(growthData.data);
    } catch (err) {
      setError(err.response?.data?.message || "Dashboard ကိုဖွင့်၍မရပါ။ Bot မှတစ်ဆင့် ပြန်ဖွင့်ပေးပါ။");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { tg?.ready(); tg?.expand(); load(); }, [load, tg]);

  const vpnPurchases = useMemo(() => (profile?.purchases || []).filter(
    (item) => item.product?.category?.trim().toUpperCase() === "VPN",
  ), [profile]);
  const active = vpnPurchases.filter((item) => item.status === "COMPLETED" && item.outlineKeyId && !item.vpnKeyDeletedAt);

  const copy = async (value, message = "Copy ကူးပြီးပါပြီ။") => {
    await navigator.clipboard.writeText(value);
    tg?.showAlert(message);
  };
  const continuePurchaseInBot = () => {
    const message = "Payment process ကို Telegram Bot မှ ဆက်လက်ဆောင်ရွက်ပါမည်။ Mini App ကိုပိတ်ပြီး VPN package ရွေးချယ်ရန် Bot သို့ပြန်သွားမည်။";
    const proceed = (confirmed) => {
      if (!confirmed) return;
      const link = "https://t.me/trustvpn_digital_bot?start=buy_vpn";
      if (tg) {
        tg.openTelegramLink(link);
        window.setTimeout(() => tg.close(), 350);
      } else {
        window.location.href = link;
      }
    };
    if (tg?.showConfirm) tg.showConfirm(message, proceed);
    else proceed(window.confirm(message));
  };

  if (loading) return <div className="min-h-screen grid place-items-center bg-slate-950 text-cyan-300"><RefreshCw className="animate-spin" /></div>;
  if (error) return <div className="min-h-screen bg-slate-950 p-6 text-white"><div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">{error}</div></div>;

  return (
    <main className="min-h-screen bg-slate-950 pb-12 text-white">
      <header className="border-b border-cyan-400/20 bg-gradient-to-br from-slate-900 to-blue-950 p-6">
        <div className="flex items-center justify-between">
          <div><p className="text-xs tracking-[.25em] text-cyan-300">GAME GEAR MM</p><h1 className="mt-2 text-2xl font-black">မင်္ဂလာပါ {profile.firstName}</h1></div>
          <ShieldCheck className="text-cyan-300" size={38} />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <Stat label="Active VPN" value={active.length} />
          <Stat label="VPN Orders" value={vpnPurchases.length} />
          <Stat label="Bonus Days" value={growth?.vpnBonusDays || 0} />
        </div>
      </header>

      <div className="space-y-5 p-5">
        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">လက်ရှိ VPN Keys</h2><button onClick={load} className="text-cyan-300"><RefreshCw size={18} /></button></div>
          <div className="profile-scrollbar max-h-[360px] space-y-3 overflow-y-auto overscroll-contain pr-2">
            {active.map((item) => (
              <div key={item.id} className="rounded-2xl border border-cyan-400/20 bg-slate-900 p-4">
                <div className="flex items-start justify-between"><div><p className="font-bold">{item.product.name}</p><p className="mt-1 text-xs text-slate-400">ကုန်ဆုံးရက်: {fmtDate(item.expiresAt)} • {item.vpnUsageLimitGB || item.product.usageLimitGB || "Unlimited"} GB</p></div><KeyRound className="text-cyan-300" /></div>
                {item.productKey?.key ? <button onClick={() => copy(item.productKey.key, "VPN Key Copy ကူးပြီးပါပြီ။")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-500/10 active:scale-[.98]"><Copy size={17} /> VPN Key Copy</button> : <div className="mt-4 rounded-xl bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-300">Key ကို server မှ ရယူနေပါသည်။ Refresh နှိပ်ပေးပါ။</div>}
              </div>
            ))}
            {!active.length && <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 text-sm text-slate-400">လက်ရှိအသုံးပြုနိုင်သော VPN key မရှိသေးပါ။</div>}
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-400/20 bg-slate-900 p-5">
          <div className="flex items-center gap-3"><ShieldCheck className="text-emerald-300" /><div><h2 className="font-bold">Verified Service</h2><p className="text-xs text-slate-400">Completed VPN orders {growth?.trust?.completedVpnOrders || 0} • Positive reviews {growth?.trust?.positiveReviews || 0}</p></div></div>
          <div className="mt-4 space-y-2">{(growth?.trust?.approvedReviews || []).map((review, index) => <div key={index} className="rounded-xl bg-white/5 p-3 text-sm"><span className="text-emerald-300">👍 Verified customer</span><span className="text-slate-400"> • {review.purchase.product.name}</span></div>)}{!(growth?.trust?.approvedReviews || []).length && <p className="text-xs text-slate-500">Admin အတည်ပြုထားသော customer review မရှိသေးပါ။</p>}</div>
        </section>

        <section className="rounded-2xl border border-violet-400/20 bg-slate-900 p-5">
          <div className="flex items-center gap-3"><Users className="text-violet-300" /><div><h2 className="font-bold">မိတ်ဆွေဖိတ်ခေါ်ခြင်း</h2><p className="text-xs text-slate-400">Paid ဖြစ်ပြီးသူ {growth?.rewarded || 0} • စုစုပေါင်း Bonus {growth?.earnedBonusDays || 0} ရက်</p></div></div>
          <button onClick={() => copy(growth.referralLink, "Referral Link Copy ကူးပြီးပါပြီ။")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 font-bold"><Copy size={17} /> Referral Link Copy</button>
        </section>

        <section>
          <h2 className="mb-3 font-bold">VPN Order History</h2>
          <div className="profile-scrollbar max-h-[320px] space-y-2 overflow-y-auto overscroll-contain pr-2">
            {vpnPurchases.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-900 p-4"><div><p className="text-sm font-semibold">{item.product.name}</p><p className="text-xs text-slate-500">{fmtDate(item.createdAt)}</p></div><span className={`rounded-full px-3 py-1 text-xs ${item.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-300" : item.status === "REJECTED" ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-300"}`}>{item.status}</span></div>)}
            {!vpnPurchases.length && <div className="rounded-xl bg-slate-900 p-4 text-sm text-slate-400">VPN order history မရှိသေးပါ။</div>}
          </div>
        </section>

        <button onClick={continuePurchaseInBot} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 p-4 font-black text-slate-950"><Gift size={19} /> VPN Package ဝယ်မည် <ExternalLink size={17} /></button>
        <p className="text-center text-xs text-slate-500">Payment process ကို Telegram Bot မှ လုံခြုံစွာဆောင်ရွက်ပါသည်။</p>
      </div>
    </main>
  );
}

function Stat({ label, value }) {
  return <div className="rounded-xl bg-white/5 p-3"><div className="text-xl font-black text-cyan-300">{value}</div><div className="mt-1 text-[10px] text-slate-400">{label}</div></div>;
}
