import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { PRODUCTS } from "./mockData";

export default function Storefront({ addToCart }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          Digital Marketplace
        </h1>
        <p className="text-slate-500 text-lg">
          High-quality assets for modern developers.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRODUCTS.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group"
          >
            <div className="h-44 overflow-hidden relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <div className="p-5">
              <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-500">
                {product.category}
              </span>
              <h3 className="font-bold text-slate-800 mt-1">{product.name}</h3>
              <div className="flex items-center justify-between mt-6">
                <span className="text-xl font-black text-slate-900">
                  ${product.price}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
