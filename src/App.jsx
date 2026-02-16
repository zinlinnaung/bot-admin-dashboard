import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Deposits from "./pages/Deposits";
import Withdrawals from "./pages/Withdrawals";
import Users from "./pages/Users";
import Products from "./pages/Products";

import HighLowGame from "./pages/HighLowGame";
import TransactionHistory from "./pages/TransactionHistory";
import SubtitleTranslator from "./pages/SubtitleTranslator";
import GameOrders from "./pages/GameOrders";
import UserProfileMini from "./pages/UserProfileMini";

function App() {
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
          <Route path="/subtitle-translator" element={<SubtitleTranslator />} />
          <Route path="/order" element={<GameOrders />} />

          {/* Catch-all inside the layout */}
          <Route path="*" element={<Dashboard />} />
        </Route>

        {/* This route is outside, so it will be a clean, blank page */}
        <Route path="/game" element={<HighLowGame />} />
        <Route path="/profile" element={<UserProfileMini />} />
      </Routes>
    </Router>
  );
}

export default App;
