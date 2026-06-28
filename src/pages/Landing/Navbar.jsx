import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Store, LayoutDashboard, ShoppingCart } from "lucide-react";

export default function Navbar({ cartCount, toggleCart }) {
  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/landing"
          className="flex items-center space-x-2 text-indigo-600 font-bold text-xl tracking-tight"
        >
          <Sparkles className="w-6 h-6" />
          <span>DigiVault</span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link
            to="/landing"
            className="flex items-center space-x-1 text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <Store className="w-4 h-4" />
            <span className="font-medium text-sm hidden sm:inline">Store</span>
          </Link>
          <Link
            to="/landing/dashboard"
            className="flex items-center space-x-1 text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-medium text-sm hidden sm:inline">
              Dashboard
            </span>
          </Link>
          <button
            onClick={toggleCart}
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
