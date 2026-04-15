import { Receipt, Wallet, Briefcase, Coins, TrendingUp, TrendingDown } from "lucide-react";
import { useApp } from "../context/AppContext";
import { SALARY_RATE, DIVIDEND_RATE } from "../constants";
import Card from "./Card";

export default function Settlement() {
  const { students, myId, isMobile } = useApp();
  const me = myId != null ? students.find(s => s.id === myId) : null;

  const settleWeek = Math.max(0, ...students.map(s => s.lastSettleWeek || 0));
  const anySettled = settleWeek > 0;

  if (!anySettled) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "32px 12px", color: "#64748b" }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🧾</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>아직 정산 내역이 없어요</div>
          <div style={{ fontSize: 12 }}>선생님이 주차 정산을 진행하면 이곳에 결과가 표시됩니다.</div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <Receipt size={20} color="#6366f1" />
        <h2 style={{ margin: 0, fontSize: 17, color: "#4f46e5" }}>정산 결과 ({settleWeek}주차)</h2>
      </div>

      {me && <MyBreakdown me={me} students={students} isMobile={isMobile} />}

      <h3 style={{ margin: "20px 0 10px", fontSize: 14, fontWeight: 600, color: "#4f46e5" }}>📋 전체 학생 수익 요약</h3>
      <AllSummary students={students} isMobile={isMobile} />

      <Card style={{ marginTop: 20, background: "#f8fafc" }}>
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, color: "#4f46e5", marginBottom: 6 }}>💡 수익 구조 안내</div>
          <div>• <b>CEO 월급</b>: 본인 회사의 새 주가 × {Math.round(SALARY_RATE * 100)}%</div>
          <div>• <b>사업 수익</b>: 이번 주 미션 등급에 따른 현금 보상</div>
          <div>• <b>주주 배당</b>: 보유한 주식의 새 주가 × {Math.round(DIVIDEND_RATE * 100)}% × 주식 수</div>
          <div style={{ marginTop: 8, fontSize: 11 }}>주식을 많이 가질수록, 주가가 높은 회사에 투자할수록 배당이 커져요.</div>
        </div>
      </Card>
    </div>
  );
}

