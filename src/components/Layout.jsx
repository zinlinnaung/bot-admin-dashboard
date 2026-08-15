import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom"; // Added Outlet
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  LogOut,
  Package,
  Gamepad2, // Added a game icon just in case!
  ShieldOff,
  Bot,
  ChartNoAxesCombined,
  Activity,
  ReceiptText,
  Handshake,
} from "lucide-react";

const SidebarItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-6 py-4 transition-all ${
      active
        ? "bg-blue-600 text-white border-r-4 border-blue-300"
        : "text-gray-400 hover:bg-gray-800 hover:text-white"
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export default function Layout() {
  // Removed children prop
  const location = useLocation();
  const logout = () => {
    sessionStorage.removeItem("adminToken");
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full shadow-xl">
        <div className="p-8">
          <h1 className="text-2xl font-black tracking-widest text-blue-500">
            ADMIN HUB
          </h1>
        </div>
        <nav className="flex-1 mt-4 overflow-y-auto">
          <SidebarItem
            to="/"
            icon={LayoutDashboard}
            label="Dashboard"
            active={location.pathname === "/"}
          />
          <SidebarItem
            to="/broadcast"
            icon={LayoutDashboard}
            label="Broadcast Manager"
            active={location.pathname === "/broadcast"}
          />
          <SidebarItem
            to="/deposits"
            icon={ArrowDownCircle}
            label="Deposits"
            active={location.pathname === "/deposits"}
          />
          <SidebarItem
            to="/withdrawals"
            icon={ArrowUpCircle}
            label="Withdrawals"
            active={location.pathname === "/withdrawals"}
          />
          <SidebarItem
            to="/users"
            icon={Users}
            label="Users List"
            active={location.pathname === "/users"}
          />
          <SidebarItem
            to="/products"
            icon={Package}
            label="Product Stock"
            active={location.pathname === "/products"}
          />

          {/* Link to the game from the sidebar (Optional) */}
          <SidebarItem
            to="/transactions"
            icon={Gamepad2}
            label="Transaction History"
            active={location.pathname === "/transactions"}
          />
          <SidebarItem
            to="/deleted-vpn-keys"
            icon={ShieldOff}
            label="Deleted VPN Keys"
            active={location.pathname === "/deleted-vpn-keys"}
          />
          <SidebarItem
            to="/business-analytics"
            icon={ChartNoAxesCombined}
            label="Business Analytics"
            active={location.pathname === "/business-analytics"}
          />
          <SidebarItem
            to="/vpn-resellers"
            icon={Handshake}
            label="VPN Resellers"
            active={location.pathname === "/vpn-resellers"}
          />
          <SidebarItem
            to="/proto-x"
            icon={Bot}
            label="Proto-X AI"
            active={location.pathname === "/proto-x"}
          />
          <SidebarItem
            to="/operations"
            icon={Activity}
            label="Operations Status"
            active={location.pathname === "/operations"}
          />
          <SidebarItem
            to="/financial-reconciliation"
            icon={ReceiptText}
            label="Financial Audit"
            active={location.pathname === "/financial-reconciliation"}
          />
          <SidebarItem
            to="/subtitle-translator"
            icon={Gamepad2}
            label="Subtitle Translator"
            active={location.pathname === "/subtitle-translator"}
          />
          <SidebarItem
            to="/order"
            icon={Gamepad2}
            label="Game Orders"
            active={location.pathname === "/order"}
          />
          {/* <SidebarItem
            to="/deduct"
            icon={Package}
            label="Deduct Balance"
            active={location.pathname === "/deduct"}
          /> */}
          <SidebarItem
            to="/2d"
            icon={Package}
            label="2D Admin"
            active={location.pathname === "/2d"}
          />
          <SidebarItem
            to="/lucky-draw"
            icon={Package}
            label="Lucky Draw"
            active={location.pathname === "/lucky-draw"}
          />
        </nav>

        <div className="p-6 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 text-gray-500 hover:text-red-400 transition w-full"
          >
            <LogOut size={20} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* The Outlet renders the component for the current route */}
        <Outlet />
      </main>
    </div>
  );
}
