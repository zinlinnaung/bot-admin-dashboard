import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import confetti from "canvas-confetti";

// Internal Components
import Navbar from "./Navbar";
import Storefront from "./Storefront";
import CartSidebar from "./CartSidebar";
import SellerDashboard from "./SellerDashboard";

export default function DigitalStoreApp() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing)
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#4F46E5", "#10B981", "#F59E0B"],
    });
    setCart([]);
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans -m-8">
      <Navbar
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        toggleCart={() => setIsCartOpen(true)}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Routes>
          <Route index element={<Storefront addToCart={addToCart} />} />
          <Route path="dashboard" element={<SellerDashboard />} />
        </Routes>
      </main>
      <CartSidebar
        isOpen={isCartOpen}
        close={() => setIsCartOpen(false)}
        cart={cart}
        remove={removeFromCart}
        checkout={handleCheckout}
      />
    </div>
  );
}
