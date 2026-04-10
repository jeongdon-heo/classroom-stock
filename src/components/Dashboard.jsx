import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";
import { TrendingUp, Building2, BarChart3, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import Card from "./Card";
import Stat from "./Stat";

const colors = ["#6366f1", "#8b5cf6", "#14b8a6", "#f59e0b", "#ef4444", "#22c55e", "#ec4899", "#06b6d4", "#eab308", "#a855f7"];

export default function Dashboard() {
  const { students, txs, week, setSelStudent: onSel, isMobile } = useApp();
  const sorted = [...students].sort((a, b) => b.stockPrice - a.stockPrice);
  const avg = Math.round(students.reduce((s, x) => s + x.stockPrice, 0) / (students.length || 1));

  return (
    <div>
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        <Stat icon={<Building2 size={18} />} label="상장 기업" value={`${students.length}개`} color="#6366f1" />
        <Stat icon={<BarChart3 size={18} />} label="평균 주가" value={`${avg.toLocaleString()}원`} color="#8b5cf6" />
        <Stat icon={<TrendingUp size={18} />} label="총 거래" value={`${txs.length}건`} color="#14b8a6" />
        <Stat icon={<Zap size={18} />} label="현재 주차" value={`${week}주차`} color="#f59e0b" />
      </div>

      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>📈 전체 주가 추이</h3>
        <div style={{ height: isMobile ? 160 : 200 }}>
          <ResponsiveContainer>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf4" />
              <XAxis dataKey="label" type="category" allowDuplicatedCategory={false} tick={{ fill: "#64748b", fontSize: isMobile ? 10 : 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: isMobile ? 10 : 11 }} width={isMobile ? 35 : 60} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#1e293b", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
              {students.map((s, i) => (
                <Line key={s.id} data={s.history} dataKey="price" name={s.company} stroke={colors[i % colors.length]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>🏢 전체 종목</h3>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(250px, 1fr))", gap: isMobile ? 10 : 12 }}>
        {sorted.map((s, i) => {
          const h = s.history;
          const prev = h.length > 1 ? h[h.length - 2].price : h[0].price;
          const ch = s.stockPrice - prev;
          const pct = prev > 0 ? ((ch / prev) * 100).toFixed(1) : 0;
          const up = ch >= 0;
          return (
            <Card key={s.id} onClick={() => onSel(s.id)} style={{ position: "relative", overflow: "hidden" }}>
              {i < 3 && <div style={{ position: "absolute", top: 8, right: 10, fontSize: 10, background: i === 0 ? "#fef3c7" : "#f1f5f9", color: i === 0 ? "#b45309" : "#64748b", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{["👑1위","🥈2위","🥉3위"][i]}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 28 }}>{s.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{s.company}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>CEO {s.name}</div>
                </div>
                {isMobile && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#1e293b" }}>{s.stockPrice.toLocaleString()}<span style={{ fontSize: 11, color: "#94a3b8" }}>원</span></div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: up ? "#16a34a" : "#dc2626" }}>
                      {up ? "+" : ""}{ch} ({pct}%)
                    </span>
                  </div>
                )}
              </div>
              {!isMobile && (
                <>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#1e293b" }}>{s.stockPrice.toLocaleString()}</span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>원</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: up ? "#16a34a" : "#dc2626", display: "flex", alignItems: "center", gap: 2 }}>
                      {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {up ? "+" : ""}{ch} ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: 40 }}>
                    <ResponsiveContainer>
                      <AreaChart data={h.slice(-8)}>
                        <defs><linearGradient id={`g${s.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={up ? "#16a34a" : "#dc2626"} stopOpacity={0.2} /><stop offset="100%" stopColor={up ? "#16a34a" : "#dc2626"} stopOpacity={0} /></linearGradient></defs>
                        <Area dataKey="price" stroke={up ? "#16a34a" : "#dc2626"} fill={`url(#g${s.id})`} strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
