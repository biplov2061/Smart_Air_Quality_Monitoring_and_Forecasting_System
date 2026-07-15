import { recommendations } from "../../data/mockData"

const severityStyles = {
  high: {
    border: "border-red-200 dark:border-red-800/30",
    bg: "bg-red-50 dark:bg-red-900/20",
    badge: "bg-red-500",
    badgeText: "text-white",
  },
  medium: {
    border: "border-amber-200 dark:border-amber-800/30",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    badge: "bg-amber-500",
    badgeText: "text-white",
  },
  low: {
    border: "border-emerald-200 dark:border-emerald-800/30",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    badge: "bg-emerald-500",
    badgeText: "text-white",
  },
}

export default function Recommendations() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-900 dark:text-white font-display font-semibold">Recommendations</h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">Based on current AQI</span>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const styles = severityStyles[rec.severity]
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-xl border ${styles.border} ${styles.bg} transition-shadow hover:shadow-sm`}
            >
              <span className="text-lg flex-shrink-0">{rec.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{rec.title}</h4>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${styles.badge} ${styles.badgeText}`}>
                    {rec.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{rec.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
