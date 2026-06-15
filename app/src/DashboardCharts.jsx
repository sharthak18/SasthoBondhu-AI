import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardCharts({ trendData, tierData }) {
  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200/50 h-72 flex flex-col">
        <h3 className="text-xs font-bold text-navy-dark uppercase tracking-wider mb-4">30-Day Patient Trend</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", fontSize: "11px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
              <Line type="monotone" dataKey="patients" name="Total Patients" stroke="#0D7A62" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: "#0D7A62" }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="highRisk" name="Referred Flags" stroke="#C84B2F" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: "#C84B2F" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200/50 h-72 flex flex-col">
        <h3 className="text-xs font-bold text-navy-dark uppercase tracking-wider mb-4">Risk Tier Distribution</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tierData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="tier" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none", fontSize: "11px" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={45}>
                {tierData.map((entry) => (
                  <Cell
                    key={entry.tier}
                    fill={entry.tier === "Green" ? "#0D7A62" : entry.tier === "Amber" ? "#C47D0C" : "#C84B2F"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
