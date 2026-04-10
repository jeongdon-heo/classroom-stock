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

  // ROI 계산
  const startPrice = h[0]?.price || 1000;
  const totalGrowth = s.stockPrice - startPrice;
  const roiPct = startPrice > 0 ? ((totalGrowth / startPrice) * 100).toFixed(1) : 0;

  // 포트폴리오 요약
  const totalInvested = s.portfolio.reduce((sum, p) => sum + p.ap * p.sh, 0);
  const totalCurrentVal = s.portfolio.reduce((sum, p) => {
    const co = students.find(x => x.id === p.cid);
    return sum + (co ? co.stockPrice * p.sh : 0);
  }, 0);
  const totalProfit = totalCurrentVal - totalInvested;
  const investROI = totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(1) : 0;

  // 나에게 투자한 사람
  const investorsInMe = students.filter(st => st.id !== s.id && st.portfolio.some(p => p.cid === s.id));

  return (
    <div>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 40 }}>{s.emoji}</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: "#e0e6ff" }}>{s.company}</h2>
          <div style={{ fontSize: 13, color: "#778", marginTop: 2 }}>CEO {s.name} · "{s.slogan}"</div>
        </div>
      </div>

      {/* 핵심 지표 */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          ["현재 주가", `${s.stockPrice.toLocaleString()}원`, up ? "#4cdf8b" : "#ff6b7a"],
          ["보유 현금", `${s.cash.toLocaleString()}원`, "#e8eaf6"],
          ["총 자산", `${(s.cash + pv).toLocaleString()}원`, "#b388ff"],
          ["누적 수익률", `${roiPct > 0 ? "+" : ""}${roiPct}%`, totalGrowth >= 0 ? "#4cdf8b" : "#ff6b7a"],
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: "rgba(100,130,255,0.08)", borderRadius: 10, padding: isMobile ? 10 : 12, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#778", marginBottom: 3 }}>{l}</div>
            <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* 주가 변동 & 수입 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 120, background: up ? "rgba(76,223,139,0.06)" : "rgba(255,107,122,0.06)", borderRadius: 8, padding: "8px 12px", border: `1px solid ${up ? "rgba(76,223,139,0.12)" : "rgba(255,107,122,0.12)"}` }}>
          <div style={{ fontSize: 10, color: up ? "#4cdf8b" : "#ff6b7a" }}>이번 주 변동</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: up ? "#4cdf8b" : "#ff6b7a" }}>{up ? "+" : ""}{ch}원 ({prev > 0 ? ((ch / prev) * 100).toFixed(1) : 0}%)</div>
        </div>
        {(s.lastSalary > 0 || s.lastBiz > 0) && (
          <>
            <div style={{ flex: 1, minWidth: 100, background: "rgba(255,171,64,0.08)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(255,171,64,0.12)" }}>
              <div style={{ fontSize: 10, color: "#ffab40" }}>CEO 급여</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#ffd740" }}>+{(s.lastSalary || 0).toLocaleString()}원</div>
            </div>
            <div style={{ flex: 1, minWidth: 100, background: "rgba(76,223,139,0.06)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(76,223,139,0.1)" }}>
              <div style={{ fontSize: 10, color: "#4cdf8b" }}>사업 수익</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#4cdf8b" }}>+{(s.lastBiz || 0).toLocaleString()}원</div>
            </div>
          </>
        )}
      </div>

      {/* 주가 차트 */}
      <div style={{ height: 130, marginBottom: 16 }}>
        <ResponsiveContainer>
          <AreaChart data={h}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,140,255,0.08)" />
            <XAxis dataKey="label" tick={{ fill: "#666", fontSize: 10 }} />
            <YAxis tick={{ fill: "#666", fontSize: 10 }} width={40} />
            <Tooltip contentStyle={{ background: "#1a2240", border: "1px solid rgba(120,140,255,0.2)", borderRadius: 8, color: "#ddd", fontSize: 12 }} />
            <defs><linearGradient id="det" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c9eff" stopOpacity={0.4} /><stop offset="100%" stopColor="#7c9eff" stopOpacity={0} /></linearGradient></defs>
            <Area dataKey="price" stroke="#7c9eff" fill="url(#det)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 나에게 투자한 사람 */}
      {investorsInMe.length > 0 && (
        <div style={{ background: "rgba(179,136,255,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, border: "1px solid rgba(179,136,255,0.12)" }}>
          <div style={{ fontSize: 12, color: "#b388ff", fontWeight: 600, marginBottom: 6 }}>💜 우리 회사 투자자 ({investorsInMe.length}명)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {investorsInMe.map(inv => {
              const holding = inv.portfolio.find(p => p.cid === s.id);
              return (
                <span key={inv.id} style={{ background: "rgba(179,136,255,0.1)", padding: "4px 10px", borderRadius: 8, fontSize: 12, color: "#ccd" }}>
                  {inv.emoji} {inv.name} <span style={{ color: "#b388ff" }}>{holding?.sh}주</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 포트폴리오 */}
      {s.portfolio.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h4 style={{ margin: 0, fontSize: 13, color: "#9cb8ff" }}>보유 주식</h4>
            <div style={{ fontSize: 11, color: totalProfit >= 0 ? "#4cdf8b" : "#ff6b7a" }}>
              투자 수익률: <span style={{ fontWeight: 700 }}>{investROI > 0 ? "+" : ""}{investROI}%</span>
            </div>
          </div>

          {/* 포트폴리오 요약 */}
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <div style={{ flex: 1, background: "rgba(100,130,255,0.06)", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#778" }}>투자 원금</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#9cb8ff" }}>{totalInvested.toLocaleString()}원</div>
            </div>
            <div style={{ flex: 1, background: "rgba(100,130,255,0.06)", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#778" }}>현재 가치</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e6ff" }}>{totalCurrentVal.toLocaleString()}원</div>
            </div>
            <div style={{ flex: 1, background: totalProfit >= 0 ? "rgba(76,223,139,0.06)" : "rgba(255,107,122,0.06)", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#778" }}>투자 손익</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: totalProfit >= 0 ? "#4cdf8b" : "#ff6b7a" }}>{totalProfit >= 0 ? "+" : ""}{totalProfit.toLocaleString()}원</div>
            </div>
          </div>

          {s.portfolio.map(p => {
            const c = students.find(x => x.id === p.cid);
            if (!c) return null;
            const profit = (c.stockPrice - p.ap) * p.sh;
            const profitPct = p.ap > 0 ? (((c.stockPrice - p.ap) / p.ap) * 100).toFixed(1) : 0;
            return (
              <div key={p.cid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(100,130,255,0.05)", borderRadius: 8, marginBottom: 4 }}>
                <div>
                  <span>{c.emoji} {c.company}</span>
                  <span style={{ color: "#778", fontSize: 12, marginLeft: 6 }}>x{p.sh}주</span>
                  <span style={{ color: "#556", fontSize: 11, marginLeft: 6 }}>(@{p.ap.toLocaleString()}원)</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: profit >= 0 ? "#4cdf8b" : "#ff6b7a", fontSize: 13, fontWeight: 600 }}>{profit >= 0 ? "+" : ""}{profit.toLocaleString()}원</span>
                  <span style={{ color: "#778", fontSize: 11, marginLeft: 4 }}>({profitPct > 0 ? "+" : ""}{profitPct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 거래 내역 */}
      {myTx.length > 0 && (
        <div>
          <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#9cb8ff" }}>최근 거래</h4>
          {myTx.map(t => {
            const isBuyer = t.bid === s.id;
            return (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "6px 0", borderBottom: "1px solid rgba(120,140,255,0.05)" }}>
                <div style={{ color: "#aab" }}>
                  <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: t.type === "buy" ? "rgba(76,223,139,0.1)" : "rgba(255,107,122,0.1)", color: t.type === "buy" ? "#4cdf8b" : "#ff6b7a", marginRight: 4 }}>{t.type === "buy" ? "매수" : "매도"}</span>
                  {isBuyer ? <span>{s.name}→<span style={{ color: "#9cb8ff" }}>{t.cn}</span></span> : <span><span style={{ color: "#9cb8ff" }}>{t.bn}</span>→{s.company}</span>}
                </div>
                <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <span style={{ fontWeight: 600 }}>{t.sh}주 × {t.price.toLocaleString()}원</span>
                  <div style={{ fontSize: 9, color: "#556" }}>{t.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
