import { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  Database,
  HardDrive,
  MemoryStick,
  ShieldCheck,
} from "lucide-react";
import { API_BASE_URL } from "../api-auth";

export default function OperationsStatus() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const load = () => {
    setError("");
    axios
      .get(`${API_BASE_URL}/admin/operations/status`)
      .then((response) => setData(response.data))
      .catch(() => setError("Server status ကိုရယူ၍မရပါ။"));
  };
  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, []);
  if (error)
    return <div className="rounded-xl bg-red-50 p-5 text-red-700">{error}</div>;
  if (!data) return <div className="p-5">Server status ရယူနေပါသည်…</div>;
  const cards = [
    [Database, "Database", `${data.database} · ${data.databaseLatencyMs} ms`],
    [MemoryStick, "Memory", `${data.memoryMb} MB`],
    [HardDrive, "Disk usage", `${data.diskUsedPercent}%`],
    [ShieldCheck, "Outline API", data.outline],
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Operations Status</h1>
          <p className="text-gray-500">
            Proto-X server monitoring နှင့် automatic alerts
          </p>
        </div>
        <button
          onClick={load}
          className="rounded-xl bg-blue-600 px-4 py-2 text-white font-bold"
        >
          Refresh
        </button>
      </div>
      <div
        className={`rounded-2xl p-5 text-white ${data.status === "ok" ? "bg-emerald-600" : "bg-amber-600"}`}
      >
        <div className="flex items-center gap-3">
          <Activity />
          <span className="text-xl font-black">
            System {data.status.toUpperCase()}
          </span>
        </div>
        <p className="mt-2 text-sm opacity-80">
          Uptime {Math.floor(data.uptimeSeconds / 60)} minutes ·{" "}
          {new Date(data.checkedAt).toLocaleString()}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map(([Icon, label, value]) => (
          <div
            key={label}
            className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100"
          >
            <Icon className="text-blue-600" />
            <p className="mt-4 text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
