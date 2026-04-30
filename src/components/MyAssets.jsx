import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Briefcase, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import Card from "./Card";

export default function MyAssets() {
  const { students, txs, myId, isMobile, portfolioVal } = useApp();
  const me = myId != null ? students.find(s => s.id === myId) : null;
  const [filter, setFilter] = useState("all");

  if (!me) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "32px 12px", color: "#64748b" }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🔒</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>로그인이 필요합니다</div>
          <div style={{ fontSize: 12 }}>학생 계정으로 로그인하면 내 자산과 거래 내역을 볼 수 있어요.</div>
        </div>
      </Card>
    );
  }

  const pv = portfolioVal(me.portfolio, students);
  const totalAsset = me.cash + pv;
  const h = me.history || [];
  const prev = h.length > 1 ? h[h.length - 2].price : (h[0]?.price || me.stockPrice);
  const priceChange = me.stockPrice - prev;
  const pricePct = prev > 0 ? ((priceChange / prev) * 100).toFixed(1) : 0;
  const up = priceChange >= 0;

  const totalInvested = me.portfolio.reduce((sum, p) => sum + p.ap * p.sh, 0);
  const totalProfit = pv - totalInvested;
  const investROI = totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(1) : 0;

  const myTxs = txs.filter(t => t.bid === me.id);
  const filteredTxs = filter === "all" ? myTxs : myTxs.filter(t => t.type === filter);
  const buyCount = myTxs.filter(t => t.type === "buy").length;
  const sellCount = myTxs.filter(t => t.type === "sell").length;

  return (
    <div>
      <Card style={{ marginBottom: 14, background: "linear-gradient(135deg, #eef2ff, #faf5ff)", borderColor: "#c7d2fe" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 36 }}>{me.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1e293b" }}>{me.name}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{me.company}{me.slogan ? ` · "${me.slogan}"` : ""}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#64748b" }}>우리 회사 주가</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{me.stockPrice.toLocaleString()}원</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: up ? "#16a34a" : "#dc2626", display: "flex", alignItems: "center", gap: 1 }}>
                {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {up ? "+" : ""}{priceChange} ({pricePct}%)
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 8 }}>
          <SummaryBox label="보유 현금" value={me.cash} color="#1e293b" bg="#fff" />
          <SummaryBox label="주식 평가액" value={pv} color="#7c3aed" bg="#fff" />
          <SummaryBox label="총 자산" value={totalAsset} color="#4f46e5" bg="#eef2ff" highlight />
        </div>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#4f46e5", display: "flex", alignItems: "center", gap: 6 }}>
            <Briefcase size={16} /> 보유 주식 ({me.portfolio.length}개)
          </h3>
          {me.portfolio.length > 0 && (
            <div style={{ fontSize: 11, color: totalProfit >= 0 ? "#16a34a" : "#dc2626" }}>
              투자 수익률 <span style={{ fontWeight: 700 }}>{investROI > 0 ? "+" : ""}{investROI}%</span>
            </div>
          )}
        </div>

        {me.portfolio.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 12px", color: "#94a3b8", fontSize: 13 }}>
            아직 보유한 주식이 없어요. 거래소 탭에서 매수해보세요!
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {[
                ["투자 원금", totalInvested, "#4f46e5", "#eef2ff"],
                ["현재 가치", pv, "#1e293b", "#f8fafc"],
                ["투자 손익", totalProfit, totalProfit >= 0 ? "#16a34a" : "#dc2626", totalProfit >= 0 ? "#f0fdf4" : "#fef2f2"],
              ].map(([label, val, color, bg]) => (
                <div key={label} style={{ flex: 1, background: bg, borderRadius: 8, padding: "8px 10px", textAlign: "center", border: "1px solid #e8ecf4" }}>
                  <div style={{ fontSize: 10, color: "#64748b", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700, color }}>
                    {label === "투자 손익" && val >= 0 ? "+" : ""}{val.toLocaleString()}원
                  </div>
                </div>
              ))}
            </div>

            <div>
              {me.portfolio.map(p => {
                const c = students.find(x => x.id === p.cid);
                if (!c) return null;
                const profit = (c.stockPrice - p.ap) * p.sh;
                const profitPct = p.ap > 0 ? (((c.stockPrice - p.ap) / p.ap) * 100).toFixed(1) : 0;
                const curVal = c.stockPrice * p.sh;
                return (
                  <div key={p.cid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#f8fafc", borderRadius: 8, marginBottom: 6, border: "1px solid #f1f5f9" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                        {c.emoji} {c.company} <span style={{ color: "#64748b", fontSize: 12, fontWeight: 400 }}>x{p.sh}주</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        평균 매입가 {p.ap.toLocaleString()}원 · 현재 {c.stockPrice.toLocaleString()}원
                      </div>
                    </div>
                    <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{curVal.toLocaleString()}원</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: profit >= 0 ? "#16a34a" : "#dc2626" }}>
                        {profit >= 0 ? "+" : ""}{profit.toLocaleString()} ({profitPct > 0 ? "+" : ""}{profitPct}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#4f46e5", display: "flex", alignItems: "center", gap: 6 }}>
            <Wallet size={16} /> 내 거래 내역 ({myTxs.length}건)
          </h3>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              ["all", `전체 ${myTxs.length}`],
              ["buy", `매수 ${buyCount}`],
              ["sell", `매도 ${sellCount}`],
            ].map(([k, label]) => (
              <button key={k} onClick={() => setFilter(k)} style={{
                padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer",
                background: filter === k ? "#eef2ff" : "#f8fafc",
                border: `1px solid ${filter === k ? "#c7d2fe" : "#e2e8f0"}`,
                color: filter === k ? "#4f46e5" : "#64748b",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {filteredTxs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 12px", color: "#94a3b8", fontSize: 13 }}>
            거래 내역이 없습니다.
          </div>
        ) : (
          <div style={{ maxHeight: isMobile ? 360 : 480, overflow: "auto" }}>
            {filteredTxs.map(t => {
              const isBuy = t.type === "buy";
              return (
                <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px", borderBottom: "1px solid #f1f5f9", fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: isBuy ? "#f0fdf4" : "#fef2f2", color: isBuy ? "#16a34a" : "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {isBuy ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ color: "#1e293b", fontWeight: 600 }}>
                        <span style={{ color: isBuy ? "#16a34a" : "#dc2626" }}>{isBuy ? "매수" : "매도"}</span> · {t.cn}
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{t.date} · {t.wk}주차</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 700, color: isBuy ? "#dc2626" : "#16a34a" }}>
                      {isBuy ? "-" : "+"}{(t.sh * t.price).toLocaleString()}원
                    </div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{t.sh}주 × {t.price.toLocaleString()}원</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function SummaryBox({ label, value, color, bg, highlight }) {
  return (
    <div style={{ background: bg, borderRadius: 10, padding: "10px 12px", textAlign: "center", border: `1px solid ${highlight ? "#c7d2fe" : "#e8ecf4"}` }}>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: highlight ? 18 : 16, fontWeight: 800, color }}>{value.toLocaleString()}원</div>
    </div>
  );
}
