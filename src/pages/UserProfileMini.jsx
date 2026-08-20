import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  Gamepad2,
  Gift,
  History,
  KeyRound,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  Wifi,
} from "lucide-react";
import { API_BASE_URL } from "../api-auth";

const fmtDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "သက်တမ်းမရှိ";
const money = (value) => `${Number(value || 0).toLocaleString()} MMK`;
const normalizeCategory = (item) =>
  String(item?.product?.category || "DIGITAL")
    .trim()
    .toUpperCase();
const isVpn = (item) => normalizeCategory(item) === "VPN";
const isMlbb = (item) =>
  normalizeCategory(item) === "MLBB" ||
  /MLBB|DIAMOND/i.test(
    `${item?.product?.name || ""} ${item?.product?.subCategory || ""}`,
  );

const statusMeta = {
  COMPLETED: {
    label: "ပြီးမြောက်",
    style: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
    icon: CheckCircle2,
  },
  PENDING: {
    label: "စစ်ဆေးဆဲ",
    style: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
    icon: Clock3,
  },
  PROCESSING: {
    label: "လုပ်ဆောင်နေ",
    style: "bg-blue-400/10 text-blue-300 ring-blue-400/20",
    icon: RefreshCw,
  },
  REJECTED: {
    label: "ပယ်ဖျက်",
    style: "bg-rose-400/10 text-rose-300 ring-rose-400/20",
    icon: Clock3,
  },
};

function categoryMeta(item) {
  if (isVpn(item))
    return {
      label: "VPN",
      icon: ShieldCheck,
      style: "from-cyan-400/20 to-blue-500/10 text-cyan-300",
    };
  if (isMlbb(item))
    return {
      label: "MLBB",
      icon: Gamepad2,
      style: "from-violet-400/20 to-fuchsia-500/10 text-violet-300",
    };
  const category = normalizeCategory(item);
  if (["CANVA", "CAPCUT", "GEMINI", "SUBSCRIPTION"].includes(category))
    return {
      label: "Subscription",
      icon: Sparkles,
      style: "from-fuchsia-400/20 to-pink-500/10 text-fuchsia-300",
    };
  if (category === "GIFTCARD")
    return {
      label: "Gift Card",
      icon: Gift,
      style: "from-amber-400/20 to-orange-500/10 text-amber-300",
    };
  return {
    label: item?.product?.category || "Digital",
    icon: Package,
    style: "from-slate-400/20 to-slate-500/10 text-slate-300",
  };
}

