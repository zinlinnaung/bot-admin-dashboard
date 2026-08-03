import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api-auth";

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/auth/login`, {
        password,
      });
      sessionStorage.setItem("adminToken", response.data.token);
      onLogin();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login မအောင်မြင်ပါ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-500">စီမံခန့်ခွဲသူ password ဖြင့် ဝင်ပါ။</p>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
          className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Password"
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "စစ်ဆေးနေသည်..." : "Login"}
        </button>
      </form>
    </main>
  );
}
