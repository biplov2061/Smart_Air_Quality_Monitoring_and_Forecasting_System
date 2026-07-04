import { pollutants } from "../../data/mockData"

const statusColors = {
  green: "bg-emerald-100 text-emerald-700",
  yellow: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
}

export default function PollutantBreakdown() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-slate-900 font-display font-semibold mb-4">Pollutant Breakdown</h3>
      <div className="space-y-3">
        {pollutants.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div>
              <span className="text-slate-900 font-medium text-sm">{p.name}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-slate-400 text-xs font-mono">{p.value} {p.unit}</span>
              </div>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                statusColors[p.color] || "bg-slate-100 text-slate-600"
              }`}
            >
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
