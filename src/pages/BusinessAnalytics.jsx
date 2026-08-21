import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api-auth";

const formatMoney = (value) => `${Number(value || 0).toLocaleString()} MMK`;
const formatNumber = (value) => Number(value || 0).toLocaleString();

function MetricCard({ label, value, note }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {note && <div className="mt-2 text-xs text-gray-400">{note}</div>}
    </div>
  );
}

export default function BusinessAnalytics() {
  const [data, setData] = useState(null);
  const [clickData, setClickData] = useState(null);
  const [clickDays, setClickDays] = useState(30);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/admin/business-analytics`)
      .then((response) => setData(response.data))
      .catch(() => setError("Business analytics ကို မရယူနိုင်သေးပါ။"));
  }, []);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/admin/product-click-analytics?days=${clickDays}`)
      .then((response) => setClickData(response.data))
      .catch(() => setClickData(null));
  }, [clickDays]);

  if (error)
    return <div className="rounded-xl bg-red-50 p-5 text-red-700">{error}</div>;
  if (!data) return <div className="p-5">တင်နေသည်…</div>;

  const cards = [
    {
      label: "လုပ်ငန်းဝင်ငွေ (၂၄ နာရီ)",
      value: formatMoney(data.revenue.dailyMMK),
      note: `${formatNumber(data.revenue.dailyOrders)} orders • product အားလုံး`,
    },
    {
      label: "လုပ်ငန်းဝင်ငွေ (၇ ရက်)",
      value: formatMoney(data.revenue.weeklyMMK),
      note: `${formatNumber(data.revenue.weeklyOrders)} orders • product အားလုံး`,
    },
    {
      label: "လုပ်ငန်းဝင်ငွေ (၃၀ ရက်)",
      value: formatMoney(data.revenue.monthlyMMK),
      note: `${formatNumber(data.revenue.monthlyOrders)} orders • product အားလုံး`,
    },
    {
      label: "Gross Revenue (၃၀ ရက်)",
      value: formatMoney(data.finance?.grossRevenue30DaysMMK),
      note: "Completed orders အားလုံး၏ ရောင်းရငွေစုစုပေါင်း",
    },
    {
      label: "Server Cost (တစ်လ)",
      value: formatMoney(data.finance?.serverMonthlyCostMMK),
      note: `$${formatNumber(data.finance?.serverMonthlyCostUSD)} × ${formatNumber(data.finance?.usdToMmkRate)} MMK`,
    },
    {
      label: "Server Cost နှုတ်ပြီးရငွေ (၃၀ ရက်)",
      value: formatMoney(data.finance?.revenueAfterServerCost30DaysMMK),
      note: "Supplier/API/payment စရိတ်များ မနှုတ်ရသေးပါ",
    },
    {
      label: "VPN ဝင်ငွေ (၃၀ ရက်)",
      value: formatMoney(data.vpnRevenue?.monthlyMMK),
      note: `${formatNumber(data.vpnRevenue?.monthlyOrders)} retail + reseller orders`,
    },
    {
      label: "Trial → Paid VPN",
      value: `${data.trial.conversionRate}%`,
      note: `${data.trial.convertedUsers}/${data.trial.users} users • lifetime`,
    },
    {
      label: "Paid VPN customers",
      value: formatNumber(data.customers.paid),
      note: "Reseller order မပါသော customer အရေအတွက်",
    },
    {
      label: "Repeat customer rate",
      value: `${data.customers.repeatPurchaseRate}%`,
      note: `${data.customers.returning}/${data.customers.paid} customers • VPN နှစ်ကြိမ်နှင့်အထက်`,
    },
    {
      label: "Reminder → Purchase",
      value: `${data.renewal?.clickToPurchaseRate || 0}%`,
      note: `${formatNumber(data.renewal?.purchases)} purchases / ${formatNumber(data.renewal?.clicks)} clicks • ၃၀ ရက်`,
    },
    {
      label: "Deleted VPN key ပျမ်းမျှအသုံးပြုမှု",
      value: `${data.operations.averageVpnUsagePercent}%`,
      note: `${formatNumber(data.operations.vpnUsageSample)} deleted keys sample • active key မပါ`,
    },
    {
      label: "Support ဖြေရှင်းချိန်",
      value: `${data.operations.averageSupportResolutionHours} နာရီ`,
      note: `${formatNumber(data.operations.resolvedSupportTicketsSample)} resolved tickets • ၃၀ ရက်`,
    },
    {
      label: "Failed orders (၃၀ ရက်)",
      value: formatNumber(data.operations.failedOrders30Days),
      note: `${formatNumber(data.operations.rejectedPurchases30Days)} rejected + ${formatNumber(data.operations.failedResellerOrders30Days)} reseller failed`,
    },
    {
      label: "Renewal reminders (၃၀ ရက်)",
      value: formatNumber(data.renewal?.remindersSent),
      note: `${formatNumber(data.renewal?.clicks)} clicks • ${formatNumber(data.renewal?.purchases)} purchases`,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Business Analytics</h1>
        <p className="text-gray-500">
          ဝင်ငွေ၊ VPN conversion၊ customer retention နှင့် reseller performance
        </p>
        <p className="mt-1 text-xs text-gray-400">
          နောက်ဆုံးတွက်ချက်ချိန်: {new Date(data.generatedAt).toLocaleString()}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </div>

      <section className="rounded-xl bg-white p-5 shadow">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Product Button Click Analytics
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Product ပြသမှု၊ button နှိပ်မှုနဲ့ ဝယ်ယူသူပြောင်းလဲမှုကို
              တိုင်းတာထားပါသည်။
            </p>
          </div>
          <select
            value={clickDays}
            onChange={(event) => setClickDays(Number(event.target.value))}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold"
          >
            <option value={7}>၇ ရက်</option>
            <option value={30}>၃၀ ရက်</option>
            <option value={90}>၉၀ ရက်</option>
            <option value={365}>၁ နှစ်</option>
          </select>
        </div>

        {clickData ? (
          <>
            <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Product ပြသမှု"
                value={formatNumber(clickData.totals?.impressions)}
              />
              <MetricCard
                label="စုစုပေါင်း Clicks"
                value={formatNumber(clickData.totals?.clicks)}
              />
              <MetricCard
                label="Click လုပ်သူ"
                value={formatNumber(clickData.totals?.uniqueClickUsers)}
                note="Unique customers"
              />
              <MetricCard
                label="Completed Orders"
                value={formatNumber(clickData.totals?.orders)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="p-3">Product</th>
                    <th className="p-3">ပြသမှု</th>
                    <th className="p-3">Clicks</th>
                    <th className="p-3">Unique Users</th>
                    <th className="p-3">Click Rate</th>
                    <th className="p-3">Click Share</th>
                    <th className="p-3">Orders</th>
                    <th className="p-3">Purchase Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {clickData.products.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.category}
                          {item.subCategory ? ` / ${item.subCategory}` : ""}
                        </div>
                      </td>
                      <td className="p-3">{formatNumber(item.impressions)}</td>
                      <td className="p-3 font-bold text-indigo-600">
                        {formatNumber(item.clicks)}
                      </td>
                      <td className="p-3">
                        {formatNumber(item.uniqueClickUsers)}
                      </td>
                      <td className="p-3">{item.clickRate}%</td>
                      <td className="p-3">{item.clickShare}%</td>
                      <td className="p-3">{formatNumber(item.orders)}</td>
                      <td className="p-3">{item.purchaseConversionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Click Rate = Clicks ÷ Product ပြသမှု။ Purchase Conversion =
              ဝယ်ယူသူ ÷ Click လုပ်သူ။ Tracking စတင်ပြီးနောက် data သာပါဝင်ပါမည်။
            </p>
          </>
        ) : (
          <div className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
            Click analytics တင်နေသည်…
          </div>
        )}
      </section>

      <section className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-4 text-xl font-bold">
          Reseller Performance (၃၀ ရက်)
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard
            label="Completed keys"
            value={formatNumber(data.reseller?.completedOrders30Days)}
          />
          <MetricCard
            label="Business wholesale revenue"
            value={formatMoney(data.reseller?.wholesaleRevenueMMK)}
          />
          <MetricCard
            label="Reported retail value"
            value={formatMoney(data.reseller?.reportedRetailValueMMK)}
            note={`${formatNumber(data.reseller?.ordersWithRetailPrice)} orders with retail price`}
          />
          <MetricCard
            label="Reported reseller margin"
            value={formatMoney(data.reseller?.reportedGrossMarginMMK)}
            note="Retail price ဖြည့်ထားသည့် order များအပေါ်သာ"
          />
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-1 text-xl font-bold">Package ရောင်းအား (၃၀ ရက်)</h2>
        <p className="mb-4 text-sm text-gray-500">
          Completed order များကို payment approve အချိန်အလိုက်တွက်ထားသည်။
          အဟောင်းများမှာ order created time ကိုအသုံးပြုသည်။
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">Package</th>
                <th className="p-3">Category</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Orders</th>
                <th className="p-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.packages.map((item) => (
                <tr
                  key={`${item.productId}-${item.channel}`}
                  className="border-b"
                >
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{item.channel}</td>
                  <td className="p-3">{formatNumber(item.orders)}</td>
                  <td className="p-3">{formatMoney(item.revenueMMK)}</td>
                </tr>
              ))}
              {data.packages.length === 0 && (
                <tr>
                  <td className="p-4 text-gray-500" colSpan="5">
                    ပြီးခဲ့သည့် ၃၀ ရက်အတွင်း completed order မရှိပါ။
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