export default function UserProfileMini() {
  const tg = window.Telegram?.WebApp;
  const [profile, setProfile] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const user = await axios.get(`${API_BASE_URL}/admin/me`);
      setProfile(user.data);
      const growthResult = await axios
        .get(`${API_BASE_URL}/growth/me`)
        .catch(() => null);
      setGrowth(growthResult?.data || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Profile ကိုဖွင့်၍မရပါ။ Bot မှတစ်ဆင့် ပြန်ဖွင့်ပေးပါ။",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    tg?.ready();
    tg?.expand();
    load();
  }, [load, tg]);

  const purchases = useMemo(() => profile?.purchases || [], [profile]);
  const completed = purchases.filter((item) => item.status === "COMPLETED");
  const pending = purchases.filter((item) =>
    ["PENDING", "PROCESSING"].includes(item.status),
  );
  const vpnPurchases = purchases.filter(isVpn);
  const activeVpn = vpnPurchases.filter(
    (item) =>
      item.status === "COMPLETED" && item.outlineKeyId && !item.vpnKeyDeletedAt,
  );
  const digitalItems = completed.filter(
    (item) => !isVpn(item) && item.productKey?.key,
  );
  const filteredOrders = purchases.filter((item) => {
    const matchesFilter =
      filter === "ALL" ||
      (filter === "VPN" && isVpn(item)) ||
      (filter === "MLBB" && isMlbb(item)) ||
      (filter === "DIGITAL" && !isVpn(item) && !isMlbb(item));
    const haystack =
      `${item.product?.name || ""} ${item.product?.category || ""} ${item.nickname || ""}`.toLowerCase();
    return matchesFilter && haystack.includes(query.trim().toLowerCase());
  });

  const copy = async (value, message = "Copy ကူးပြီးပါပြီ။") => {
    try {
      await navigator.clipboard.writeText(value);
      tg?.showAlert(message);
    } catch {
      tg?.showAlert("Copy မလုပ်နိုင်ပါ။ ဖိထားပြီး Copy ကူးပေးပါ။");
    }
  };

  const openShop = () => {
    const link = "https://t.me/trustvpn_digital_bot?start=shop";
    if (tg) {
      tg.openTelegramLink(link);
      window.setTimeout(() => tg.close(), 350);
    } else window.location.href = link;
  };

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-cyan-300">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin" size={30} />
          <p className="mt-3 text-xs font-bold text-slate-400">
            Profile တင်နေပါသည်…
          </p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-slate-950 p-5 text-white">
        <div className="mx-auto max-w-lg rounded-3xl border border-rose-500/30 bg-rose-500/10 p-5">
          <p className="font-bold text-rose-200">{error}</p>
          <button
            onClick={() => load(true)}
            className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-950"
          >
            ပြန်စမ်းမည်
          </button>
        </div>
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-950 pb-28 text-white">
      <div className="mx-auto max-w-2xl">
        <header className="relative overflow-hidden border-b border-cyan-400/15 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 px-5 pb-7 pt-6">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black tracking-[.28em] text-cyan-300">
                GAME GEAR MM
              </p>
              <h1 className="mt-2 text-2xl font-black">
                မင်္ဂလာပါ {profile.firstName}
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                @{profile.username || "customer"} • Member since{" "}
                {fmtDate(profile.createdAt)}
              </p>
            </div>
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-300"
            >
              <RefreshCw
                size={19}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
          <div className="relative mt-6 grid grid-cols-3 gap-2">
            <Stat label="Orders" value={purchases.length} />
            <Stat label="Completed" value={completed.length} />
            <Stat
              label="Pending"
              value={pending.length}
              accent={pending.length > 0}
            />
          </div>
        </header>

        <nav className="sticky top-0 z-20 grid grid-cols-3 border-b border-white/10 bg-slate-950/95 px-4 py-2 backdrop-blur-xl">
          <TabButton
            active={tab === "overview"}
            onClick={() => setTab("overview")}
            icon={Sparkles}
            label="Overview"
          />
          <TabButton
            active={tab === "orders"}
            onClick={() => setTab("orders")}
            icon={History}
            label="Orders"
          />
          <TabButton
            active={tab === "vpn"}
            onClick={() => setTab("vpn")}
            icon={Wifi}
            label="VPN"
          />
        </nav>

        <div className="space-y-5 p-4 sm:p-5">
          {tab === "overview" && (
            <>
              <SectionTitle
                title="My products"
                subtitle="အသုံးပြုနိုင်သော digital products"
              />
              <div className="grid grid-cols-2 gap-3">
                <SummaryCard
                  icon={ShieldCheck}
                  label="Active VPN"
                  value={activeVpn.length}
                  color="cyan"
                  onClick={() => setTab("vpn")}
                />
                <SummaryCard
                  icon={KeyRound}
                  label="Digital Keys"
                  value={digitalItems.length}
                  color="violet"
                  onClick={() => setTab("orders")}
                />
              </div>

              {(activeVpn.length > 0 || digitalItems.length > 0) && (
                <section className="space-y-3">
                  {[...activeVpn.slice(0, 2), ...digitalItems.slice(0, 2)].map(
                    (item) => (
                      <EntitlementCard key={item.id} item={item} copy={copy} />
                    ),
                  )}
                </section>
              )}

              <section className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/10 to-slate-900 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-violet-400/15 p-3 text-violet-300">
                    <Users size={21} />
                  </div>
                  <div>
                    <h2 className="font-black">မိတ်ဆွေဖိတ်ခေါ်ခြင်း</h2>
                    <p className="text-xs text-slate-400">
                      Paid ဖြစ်ပြီးသူ {growth?.rewarded || 0} • Bonus{" "}
                      {growth?.earnedBonusDays || 0} ရက်
                    </p>
                  </div>
                </div>
                {growth?.referralLink && (
                  <button
                    onClick={() =>
                      copy(
                        growth.referralLink,
                        "Referral Link Copy ကူးပြီးပါပြီ။",
                      )
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-black"
                  >
                    <Copy size={16} /> Referral Link Copy
                  </button>
                )}
              </section>

              <section>
                <div className="mb-3 flex items-end justify-between">
                  <SectionTitle
                    title="Recent orders"
                    subtitle="နောက်ဆုံးဝယ်ယူမှုများ"
                  />
                  <button
                    onClick={() => setTab("orders")}
                    className="text-xs font-bold text-cyan-300"
                  >
                    အားလုံးကြည့်မည်
                  </button>
                </div>
                <div className="space-y-2">
                  {purchases.slice(0, 4).map((item) => (
                    <OrderRow key={item.id} item={item} compact />
                  ))}
                  {!purchases.length && <EmptyState />}
                </div>
              </section>
            </>
          )}

          {tab === "orders" && (
            <>
              <SectionTitle
                title="Order history"
                subtitle="Product အမျိုးအစားအားလုံး"
              />
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-slate-500"
                  size={18}
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Product name ရှာမည်…"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-400/50"
                />
              </div>
              <div className="profile-scrollbar flex gap-2 overflow-x-auto pb-1">
                {["ALL", "VPN", "MLBB", "DIGITAL"].map((value) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black ${filter === value ? "bg-cyan-400 text-slate-950" : "bg-slate-900 text-slate-400"}`}
                  >
                    {value === "ALL" ? "အားလုံး" : value}
                  </button>
                ))}
              </div>
              <div className="profile-scrollbar max-h-[620px] space-y-3 overflow-y-auto overscroll-contain pr-1">
                {filteredOrders.map((item) => (
                  <OrderRow key={item.id} item={item} copy={copy} />
                ))}
                {!filteredOrders.length && (
                  <EmptyState text="ရှာဖွေမှုနှင့်ကိုက်ညီသော order မရှိပါ။" />
                )}
              </div>
            </>
          )}

          {tab === "vpn" && (
            <>
              <SectionTitle
                title="VPN Center"
                subtitle="လက်ရှိ keys နဲ့ VPN order history"
              />
              <div className="profile-scrollbar max-h-[470px] space-y-3 overflow-y-auto overscroll-contain pr-1">
                {activeVpn.map((item) => (
                  <EntitlementCard key={item.id} item={item} copy={copy} vpn />
                ))}
                {!activeVpn.length && (
                  <EmptyState text="လက်ရှိအသုံးပြုနိုင်သော VPN key မရှိသေးပါ။" />
                )}
              </div>
              <section>
                <h3 className="mb-3 text-sm font-black text-slate-300">
                  VPN order history
                </h3>
                <div className="profile-scrollbar max-h-[360px] space-y-2 overflow-y-auto pr-1">
                  {vpnPurchases.map((item) => (
                    <OrderRow key={item.id} item={item} compact />
                  ))}
                  {!vpnPurchases.length && (
                    <EmptyState text="VPN order history မရှိသေးပါ။" />
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/95 p-3 backdrop-blur-xl">
        <button
          onClick={openShop}
          className="mx-auto flex w-full max-w-2xl items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 p-4 font-black text-slate-950 shadow-xl shadow-cyan-950/30"
        >
          <ShoppingBag size={19} /> Products ဝယ်မည် <ExternalLink size={16} />
        </button>
      </div>
    </main>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div
      className={`rounded-2xl border p-3 text-center ${accent ? "border-amber-400/20 bg-amber-400/10" : "border-white/10 bg-white/5"}`}
    >
      <div
        className={`text-xl font-black ${accent ? "text-amber-300" : "text-cyan-300"}`}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] font-semibold text-slate-400">
        {label}
      </div>
    </div>
  );
}
function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition ${active ? "bg-white/10 text-cyan-300" : "text-slate-500"}`}
    >
      {createElement(icon, { size: 16 })}
      {label}
    </button>
  );
}
function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h2 className="font-black text-white">{title}</h2>
      <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}
function SummaryCard({ icon, label, value, color, onClick }) {
  const palette =
    color === "violet"
      ? "border-violet-400/20 bg-violet-400/10 text-violet-300"
      : "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
  return (
    <button
      onClick={onClick}
      className={`rounded-3xl border p-4 text-left ${palette}`}
    >
      <div className="flex items-center justify-between">
        {createElement(icon, { size: 22 })}
        <ChevronRight size={17} />
      </div>
      <div className="mt-5 text-3xl font-black">{value}</div>
      <div className="mt-1 text-xs font-bold text-slate-400">{label}</div>
    </button>
  );
}

function EntitlementCard({ item, copy, vpn = false }) {
  const meta = categoryMeta(item);
  const key = item.productKey?.key;
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-4">
      <div className="flex items-start gap-3">
        <div className={`rounded-2xl bg-gradient-to-br p-3 ${meta.style}`}>
          {createElement(meta.icon, { size: 21 })}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="truncate font-black">
                {item.product?.name || "Digital Product"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {meta.label} • Order #{item.id}
              </p>
            </div>
            <Status status={item.status} />
          </div>
          {vpn && (
            <p className="mt-3 text-xs text-slate-400">
              ကုန်ဆုံးရက်:{" "}
              <span className="text-slate-200">{fmtDate(item.expiresAt)}</span>
              <br />
              Data Limit:{" "}
              <span className="text-slate-200">
                {item.vpnUsageLimitGB ||
                  item.product?.usageLimitGB ||
                  "Unlimited"}{" "}
                GB
              </span>
            </p>
          )}
        </div>
      </div>
      {key ? (
        <button
          onClick={() => copy(key, `${meta.label} Key Copy ကူးပြီးပါပြီ။`)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950"
        >
          <Copy size={16} /> {vpn ? "VPN Key" : "Digital Key"} Copy
        </button>
      ) : (
        <div className="mt-4 rounded-xl bg-white/5 px-3 py-2 text-center text-xs text-slate-500">
          Key/Code မရှိသေးပါ။
        </div>
      )}
    </div>
  );
}

function OrderRow({ item, copy, compact = false }) {
  const meta = categoryMeta(item);
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900 p-4">
      <div className="flex gap-3">
        <div
          className={`h-fit rounded-xl bg-gradient-to-br p-2.5 ${meta.style}`}
        >
          {createElement(meta.icon, { size: 19 })}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-black">
                {item.product?.name || "Product"}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                #{item.id} • {meta.label} • {fmtDate(item.createdAt)}
              </p>
            </div>
            <Status status={item.status} />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-xs">
            <span className="text-slate-500">Qty {item.quantity || 1}</span>
            <strong className="text-slate-200">{money(item.amount)}</strong>
          </div>
          {!compact && (item.playerId || item.nickname) && (
            <div className="mt-3 rounded-xl bg-violet-400/5 px-3 py-2 text-xs text-slate-400">
              <span className="font-bold text-violet-300">Game Account</span>
              <br />
              {item.nickname || "—"} • {item.playerId}
              {item.serverId ? ` (${item.serverId})` : ""}
            </div>
          )}
          {!compact && copy && item.productKey?.key && (
            <button
              onClick={() =>
                copy(item.productKey.key, "Product Key Copy ကူးပြီးပါပြီ။")
              }
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 py-2.5 text-xs font-black text-cyan-300"
            >
              <Copy size={14} /> Key/Code Copy
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function Status({ status }) {
  const meta = statusMeta[status] || {
    label: status || "UNKNOWN",
    style: "bg-slate-400/10 text-slate-300 ring-slate-400/20",
    icon: Clock3,
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ring-1 ${meta.style}`}
    >
      {createElement(meta.icon, {
        size: 11,
        className: status === "PROCESSING" ? "animate-spin" : "",
      })}
      {meta.label}
    </span>
  );
}
function EmptyState({ text = "ဝယ်ယူမှုမှတ်တမ်း မရှိသေးပါ။" }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 px-5 py-10 text-center">
      <Package className="mx-auto text-slate-700" size={30} />
      <p className="mt-3 text-sm text-slate-500">{text}</p>
    </div>
  );
}
