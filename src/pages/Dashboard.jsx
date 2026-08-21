import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  Clock,
  DollarSign,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Server,
  TrendingUp,
  Users,
} from "lucide-react";
import StatCard from "../components/StatCard";

const API_URL = "https://api.prototypeconnect.xyz";

export default function Dashboard() {
  const [stats, setStats] = useState({
    userCount: 0,
    deposits: [],
    withdrawals: [],
    todayRevenue: 0,
    todayWithdraw: 0,
    todayCashFlow: 0,
    activeVpnKeys: 0,
    expiringSoon: 0,
    deletedVpnKeys: 0,
    monthlyRevenue: 0,
    grossRevenue: 0,
    monthlyServerCostMmk: 80000,
    monthlyRevenueAfterServerCost: -80000,
    vpnKeysScheduledForDeletionNext3Days: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const { data } = await axios.get(`${API_URL}/admin/dashboard-stats`);
      setStats((current) => ({ ...current, ...data }));
      setLastUpdated(new Date());
      setError("");
    } catch (requestError) {
      console.error("Dashboard data fetch error:", requestError);
      setError("Dashboard data ကို ယာယီရယူ၍မရပါ။ ခဏအကြာ Refresh ပြန်လုပ်ပါ။");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-cyan-600" size={36} />
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Business data တင်နေပါသည်…
          </p>
        </div>
      </div>
    );

  const pendingDeposits = stats.deposits?.length || 0;
  const pendingWithdrawals = stats.withdrawals?.length || 0;
  const pendingTotal = pendingDeposits + pendingWithdrawals;

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-cyan-700">
            Game Gear MM Operations
          </p>
          <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
            Business Overview
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Sales၊ customers၊ VPN keys နဲ့ လုပ်ဆောင်ရန်ကျန်ရှိသည့် approvals
            များကို တစ်နေရာတည်းမှ ကြည့်နိုင်ပါသည်။
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700 disabled:opacity-60"
        >
          <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />{" "}
          Refresh
        </button>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's Revenue"
          value={`${Number(stats.todayRevenue || 0).toLocaleString()} MMK`}
          icon={DollarSign}
          color="bg-blue-600"
        />
        <StatCard
          title="Monthly Gross Revenue"
          value={`${Number(stats.monthlyRevenue || 0).toLocaleString()} MMK`}
          icon={TrendingUp}
          color="bg-violet-600"
        />
        <StatCard
          title="Gross Revenue (All Time)"
          value={`${Number(stats.grossRevenue || 0).toLocaleString()} MMK`}
          icon={TrendingUp}
          color="bg-indigo-600"
        />
        <StatCard
          title="Monthly Server Cost"
          value={`${Number(stats.monthlyServerCostMmk || 0).toLocaleString()} MMK`}
          icon={Server}
          color="bg-rose-600"
        />
        <StatCard
          title="After Server Cost (Month)"
          value={`${Number(stats.monthlyRevenueAfterServerCost || 0).toLocaleString()} MMK`}
          icon={DollarSign}
          color="bg-amber-600"
        />
        <StatCard
          title="VPN Keys: Delete in 3 Days"
          value={stats.vpnKeysScheduledForDeletionNext3Days || 0}
          icon={ShieldAlert}
          color="bg-orange-600"
        />
        <StatCard
          title="Active VPN Keys"
          value={stats.activeVpnKeys || 0}
          icon={ShieldCheck}
          color="bg-emerald-600"
        />
        <StatCard
          title="Total Customers"
          value={stats.userCount || 0}
          icon={Users}
          color="bg-cyan-600"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Action Center
              </p>
              <h3 className="mt-1 text-xl font-black text-slate-900">
                Pending approvals
              </h3>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${pendingTotal ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
            >
              {pendingTotal} pending
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/deposits"
              className="group rounded-2xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/50"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
                  <ArrowDownCircle size={21} />
                </div>
                <ArrowRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                />
              </div>
              <p className="mt-4 text-2xl font-black text-slate-900">
                {pendingDeposits}
              </p>
              <p className="text-sm font-semibold text-slate-500">
                Deposit requests
              </p>
            </Link>
            <Link
              to="/withdrawals"
              className="group rounded-2xl border border-slate-200 p-4 transition hover:border-rose-300 hover:bg-rose-50/50"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-rose-100 p-2.5 text-rose-700">
                  <ArrowUpCircle size={21} />
                </div>
                <ArrowRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-rose-600"
                />
              </div>
              <p className="mt-4 text-2xl font-black text-slate-900">
                {pendingWithdrawals}
              </p>
              <p className="text-sm font-semibold text-slate-500">
                Withdrawal requests
              </p>
            </Link>
          </div>
          <Link
            to="/order"
            className="mt-3 flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <span>Customer & MLBB orders ကြည့်မည်</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white shadow-xl sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-400/15 p-2.5 text-cyan-300">
              <Activity size={21} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Operations
              </p>
              <h3 className="font-black">System snapshot</h3>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
              <span className="text-sm text-slate-300">
                VPN keys scheduled for deletion within 3 days
              </span>
              <strong className="text-amber-300">
                {stats.vpnKeysScheduledForDeletionNext3Days ??
                  stats.expiringSoon ??
                  0}
              </strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
              <span className="text-sm text-slate-300">
                Deleted key records
              </span>
              <strong>{stats.deletedVpnKeys || 0}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
              <span className="text-sm text-slate-300">Today's payouts</span>
              <strong>
                {Number(stats.todayWithdraw || 0).toLocaleString()} MMK
              </strong>
            </div>
          </div>
          <Link
            to="/operations"
            className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-50"
          >
            Full system status <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <Clock size={14} />
        <span>
          Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
        </span>
        <span>•</span>
        <span>
          Dashboard သည် manual Refresh ဖြင့်သာ API request ထပ်ခေါ်ပါသည်။
        </span>
      </footer>
    </div>
  );
}
