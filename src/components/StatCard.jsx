export default function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className={`${color} p-4 rounded-2xl text-white shadow-lg`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-2xl font-black text-gray-800">{value}</h3>
      </div>
    </div>
  );
}
