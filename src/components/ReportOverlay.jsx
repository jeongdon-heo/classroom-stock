import { Printer, FileText } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ReportOverlay({ onClose }) {
  const { students, week, portfolioVal, txs } = useApp();
  const reportWeek = Math.max(1, week - 1);
  const sorted = [...students].sort((a, b) => b.stockPrice - a.stockPrice);
  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  const handlePrint = () => { window.print(); };

  const thS = { padding: "10px 12px", borderBottom: "2px solid #2E75B6", fontSize: 13, fontWeight: 700, textAlign: "left", color: "#2E75B6", background: "#f0f5ff" };
  const tdS = { padding: "10px 12px", borderBottom: "1px solid #e0e0e0", fontSize: 13 };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#fff", overflow: "auto" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .report-card { page-break-after: always; break-after: page; }
          .report-card:last-child { page-break-after: auto; break-after: auto; }
          body, html { margin: 0; padding: 0; }
          @page { size: A4; margin: 12mm; }
        }
        @media screen {
          .report-card { box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        }
      `}</style>

      <div className="no-print" style={{ position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(135deg, #1a237e, #283593)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FileText size={20} color="#fff" />
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>주간 보고서 미리보기</span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{reportWeek}주차 · {students.length}명</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 24px", background: "#fff", border: "none", borderRadius: 8, color: "#1a237e", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            <Printer size={16} /> 인쇄하기
          </button>
          <button onClick={onClose} style={{ padding: "10px 16px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 14 }}>닫기</button>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px", fontFamily: "'Noto Sans KR', sans-serif", color: "#222" }}>
        {students.map((s, idx) => {
          const h = s.history;
          const prev = h.length > 1 ? h[h.length - 2].price : h[0].price;
          const ch = s.stockPrice - prev;
          const chPct = prev > 0 ? ((ch / prev) * 100).toFixed(1) : 0;
          const pv = portfolioVal(s.portfolio, students);
          const totalAssets = s.cash + pv;
          const rank = sorted.findIndex(x => x.id === s.id) + 1;
          const assetSorted = [...students].sort((a, b) => (b.cash + portfolioVal(b.portfolio, students)) - (a.cash + portfolioVal(a.portfolio, students)));
          const assetRank = assetSorted.findIndex(x => x.id === s.id) + 1;
          const myTxs = txs.filter(t => t.bid === s.id).slice(0, 6);
          const startPrice = h[0]?.price || 1000;
          const totalGrowth = s.stockPrice - startPrice;
          const totalGrowthPct = startPrice > 0 ? ((totalGrowth / startPrice) * 100).toFixed(1) : 0;
          const chartData = h.slice(-10);
          const investorsInMe = students.filter(st => st.id !== s.id && st.portfolio.some(p => p.cid === s.id));

          return (
            <div key={s.id} className="report-card" style={{ border: "2px solid #2E75B6", borderRadius: 14, padding: 28, marginBottom: 32, background: "#fff", minHeight: 920, display: "flex", flexDirection: "column" }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "3px solid #2E75B6", paddingBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: 52, lineHeight: 1 }}>{s.emoji}</div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#1a237e", letterSpacing: -0.5 }}>{s.company}</div>
                    <div style={{ fontSize: 15, color: "#666", marginTop: 4 }}>CEO <b>{s.name}</b></div>
                    <div style={{ fontSize: 13, color: "#999", marginTop: 2, fontStyle: "italic" }}>"{s.slogan}"</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", background: "#f0f5ff", borderRadius: 10, padding: "12px 18px", border: "1px solid #dce8ff" }}>
                  <div style={{ fontSize: 11, color: "#888" }}>4학년 2반 주식회사</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#2E75B6" }}>{reportWeek}주차</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{today}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <div style={{ flex: 1, background: rank <= 3 ? "#fffbf0" : "#f0f5ff", borderRadius: 10, padding: "14px 12px", textAlign: "center", border: `1px solid ${rank <= 3 ? "#ffe0b2" : "#e0e8ff"}` }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>주가 순위</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: rank <= 3 ? "#f57c00" : "#1a237e" }}>{rank <= 3 ? ["🥇 1위","🥈 2위","🥉 3위"][rank-1] : `${rank}위`}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>{students.length}명 중</div>
                </div>
                <div style={{ flex: 1, background: assetRank <= 3 ? "#faf0ff" : "#f5f0ff", borderRadius: 10, padding: "14px 12px", textAlign: "center", border: `1px solid ${assetRank <= 3 ? "#e0c8ff" : "#e8e0ff"}` }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>자산 순위</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: assetRank <= 3 ? "#f57c00" : "#4a148c" }}>{assetRank <= 3 ? ["🥇 1위","🥈 2위","🥉 3위"][assetRank-1] : `${assetRank}위`}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>{students.length}명 중</div>
                </div>
                <div style={{ flex: 1.2, background: "#f8faff", borderRadius: 10, padding: "14px 12px", textAlign: "center", border: "1px solid #e8f0fe" }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>우리 회사 투자자</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#2E75B6" }}>{investorsInMe.length}명</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>{investorsInMe.length > 0 ? investorsInMe.map(x => x.name).join(", ") : "아직 없음"}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, flex: 1 }}>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: "#f8faff", borderRadius: 12, padding: 18, border: "1px solid #e8f0fe" }}>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 6, fontWeight: 600 }}>📈 현재 주가</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 36, fontWeight: 900, color: "#1a237e" }}>{s.stockPrice.toLocaleString()}</span>
                      <span style={{ fontSize: 16, color: "#888" }}>원</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: ch >= 0 ? "#2e7d32" : "#c62828", background: ch >= 0 ? "#e8f5e9" : "#ffebee", padding: "3px 10px", borderRadius: 6 }}>
                        {ch >= 0 ? "▲" : "▼"} {Math.abs(ch)}원 ({ch >= 0 ? "+" : ""}{chPct}%)
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 10, borderTop: "1px solid #e8f0fe", paddingTop: 8 }}>
                      📊 누적 성장: <b>{startPrice.toLocaleString()}원</b> → <b>{s.stockPrice.toLocaleString()}원</b>
                      <span style={{ marginLeft: 6, fontWeight: 700, color: totalGrowth >= 0 ? "#2e7d32" : "#c62828" }}>({totalGrowthPct > 0 ? "+" : ""}{totalGrowthPct}%)</span>
                    </div>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr><th style={thS}>항목</th><th style={{ ...thS, textAlign: "right" }}>금액</th></tr></thead>
                    <tbody>
                      <tr><td style={tdS}>💵 보유 현금</td><td style={{ ...tdS, textAlign: "right", fontWeight: 700 }}>{s.cash.toLocaleString()}원</td></tr>
                      <tr><td style={tdS}>📊 보유 주식 가치</td><td style={{ ...tdS, textAlign: "right", fontWeight: 700 }}>{pv.toLocaleString()}원</td></tr>
                      <tr style={{ background: "#f0f5ff" }}><td style={{ ...tdS, fontWeight: 800, color: "#1a237e", fontSize: 15 }}>💰 총 자산</td><td style={{ ...tdS, textAlign: "right", fontWeight: 900, color: "#1a237e", fontSize: 18 }}>{totalAssets.toLocaleString()}원</td></tr>
                    </tbody>
                  </table>

                  <div style={{ background: "#fffbf0", borderRadius: 10, padding: 16, border: "1px solid #ffe0b2" }}>
                    <div style={{ fontWeight: 800, marginBottom: 8, color: "#e65100", fontSize: 14 }}>💰 이번 주 CEO 수익</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span>CEO 급여 (주가의 10%)</span><span style={{ fontWeight: 800, color: "#2e7d32" }}>+{(s.lastSalary || 0).toLocaleString()}원</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span>사업 수익 (미션 성과)</span><span style={{ fontWeight: 800, color: "#2e7d32" }}>+{(s.lastBiz || 0).toLocaleString()}원</span></div>
                    <div style={{ borderTop: "1px solid #ffe0b2", paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span style={{ fontWeight: 800, color: "#e65100" }}>수익 합계</span>
                      <span style={{ fontWeight: 900, color: "#e65100", fontSize: 16 }}>+{((s.lastSalary || 0) + (s.lastBiz || 0)).toLocaleString()}원</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: "#fafbff", borderRadius: 12, padding: 16, border: "1px solid #e8f0fe" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 10 }}>📊 주가 추이</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100 }}>
                      {chartData.map((d, i) => {
                        const maxP = Math.max(...chartData.map(x => x.price));
                        const minP = Math.min(...chartData.map(x => x.price));
                        const range = maxP - minP || 1;
                        const barH = Math.max(8, ((d.price - minP) / range) * 80);
                        const isLast = i === chartData.length - 1;
                        return (
                          <div key={i} style={{ flex: 1, textAlign: "center" }}>
                            <div style={{ fontSize: 9, color: isLast ? "#1a237e" : "#bbb", fontWeight: isLast ? 800 : 400, marginBottom: 3 }}>{d.price.toLocaleString()}</div>
                            <div style={{ height: barH, background: isLast ? "linear-gradient(180deg, #2E75B6, #5a9fd4)" : "#d0dff5", borderRadius: "4px 4px 0 0", transition: "height 0.3s" }} />
                            <div style={{ fontSize: 10, color: "#888", marginTop: 4, fontWeight: isLast ? 700 : 400 }}>{d.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ background: "#f8faf8", borderRadius: 10, padding: 14, border: "1px solid #e0f0e0", flex: s.portfolio.length > 0 ? undefined : 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 8 }}>🏦 내가 투자한 회사</div>
                    {s.portfolio.length === 0 ? (
                      <div style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: 12 }}>아직 투자한 회사가 없습니다</div>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr>
                          <th style={{ ...thS, background: "#e8f5e9", color: "#2e7d32", fontSize: 11, padding: "6px 8px" }}>회사</th>
                          <th style={{ ...thS, background: "#e8f5e9", color: "#2e7d32", fontSize: 11, padding: "6px 8px", textAlign: "center" }}>보유</th>
                          <th style={{ ...thS, background: "#e8f5e9", color: "#2e7d32", fontSize: 11, padding: "6px 8px", textAlign: "right" }}>손익</th>
                        </tr></thead>
                        <tbody>
                          {s.portfolio.map(po => {
                            const co = students.find(x => x.id === po.cid);
                            if (!co) return null;
                            const profit = (co.stockPrice - po.ap) * po.sh;
                            return (
                              <tr key={po.cid}>
                                <td style={{ ...tdS, fontSize: 12 }}>{co.emoji} {co.company}</td>
                                <td style={{ ...tdS, textAlign: "center", fontSize: 12 }}>{po.sh}주</td>
                                <td style={{ ...tdS, textAlign: "right", fontWeight: 700, color: profit >= 0 ? "#2e7d32" : "#c62828", fontSize: 12 }}>{profit >= 0 ? "+" : ""}{profit.toLocaleString()}원</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div style={{ background: "#fafafa", borderRadius: 10, padding: 14, border: "1px solid #eee" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 8 }}>📋 최근 투자 내역</div>
                    {myTxs.length === 0 ? (
                      <div style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: 12 }}>거래 내역이 없습니다</div>
                    ) : myTxs.map(t => (
                      <div key={t.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: "1px solid #f0f0f0" }}>
                        <div>
                          <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: t.type === "buy" ? "#e8f5e9" : "#ffebee", color: t.type === "buy" ? "#2e7d32" : "#c62828", marginRight: 4 }}>{t.type === "buy" ? "매수" : "매도"}</span>
                          {t.cn}
                        </div>
                        <span style={{ fontWeight: 600 }}>{t.sh}주 × {t.price.toLocaleString()}원</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "auto", paddingTop: 16 }}>
                <div style={{ borderTop: "2px dashed #ccc", paddingTop: 14 }}>
                  <div style={{ fontSize: 14, color: "#555", marginBottom: 8, fontWeight: 600 }}>✏️ 이번 주 나의 소감</div>
                  <div style={{ display: "grid", gap: 12 }}>
                    <div><div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>이번 주 가장 잘한 점:</div><div style={{ borderBottom: "1px solid #ddd", height: 24 }} /></div>
                    <div><div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>다음 주 목표:</div><div style={{ borderBottom: "1px solid #ddd", height: 24 }} /></div>
                    <div><div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>투자 전략 메모:</div><div style={{ borderBottom: "1px solid #ddd", height: 24 }} /></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
