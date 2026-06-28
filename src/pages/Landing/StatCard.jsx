import React from "react";

export default function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl bg-slate-50 ${color}`}>{icon}</div>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}
