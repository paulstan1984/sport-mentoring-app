"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CheckinItemStat {
  label: string;
  checkedCount: number;
}

export function CheckinReportChart({ data }: { data: CheckinItemStat[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--kit-text-3)" }}>
        Nu există încă date de checkin pentru raport.
      </p>
    );
  }

  return (
    <div className="rounded-2xl p-4" style={{ border: "1px solid var(--kit-border)", background: "var(--kit-surface)" }}>
      <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--kit-text)" }}>
        Raport checkin (ultimele 14 zile)
      </h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" angle={-20} textAnchor="end" interval={0} height={54} tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => [value, "Bifări"]} />
            <Bar dataKey="checkedCount" name="Bifări" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
