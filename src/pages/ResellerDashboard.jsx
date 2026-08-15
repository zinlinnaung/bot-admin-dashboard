import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api-auth";

const money = (value) => `${Number(value || 0).toLocaleString()} MMK`;
const idempotencyKey = (prefix) =>
  `${prefix}:${window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "web"}:${crypto.randomUUID()}`;

export default function ResellerDashboard() {
  const tg = window.Telegram?.WebApp;
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState("");
  const [retailPrice, setRetailPrice] = useState(4000);
  const [topup, setTopup] = useState(10000);
  const [newKey, setNewKey] = useState("");

  const headers = { "X-Telegram-Init-Data": tg?.initData || "" };
  const load = useCallback(async () => {
    try {
      setError("");
      const response = await axios.get(`${API_BASE_URL}/reseller/me`, {
        headers,
      });
      setData(response.data);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Reseller အချက်အလက် မရယူနိုင်ပါ။ Telegram bot မှ ဖွင့်ပေးပါ။",
      );
    }
  }, [tg?.initData]);

  useEffect(() => {
    tg?.ready();
    tg?.expand();
    load();
  }, [load]);

  const action = async (url, body = {}) => {
    setBusy(true);
    setError("");
    try {
      const response = await axios.post(`${API_BASE_URL}${url}`, body, {
        headers,
      });
      await load();
      return response.data;
    } catch (e) {
      setError(e.response?.data?.message || "လုပ်ဆောင်မှု မအောင်မြင်ပါ။");
      return null;
    } finally {
      setBusy(false);
    }
  };

  if (!data && !error)
    return (
      <Shell>
        <p>အချက်အလက် ရယူနေသည်…</p>
      </Shell>
    );
  const account = data?.account;
  return (
    <Shell>
      <div className="space-y-4">
        <header className="rounded-3xl bg-gradient-to-br from-slate-950 to-blue-900 p-6 text-white shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-200">
            Proto-X Partner
          </p>
          <h1 className="mt-2 text-3xl font-black">VPN Reseller</h1>
          <p className="mt-2 text-sm text-blue-100">
            ၁ လ · 100GB key တစ်ခု 2,500 MMK
          </p>
        </header>
        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}
        {!account && (
          <Card title="အစီအစဉ်အကြောင်း">
            <p>
              စတင်ရန် 30,000 MMK ကို reseller wallet ထဲ ထည့်ထားရပါမည်။
              အခကြေးငွေအဖြစ် ပျောက်မသွားဘဲ VPN key ၁၂ ခုအထိ ဝယ်ယူနိုင်သော
              လက်ကျန်ဖြစ်ပါသည်။
            </p>
            <p className="mt-2">
              အကြံပြုရောင်းဈေး 4,000 MMK ဖြစ်ပြီး key တစ်ခုလျှင် 1,500 MMK
              အမြတ်ရနိုင်ပါသည်။
            </p>
            <Button disabled={busy} onClick={() => action("/reseller/apply")}>
              Reseller လျှောက်ထားမည်
            </Button>
          </Card>
        )}
        {account?.status === "PENDING" && (
          <Notice
            title="Admin အတည်ပြုချက် စောင့်နေသည်"
            text="စစ်ဆေးပြီးလျှင် bot မှ အသိပေးပါမည်။"
          />
        )}
        {account?.status === "REJECTED" && (
          <Notice
            title="လျှောက်လွှာ အတည်မပြုရသေးပါ"
            text="Support ကို ဆက်သွယ်ပြီး ပြန်လည်လျှောက်ထားနိုင်ပါသည်။"
          />
        )}
        {account?.status === "APPROVED" && (
          <Card title="လျှောက်လွှာ အတည်ပြုပြီးပါပြီ">
            <p>
              လက်ရှိ main wallet: <b>{money(data.user.mainBalance)}</b>
            </p>
            <p>
              Reseller wallet စဖွင့်ရန်:{" "}
              <b>{money(account.openingBalanceRequired)}</b>
            </p>
            <Button
              disabled={busy}
              onClick={() => action("/reseller/activate")}
            >
              30,000 MMK ဖြင့် စတင်မည်
            </Button>
          </Card>
        )}
        {account?.status === "SUSPENDED" && (
          <Notice
            title="Account ယာယီပိတ်ထားသည်"
            text="အသေးစိတ်သိရှိရန် Support ကို ဆက်သွယ်ပါ။"
          />
        )}
        {account?.status === "ACTIVE" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Reseller လက်ကျန်" value={money(account.balance)} />
              <Stat label="ရောင်းပြီး key" value={data.summary.totalKeys} />
              <Stat
                label="စုစုပေါင်းအမြတ်"
                value={money(data.summary.totalProfit)}
              />
              <Stat
                label="တစ်နေ့ limit"
                value={`${account.dailyKeyLimit} keys`}
              />
            </div>
            <Card title="VPN key အသစ်ထုတ်မည်">
              <label className="text-sm font-bold">
                Customer အမည်/မှတ်ချက်
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                value={label}
                maxLength={100}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="ဥပမာ - Mg Mg"
              />
              <label className="mt-3 block text-sm font-bold">
                Customer ကို ရောင်းမည့်ဈေး
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                type="number"
                min="2500"
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">
                Wallet မှ {money(account.wholesalePrice)} ဖြတ်ပါမည်။
              </p>
              <Button
                disabled={busy}
                onClick={async () => {
                  setNewKey("");
                  const result = await action("/reseller/orders", {
                    customerLabel: label,
                    retailPrice: Number(retailPrice),
                    requestKey: idempotencyKey("order"),
                  });
                  if (result?.accessKey) setNewKey(result.accessKey);
                }}
              >
                100GB Key ထုတ်မည်
              </Button>
              {newKey && (
                <div className="mt-4 rounded-xl bg-emerald-50 p-3 break-all text-sm">
                  <b>ထုတ်ပြီးသော key</b>
                  <p className="my-2">{newKey}</p>
                  <button
                    className="font-bold text-emerald-700"
                    onClick={() => navigator.clipboard.writeText(newKey)}
                  >
                    Copy Key
                  </button>
                </div>
              )}
            </Card>
            <Card title="Reseller wallet ဖြည့်မည်">
              <p className="text-sm">
                Main wallet: {money(data.user.mainBalance)}
              </p>
              <input
                className="mt-3 w-full rounded-xl border border-slate-300 p-3"
                type="number"
                min="2500"
                step="500"
                value={topup}
                onChange={(e) => setTopup(e.target.value)}
              />
              <Button
                disabled={busy}
                onClick={() =>
                  action("/reseller/topup", {
                    amount: Number(topup),
                    requestKey: idempotencyKey("topup"),
                  })
                }
              >
                Wallet ဖြည့်မည်
              </Button>
            </Card>
            <Card title="Key ထုတ်ထားမှုမှတ်တမ်း">
              <div className="space-y-3">
                {data.orders.length === 0 && (
                  <p className="text-sm text-slate-500">မှတ်တမ်းမရှိသေးပါ။</p>
                )}
                {data.orders.map((order) => (
                  <div key={order.id} className="rounded-xl border p-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <b>
                        #{order.id} {order.customerLabel || "Customer"}
                      </b>
                      <span>{order.status}</span>
                    </div>
                    <p className="mt-1">
                      ရောင်းဈေး {money(order.retailPrice)} · အမြတ်{" "}
                      {money(order.profit)}
                    </p>
                    {order.expiresAt && (
                      <p>
                        သက်တမ်းကုန်:{" "}
                        {new Date(order.expiresAt).toLocaleDateString("my-MM")}
                      </p>
                    )}
                    {order.accessKey && (
                      <button
                        className="mt-2 font-bold text-blue-700"
                        onClick={() =>
                          navigator.clipboard.writeText(order.accessKey)
                        }
                      >
                        Key Copy
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </Shell>
  );
}

const Shell = ({ children }) => (
  <main className="min-h-screen bg-slate-100 p-4 text-slate-900">
    <div className="mx-auto max-w-xl">{children}</div>
  </main>
);
const Card = ({ title, children }) => (
  <section className="rounded-2xl bg-white p-5 shadow-sm">
    <h2 className="mb-3 text-lg font-black">{title}</h2>
    {children}
  </section>
);
const Notice = ({ title, text }) => (
  <Card title={title}>
    <p className="text-slate-600">{text}</p>
  </Card>
);
const Stat = ({ label, value }) => (
  <div className="rounded-2xl bg-white p-4 shadow-sm">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-1 text-lg font-black">{value}</p>
  </div>
);
const Button = ({ children, ...props }) => (
  <button
    {...props}
    className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-black text-white disabled:opacity-50"
  >
    {children}
  </button>
);
