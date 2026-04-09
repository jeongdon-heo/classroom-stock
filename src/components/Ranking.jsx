import { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useApp } from "../context/AppContext";
import Card from "./Card";

export default function Ranking() {
  const { students, portfolioVal } = useApp();
  const [mode, setMode] = useState("stock");
  const getVal = (s) => mode === "stock" ? s.stockPrice : s.cash + portfolioVal(s.portfolio, students);
  const sorted = [...students].sort((a, b) => getVal(b) - getVal(a));
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["stock", "📈 주가 순위"], ["assets", "💰 총자산 순위"]].map(([m, l]) => (
          <button key={m} onClick={() => setMode(m)} style={{ padding: "10px 20px", background: mode === m ? "rgba(100,130,255,0.15)" : "rgba(100,130,255,0.04)", border: `1px solid ${mode === m ? "rgba(120,160,255,0.3)" : "rgba(120,140,255,0.1)"}`, borderRadius: 10, color: mode === m ? "#9cb8ff" : "#778", cursor: "pointer", fontSize: 14, fontWeight: mode === m ? 600 : 400 }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 12, marginBottom: 24, alignItems: "end" }}>
        {[sorted[1], sorted[0], sorted[2]].map((s, i) => {
          if (!s) return <div key={i} />;
          const rk = i === 1 ? 0 : i === 0 ? 1 : 2;
          const hs = [130, 170, 110];
          return (
            <Card key={s.id} style={{ textAlign: "center", minHeight: hs[i], display: "flex", flexDirection: "column", justifyContent: "center", background: rk === 0 ? "linear-gradient(160deg, rgba(255,215,0,0.08), rgba(255,180,0,0.04))" : undefined, borderColor: rk === 0 ? "rgba(255,215,0,0.2)" : undefined }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>{medals[rk]}</div>
              <div style={{ fontSize: 30, marginBottom: 6 }}>{s.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#e0e6ff" }}>{s.company}</div>
              <div style={{ fontSize: 11, color: "#778", marginBottom: 8 }}>{s.name}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: rk === 0 ? "#ffd740" : "#9cb8ff" }}>{getVal(s).toLocaleString()}원</div>
            </Card>
          );
        })}
      </div>

      {sorted.slice(3).map((s, i) => (
        <Card key={s.id} style={{ marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#556", width: 26 }}>{i + 4}</span>
            <span style={{ fontSize: 22 }}>{s.emoji}</span>
            <div><div style={{ fontWeight: 600, fontSize: 13, color: "#ccd" }}>{s.company}</div><div style={{ fontSize: 11, color: "#556" }}>{s.name}</div></div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{getVal(s).toLocaleString()}원</div>
        </Card>
      ))}

      <Card style={{ marginTop: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>📊 비교 차트</h3>
        <div style={{ height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={sorted.map(s => ({ name: s.name, value: getVal(s) }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,140,255,0.08)" />
              <XAxis type="number" tick={{ fill: "#666", fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#aab", fontSize: 12 }} width={48} />
              <Tooltip contentStyle={{ background: "#1a2240", border: "1px solid rgba(120,140,255,0.2)", borderRadius: 8, color: "#ddd", fontSize: 12 }} />
              <Bar dataKey="value" fill="#7c9eff" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
