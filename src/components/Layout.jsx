import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Bot,
  ChevronRight,
  Handshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Radio,
  ReceiptText,
  ShieldOff,
  ShoppingBag,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
      {
        to: "/business-analytics",
        icon: BarChart3,
        label: "Business Analytics",
      },
      { to: "/growth", icon: TrendingUp, label: "Customer Growth" },
    ],
  },
  {
    label: "Sales & Customers",
    items: [
      { to: "/order", icon: ShoppingBag, label: "Orders" },
      { to: "/products", icon: Package, label: "Products & MLBB" },
      { to: "/users", icon: Users, label: "Customers" },
      { to: "/vpn-resellers", icon: Handshake, label: "VPN Resellers" },
      { to: "/broadcast", icon: Radio, label: "Broadcast" },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/deposits", icon: ArrowDownCircle, label: "Deposits" },
      { to: "/withdrawals", icon: ArrowUpCircle, label: "Withdrawals" },
      { to: "/transactions", icon: ReceiptText, label: "Transactions" },
      {
        to: "/financial-reconciliation",
        icon: ReceiptText,
        label: "Financial Audit",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/operations", icon: Activity, label: "System Status" },
      { to: "/deleted-vpn-keys", icon: ShieldOff, label: "Deleted VPN Keys" },
      { to: "/proto-x", icon: Bot, label: "Proto-X AI" },
    ],
  },
];

function SidebarContent({ closeMenu }) {
  const logout = () => {
    sessionStorage.removeItem("adminToken");
    window.location.href = "/";
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-black shadow-lg shadow-cyan-950/40">
            G
          </div>
          <div>
            <p className="text-base font-black tracking-wide">GAME GEAR MM</p>
            <p className="text-xs text-slate-400">Business Control Center</p>
          </div>
        </div>
      </div>

      <nav className="profile-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navigation.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/30" : "text-slate-300 hover:bg-white/7 hover:text-white"}`
                  }
                >
                  {React.createElement(Icon, { size: 18 })}
                  <span className="flex-1">{label}</span>
                  <ChevronRight
                    size={15}
                    className="opacity-0 transition group-hover:opacity-60"
                  />
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const currentItem = navigation
    .flatMap((section) => section.items)
    .find((item) => item.to === location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 shadow-2xl lg:block">
        <SidebarContent />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[86%] max-w-80 shadow-2xl">
            <SidebarContent closeMenu={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label="Open navigation"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Admin Portal
              </p>
              <h1 className="font-black text-slate-800">
                {currentItem?.label || "Dashboard"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
