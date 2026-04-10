import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useApp } from "../context/AppContext";
import { MAX_SHARES } from "../constants";
import { ss, si, qb } from "../styles";
import Card from "./Card";

export default function Trade() {
  const { students, doTrade, txs, isMobile } = useApp();
  const [buyer, setBuyer] = useState("");
  const [co, setCo] = useState("");
  const [sh, setSh] = useState(1);
  const [type, setType] = useState("buy");
  const [msg, setMsg] = useState(null);

  const b = students.find(s => s.id === Number(buyer));
  const c = students.find(s => s.id === Number(co));
  const avail = students.filter(s => s.id !== Number(buyer));

  const go = () => {
    if (!buyer || !co) { flash("error", "모든 항목을 선택해주세요."); return; }
    if (doTrade(Number(buyer), Number(co), type, sh)) flash("success", `${type === "buy" ? "매수" : "매도"} 완료!`);
    else flash("error", "거래 실패! (잔액, 한도, 보유량 확인)");
  };
  function flash(t, txt) { setMsg({ t, txt }); setTimeout(() => setMsg(null), 3000); }

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 16 : 20 }}>
      <Card>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>💰 주식 거래</h3>
        {msg && <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 14, background: msg.t === "success" ? "rgba(76,223,139,0.1)" : "rgba(255,107,122,0.1)", border: `1px solid ${msg.t === "success" ? "rgba(76,223,139,0.3)" : "rgba(255,107,122,0.3)"}`, color: msg.t === "success" ? "#4cdf8b" : "#ff6b7a", fontSize: 13 }}>{msg.txt}</div>}

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["buy", "sell"].map(t => (
            <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: "10px", background: type === t ? (t === "buy" ? "rgba(76,223,139,0.15)" : "rgba(255,107,122,0.15)") : "rgba(100,130,255,0.05)", border: `1px solid ${type === t ? (t === "buy" ? "rgba(76,223,139,0.4)" : "rgba(255,107,122,0.4)") : "rgba(120,140,255,0.1)"}`, borderRadius: 10, color: type === t ? (t === "buy" ? "#4cdf8b" : "#ff6b7a") : "#778", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
              {t === "buy" ? "📈 매수" : "📉 매도"}
            </button>
          ))}
        </div>

        <label style={ss}>투자자</label>
        <select value={buyer} onChange={e => { setBuyer(e.target.value); setCo(""); }} style={si}>
          <option value="">선택</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.cash.toLocaleString()}원)</option>)}
        </select>

        <label style={ss}>대상 회사</label>
        <select value={co} onChange={e => setCo(e.target.value)} style={si}>
          <option value="">선택</option>
          {avail.map(s => {
            const held = b?.portfolio.find(p => p.cid === s.id)?.sh || 0;
            return <option key={s.id} value={s.id}>{s.emoji} {s.company} ({s.stockPrice.toLocaleString()}원){held > 0 ? ` [${held}주]` : ""}</option>;
          })}
        </select>

        <label style={ss}>수량</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <button onClick={() => setSh(Math.max(1, sh - 1))} style={qb}><Minus size={14} /></button>
          <span style={{ fontSize: 20, fontWeight: 800, minWidth: 30, textAlign: "center" }}>{sh}</span>
          <button onClick={() => setSh(Math.min(MAX_SHARES, sh + 1))} style={qb}><Plus size={14} /></button>
          <span style={{ fontSize: 12, color: "#778" }}>(최대 {MAX_SHARES}주)</span>
        </div>

        {c && (
          <div style={{ background: "rgba(100,130,255,0.05)", borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "#778" }}>주당</span><span>{c.stockPrice.toLocaleString()}원</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15 }}><span style={{ color: "#778" }}>총액</span><span style={{ color: type === "buy" ? "#ff6b7a" : "#4cdf8b" }}>{(c.stockPrice * sh).toLocaleString()}원</span></div>
          </div>
        )}

        <button onClick={go} style={{ width: "100%", padding: 14, background: type === "buy" ? "linear-gradient(135deg, #2e7d32, #43a047)" : "linear-gradient(135deg, #c62828, #e53935)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          {type === "buy" ? "매수하기" : "매도하기"}
        </button>
      </Card>

      <Card>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>📋 거래 기록</h3>
        <div style={{ maxHeight: isMobile ? 300 : 450, overflow: "auto" }}>
          {txs.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "#556" }}>거래 기록 없음</div> :
            txs.slice(0, 30).map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 10px", borderBottom: "1px solid rgba(120,140,255,0.06)", fontSize: 13 }}>
                <div>
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: t.type === "buy" ? "rgba(76,223,139,0.1)" : "rgba(255,107,122,0.1)", color: t.type === "buy" ? "#4cdf8b" : "#ff6b7a", marginRight: 6 }}>{t.type === "buy" ? "매수" : "매도"}</span>
                  <span style={{ color: "#ccd" }}>{t.bn}</span><span style={{ color: "#556", margin: "0 3px" }}>→</span><span style={{ color: "#9cb8ff" }}>{t.cn}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600 }}>{t.sh}주 × {t.price.toLocaleString()}원</div>
                  <div style={{ fontSize: 10, color: "#556" }}>{t.date}</div>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
