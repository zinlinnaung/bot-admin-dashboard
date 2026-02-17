import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import {
  ChevronLeft,
  Loader2,
  History,
  UserCircle,
  Store,
  CreditCard,
  Image as ImageIcon,
  ArrowDownLeft,
} from "lucide-react";

const API_BASE_URL =
  "https://telegram-ecommerce-bot-backend-production.up.railway.app";

const UserProfileMini = () => {
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("profile");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    method: "KPay",
    image: null,
    preview: null,
  });

  const fileInputRef = useRef(null);
  const tg = window.Telegram?.WebApp;

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const tid = tg?.initDataUnsafe?.user?.id || "1776339525";

      // Get user ID from Telegram ID
      const userRes = await axios.get(
        `${API_BASE_URL}/admin/by-telegram/${tid}`,
      );

      // Fetch full details and products in parallel
      const [details, prods] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/users/${userRes.data.id}`),
        axios.get(`${API_BASE_URL}/admin/products`),
      ]);

      setUserData(details.data);
      setProducts(prods.data);
    } catch (e) {
      console.error("Fetch Error:", e);
      tg?.showAlert("Error loading data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [tg]);

  useEffect(() => {
    tg?.ready();
    tg?.expand();
    fetchData();
  }, [fetchData, tg]);

  // --- Logic for Deposit Submission ---
  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.image)
      return tg?.showAlert("Please fill all fields and upload a slip");

    const formData = new FormData();
    formData.append("amount", form.amount.toString());
    formData.append("method", form.method);
    formData.append(
      "telegramId",
      (tg?.initDataUnsafe?.user?.id || "1776339525").toString(),
    );
    formData.append("image", form.image);

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${API_BASE_URL}/admin/deposit-with-image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        },
      );

      if (response.data.success) {
        tg?.HapticFeedback.notificationOccurred("success");
        tg?.showAlert("✅ Deposit request sent! Waiting for Admin approval.");

        // Reset everything
        setCurrentView("profile");
        setForm({ amount: "", method: "KPay", image: null, preview: null });
        if (fileInputRef.current) fileInputRef.current.value = "";

        // Refresh history to show "Pending" status
        fetchData();
      }
    } catch (err) {
      console.error("Upload Error:", err);
      tg?.showAlert("Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Loading...
        </span>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans antialiased">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md p-4 flex items-center gap-4 border-b">
        {currentView !== "profile" ? (
          <button
            onClick={() => setCurrentView("profile")}
            className="p-2 bg-gray-100 rounded-full"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg">
            {userData?.firstName?.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter leading-none mb-1">
            {currentView === "profile" ? "Your Account" : currentView}
          </p>
          <h1 className="font-bold text-gray-900 leading-none">
            {userData?.firstName}
          </h1>
        </div>
      </div>

      <div className="p-5">
        {currentView === "profile" && (
          <ProfileView data={userData} setView={setCurrentView} />
        )}
        {currentView === "shop" && <ShopView products={products} />}
        {currentView === "topup" && (
          <TopUpView
            form={form}
            setForm={setForm}
            onSubmit={handleTopUp}
            loading={submitting}
            fileInputRef={fileInputRef}
          />
        )}
      </div>

      {/* Persistent Bottom Nav */}
      <div className="fixed bottom-6 left-6 right-6 h-16 bg-gray-900 rounded-2xl flex items-center justify-around px-4 shadow-2xl z-50">
        <NavBtn
          act={currentView === "profile"}
          icon={<UserCircle />}
          onClick={() => setCurrentView("profile")}
        />
        <NavBtn
          act={currentView === "shop"}
          icon={<Store />}
          onClick={() => setCurrentView("shop")}
        />
        <NavBtn
          act={currentView === "topup"}
          icon={<CreditCard />}
          onClick={() => setCurrentView("topup")}
        />
      </div>
    </div>
  );
};

// --- Sub-Component: Profile & History ---
const ProfileView = ({ data, setView }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl">
      <p className="text-xs opacity-70 mb-1 font-medium">Available Balance</p>
      <h2 className="text-4xl font-black">
        {Number(data?.balance || 0).toLocaleString()}{" "}
        <span className="text-sm font-normal opacity-80">MMK</span>
      </h2>
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setView("topup")}
          className="flex-1 bg-white text-indigo-600 py-3 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-transform"
        >
          Top Up
        </button>
        <button
          onClick={() => setView("shop")}
          className="flex-1 bg-indigo-500/50 text-white border border-indigo-400 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
        >
          Shop
        </button>
      </div>
    </div>

    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
      <h3 className="font-bold mb-5 flex items-center gap-2 text-gray-800">
        <History size={18} className="text-indigo-600" /> Recent History
      </h3>
      <div className="space-y-5">
        {data?.deposits?.length > 0 ? (
          data.deposits.slice(0, 8).map((d, i) => {
            const status = d.status?.toLowerCase() || "pending";
            return (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${status === "rejected" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
                  >
                    <ArrowDownLeft size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Deposit</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {d.method}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold text-sm ${status === "rejected" ? "text-red-600" : "text-emerald-600"}`}
                  >
                    {status === "rejected" ? "" : "+"}
                    {Number(d.amount).toLocaleString()}
                  </p>
                  <span
                    className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border ${
                      status === "pending"
                        ? "bg-amber-50 text-amber-600 border-amber-200"
                        : status === "approved"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-red-50 text-red-600 border-red-200"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              No activity yet
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// --- Sub-Component: TopUp Form ---
const TopUpView = ({ form, setForm, onSubmit, loading, fileInputRef }) => (
  <form
    onSubmit={onSubmit}
    className="bg-white p-6 rounded-[2rem] shadow-sm space-y-4 animate-in slide-in-from-left-4"
  >
    <div className="mb-2">
      <h3 className="font-bold text-xl text-gray-900">Deposit Funds</h3>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
        Send slip to approval
      </p>
    </div>

    <select
      className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 outline-none appearance-none"
      value={form.method}
      onChange={(e) => setForm({ ...form, method: e.target.value })}
    >
      <option value="KPay">KPay</option>
      <option value="WavePay">WavePay</option>
    </select>

    <input
      type="number"
      placeholder="Enter Amount"
      className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 outline-none placeholder:text-gray-300"
      value={form.amount}
      onChange={(e) => setForm({ ...form, amount: e.target.value })}
    />

    <div
      onClick={() => document.getElementById("slip").click()}
      className="w-full h-44 border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden bg-gray-50/50 hover:bg-gray-50 transition-colors"
    >
      {form.preview ? (
        <img
          src={form.preview}
          className="w-full h-full object-cover"
          alt="Preview"
        />
      ) : (
        <>
          <div className="p-3 bg-white rounded-full shadow-sm mb-2 text-indigo-600">
            <ImageIcon size={20} />
          </div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            Upload Payment Slip
          </p>
        </>
      )}
    </div>

    <input
      id="slip"
      type="file"
      ref={fileInputRef}
      hidden
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file)
          setForm({ ...form, image: file, preview: URL.createObjectURL(file) });
      }}
    />

    <button
      disabled={loading}
      className="w-full bg-indigo-600 text-white py-4 rounded-[1.5rem] font-bold shadow-lg shadow-indigo-100 flex justify-center items-center active:scale-95 transition-transform disabled:opacity-50"
    >
      {loading ? <Loader2 className="animate-spin" /> : "Confirm Deposit"}
    </button>
  </form>
);

// --- Sub-Component: Shop Grid ---
const ShopView = ({ products }) => (
  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-right-4">
    {products.map((p) => (
      <div
        key={p.id}
        className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col"
      >
        <div className="h-28 w-full bg-indigo-50 rounded-2xl mb-3 flex items-center justify-center font-black text-indigo-600 text-2xl">
          {p.name[0]}
        </div>
        <h4 className="text-xs font-bold text-gray-800 line-clamp-1 mb-1">
          {p.name}
        </h4>
        <p className="text-indigo-600 font-black text-sm">
          {Number(p.price).toLocaleString()}{" "}
          <span className="text-[8px]">MMK</span>
        </p>
        <button className="w-full mt-3 bg-gray-900 text-white py-2 rounded-xl text-[10px] font-bold active:scale-95 transition-transform">
          BUY NOW
        </button>
      </div>
    ))}
  </div>
);

// --- Helper: Nav Button ---
const NavBtn = ({ act, icon, onClick }) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-2xl transition-all duration-300 ${
      act
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40"
        : "text-gray-500 hover:text-gray-300"
    }`}
  >
    {React.cloneElement(icon, { size: 22 })}
  </button>
);

export default UserProfileMini;
