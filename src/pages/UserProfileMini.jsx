import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import {
  ChevronLeft,
  Loader2,
  PlusCircle,
  ShoppingBag,
  History,
  UserCircle,
  Store,
  CreditCard,
  Image as ImageIcon,
  X,
  ArrowDownLeft,
  ArrowUpRight,
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

  const tg = window.Telegram?.WebApp;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const tid = tg?.initDataUnsafe?.user?.id || "6503912648";
      const userRes = await axios.get(
        `${API_BASE_URL}/admin/by-telegram/${tid}`,
      );
      const [details, prods] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/users/${userRes.data.id}`),
        axios.get(`${API_BASE_URL}/admin/products`),
      ]);
      setUserData(details.data);
      setProducts(prods.data);
    } catch (e) {
      tg?.showAlert("Error loading data");
    } finally {
      setLoading(false);
    }
  }, [tg]);

  useEffect(() => {
    tg?.ready();
    tg?.expand();
    fetchData();
  }, [fetchData, tg]);

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.image)
      return tg?.showAlert("Please fill all fields");

    const formData = new FormData();
    formData.append("image", form.image);
    formData.append("amount", form.amount);
    formData.append("method", form.method);
    formData.append("telegramId", tg?.initDataUnsafe?.user?.id || "6503912648");

    try {
      setSubmitting(true);
      await axios.post(`${API_BASE_URL}/wallet/deposit-with-image`, formData);
      tg?.HapticFeedback.notificationOccurred("success");
      tg?.showAlert("Deposit request sent! Waiting for Admin approval.");
      setForm({ amount: "", method: "KPay", image: null, preview: null });
      setCurrentView("profile");
      fetchData();
    } catch (err) {
      tg?.showAlert("Upload failed");
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
    <div className="min-h-screen bg-gray-50 pb-24">
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
          <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
            {userData?.firstName?.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-[9px] font-bold text-indigo-500 uppercase">
            {currentView}
          </p>
          <h1 className="font-bold text-gray-900">{userData?.firstName}</h1>
        </div>
      </div>

      <div className="p-5">
        {currentView === "profile" && (
          <ProfileView data={userData} setView={setCurrentView} />
        )}
        {currentView === "shop" && (
          <ShopView
            products={products}
            onBuy={() => tg.showAlert("Buy feature ready")}
          />
        )}
        {currentView === "topup" && (
          <TopUpView
            form={form}
            setForm={setForm}
            onSubmit={handleTopUp}
            loading={submitting}
          />
        )}
      </div>

      {/* Nav */}
      <div className="fixed bottom-6 left-6 right-6 h-16 bg-gray-900 rounded-2xl flex items-center justify-around px-4 shadow-xl">
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

const ProfileView = ({ data, setView }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-lg">
      <p className="text-xs opacity-70 mb-1">Balance</p>
      <h2 className="text-4xl font-black">
        {Number(data?.balance).toLocaleString()}{" "}
        <span className="text-sm">MMK</span>
      </h2>
      <div className="flex gap-2 mt-6">
        <button
          onClick={() => setView("topup")}
          className="flex-1 bg-white text-indigo-600 py-3 rounded-xl font-bold text-sm"
        >
          Top Up
        </button>
        <button
          onClick={() => setView("shop")}
          className="flex-1 bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm"
        >
          Shop
        </button>
      </div>
    </div>
    <div className="bg-white p-6 rounded-[2rem] shadow-sm">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <History size={16} /> History
      </h3>
      <div className="space-y-4">
        {data?.deposits?.slice(0, 5).map((d, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <ArrowDownLeft size={16} />
              </div>
              <div>
                <p className="text-sm font-bold">Deposit</p>
                <p className="text-[10px] text-gray-400">{d.method}</p>
              </div>
            </div>
            <p className="font-bold text-emerald-600">
              +{Number(d.amount).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TopUpView = ({ form, setForm, onSubmit, loading }) => (
  <form
    onSubmit={onSubmit}
    className="bg-white p-6 rounded-[2rem] shadow-sm space-y-4 animate-in slide-in-from-left-4"
  >
    <h3 className="font-bold text-xl mb-4">Deposit</h3>
    <select
      className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
      value={form.method}
      onChange={(e) => setForm({ ...form, method: e.target.value })}
    >
      <option value="KPay">KPay</option>
      <option value="WavePay">WavePay</option>
    </select>
    <input
      type="number"
      placeholder="Amount"
      className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
      value={form.amount}
      onChange={(e) => setForm({ ...form, amount: e.target.value })}
    />
    <div
      onClick={() => document.getElementById("slip").click()}
      className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center relative overflow-hidden"
    >
      {form.preview ? (
        <img src={form.preview} className="w-full h-full object-cover" />
      ) : (
        <>
          <ImageIcon className="text-gray-300 mb-2" />
          <p className="text-[10px] text-gray-400 font-bold uppercase">
            Upload Slip
          </p>
        </>
      )}
    </div>
    <input
      id="slip"
      type="file"
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
      className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 flex justify-center"
    >
      {loading ? <Loader2 className="animate-spin" /> : "Submit Deposit"}
    </button>
  </form>
);

const ShopView = ({ products }) => (
  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-right-4">
    {products.map((p) => (
      <div key={p.id} className="bg-white p-4 rounded-2xl border">
        <div className="h-20 w-20 bg-indigo-50 rounded-xl mx-auto mb-3 flex items-center justify-center font-bold text-indigo-600">
          {p.name[0]}
        </div>
        <h4 className="text-xs font-bold line-clamp-1">{p.name}</h4>
        <p className="text-indigo-600 font-black mt-1">
          {Number(p.price).toLocaleString()} MMK
        </p>
        <button className="w-full mt-3 bg-gray-900 text-white py-2 rounded-lg text-[10px] font-bold">
          BUY
        </button>
      </div>
    ))}
  </div>
);

const NavBtn = ({ act, icon, onClick }) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-xl transition-all ${act ? "bg-indigo-600 text-white" : "text-gray-500"}`}
  >
    {icon}
  </button>
);

export default UserProfileMini;
