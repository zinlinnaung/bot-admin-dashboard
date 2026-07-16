import React, { useState } from "react";
import axios from "axios";
import {
  Key,
  Activity,
  Loader2,
  Database,
  ShieldAlert,
  Search,
  Wifi,
} from "lucide-react";

export default function VpnUsageChecker() {
  const [keyId, setKeyId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // သင့်ရဲ့ Backend API URL ကို ဤနေရာတွင် ပြင်ဆင်ပါ
  const API_URL = "https://api.prototypeconnect.xyz/admin";

  const handleCheckUsage = async (e) => {
    e.preventDefault();
    if (!keyId.trim()) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      // သင့်တော်ရာ API endpoint သို့ axios ဖြင့် လှမ်းခေါ်ပါမည်
      const res = await axios.get(`${API_URL}/vpn/keys/${keyId}/usage`);

      if (res.data && res.data.success) {
        setResult(res.data.data);
      } else {
        throw new Error("ဒေတာရယူရာတွင် အမှားအယွင်းရှိပါသည်။");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "ဆာဗာနှင့် ချိတ်ဆက်၍မရပါ။",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-h-screen overflow-hidden p-4 md:p-8 flex justify-center items-center h-screen bg-gray-50/50">
      {/* --- MAIN CARD --- */}
      <div className="w-full max-w-xl animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col">
          {/* HEADER SECTION */}
          <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-[1.2rem] flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Wifi size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  VPN Data Usage
                </h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  Check Outline Key Bandwidth
                </p>
              </div>
            </div>
          </div>

          {/* FORM SECTION */}
          <div className="p-8">
            <form onSubmit={handleCheckUsage} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Outline Key ID
                </label>
                <div className="relative">
                  <Key
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Enter Key ID (e.g., 15)"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-blue-50/30 rounded-2xl outline-none font-bold text-gray-700 transition-all text-lg"
                    value={keyId}
                    onChange={(e) => setKeyId(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !keyId.trim()}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Search size={18} /> Check Usage
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="px-8 pb-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-rose-50 border border-rose-100 p-5 rounded-[1.5rem] flex items-start gap-4">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-rose-800">
                    Check Failed
                  </h4>
                  <p className="text-xs font-bold text-rose-600 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* RESULT SECTION */}
          {result && !error && (
            <div className="px-8 pb-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-[2rem] text-center shadow-inner relative overflow-hidden">
                {/* Decorative background icon */}
                <Database
                  className="absolute -right-4 -bottom-4 text-emerald-100 opacity-50"
                  size={120}
                />

                <div className="relative z-10">
                  <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                    <Activity size={24} />
                  </div>

                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 mb-2">
                    Total Data Transferred
                  </p>

                  <h2 className="text-5xl font-black text-emerald-600 flex items-baseline justify-center gap-2">
                    {result.usageGB.toFixed(2)}
                    <span className="text-lg font-bold">GB</span>
                  </h2>

                  <div className="mt-4 inline-block bg-white px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 font-mono">
                      {result.usageBytes.toLocaleString()} Bytes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
