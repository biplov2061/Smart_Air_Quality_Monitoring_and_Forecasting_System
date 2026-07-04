import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { trendData } from "../../data/mockData"

export default function TrendChart() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-slate-900 font-display font-semibold">24-Hour Trend</h3>
          <p className="text-xs text-slate-400 mt-0.5">Hourly AQI readings</p>
        </div>
        <div className="flex gap-2">
          {["24H", "7D", "30D"].map((label) => (
            <button
              key={label}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                label === "24H"
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              domain={[0, "auto"]}
            />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "13px",
              }}
              labelStyle={{ color: "#94a3b8" }}
              formatter={(value) => [value, "AQI"]}
            />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#059669"
              strokeWidth={2}
              fill="url(#aqiGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#059669", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
