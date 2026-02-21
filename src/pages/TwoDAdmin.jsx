import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ShieldAlert,
  PlusCircle,
  X,
  Loader2,
  Hash,
  Trash2,
  Info,
  RefreshCw,
  Lock,
} from "lucide-react";

// Update this to your actual API base URL
const API_URL =
  "https://telegram-ecommerce-bot-backend-production.up.railway.app/admin";

export default function TwoDAdmin() {
  const [blockedNumbers, setBlockedNumbers] = useState([]);
  const [newNumber, setNewNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * 1. Fetch blocked numbers from the in-memory cache/database
   */
  const fetchBlockedNumbers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/blocked-numbers`);
      // Accessing the key 'blockedNumbers' from your NestJS service response
      setBlockedNumbers(res.data.blockedNumbers || []);
    } catch (err) {
      console.error("Error fetching blocked numbers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedNumbers();
  }, []);

  /**
   * 2. Handle adding a new blocked number
   */
  const handleAddNumber = async (e) => {
    e.preventDefault();
    const cleanNumber = newNumber.trim();

    if (!cleanNumber || cleanNumber.length !== 2) {
      alert("ကျေးဇူးပြု၍ ၂ လုံးဂဏန်း မှန်ကန်စွာရိုက်ထည့်ပါ (e.g. 05)");
      return;
    }

    if (blockedNumbers.includes(cleanNumber)) {
      alert("ဤဂဏန်းမှာ ပိတ်ထားပြီးသားဖြစ်သည်");
      return;
    }

    const updatedList = [...blockedNumbers, cleanNumber];
    await updateSettings(updatedList);
    setNewNumber("");
  };

  /**
   * 3. Handle removing a blocked number
   */
  const handleRemoveNumber = async (numberToRemove) => {
    if (
      !window.confirm(`${numberToRemove} ကို ပိတ်ဂဏန်းစာရင်းမှ ပြန်ဖွင့်မလား?`)
    )
      return;

    const updatedList = blockedNumbers.filter((n) => n !== numberToRemove);
    await updateSettings(updatedList);
  };

  /**
   * 4. Core Update Function
   */
  const updateSettings = async (newList) => {
    setIsUpdating(true);
    try {
      const res = await axios.post(`${API_URL}/blocked-numbers`, {
        numbers: newList,
      });
      setBlockedNumbers(res.data.blockedNumbers);
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Failed to update"));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-h-screen overflow-hidden p-2 animate-in fade-in duration-500">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2 text-gray-800">
            <ShieldAlert className="text-rose-600" size={28} />
            2D Blocked Numbers
          </h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
            Currently Blocked: {blockedNumbers.length} Numbers
          </p>
        </div>

        <button
          onClick={fetchBlockedNumbers}
          className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-2xl transition-all"
        >
          <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* --- LEFT: ADD NUMBER FORM --- */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                <Lock size={24} />
              </div>
              <h4 className="text-xl font-black text-gray-900">Block New</h4>
            </div>

            <form onSubmit={handleAddNumber} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Enter 2D Number
                </label>
                <div className="relative">
                  <Hash
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-200"
                    size={24}
                  />
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="00"
                    className="w-full pl-16 pr-6 py-5 bg-rose-50/30 border-2 border-rose-100 rounded-2xl outline-none font-mono text-3xl font-black text-rose-600 placeholder:text-rose-100"
                    value={newNumber}
                    onChange={(e) =>
                      setNewNumber(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-bold italic flex items-start gap-2 px-1">
                  <Info size={12} className="mt-0.5" />
                  ဤဂဏန်းကို ပိတ်လိုက်ပါက User များ ထိုး၍ရတော့မည်မဟုတ်ပါ။
                </p>
              </div>

              <button
                type="submit"
                disabled={isUpdating || newNumber.length !== 2}
                className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-rose-100 flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <PlusCircle size={18} /> Block Number
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* --- RIGHT: LIST OF BLOCKED NUMBERS --- */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-[65vh] overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Live Block List
              </span>
              {isUpdating && (
                <span className="text-xs font-bold text-rose-500 animate-pulse">
                  Updating Cache...
                </span>
              )}
            </div>

            <div className="flex-1 overflow-auto p-8 custom-scrollbar">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="animate-spin text-blue-600" size={40} />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Loading Cache...
                  </p>
                </div>
              ) : blockedNumbers.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {blockedNumbers.map((num) => (
                    <div
                      key={num}
                      className="group relative bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center hover:bg-rose-50 hover:border-rose-100 transition-all duration-300"
                    >
                      <span className="text-3xl font-black text-gray-800 group-hover:text-rose-600 font-mono transition-colors">
                        {num}
                      </span>
                      <button
                        onClick={() => handleRemoveNumber(num)}
                        className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-rose-600 p-2 rounded-xl shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Hash size={32} className="text-gray-200" />
                  </div>
                  <h5 className="text-gray-400 font-black uppercase tracking-widest text-sm">
                    No Blocked Numbers
                  </h5>
                  <p className="text-gray-300 text-xs font-bold mt-2">
                    Everything is open for betting.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
