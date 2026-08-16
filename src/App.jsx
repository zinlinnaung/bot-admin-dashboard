import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Deposits from "./pages/Deposits";
import Withdrawals from "./pages/Withdrawals";
import Users from "./pages/Users";
import Products from "./pages/Products";

import HighLowGame from "./pages/HighLowGame";
import TransactionHistory from "./pages/TransactionHistory";

import GameOrders from "./pages/GameOrders";
import UserProfileMini from "./pages/UserProfileMini";
import DeductBalance from "./pages/DeductBalance";
import TwoDAdmin from "./pages/TwoDAdmin";
import LuckyDraw from "./pages/LuckyDraw";
import BroadcastManager from "./pages/BroadcastManager";
import DigitalStoreApp from "./pages/Landing/DigitalStoreApp";
import VpnUsageChecker from "./pages/Users";
import { useEffect, useState } from "react";
import AdminLogin from "./components/AdminLogin";
import DeletedVpnKeys from "./pages/DeletedVpnKeys";
import VpnUsageCheck from "./pages/VpnUsageCheck";
import ProtoXOperations from "./pages/ProtoXOperations";
import BusinessAnalytics from "./pages/BusinessAnalytics";
import OperationsStatus from "./pages/OperationsStatus";
import FinancialReconciliation from "./pages/FinancialReconciliation";
import ResellerDashboard from "./pages/ResellerDashboard";
import VpnResellers from "./pages/VpnResellers";
import GrowthAnalytics from "./pages/GrowthAnalytics";

function App() {
  if (window.location.pathname === "/vpn-check") {
    return <VpnUsageCheck />;
  }
  if (window.location.pathname === "/reseller") {
    return <ResellerDashboard />;
  }
  const isTelegramWebApp = Boolean(window.Telegram?.WebApp?.initData);
  const [authenticated, setAuthenticated] = useState(
    isTelegramWebApp || Boolean(sessionStorage.getItem("adminToken")),
  );

  useEffect(() => {
    const expired = () => setAuthenticated(false);
    window.addEventListener("admin-auth-expired", expired);
    return () => window.removeEventListener("admin-auth-expired", expired);
  }, []);

  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <Router>
      <Routes>
        {/* Everything inside here will have the Sidebar/Navbar */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/deposits" element={<Deposits />} />
          <Route path="/withdrawals" element={<Withdrawals />} />
          <Route path="/users" element={<Users />} />
          <Route path="/products" element={<Products />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/deleted-vpn-keys" element={<DeletedVpnKeys />} />
          <Route path="/proto-x" element={<ProtoXOperations />} />
          <Route path="/business-analytics" element={<BusinessAnalytics />} />
          <Route path="/growth" element={<GrowthAnalytics />} />
          <Route path="/vpn-resellers" element={<VpnResellers />} />
          <Route path="/operations" element={<OperationsStatus />} />
          <Route
            path="/financial-reconciliation"
            element={<FinancialReconciliation />}
          />
          <Route path="/subtitle-translator" element={<VpnUsageChecker />} />
          <Route path="/order" element={<GameOrders />} />
          <Route path="/deduct" element={<DeductBalance />} />
          <Route path="/2d" element={<TwoDAdmin />} />
          <Route path="/lucky-draw" element={<LuckyDraw />} />
          <Route path="/broadcast" element={<BroadcastManager />} />

          {/* Catch-all inside the layout */}
          <Route path="*" element={<Dashboard />} />
        </Route>

        {/* This route is outside, so it will be a clean, blank page */}
        <Route path="/game" element={<HighLowGame />} />
        <Route path="/profile" element={<UserProfileMini />} />
        <Route path="/landing" element={<DigitalStoreApp />} />
      </Routes>
    </Router>
  );
}

export default App;
