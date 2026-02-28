import React, { useState, useEffect } from "react";
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
} from "lucide-react";

const API_URL =
  "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin";

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
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingKeys, setFetchingKeys] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isViewKeysOpen, setIsViewKeysOpen] = useState(false);

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
    isFreeTrial: false, // New Field
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

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: currentProduct.name,
        category: currentProduct.category,
        subCategory: currentProduct.subCategory,
        // If it's a trial, we ensure the price is 0
        price: currentProduct.isFreeTrial ? 0 : Number(currentProduct.price),
        description: currentProduct.description,
        type: currentProduct.type,
        isFreeTrial: currentProduct.isFreeTrial, // Send Trial Flag
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
      console.error("Save Error:", error.response?.data || error.message);
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
      console.error("Failed to fetch keys", error);
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Inventory</h2>
          <p className="text-gray-500 text-sm">
            Manage stock levels and products
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
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-100 font-bold active:scale-95 transition-all"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => {
            const stockCount = p.stock ?? p._count?.keys ?? 0;
            const isOutOfStock =
              p.type === PRODUCT_TYPE.AUTO && stockCount === 0;

            return (
              <div
                key={p.id}
                className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col relative overflow-hidden"
              >
                {/* Trial Badge */}
                {p.isFreeTrial && (
                  <div className="absolute top-0 left-0 bg-blue-600 text-white px-4 py-1.5 rounded-br-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Gift size={12} /> Trial
                  </div>
                )}

                {p.type === PRODUCT_TYPE.AUTO && (
                  <div
                    className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-wider ${
                      stockCount > 0
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    STOCK: {stockCount}
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`p-3 rounded-2xl ${
                      p.type === PRODUCT_TYPE.API
                        ? "bg-orange-50 text-orange-600"
                        : p.type === PRODUCT_TYPE.MANUAL
                          ? "bg-purple-50 text-purple-600"
                          : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {p.type === PRODUCT_TYPE.API ? (
                      <Zap size={24} />
                    ) : p.type === PRODUCT_TYPE.MANUAL ? (
                      <Gamepad2 size={24} />
                    ) : (
                      <Package size={24} />
                    )}
                  </div>
                  <div className="mt-6 flex flex-col items-end gap-1">
                    <span className="bg-gray-900 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                      {p.category}
                    </span>
                    {p.type === PRODUCT_TYPE.API && (
                      <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                        {p.usageLimitGB}GB / {p.packageDays} Days
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-1 leading-tight">
                  {p.name}
                </h3>
                <p className="text-gray-400 text-xs mb-4 line-clamp-2 h-8">
                  {p.description || "..."}
                </p>

                <div className="bg-gray-50 rounded-2xl p-3 flex justify-between items-center mb-4 border border-gray-100">
                  <div>
                    <p className="text-[9px] text-gray-400 font-black uppercase">
                      Price
                    </p>
                    <p
                      className={`font-black ${p.isFreeTrial ? "text-blue-600" : "text-gray-900"}`}
                    >
                      {p.isFreeTrial
                        ? "FREE"
                        : `${Number(p.price).toLocaleString()} MMK`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 font-black uppercase">
                      Status
                    </p>
                    <p
                      className={`text-[10px] font-bold ${isOutOfStock ? "text-rose-500" : "text-emerald-500"}`}
                    >
                      {p.type === PRODUCT_TYPE.AUTO
                        ? stockCount > 0
                          ? "AVAILABLE"
                          : "OUT OF STOCK"
                        : "READY"}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2">
                  {p.type === PRODUCT_TYPE.AUTO && (
                    <>
                      <button
                        onClick={() => {
                          setKeyForm({ productId: p.id, keys: "" });
                          setIsKeyModalOpen(true);
                        }}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-[11px] font-black flex justify-center items-center gap-1 transition-all"
                      >
                        <Plus size={14} /> Add Keys
                      </button>
                      <button
                        onClick={() => handleViewKeys(p)}
                        className="p-2.5 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-xl transition-all"
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
                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- PRODUCT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-900">
                Product Setup
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* --- FREE TRIAL TOGGLE --- */}
              <div
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${currentProduct.isFreeTrial ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
              >
                <input
                  type="checkbox"
                  id="isFreeTrial"
                  className="w-5 h-5 rounded-lg accent-blue-600"
                  checked={currentProduct.isFreeTrial}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      isFreeTrial: e.target.checked,
                      price: e.target.checked ? "0" : currentProduct.price,
                    })
                  }
                />
                <label
                  htmlFor="isFreeTrial"
                  className="flex flex-col cursor-pointer"
                >
                  <span className="text-sm font-black text-gray-900">
                    One-Time Free Trial
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold uppercase">
                    Users can only buy this once
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">
                    Category
                  </label>
                  <select
                    className="w-full bg-gray-50 p-3 rounded-xl text-sm font-bold"
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
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">
                    Sub-Category
                  </label>
                  <select
                    className="w-full bg-gray-50 p-3 rounded-xl text-sm font-bold"
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

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">
                  Name
                </label>
                <input
                  required
                  placeholder="e.g. 1GB Trial Package"
                  className="w-full bg-gray-50 p-3 rounded-xl font-semibold"
                  value={currentProduct.name}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">
                  Price (MMK)
                </label>
                <input
                  type="number"
                  required={!currentProduct.isFreeTrial}
                  disabled={currentProduct.isFreeTrial}
                  className={`w-full p-3 rounded-xl font-bold transition-all ${currentProduct.isFreeTrial ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-gray-50 text-blue-600"}`}
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

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">
                  Service Type
                </label>
                <div className="flex gap-2">
                  {Object.values(PRODUCT_TYPE).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setCurrentProduct({ ...currentProduct, type: t })
                      }
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${currentProduct.type === t ? "bg-gray-900 text-white shadow-lg" : "bg-gray-100 text-gray-400"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* API Fields */}
              {currentProduct.type === PRODUCT_TYPE.API && (
                <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-black text-orange-600 uppercase flex items-center gap-1">
                    <Zap size={12} /> API Configuration (Hiddify)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1">
                        <HardDrive size={10} /> Data (GB)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 1"
                        className="w-full bg-white p-2.5 rounded-xl font-bold text-sm border border-orange-100"
                        value={currentProduct.usageLimitGB}
                        onChange={(e) =>
                          setCurrentProduct({
                            ...currentProduct,
                            usageLimitGB: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1">
                        <Calendar size={10} /> Days
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 30"
                        className="w-full bg-white p-2.5 rounded-xl font-bold text-sm border border-orange-100"
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
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">
                  Description
                </label>
                <textarea
                  className="w-full bg-gray-50 p-3 rounded-xl text-sm h-20"
                  value={currentProduct.description}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-blue-100"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save size={20} />
                )}{" "}
                Confirm Save
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- KEY IMPORT MODAL --- */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">Stock Import</h3>
              <button onClick={() => setIsKeyModalOpen(false)}>
                <X />
              </button>
            </div>
            <form onSubmit={handleAddKeys} className="space-y-5">
              <textarea
                required
                rows={8}
                placeholder="Paste keys here (one per line)..."
                className="w-full bg-gray-50 p-4 rounded-2xl font-mono text-sm border-2 border-transparent focus:border-emerald-500 outline-none"
                value={keyForm.keys}
                onChange={(e) =>
                  setKeyForm({ ...keyForm, keys: e.target.value })
                }
              />
              <button
                type="submit"
                disabled={submitting || !keyForm.keys.trim()}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black flex justify-center items-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Plus size={20} />
                )}
                Import {keyForm.keys.split("\n").filter((k) => k.trim()).length}{" "}
                Keys
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW KEYS MODAL --- */}
      {isViewKeysOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black">Current Stock</h3>
                <p className="text-xs text-gray-500">
                  Unused keys available for sale
                </p>
              </div>
              <button
                onClick={() => setIsViewKeysOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {fetchingKeys ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-blue-600" size={30} />
                </div>
              ) : selectedProductKeys.filter((k) => !k.isUsed).length === 0 ? (
                <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2">
                  <Package size={40} className="opacity-20" />
                  <p className="font-bold">No keys in stock.</p>
                </div>
              ) : (
                selectedProductKeys
                  .filter((k) => !k.isUsed)
                  .map((k) => (
                    <div
                      key={k.id}
                      className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100"
                    >
                      <div className="flex flex-col">
                        <code className="text-sm font-black text-blue-600 break-all">
                          {k.key}
                        </code>
                        <span className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-tighter">
                          ID: {k.id}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <button
              onClick={() => setIsViewKeysOpen(false)}
              className="mt-6 w-full py-4 bg-gray-900 text-white rounded-2xl font-black"
            >
              Close Viewer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
