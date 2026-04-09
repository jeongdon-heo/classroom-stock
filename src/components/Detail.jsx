import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useApp } from "../context/AppContext";

export default function Detail({ s }) {
  const { students, txs, portfolioVal } = useApp();
  if (!s) return null;
  const h = s.history;
  const prev = h.length > 1 ? h[h.length - 2].price : h[0].price;
  const ch = s.stockPrice - prev;
  const up = ch >= 0;
  const pv = portfolioVal(s.portfolio, students);
  const myTx = txs.filter(t => t.cid === s.id || t.bid === s.id).slice(0, 10);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 40 }}>{s.emoji}</div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: "#e0e6ff" }}>{s.company}</h2>
          <div style={{ fontSize: 13, color: "#778", marginTop: 2 }}>CEO {s.name} · "{s.slogan}"</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
        {[["현재 주가", `${s.stockPrice.toLocaleString()}원`, up ? "#4cdf8b" : "#ff6b7a"],
          ["보유 현금", `${s.cash.toLocaleString()}원`, "#e8eaf6"],
          ["총 자산", `${(s.cash + pv).toLocaleString()}원`, "#b388ff"]].map(([l, v, c]) => (
          <div key={l} style={{ background: "rgba(100,130,255,0.08)", borderRadius: 10, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#778", marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      {(s.lastSalary > 0 || s.lastBiz > 0) && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <div style={{ flex: 1, background: "rgba(255,171,64,0.08)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(255,171,64,0.12)" }}>
            <div style={{ fontSize: 10, color: "#ffab40" }}>지난 주 CEO 급여</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#ffd740" }}>+{(s.lastSalary || 0).toLocaleString()}원</div>
          </div>
          <div style={{ flex: 1, background: "rgba(76,223,139,0.06)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(76,223,139,0.1)" }}>
            <div style={{ fontSize: 10, color: "#4cdf8b" }}>지난 주 사업 수익</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#4cdf8b" }}>+{(s.lastBiz || 0).toLocaleString()}원</div>
          </div>
        </div>
      )}
      <div style={{ height: 150, marginBottom: 20 }}>
        <ResponsiveContainer>
          <AreaChart data={h}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,140,255,0.08)" />
            <XAxis dataKey="label" tick={{ fill: "#666", fontSize: 10 }} />
            <YAxis tick={{ fill: "#666", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#1a2240", border: "1px solid rgba(120,140,255,0.2)", borderRadius: 8, color: "#ddd", fontSize: 12 }} />
            <defs><linearGradient id="det" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c9eff" stopOpacity={0.4} /><stop offset="100%" stopColor="#7c9eff" stopOpacity={0} /></linearGradient></defs>
            <Area dataKey="price" stroke="#7c9eff" fill="url(#det)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {s.portfolio.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#9cb8ff" }}>보유 주식</h4>
          {s.portfolio.map(p => {
            const c = students.find(x => x.id === p.cid);
            if (!c) return null;
            const profit = (c.stockPrice - p.ap) * p.sh;
            return (
              <div key={p.cid} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(100,130,255,0.05)", borderRadius: 8, marginBottom: 4 }}>
                <div>{c.emoji} {c.company} <span style={{ color: "#778", fontSize: 12 }}>x{p.sh}주</span></div>
                <div style={{ color: profit >= 0 ? "#4cdf8b" : "#ff6b7a", fontSize: 13, fontWeight: 600 }}>{profit >= 0 ? "+" : ""}{profit.toLocaleString()}원</div>
              </div>
            );
          })}
        </div>
      )}
      {myTx.length > 0 && (
        <div>
          <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#9cb8ff" }}>최근 거래</h4>
          {myTx.map(t => (
            <div key={t.id} style={{ fontSize: 12, padding: "6px 0", borderBottom: "1px solid rgba(120,140,255,0.05)", color: "#aab" }}>
              <span style={{ color: t.type === "buy" ? "#4cdf8b" : "#ff6b7a", fontWeight: 600 }}>{t.type === "buy" ? "매수" : "매도"}</span> {t.bn}→{t.cn} {t.sh}주 @{t.price.toLocaleString()}원
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
