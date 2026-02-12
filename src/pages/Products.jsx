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
  AlertCircle,
} from "lucide-react";

// API URL (Based on your snippet)
const API_URL =
  "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Form States
  const [currentProduct, setCurrentProduct] = useState({
    id: null,
    name: "",
    category: "VPN",
    price: "",
    description: "",
  });
  const [keyForm, setKeyForm] = useState({ productId: null, key: "" });

  // 1. Fetch Products
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

  // 2. Handle Submit (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (currentProduct.id) {
        // Update
        await axios.put(`${API_URL}/products/${currentProduct.id}`, {
          ...currentProduct,
          price: Number(currentProduct.price),
        });
      } else {
        // Create
        await axios.post(`${API_URL}/products`, {
          ...currentProduct,
          price: Number(currentProduct.price),
        });
      }
      setIsModalOpen(false);
      fetchProducts(); // Refresh list
    } catch (error) {
      alert("Error saving product");
      console.error(error);
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      alert("Failed to delete");
    }
  };

  // 4. Handle Add Key
  const handleAddKey = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/products/${keyForm.productId}/keys`, {
        key: keyForm.key,
      });
      alert("Key added successfully!");
      setKeyForm({ ...keyForm, key: "" }); // Clear input
      fetchProducts(); // Refresh to show updated stock count
    } catch (error) {
      alert("Error adding key");
    }
  };

  // Helper to open modals
  const openAddModal = () => {
    setCurrentProduct({
      id: null,
      name: "",
      category: "VPN",
      price: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setCurrentProduct({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description || "",
    });
    setIsModalOpen(true);
  };

  const openKeyModal = (product) => {
    setKeyForm({ productId: product.id, key: "" });
    setIsKeyModalOpen(true);
  };

  if (loading)
    return (
      <div className="p-10 text-center text-blue-600 font-bold">
        Loading Inventory...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Product Inventory</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-blue-200"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl border border-dashed flex flex-col items-center gap-3">
          <AlertCircle size={40} className="text-gray-300" />
          <p className="text-gray-500 font-medium">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between mb-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                  <Package size={24} />
                </div>
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 h-fit rounded uppercase">
                  {p.category}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800 truncate">
                {p.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4 truncate h-6">
                {p.description || "No description"}
              </p>

              <div className="flex justify-between items-center py-4 border-t border-b border-dashed my-2">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">
                    Price
                  </p>
                  <p className="font-black text-blue-600">
                    {Number(p.price).toLocaleString()} MMK
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">
                    Stock
                  </p>
                  <p
                    className={`font-bold ${p.keys?.filter((k) => !k.isUsed).length > 0 ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {p.keys ? p.keys.filter((k) => !k.isUsed).length : 0} Keys
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between gap-2 mt-2">
                <button
                  onClick={() => openKeyModal(p)}
                  className="flex-1 bg-emerald-50 text-emerald-600 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1 hover:bg-emerald-100"
                >
                  <Plus size={14} /> Add Stock
                </button>
                <button
                  onClick={() => openEditModal(p)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= PRODUCT MODAL (Create / Edit) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {currentProduct.id ? "Edit Product" : "New Product"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={currentProduct.name}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Price (MMK)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={currentProduct.price}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        price: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={currentProduct.category}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        category: e.target.value,
                      })
                    }
                  >
                    <option value="VPN">VPN</option>
                    <option value="Netflix">Netflix</option>
                    <option value="Premium">Premium Account</option>
                    <option value="Gaming">Gaming ID</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="3"
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
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 flex justify-center gap-2"
              >
                <Save size={18} /> Save Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD KEY MODAL ================= */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Key size={18} /> Add Stock Key
              </h3>
              <button onClick={() => setIsKeyModalOpen(false)}>
                <X className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleAddKey} className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mb-2">
                Enter the secret key, token, or login credential for this
                product.
              </div>
              <textarea
                required
                className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
                rows="3"
                placeholder="e.g. vmess://... or user:pass"
                value={keyForm.key}
                onChange={(e) =>
                  setKeyForm({ ...keyForm, key: e.target.value })
                }
              />
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-2 rounded-xl font-bold hover:bg-emerald-700"
              >
                Confirm Add
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
