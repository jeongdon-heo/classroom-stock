import { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useApp } from "../context/AppContext";
import Card from "./Card";

export default function Ranking() {
  const { students, portfolioVal, isMobile } = useApp();
  const [mode, setMode] = useState("stock");
  const getVal = (s) => mode === "stock" ? s.stockPrice : s.cash + portfolioVal(s.portfolio, students);
  const sorted = [...students].sort((a, b) => getVal(b) - getVal(a));
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["stock", "📈 주가 순위"], ["assets", "💰 총자산 순위"]].map(([m, l]) => (
          <button key={m} onClick={() => setMode(m)} style={{ padding: isMobile ? "8px 14px" : "10px 20px", background: mode === m ? "#eef2ff" : "#f8fafc", border: `1px solid ${mode === m ? "#a5b4fc" : "#e2e8f0"}`, borderRadius: 10, color: mode === m ? "#4f46e5" : "#94a3b8", cursor: "pointer", fontSize: isMobile ? 13 : 14, fontWeight: mode === m ? 600 : 400 }}>{l}</button>
        ))}
      </div>

      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {sorted.slice(0, 3).map((s, i) => (
            <Card key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: i === 0 ? "linear-gradient(135deg, #fffbeb, #fef3c7)" : "#fff", borderColor: i === 0 ? "#fcd34d" : undefined }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 22 }}>{medals[i]}</div>
                <div style={{ fontSize: 28 }}>{s.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{s.company}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.name}</div>
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: i === 0 ? "#b45309" : "#4f46e5" }}>{getVal(s).toLocaleString()}원</div>
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 12, marginBottom: 24, alignItems: "end" }}>
          {[sorted[1], sorted[0], sorted[2]].map((s, i) => {
            if (!s) return <div key={i} />;
            const rk = i === 1 ? 0 : i === 0 ? 1 : 2;
            const hs = [130, 170, 110];
            return (
              <Card key={s.id} style={{ textAlign: "center", minHeight: hs[i], display: "flex", flexDirection: "column", justifyContent: "center", background: rk === 0 ? "linear-gradient(160deg, #fffbeb, #fef3c7)" : "#fff", borderColor: rk === 0 ? "#fcd34d" : undefined }}>
                <div style={{ fontSize: 26, marginBottom: 4 }}>{medals[rk]}</div>
                <div style={{ fontSize: 30, marginBottom: 6 }}>{s.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{s.company}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>{s.name}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: rk === 0 ? "#b45309" : "#4f46e5" }}>{getVal(s).toLocaleString()}원</div>
              </Card>
            );
          })}
        </div>
      )}

      {sorted.slice(3).map((s, i) => (
        <Card key={s.id} style={{ marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "10px 12px" : "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", width: 26 }}>{i + 4}</span>
            <span style={{ fontSize: 22 }}>{s.emoji}</span>
            <div><div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{s.company}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{s.name}</div></div>
          </div>
          <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "#1e293b" }}>{getVal(s).toLocaleString()}원</div>
        </Card>
      ))}

      <Card style={{ marginTop: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>📊 비교 차트</h3>
        <div style={{ height: isMobile ? 200 : 240 }}>
          <ResponsiveContainer>
            <BarChart data={sorted.map(s => ({ name: s.name, value: getVal(s) }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf4" />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#475569", fontSize: isMobile ? 11 : 12 }} width={isMobile ? 40 : 48} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#1e293b", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
