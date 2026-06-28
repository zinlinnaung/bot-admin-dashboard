import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function CartSidebar({ isOpen, close, cart, remove, checkout }) {
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Shopping Cart</h2>
              <button
                onClick={close}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b pb-4 border-slate-100"
                >
                  <div>
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      ${item.price} x {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {cart.length === 0 && (
                <p className="text-center text-slate-400 mt-10">
                  Your cart is empty
                </p>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-6 bg-slate-50">
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
                <button
                  onClick={checkout}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                >
                  Complete Purchase
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