function MyBreakdown({ me, students, isMobile }) {
  const salary = me.lastSalary || 0;
  const biz = me.lastBiz || 0;
  const dividend = me.lastDividend || 0;
  const details = me.lastDividendDetails || [];
  const total = salary + biz + dividend;

  const h = me.history || [];
  const prev = h.length > 1 ? h[h.length - 2].price : (h[0]?.price || me.stockPrice);
  const priceChange = me.stockPrice - prev;
  const pricePct = prev > 0 ? ((priceChange / prev) * 100).toFixed(1) : 0;
  const up = priceChange >= 0;

  return (
    <Card style={{ marginBottom: 14, background: "linear-gradient(135deg, #eef2ff, #faf5ff)", borderColor: "#c7d2fe" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 28 }}>{me.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{me.name}님의 이번 주 정산</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{me.company}</div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", marginBottom: 12, border: "1px solid #e8ecf4" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>우리 회사 주가</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{me.stockPrice.toLocaleString()}원</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: up ? "#16a34a" : "#dc2626", display: "flex", alignItems: "center", gap: 2 }}>
              {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {up ? "+" : ""}{priceChange}원 ({pricePct}%)
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
        <IncomeBox icon={<Wallet size={16} />} color="#f59e0b" bg="#fffbeb" border="#fde68a" label="CEO 월급" value={salary} note={`주가 × ${Math.round(SALARY_RATE * 100)}%`} />
        <IncomeBox icon={<Briefcase size={16} />} color="#16a34a" bg="#f0fdf4" border="#bbf7d0" label="사업 수익" value={biz} note={me.mg ? `등급 ${me.mg}` : "미션 보상"} />
        <IncomeBox icon={<Coins size={16} />} color="#7c3aed" bg="#faf5ff" border="#e9d5ff" label="주주 배당" value={dividend} note={details.length > 0 ? `${details.length}개 회사` : "보유 주식 없음"} />
      </div>

      <div style={{ background: "#eef2ff", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #c7d2fe" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5" }}>이번 주 총 수입</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#4f46e5" }}>+{total.toLocaleString()}원</div>
      </div>

      {details.length > 0 && (
        <div style={{ marginTop: 12, background: "#fff", borderRadius: 10, padding: "10px 14px", border: "1px solid #e8ecf4" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <Coins size={14} /> 배당 상세 내역
          </div>
          {details.map(d => {
            const co = students.find(x => x.id === d.cid);
            if (!co) return null;
            return (
              <div key={d.cid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px dashed #f1f5f9", fontSize: 12 }}>
                <div>
                  <span style={{ fontSize: 14, marginRight: 6 }}>{co.emoji}</span>
                  <span style={{ color: "#1e293b", fontWeight: 600 }}>{co.company}</span>
                  <span style={{ color: "#94a3b8", marginLeft: 6 }}>{d.sh}주 × {d.perShare}원</span>
                </div>
                <div style={{ fontWeight: 700, color: "#7c3aed" }}>+{d.amount.toLocaleString()}원</div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function IncomeBox({ icon, color, bg, border, label, value, note }) {
  return (
    <div style={{ background: bg, borderRadius: 10, padding: "10px 12px", border: `1px solid ${border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color, fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 17, fontWeight: 800, color }}>+{value.toLocaleString()}원</div>
      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{note}</div>
    </div>
  );
}

function AllSummary({ students, isMobile }) {
  const sorted = [...students].sort((a, b) => {
    const ta = (a.lastSalary || 0) + (a.lastBiz || 0) + (a.lastDividend || 0);
    const tb = (b.lastSalary || 0) + (b.lastBiz || 0) + (b.lastDividend || 0);
    return tb - ta;
  });

  if (isMobile) {
    return (
      <div style={{ display: "grid", gap: 8 }}>
        {sorted.map(s => {
          const total = (s.lastSalary || 0) + (s.lastBiz || 0) + (s.lastDividend || 0);
          return (
            <div key={s.id} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: "1px solid #e8ecf4" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{s.emoji} {s.name}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#4f46e5" }}>+{total.toLocaleString()}원</div>
              </div>
              <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#64748b" }}>
                <span>월급 <b style={{ color: "#b45309" }}>{(s.lastSalary || 0).toLocaleString()}</b></span>
                <span>사업 <b style={{ color: "#16a34a" }}>{(s.lastBiz || 0).toLocaleString()}</b></span>
                <span>배당 <b style={{ color: "#7c3aed" }}>{(s.lastDividend || 0).toLocaleString()}</b></span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8ecf4", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#f8fafc", color: "#64748b", fontSize: 11, textAlign: "left" }}>
            <th style={thS}>학생</th>
            <th style={{ ...thS, textAlign: "right" }}>CEO 월급</th>
            <th style={{ ...thS, textAlign: "right" }}>사업 수익</th>
            <th style={{ ...thS, textAlign: "right" }}>주주 배당</th>
            <th style={{ ...thS, textAlign: "right", color: "#4f46e5" }}>합계</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(s => {
            const total = (s.lastSalary || 0) + (s.lastBiz || 0) + (s.lastDividend || 0);
            return (
              <tr key={s.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={tdS}><span style={{ marginRight: 6 }}>{s.emoji}</span>{s.name} <span style={{ color: "#94a3b8", fontSize: 11, marginLeft: 4 }}>({s.company})</span></td>
                <td style={{ ...tdS, textAlign: "right", color: "#b45309", fontWeight: 600 }}>+{(s.lastSalary || 0).toLocaleString()}</td>
                <td style={{ ...tdS, textAlign: "right", color: "#16a34a", fontWeight: 600 }}>+{(s.lastBiz || 0).toLocaleString()}</td>
                <td style={{ ...tdS, textAlign: "right", color: "#7c3aed", fontWeight: 600 }}>+{(s.lastDividend || 0).toLocaleString()}</td>
                <td style={{ ...tdS, textAlign: "right", color: "#4f46e5", fontWeight: 800 }}>+{total.toLocaleString()}원</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const thS = { padding: "10px 14px", fontWeight: 600 };
const tdS = { padding: "10px 14px", color: "#1e293b" };
