import React, { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Package, TrendingUp, Sparkles } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "./StatCard";
import { SALES_DATA } from "./mockData";

export default function SellerDashboard() {
  const [aiIdea, setAiIdea] = useState("");
  const [loading, setLoading] = useState(false);

  const generateWithGemini = async () => {
    setLoading(true);
    setTimeout(() => {
      setAiIdea(
        "A premium pack of 50+ animated Lucide icons for high-end React dashboards.",
      );
      setLoading(false);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Earnings"
          value="$12,840"
          icon={<DollarSign />}
          color="text-emerald-600"
        />
        <StatCard
          label="Orders"
          value="384"
          icon={<Package />}
          color="text-indigo-600"
        />
        <StatCard
          label="Growth"
          value="+24%"
          icon={<TrendingUp />}
          color="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Revenue Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  fill="#e0e7ff"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-between">
          <div>
            <Sparkles className="text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI Ideation</h3>
            <p className="text-slate-400 text-sm mb-6">
              Let Gemini suggest your next best-selling product.
            </p>
            {aiIdea && (
              <p className="bg-white/10 p-4 rounded-xl border border-white/10 text-sm italic">
                "{aiIdea}"
              </p>
            )}
          </div>
          <button
            onClick={generateWithGemini}
            className="mt-6 bg-indigo-500 w-full py-3 rounded-xl font-bold hover:bg-indigo-400 transition-all"
          >
            {loading ? "Thinking..." : "Generate Idea"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
