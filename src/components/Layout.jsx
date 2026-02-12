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

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full shadow-xl">
        <div className="p-8">
          <h1 className="text-2xl font-black tracking-widest text-blue-500">
            ADMIN HUB
          </h1>
        </div>
        <nav className="flex-1 mt-4">
          <SidebarItem
            to="/"
            icon={LayoutDashboard}
            label="Dashboard"
            active={location.pathname === "/"}
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
          {/* <SidebarItem
            to="/game"
            icon={Gamepad2}
            label="Dice Game"
            active={location.pathname === "/game"}
          /> */}
        </nav>

        <div className="p-6 border-t border-gray-800">
          <button className="flex items-center gap-3 text-gray-500 hover:text-red-400 transition w-full">
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
