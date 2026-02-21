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

  // Game Purchase States
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [gameForm, setGameForm] = useState({
    playerId: "",
    serverId: "",
    nickname: "",
  });
  const [isValidating, setIsValidating] = useState(false);

  // Deposit Form State
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
      console.error("Fetch Error:", e);
      tg?.showAlert("Error loading data.");
    } finally {
      setLoading(false);
    }
  }, [tg]);

  useEffect(() => {
    tg?.ready();
    tg?.expand();
    fetchData();
  }, [fetchData, tg]);

  // --- Purchase Logic ---
  const handlePurchaseClick = (product) => {
    const currentBalance = Number(userData?.balance || 0);
    const productPrice = Number(product?.price || 0);

    if (currentBalance < productPrice) {
      return tg?.showAlert(
        `❌ လက်ကျန်ငွေ မလုံလောက်ပါဘူး။\n\nလက်ရှိငွေ: ${currentBalance.toLocaleString()} MMK\nကျသင့်ငွေ: ${productPrice.toLocaleString()} MMK`,
      );
    }

    if (product.type === "AUTO") {
      confirmPurchase(product);
    } else {
      setSelectedProduct(product);
      setShowModal(true);
    }
  };

  const validateMLBB = async () => {
    if (!gameForm.playerId || !gameForm.serverId)
      return tg?.showAlert("ID နှင့် Server ဖြည့်ပါ");

    setIsValidating(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/admin/validate-mlbb?id=${gameForm.playerId}&serverid=${gameForm.serverId}`,
      );
      if (res.data.status === "success") {
        setGameForm((prev) => ({
          ...prev,
          nickname: res.data.result.nickname,
        }));
        tg?.HapticFeedback.notificationOccurred("success");
      } else {
        tg?.showAlert("❌ အကောင့်ရှာမတွေ့ပါ။ ID ပြန်စစ်ပေးပါ။");
      }
    } catch (e) {
      tg?.showAlert("⚠️ Validation API ခေတ္တချို့ယွင်းနေပါသည်။");
    } finally {
      setIsValidating(false);
    }
  };

  const confirmPurchase = async (product, gameData = null) => {
    tg?.showConfirm(
      `ဝယ်ယူရန် သေချာပါသလား?\n${product.name}`,
      async (confirmed) => {
        if (!confirmed) return;
        try {
          setSubmitting(true);
          const tid = tg?.initDataUnsafe?.user?.id || "1776339525";

          const payload = {
            telegramId: tid.toString(),
            productId: product.id,
            ...(gameData && {
              playerId: gameData.playerId,
              serverId: gameData.serverId,
              nickname: gameData.nickname,
            }),
          };

          const res = await axios.post(
            `${API_BASE_URL}/admin/purchase`,
            payload,
          );

          if (res.data) {
            tg?.HapticFeedback.notificationOccurred("success");
            tg?.showAlert("✅ ဝယ်ယူမှု အောင်မြင်ပါသည်။");
            setShowModal(false);
            setGameForm({ playerId: "", serverId: "", nickname: "" });
            fetchData();
            setCurrentView("profile");
          }
        } catch (err) {
          tg?.showAlert(
            `❌ Error: ${err.response?.data?.message || "ဝယ်ယူမှု မအောင်မြင်ပါ။"}`,
          );
        } finally {
          setSubmitting(false);
        }
      },
    );
  };

  // --- Deposit Logic ---
  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.image)
      return tg?.showAlert("Please fill all fields");

    const formData = new FormData();
    formData.append("amount", form.amount);
    formData.append("method", form.method);
    formData.append(
      "telegramId",
      (tg?.initDataUnsafe?.user?.id || "1776339525").toString(),
    );
    formData.append("image", form.image);

    try {
      setSubmitting(true);
      await axios.post(`${API_BASE_URL}/admin/deposit-with-image`, formData);
      tg?.showAlert("✅ Deposit request sent!");
      setCurrentView("profile");
      setForm({ amount: "", method: "KPay", image: null, preview: null });
      fetchData();
    } catch (err) {
      tg?.showAlert("Upload failed.");
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
          <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
            {userData?.firstName?.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-[9px] font-bold text-indigo-500 uppercase leading-none mb-1">
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
        {currentView === "shop" && (
          <ShopView
            products={products}
            onBuy={handlePurchaseClick}
            loading={submitting}
          />
        )}
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

      {/* Game Input Modal */}
      {showModal && (
        <GameInputModal
          product={selectedProduct}
          form={gameForm}
          setForm={setGameForm}
          onCancel={() => setShowModal(false)}
          onConfirm={confirmPurchase}
          onValidate={validateMLBB}
          loading={submitting}
          validating={isValidating}
        />
      )}

      {/* Bottom Nav */}
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

// --- Sub Components ---

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
          className="flex-1 bg-white text-indigo-600 py-3 rounded-xl font-bold text-sm"
        >
          Top Up
        </button>
        <button
          onClick={() => setView("shop")}
          className="flex-1 bg-indigo-500/50 text-white border border-indigo-400 py-3 rounded-xl font-bold text-sm"
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
        {(data?.deposits || []).slice(0, 5).map((d, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <ArrowDownLeft size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Deposit</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  {d.method}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-emerald-600">
                +{Number(d.amount).toLocaleString()}
              </p>
              <span
                className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase border ${d.status === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}
              >
                {d.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ShopView = ({ products, onBuy, loading }) => (
  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-right-4">
    {products.map((p) => (
      <div
        key={p.id}
        className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col"
      >
        <div className="h-28 w-full bg-indigo-50 rounded-2xl mb-3 flex items-center justify-center font-black text-indigo-600 text-2xl overflow-hidden">
          {p.image ? (
            <img
              src={`${API_BASE_URL}/uploads/${p.image}`}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            p.name[0]
          )}
        </div>
        <h4 className="text-xs font-bold text-gray-800 line-clamp-1 mb-1">
          {p.name}
        </h4>
        <p className="text-indigo-600 font-black text-sm">
          {Number(p.price).toLocaleString()}{" "}
          <span className="text-[8px]">MMK</span>
        </p>
        <button
          disabled={loading}
          onClick={() => onBuy(p)}
          className="w-full mt-3 bg-gray-900 text-white py-2 rounded-xl text-[10px] font-bold disabled:bg-gray-400"
        >
          {loading ? "..." : "BUY NOW"}
        </button>
      </div>
    ))}
  </div>
);

const TopUpView = ({ form, setForm, onSubmit, loading, fileInputRef }) => (
  <form
    onSubmit={onSubmit}
    className="bg-white p-6 rounded-[2rem] shadow-sm space-y-4"
  >
    <div>
      <h3 className="font-bold text-xl">Deposit Funds</h3>
      <p className="text-[10px] text-gray-400 font-bold uppercase">
        Send slip to approval
      </p>
    </div>
    <select
      className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none"
      value={form.method}
      onChange={(e) => setForm({ ...form, method: e.target.value })}
    >
      <option value="KPay">KPay</option>
      <option value="WavePay">WavePay</option>
    </select>
    <input
      type="number"
      placeholder="Amount"
      className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none"
      value={form.amount}
      onChange={(e) => setForm({ ...form, amount: e.target.value })}
    />
    <div
      onClick={() => fileInputRef.current.click()}
      className="w-full h-44 border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden bg-gray-50/50"
    >
      {form.preview ? (
        <img src={form.preview} className="w-full h-full object-cover" alt="" />
      ) : (
        <ImageIcon className="text-gray-300" />
      )}
    </div>
    <input
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
      className="w-full bg-indigo-600 text-white py-4 rounded-[1.5rem] font-bold"
    >
      {loading ? (
        <Loader2 className="animate-spin mx-auto" />
      ) : (
        "Confirm Deposit"
      )}
    </button>
  </form>
);

const GameInputModal = ({
  product,
  form,
  setForm,
  onCancel,
  onConfirm,
  onValidate,
  loading,
  validating,
}) => {
  const isMLBB = product?.name.toUpperCase().includes("MLBB");
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-full duration-300">
        <div className="text-center">
          <h3 className="text-xl font-black">{product?.name}</h3>
          <p className="text-xs text-gray-400 font-bold uppercase mt-1">
            Game Details
          </p>
        </div>
        <div className="space-y-3">
          <input
            placeholder="Player ID"
            className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none"
            value={form.playerId}
            onChange={(e) => setForm({ ...form, playerId: e.target.value })}
          />
          {isMLBB && (
            <div className="flex gap-2">
              <input
                placeholder="Server ID"
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none flex-1"
                value={form.serverId}
                onChange={(e) => setForm({ ...form, serverId: e.target.value })}
              />
              <button
                onClick={onValidate}
                disabled={validating}
                className="bg-indigo-50 text-indigo-600 px-4 rounded-2xl font-black text-xs"
              >
                {validating ? "..." : "CHECK"}
              </button>
            </div>
          )}
          {form.nickname && (
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <p className="text-[10px] text-emerald-600 font-black uppercase">
                Nickname
              </p>
              <p className="font-bold text-emerald-700">{form.nickname}</p>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-4 font-bold text-gray-400 bg-gray-50 rounded-2xl"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(product, form)}
            disabled={loading || (isMLBB && !form.nickname)}
            className="flex-1 py-4 font-bold text-white bg-indigo-600 rounded-2xl shadow-lg disabled:opacity-50"
          >
            {loading ? "..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

const NavBtn = ({ act, icon, onClick }) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-2xl transition-all ${act ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500"}`}
  >
    {React.cloneElement(icon, { size: 22 })}
  </button>
);

export default UserProfileMini;
