import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useApp } from "../context/AppContext";

export default function Detail({ s }) {
  const { students, txs, portfolioVal, isMobile } = useApp();
  if (!s) return null;
  const h = s.history;
  const prev = h.length > 1 ? h[h.length - 2].price : h[0].price;
  const ch = s.stockPrice - prev;
  const up = ch >= 0;
  const pv = portfolioVal(s.portfolio, students);
  const myTx = txs.filter(t => t.cid === s.id || t.bid === s.id).slice(0, 15);

  const startPrice = h[0]?.price || 1000;
  const totalGrowth = s.stockPrice - startPrice;
  const roiPct = startPrice > 0 ? ((totalGrowth / startPrice) * 100).toFixed(1) : 0;

  const totalInvested = s.portfolio.reduce((sum, p) => sum + p.ap * p.sh, 0);
  const totalCurrentVal = s.portfolio.reduce((sum, p) => {
    const co = students.find(x => x.id === p.cid);
    return sum + (co ? co.stockPrice * p.sh : 0);
  }, 0);
  const totalProfit = totalCurrentVal - totalInvested;
  const investROI = totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(1) : 0;

  const investorsInMe = students.filter(st => st.id !== s.id && st.portfolio.some(p => p.cid === s.id));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 40 }}>{s.emoji}</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: "#1e293b" }}>{s.company}</h2>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>CEO {s.name} · "{s.slogan}"</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          ["현재 주가", `${s.stockPrice.toLocaleString()}원`, up ? "#16a34a" : "#dc2626"],
          ["보유 현금", `${s.cash.toLocaleString()}원`, "#1e293b"],
          ["총 자산", `${(s.cash + pv).toLocaleString()}원`, "#7c3aed"],
          ["누적 수익률", `${roiPct > 0 ? "+" : ""}${roiPct}%`, totalGrowth >= 0 ? "#16a34a" : "#dc2626"],
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: "#f8fafc", borderRadius: 10, padding: isMobile ? 10 : 12, textAlign: "center", border: "1px solid #e8ecf4" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 3 }}>{l}</div>
            <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 120, background: up ? "#f0fdf4" : "#fef2f2", borderRadius: 8, padding: "8px 12px", border: `1px solid ${up ? "#bbf7d0" : "#fecaca"}` }}>
          <div style={{ fontSize: 10, color: up ? "#16a34a" : "#dc2626" }}>이번 주 변동</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: up ? "#16a34a" : "#dc2626" }}>{up ? "+" : ""}{ch}원 ({prev > 0 ? ((ch / prev) * 100).toFixed(1) : 0}%)</div>
        </div>
        {(s.lastSalary > 0 || s.lastBiz > 0 || s.lastDividend > 0) && (
          <>
            <div style={{ flex: 1, minWidth: 100, background: "#fffbeb", borderRadius: 8, padding: "8px 12px", border: "1px solid #fde68a" }}>
              <div style={{ fontSize: 10, color: "#b45309" }}>CEO 급여</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#b45309" }}>+{(s.lastSalary || 0).toLocaleString()}원</div>
            </div>
            <div style={{ flex: 1, minWidth: 100, background: "#f0fdf4", borderRadius: 8, padding: "8px 12px", border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: 10, color: "#16a34a" }}>사업 수익</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#16a34a" }}>+{(s.lastBiz || 0).toLocaleString()}원</div>
            </div>
            <div style={{ flex: 1, minWidth: 100, background: "#faf5ff", borderRadius: 8, padding: "8px 12px", border: "1px solid #e9d5ff" }}>
              <div style={{ fontSize: 10, color: "#7c3aed" }}>주주 배당</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#7c3aed" }}>+{(s.lastDividend || 0).toLocaleString()}원</div>
            </div>
          </>
        )}
      </div>

      <div style={{ height: 130, marginBottom: 16 }}>
        <ResponsiveContainer>
          <AreaChart data={h}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf4" />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} width={40} />
            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#1e293b", fontSize: 12 }} />
            <defs><linearGradient id="det" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
            <Area dataKey="price" stroke="#6366f1" fill="url(#det)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {investorsInMe.length > 0 && (
        <div style={{ background: "#faf5ff", borderRadius: 10, padding: "10px 14px", marginBottom: 16, border: "1px solid #e9d5ff" }}>
          <div style={{ fontSize: 12, color: "#7c3aed", fontWeight: 600, marginBottom: 6 }}>💜 우리 회사 투자자 ({investorsInMe.length}명)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {investorsInMe.map(inv => {
              const holding = inv.portfolio.find(p => p.cid === s.id);
              return (
                <span key={inv.id} style={{ background: "#ede9fe", padding: "4px 10px", borderRadius: 8, fontSize: 12, color: "#1e293b" }}>
                  {inv.emoji} {inv.name} <span style={{ color: "#7c3aed" }}>{holding?.sh}주</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {s.portfolio.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h4 style={{ margin: 0, fontSize: 13, color: "#4f46e5" }}>보유 주식</h4>
            <div style={{ fontSize: 11, color: totalProfit >= 0 ? "#16a34a" : "#dc2626" }}>
              투자 수익률: <span style={{ fontWeight: 700 }}>{investROI > 0 ? "+" : ""}{investROI}%</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {[
              ["투자 원금", totalInvested, "#4f46e5", "#eef2ff"],
              ["현재 가치", totalCurrentVal, "#1e293b", "#f8fafc"],
              ["투자 손익", totalProfit, totalProfit >= 0 ? "#16a34a" : "#dc2626", totalProfit >= 0 ? "#f0fdf4" : "#fef2f2"],
            ].map(([label, val, color, bg]) => (
              <div key={label} style={{ flex: 1, background: bg, borderRadius: 8, padding: "6px 10px", textAlign: "center", border: "1px solid #e8ecf4" }}>
                <div style={{ fontSize: 9, color: "#64748b" }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color }}>{(label === "투자 손익" && val >= 0 ? "+" : "")}{val.toLocaleString()}원</div>
              </div>
            ))}
          </div>
          {s.portfolio.map(p => {
            const c = students.find(x => x.id === p.cid);
            if (!c) return null;
            const profit = (c.stockPrice - p.ap) * p.sh;
            const profitPct = p.ap > 0 ? (((c.stockPrice - p.ap) / p.ap) * 100).toFixed(1) : 0;
            return (
              <div key={p.cid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f8fafc", borderRadius: 8, marginBottom: 4, border: "1px solid #f1f5f9" }}>
                <div>
                  <span>{c.emoji} {c.company}</span>
                  <span style={{ color: "#64748b", fontSize: 12, marginLeft: 6 }}>x{p.sh}주</span>
                  <span style={{ color: "#94a3b8", fontSize: 11, marginLeft: 6 }}>(@{p.ap.toLocaleString()}원)</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: profit >= 0 ? "#16a34a" : "#dc2626", fontSize: 13, fontWeight: 600 }}>{profit >= 0 ? "+" : ""}{profit.toLocaleString()}원</span>
                  <span style={{ color: "#64748b", fontSize: 11, marginLeft: 4 }}>({profitPct > 0 ? "+" : ""}{profitPct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {myTx.length > 0 && (
        <div>
          <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#4f46e5" }}>최근 거래</h4>
          {myTx.map(t => {
            const isBuyer = t.bid === s.id;
            return (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ color: "#475569" }}>
                  <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: t.type === "buy" ? "#f0fdf4" : "#fef2f2", color: t.type === "buy" ? "#16a34a" : "#dc2626", marginRight: 4 }}>{t.type === "buy" ? "매수" : "매도"}</span>
                  {isBuyer ? <span>{s.name}→<span style={{ color: "#6366f1" }}>{t.cn}</span></span> : <span><span style={{ color: "#6366f1" }}>{t.bn}</span>→{s.company}</span>}
                </div>
                <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>{t.sh}주 × {t.price.toLocaleString()}원</span>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>{t.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
