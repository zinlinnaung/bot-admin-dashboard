import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Package,
  Plus,
  Trash2,
  Edit,
  Key,
  X,
  Save,
  Gamepad2,
  Loader2,
  Zap,
  Eye,
  HardDrive,
  Calendar,
  Gift,
  Search,
  Filter,
  AlertCircle,
  TrendingUp,
  LayoutGrid,
} from "lucide-react";

const API_URL = "https://vpnbot-production-e78a.up.railway.app/admin";

const PRODUCT_TYPE = {
  AUTO: "AUTO",
  MANUAL: "MANUAL",
  API: "API",
};

const CATEGORY_MAP = {
  Gaming: ["Mobile Legends", "PUBG Mobile", "Free Fire", "Other Games"],
  VPN: ["Hiddify", "Outline", "1.1.1.1", "Surfshark"],
  Netflix: ["Shared Screen", "Private Profile", "Full Account"],
  Premium: ["Canva", "Spotify", "YouTube", "Other"],
  Spotify: ["Premium Account", "Family Plan", "Duo Plan"],
  Canva: ["Pro Account", "Edu Account(lifetime)", "Other"],
  Capcut: ["Pro Account", "Mobile Pro", "Other"],
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingKeys, setFetchingKeys] = useState(false);

  // UX States
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isViewKeysOpen, setIsViewKeysOpen] = useState(false);

  // --- New State ---
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [bulkPriceAmount, setBulkPriceAmount] = useState("");

  // --- New Handler ---
  const handleBulkPriceUpdate = async (e) => {
    e.preventDefault();
    const amount = Number(bulkPriceAmount);

    if (!amount || isNaN(amount)) {
      alert("Please enter a valid amount.");
      return;
    }

    const confirmMsg =
      amount > 0
        ? `Are you sure you want to INCREASE all prices by ${amount.toLocaleString()} MMK?`
        : `Are you sure you want to DECREASE all prices by ${Math.abs(amount).toLocaleString()} MMK?`;

    if (!window.confirm(confirmMsg)) return;

    setSubmitting(true);
    try {
      const res = await axios.patch(`${API_URL}/products/bulk-add-price`, {
        amount,
      });
      alert(res.data.message);
      setIsBulkPriceModalOpen(false);
      setBulkPriceAmount("");
      fetchProducts(); // Refresh the list to see new prices
    } catch (error) {
      alert(error.response?.data?.message || "Bulk update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const [currentProduct, setCurrentProduct] = useState({
    id: null,
    name: "",
    category: "Gaming",
    subCategory: "Mobile Legends",
    price: "",
    description: "",
    type: PRODUCT_TYPE.MANUAL,
    usageLimitGB: "",
    packageDays: "",
    isFreeTrial: false,
  });

  const [keyForm, setKeyForm] = useState({ productId: null, keys: "" });
  const [selectedProductKeys, setSelectedProductKeys] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Filter Logic ---
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === "All" || p.category === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [products, searchTerm, activeTab]);

  const stats = useMemo(() => {
    const total = products.length;
    const outOfStock = products.filter(
      (p) =>
        p.type === PRODUCT_TYPE.AUTO && (p.stock ?? p._count?.keys ?? 0) === 0,
    ).length;
    const apiCount = products.filter((p) => p.type === PRODUCT_TYPE.API).length;
    return { total, outOfStock, apiCount };
  }, [products]);

  // --- Handlers (Logic remains unchanged) ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: currentProduct.name,
        category: currentProduct.category,
        subCategory: currentProduct.subCategory,
        price: currentProduct.isFreeTrial ? 0 : Number(currentProduct.price),
        description: currentProduct.description,
        type: currentProduct.type,
        isFreeTrial: currentProduct.isFreeTrial,
        usageLimitGB:
          currentProduct.type === PRODUCT_TYPE.API
            ? Number(currentProduct.usageLimitGB)
            : null,
        packageDays:
          currentProduct.type === PRODUCT_TYPE.API
            ? Number(currentProduct.packageDays)
            : null,
      };

      if (currentProduct.id) {
        await axios.patch(`${API_URL}/products/${currentProduct.id}`, payload);
      } else {
        await axios.post(`${API_URL}/products`, payload);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddKeys = async (e) => {
    e.preventDefault();
    if (!keyForm.keys.trim() || !keyForm.productId) return;
    setSubmitting(true);
    try {
      const keyArray = keyForm.keys.split("\n").filter((k) => k.trim() !== "");
      await axios.post(`${API_URL}/products/${keyForm.productId}/keys`, {
        keys: keyArray,
      });
      setIsKeyModalOpen(false);
      setKeyForm({ productId: null, keys: "" });
      fetchProducts();
      alert(`Successfully added ${keyArray.length} keys`);
    } catch (error) {
      alert("Failed to add keys.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewKeys = async (product) => {
    setFetchingKeys(true);
    setIsViewKeysOpen(true);
    try {
      const res = await axios.get(`${API_URL}/products/${product.id}`);
      setSelectedProductKeys(res.data.keys || []);
    } catch (error) {
      setSelectedProductKeys([]);
    } finally {
      setFetchingKeys(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      fetchProducts();
    } catch (error) {
      alert("Delete failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-[900] text-slate-900 tracking-tight">
              Inventory
            </h2>
            <p className="text-slate-500 font-medium">
              Manage your digital stock and services
            </p>
          </div>
          <button
            onClick={() => {
              setCurrentProduct({
                id: null,
                name: "",
                category: "Gaming",
                subCategory: CATEGORY_MAP["Gaming"][0],
                price: "",
                description: "",
                type: PRODUCT_TYPE.MANUAL,
                usageLimitGB: "",
                packageDays: "",
                isFreeTrial: false,
              });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 font-bold transition-all active:scale-95"
          >
            <Plus size={20} /> Add New Product
          </button>

          <div className="flex flex-wrap gap-3">
            {/* New Bulk Button */}
            <button
              onClick={() => setIsBulkPriceModalOpen(true)}
              className="bg-white border-2 border-slate-100 hover:border-blue-100 text-slate-600 px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95 shadow-sm"
            >
              <TrendingUp size={20} className="text-blue-600" /> Bulk Price
            </button>

            {/* Existing Add Product Button */}
            <button
              onClick={() => {
                /* ... existing logic ... */
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 font-bold transition-all active:scale-95"
            >
              <Plus size={20} /> Add New Product
            </button>
          </div>
        </div>

        {/* --- Quick Stats --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase">
                Total Items
              </p>
              <p className="text-xl font-black text-slate-900">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase">
                Out of Stock
              </p>
              <p className="text-xl font-black text-slate-900">
                {stats.outOfStock}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase">
                API Services
              </p>
              <p className="text-xl font-black text-slate-900">
                {stats.apiCount}
              </p>
            </div>
          </div>
        </div>

        {/* --- Search & Tabs --- */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex flex-wrap gap-1 p-1">
              {["All", ...Object.keys(CATEGORY_MAP)].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-72 px-2">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* --- Product Grid --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="font-bold text-slate-400">Loading Inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Package size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              No products found
            </h3>
            <p className="text-slate-500 font-medium">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const stockCount = p.stock ?? p._count?.keys ?? 0;
              const isOutOfStock =
                p.type === PRODUCT_TYPE.AUTO && stockCount === 0;

              return (
                <div
                  key={p.id}
                  className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div className="p-6 pb-4 relative">
                    {/* Badges */}
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={`p-3 rounded-2xl shadow-sm ${
                          p.type === PRODUCT_TYPE.API
                            ? "bg-orange-50 text-orange-600"
                            : p.type === PRODUCT_TYPE.MANUAL
                              ? "bg-purple-50 text-purple-600"
                              : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {p.type === PRODUCT_TYPE.API ? (
                          <Zap size={22} />
                        ) : p.type === PRODUCT_TYPE.MANUAL ? (
                          <Gamepad2 size={22} />
                        ) : (
                          <Package size={22} />
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {p.isFreeTrial && (
                          <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                            <Gift size={10} /> Trial
                          </span>
                        )}
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tight">
                          {p.subCategory}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-black text-slate-900 text-lg leading-tight mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-slate-400 text-xs font-medium line-clamp-2 h-8 leading-relaxed">
                      {p.description ||
                        "No description provided for this service."}
                    </p>
                  </div>

                  <div className="px-6 py-4 bg-slate-50/50 border-y border-slate-50 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Pricing
                      </p>
                      <p
                        className={`text-lg font-black ${p.isFreeTrial ? "text-blue-600" : "text-slate-900"}`}
                      >
                        {p.isFreeTrial
                          ? "FREE"
                          : `${Number(p.price).toLocaleString()} MMK`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Stock
                      </p>
                      {p.type === PRODUCT_TYPE.AUTO ? (
                        <p
                          className={`text-xs font-black ${isOutOfStock ? "text-rose-500" : "text-emerald-500"}`}
                        >
                          {isOutOfStock ? "OUT OF STOCK" : `${stockCount} KEYS`}
                        </p>
                      ) : (
                        <p className="text-xs font-black text-slate-500">
                          MANUAL
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 flex gap-2">
                    {p.type === PRODUCT_TYPE.AUTO && (
                      <>
                        <button
                          onClick={() => {
                            setKeyForm({ productId: p.id, keys: "" });
                            setIsKeyModalOpen(true);
                          }}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-100"
                        >
                          <Plus size={16} /> Keys
                        </button>
                        <button
                          onClick={() => handleViewKeys(p)}
                          className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-2xl transition-all"
                        >
                          <Eye size={18} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setCurrentProduct(p);
                        setIsModalOpen(true);
                      }}
                      className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-2xl transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-2xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- BULK PRICE UPDATE MODAL --- */}
        {isBulkPriceModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-md p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Global Pricing
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Update all products at once
                  </p>
                </div>
                <button
                  onClick={() => setIsBulkPriceModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full"
                >
                  <X />
                </button>
              </div>

              <form onSubmit={handleBulkPriceUpdate} className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <AlertCircle className="text-blue-600 shrink-0" size={20} />
                  <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                    Enter a positive number to <b>increase</b> prices, or a
                    negative number (e.g., -500) to <b>decrease</b> prices. This
                    affects every product in your inventory.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-2">
                    Adjustment Amount (MMK)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1000 or -500"
                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-black text-xl text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={bulkPriceAmount}
                    onChange={(e) => setBulkPriceAmount(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !bulkPriceAmount}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-[2rem] font-black flex justify-center items-center gap-2 shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Save size={20} />
                  )}
                  Update All Prices
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- MODALS (Enhanced Styling) --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-lg p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <LayoutGrid size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Configure Product
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-6">
                {/* Trial Toggle */}
                <label
                  className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer ${currentProduct.isFreeTrial ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-transparent hover:border-slate-200"}`}
                >
                  <input
                    type="checkbox"
                    className="w-6 h-6 rounded-lg accent-blue-600"
                    checked={currentProduct.isFreeTrial}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        isFreeTrial: e.target.checked,
                        price: e.target.checked ? "0" : currentProduct.price,
                      })
                    }
                  />
                  <div>
                    <span className="block text-sm font-black text-slate-900">
                      One-Time Free Trial
                    </span>
                    <span className="text-[11px] text-blue-600 font-bold uppercase tracking-wide">
                      Users can only purchase this once
                    </span>
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-2">
                      Category
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                      value={currentProduct.category}
                      onChange={(e) =>
                        setCurrentProduct({
                          ...currentProduct,
                          category: e.target.value,
                          subCategory: CATEGORY_MAP[e.target.value][0],
                        })
                      }
                    >
                      {Object.keys(CATEGORY_MAP).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-2">
                      Sub-Category
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                      value={currentProduct.subCategory}
                      onChange={(e) =>
                        setCurrentProduct({
                          ...currentProduct,
                          subCategory: e.target.value,
                        })
                      }
                    >
                      {CATEGORY_MAP[currentProduct.category].map((sc) => (
                        <option key={sc} value={sc}>
                          {sc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-2">
                    Product Display Name
                  </label>
                  <input
                    required
                    placeholder="e.g. Netflix 1 Month Premium"
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={currentProduct.name}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-2">
                    Base Price (MMK)
                  </label>
                  <input
                    type="number"
                    disabled={currentProduct.isFreeTrial}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-black text-blue-600 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={
                      currentProduct.isFreeTrial ? "0" : currentProduct.price
                    }
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        price: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-2">
                    Delivery Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(PRODUCT_TYPE).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setCurrentProduct({ ...currentProduct, type: t })
                        }
                        className={`py-3 rounded-2xl text-[11px] font-black transition-all border-2 ${
                          currentProduct.type === t
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {currentProduct.type === PRODUCT_TYPE.API && (
                  <div className="p-5 bg-orange-50 rounded-[2rem] border border-orange-100 space-y-4">
                    <div className="flex items-center gap-2 text-orange-600 font-black text-xs uppercase">
                      <Zap size={16} /> API Auto-Config
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Data (GB)"
                        className="p-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold"
                        value={currentProduct.usageLimitGB}
                        onChange={(e) =>
                          setCurrentProduct({
                            ...currentProduct,
                            usageLimitGB: e.target.value,
                          })
                        }
                      />
                      <input
                        type="number"
                        placeholder="Days"
                        className="p-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold"
                        value={currentProduct.packageDays}
                        onChange={(e) =>
                          setCurrentProduct({
                            ...currentProduct,
                            packageDays: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                <textarea
                  placeholder="Product Description..."
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-medium h-28 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={currentProduct.description}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      description: e.target.value,
                    })
                  }
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[2rem] font-black flex justify-center gap-2 shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Save size={20} />
                  )}
                  Confirm & Save Product
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- STOCK IMPORT MODAL --- */}
        {isKeyModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-md p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900">
                  Bulk Stock Import
                </h3>
                <button
                  onClick={() => setIsKeyModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full"
                >
                  <X />
                </button>
              </div>
              <form onSubmit={handleAddKeys} className="space-y-6">
                <div className="relative">
                  <textarea
                    required
                    rows={8}
                    placeholder="Paste keys here&#10;Key123&#10;Key456..."
                    className="w-full bg-slate-50 p-6 rounded-[2rem] font-mono text-sm border-2 border-transparent focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                    value={keyForm.keys}
                    onChange={(e) =>
                      setKeyForm({ ...keyForm, keys: e.target.value })
                    }
                  />
                  <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black">
                    {keyForm.keys.split("\n").filter((k) => k.trim()).length}{" "}
                    DETECTED
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting || !keyForm.keys.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[2rem] font-black flex justify-center items-center gap-2 shadow-xl shadow-emerald-100 transition-all active:scale-95"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Plus size={20} />
                  )}
                  Import All Keys
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- VIEW KEYS MODAL --- */}
        {isViewKeysOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-lg p-8 shadow-2xl max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Active Stock
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Available for auto-delivery
                  </p>
                </div>
                <button
                  onClick={() => setIsViewKeysOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full"
                >
                  <X />
                </button>
              </div>

              <div className="overflow-y-auto space-y-3 pr-2 custom-scrollbar flex-1">
                {fetchingKeys ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                  </div>
                ) : selectedProductKeys.filter((k) => !k.isUsed).length ===
                  0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-[2.5rem]">
                    <Package
                      size={48}
                      className="mx-auto text-slate-200 mb-4"
                    />
                    <p className="font-black text-slate-400">
                      Warehouse is empty
                    </p>
                  </div>
                ) : (
                  selectedProductKeys
                    .filter((k) => !k.isUsed)
                    .map((k) => (
                      <div
                        key={k.id}
                        className="group flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all"
                      >
                        <div className="flex flex-col">
                          <code className="text-sm font-black text-blue-600 break-all">
                            {k.key}
                          </code>
                          <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                            Serial: {k.id}
                          </span>
                        </div>
                        <Key
                          size={16}
                          className="text-slate-200 group-hover:text-blue-200 transition-colors"
                        />
                      </div>
                    ))
                )}
              </div>

              <button
                onClick={() => setIsViewKeysOpen(false)}
                className="mt-6 w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] font-black transition-all shadow-xl shadow-slate-200"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scrollbar CSS */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
