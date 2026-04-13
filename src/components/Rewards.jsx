import Card from "./Card";
import { useApp } from "../context/AppContext";

const th = { padding: "8px 10px", background: "#eef2ff", color: "#4f46e5", fontSize: 12, fontWeight: 700, textAlign: "left", borderBottom: "1px solid #c7d2fe" };
const td = { padding: "8px 10px", fontSize: 13, color: "#1e293b", borderBottom: "1px solid #f1f5f9" };
const tdR = { ...td, textAlign: "right", fontWeight: 600 };

export default function Rewards() {
  const { isMobile } = useApp();

  const special = [
    { name: "우수 기업상 (TOP 3)", cond: "최종 주가 상위 3개 회사", reward: "상장 + 보너스 과자 2개" },
    { name: "투자왕", cond: "투자 수익률 1위 학생", reward: "상장 + 보너스 과자 2개" },
    { name: "성장상", cond: "주가 상승률이 가장 높은 학생", reward: "상장 + 보너스 과자 1개" },
  ];

  const tiers = [
    { tier: "🥇 골드", pct: "상위 30%", set: "과자 3~4종 + 음료 1개", price: "약 3,000원", color: "#fef3c7", border: "#fde68a", text: "#b45309" },
    { tier: "🥈 실버", pct: "중위 40%", set: "과자 2종 + 음료 1개", price: "약 2,000원", color: "#f1f5f9", border: "#cbd5e1", text: "#475569" },
    { tier: "🥉 브론즈", pct: "하위 30%", set: "과자 1종 + 음료 1개", price: "약 1,500원", color: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
  ];

  const budget = [
    { item: "골드 과자 세트 (상위 30%)", qty: "8명", unit: "3,000원", total: "24,000원" },
    { item: "실버 과자 세트 (중위 40%)", qty: "10명", unit: "2,000원", total: "20,000원" },
    { item: "브론즈 과자 세트 (하위 30%)", qty: "7명", unit: "1,500원", total: "10,500원" },
    { item: "특별상 보너스 과자", qty: "5명", unit: "1,000원", total: "5,000원" },
    { item: "경매용 프리미엄 과자", qty: "3~5개", unit: "2,000~3,000원", total: "10,000원" },
  ];

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)", borderRadius: 14, padding: isMobile ? 16 : 20, marginBottom: 20, border: "1px solid #fcd34d", textAlign: "center" }}>
        <div style={{ fontSize: isMobile ? 30 : 36, marginBottom: 6 }}>🏆</div>
        <h2 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#92400e", fontFamily: "'Black Han Sans', sans-serif", letterSpacing: 1 }}>4-2 주식회사 주주총회</h2>
        <p style={{ margin: "8px 0 0", fontSize: isMobile ? 12 : 13, color: "#78350f" }}>학기말 모두 함께 모여 보상을 받는 날! 전원이 과자 세트를 받고, 남은 가상 화폐로 프리미엄 과자 경매까지 즐깁니다.</p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#4f46e5" }}>🏅 특별상 시상</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>상 이름</th><th style={th}>선정 기준</th><th style={th}>보상</th></tr></thead>
          <tbody>
            {special.map(s => (
              <tr key={s.name}><td style={{ ...td, fontWeight: 700, color: "#b45309" }}>{s.name}</td><td style={td}>{s.cond}</td><td style={td}>{s.reward}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#4f46e5" }}>🎁 1단계: 등급별 과자 세트 (전원 보상)</h3>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b" }}>총자산(현금 + 주식 가치) 기준 3등급으로 나누어 모두에게 과자 세트를 지급합니다. 아무도 빈손으로 돌아가지 않습니다.</p>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 10 }}>
          {tiers.map(t => (
            <div key={t.tier} style={{ background: t.color, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 4 }}>{t.tier}</div>
              <div style={{ fontSize: 12, color: t.text, marginBottom: 8, opacity: 0.85 }}>{t.pct}</div>
              <div style={{ fontSize: 13, color: "#1e293b", marginBottom: 6 }}>{t.set}</div>
              <div style={{ fontSize: 12, color: t.text, fontWeight: 700 }}>{t.price}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#4f46e5" }}>🔨 2단계: 과자 경매</h3>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b" }}>등급별 과자 세트를 받은 후, 프리미엄 과자 3~5개를 가상 화폐로 경매합니다. 남은 가상 화폐를 어떻게 쓸지 마지막까지 판단해보세요.</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>규칙</th><th style={th}>내용</th></tr></thead>
          <tbody>
            <tr><td style={{ ...td, fontWeight: 600 }}>입찰 화폐</td><td style={td}>가상 화폐(현금)</td></tr>
            <tr><td style={{ ...td, fontWeight: 600 }}>시작가</td><td style={td}>과자당 500원</td></tr>
            <tr><td style={{ ...td, fontWeight: 600 }}>입찰 단위</td><td style={td}>100원 이상, 100원 단위로 올려 부르기</td></tr>
            <tr><td style={{ ...td, fontWeight: 600 }}>낙찰</td><td style={td}>최고 입찰자에게 "하나, 둘, 셋, 낙찰!"</td></tr>
            <tr><td style={{ ...td, fontWeight: 600 }}>경매 상품</td><td style={td}>빼빼로 대형, 과자 선물세트 등 3~5개</td></tr>
          </tbody>
        </table>
      </Card>

      <Card>
        <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#4f46e5" }}>💰 예산 계획 (25명 기준)</h3>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b" }}>학급 인원에 따라 조정됩니다.</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
            <thead><tr><th style={th}>항목</th><th style={{ ...th, textAlign: "right" }}>수량</th><th style={{ ...th, textAlign: "right" }}>단가</th><th style={{ ...th, textAlign: "right" }}>소계</th></tr></thead>
            <tbody>
              {budget.map(b => (
                <tr key={b.item}><td style={td}>{b.item}</td><td style={tdR}>{b.qty}</td><td style={tdR}>{b.unit}</td><td style={{ ...tdR, color: "#4f46e5" }}>{b.total}</td></tr>
              ))}
              <tr style={{ background: "#eef2ff" }}>
                <td style={{ ...td, fontWeight: 800, color: "#4f46e5" }}>합계</td>
                <td style={tdR}></td>
                <td style={tdR}></td>
                <td style={{ ...tdR, fontWeight: 900, color: "#4f46e5", fontSize: 15 }}>약 69,500원</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
