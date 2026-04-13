import { useState } from "react";
import { Star, Users, Target, Vote, Zap, Gift, RefreshCw, Award, Printer, Plus, Minus, Trash2, Sparkles, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { DEFAULT_STOCK_PRICE, DEFAULT_CASH, GRADES, MISSION_CASH, SALARY_RATE, TICKET_VALUE, TICKET_REASONS } from "../constants";
import { uid } from "../utils";
import { ss, si, qb, sb } from "../styles";
import Card from "./Card";
import EmojiPicker from "./EmojiPicker";
import ReportOverlay from "./ReportOverlay";

export default function Admin() {
  const { students, setStudents, week, mission, setMission, evts, setEvts, settle, resetAll, loadSample, showAdd, setShowAdd, persist, txs, showReport, setShowReport, portfolioVal, ticketLog, saveTickets, isMobile } = useApp();
  const [sub, setSub] = useState("ticket");
  const [nm, setNm] = useState(mission);
  const [ed, setEd] = useState("");
  const [et, setEt] = useState([]);
  const [ea, setEa] = useState(200);
  const [nn, setNn] = useState("");
  const [nc, setNc] = useState("");
  const [ns, setNs] = useState("");
  const [ne, setNe] = useState("🏢");
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [tkReason, setTkReason] = useState("morning");
  const [tkCustomCount, setTkCustomCount] = useState(1);
  const [tkMsg, setTkMsg] = useState(null);
  const [aucItems, setAucItems] = useState([]);
  const [aucActive, setAucActive] = useState(null);
  const [aucHistory, setAucHistory] = useState([]);
  const [aucNewName, setAucNewName] = useState("");
  const [aucNewEmoji, setAucNewEmoji] = useState("🍫");
  const [aucNewStart, setAucNewStart] = useState(500);
  const [bulkCashAmt, setBulkCashAmt] = useState(500);
  const [bulkCashMsg, setBulkCashMsg] = useState(null);
  const [marketPct, setMarketPct] = useState(10);
  const [marketMsg, setMarketMsg] = useState(null);

  const giveTicket = (studentId, reasonId, choice) => {
    const reason = TICKET_REASONS.find(r => r.id === reasonId);
    if (!reason) return;
    const count = reasonId === "custom" ? tkCustomCount : reason.tickets;
    const cashAmount = count * TICKET_VALUE;
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const delta = choice === "cash" ? cashAmount : choice === "loss" ? -cashAmount : 0;
    if (delta !== 0) {
      setStudents(students.map(s => s.id === studentId ? { ...s, cash: s.cash + delta } : s));
    }

    const log = {
      id: uid(),
      studentId,
      studentName: student.name,
      reason: reason.label,
      emoji: reason.emoji,
      tickets: count,
      choice,
      cashAmount: delta,
      week,
      date: new Date().toLocaleString("ko-KR"),
    };
    saveTickets([log, ...ticketLog]);
    setTkMsg({ name: student.name, tickets: count, choice, cash: cashAmount });
    setTimeout(() => setTkMsg(null), 3000);
  };

  const addS = () => {
    if (!nn.trim() || !nc.trim()) return;
    if (nn.trim().length > 20 || nc.trim().length > 30 || ns.length > 50) return;
    setStudents([...students, { id: Date.now(), name: nn, company: nc, slogan: ns || "열심히!", emoji: ne, stockPrice: DEFAULT_STOCK_PRICE, history: [{ week: Math.max(0, week - 1), price: DEFAULT_STOCK_PRICE, label: "시작" }], cash: DEFAULT_CASH, portfolio: [], tp: 0, mg: "", pv: 0, lastSalary: 0, lastBiz: 0 }]);
    setNn(""); setNc(""); setNs(""); setNe("🏢"); setShowAdd(false);
  };
  const upPts = (id, a) => setStudents(students.map(s => s.id === id ? { ...s, tp: (s.tp || 0) + a } : s));
  const setGrade = (id, g) => setStudents(students.map(s => s.id === id ? { ...s, mg: g } : s));
  const addVote = (id) => setStudents(students.map(s => s.id === id ? { ...s, pv: (s.pv || 0) + 1 } : s));
  const resetVotes = () => setStudents(students.map(s => ({ ...s, pv: 0 })));
  const fireEvt = () => {
    if (!ed || !et.length) return;
    setStudents(students.map(s => et.includes(s.id) ? { ...s, tp: (s.tp || 0) + ea } : s));
    setEvts([{ id: uid(), desc: ed, who: et.map(x => students.find(s => s.id === x)?.name).join(", "), amt: ea, wk: week, date: new Date().toLocaleString("ko-KR") }, ...evts]);
    setEd(""); setEt([]); setEa(200);
  };

  const subs = [
    { id: "ticket", label: "행운권 환전", icon: <Gift size={15} /> },
    { id: "points", label: "포인트", icon: <Star size={15} /> },
    { id: "mission", label: "미션", icon: <Target size={15} /> },
    { id: "vote", label: "투표", icon: <Vote size={15} /> },
    { id: "event", label: "이벤트", icon: <Zap size={15} /> },
    { id: "bulkCash", label: "일괄지급", icon: <DollarSign size={15} /> },
    { id: "market", label: "시장조절", icon: <TrendingUp size={15} /> },
    { id: "activity", label: "활동현황", icon: <BarChart3 size={15} /> },
    { id: "manage", label: "학생관리", icon: <Users size={15} /> },
    { id: "settle", label: "정산", icon: <RefreshCw size={15} /> },
    { id: "auction", label: "🔨경매", icon: <Award size={15} /> },
    { id: "report", label: "보고서", icon: <Printer size={15} /> },
  ];

  return (
    <div>
      <div className="admin-subtabs" style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: isMobile ? "nowrap" : "wrap" }}>
        {subs.map(t => (
          <button key={t.id} onClick={() => setSub(t.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: isMobile ? "8px 12px" : "8px 14px", background: sub === t.id ? "#e0e7ff" : "#f8fafc", border: `1px solid ${sub === t.id ? "#a5b4fc" : "#e8ecf4"}`, borderRadius: 10, color: sub === t.id ? "#4f46e5" : "#64748b", cursor: "pointer", fontSize: isMobile ? 12 : 13, fontWeight: sub === t.id ? 600 : 400, whiteSpace: "nowrap", flexShrink: 0 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {sub === "ticket" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>🎫 행운권 환전</h3>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b" }}>활동으로 받은 실물 행운권을 가상 화폐(1장 = {TICKET_VALUE}원)로 환전합니다. 실수로 환전한 경우 '가상화폐 손실'로 되돌릴 수 있습니다.</p>

            {tkMsg && (
              <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 14, background: tkMsg.choice === "cash" ? "#f0fdf4" : "#fef2f2", border: `1px solid ${tkMsg.choice === "cash" ? "#86efac" : "#fca5a5"}`, color: tkMsg.choice === "cash" ? "#16a34a" : "#dc2626", fontSize: 13 }}>
                ✅ {tkMsg.name} → {tkMsg.choice === "cash" ? `가상 화폐 +${tkMsg.cash.toLocaleString()}원 환전 완료!` : `가상 화폐 -${tkMsg.cash.toLocaleString()}원 차감 완료!`}
              </div>
            )}

            <label style={ss}>지급 사유</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {TICKET_REASONS.map(r => (
                <button key={r.id} onClick={() => setTkReason(r.id)} style={{ padding: "8px 14px", background: tkReason === r.id ? "#fde68a" : "#f8fafc", border: `1px solid ${tkReason === r.id ? "#fbbf24" : "#e8ecf4"}`, borderRadius: 10, color: tkReason === r.id ? "#d97706" : "#64748b", cursor: "pointer", fontSize: 12, fontWeight: tkReason === r.id ? 700 : 400 }}>
                  {r.emoji} {r.label} {r.tickets > 0 ? `(${r.tickets}장)` : ""}
                </button>
              ))}
            </div>

            {tkReason === "custom" && (
              <div style={{ marginBottom: 14 }}>
                <label style={ss}>행운권 수량</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setTkCustomCount(Math.max(1, tkCustomCount - 1))} style={qb}><Minus size={14} /></button>
                  <span style={{ fontSize: 20, fontWeight: 800, minWidth: 30, textAlign: "center" }}>{tkCustomCount}</span>
                  <button onClick={() => setTkCustomCount(Math.min(10, tkCustomCount + 1))} style={qb}><Plus size={14} /></button>
                  <span style={{ fontSize: 12, color: "#64748b" }}>장 = {(tkCustomCount * TICKET_VALUE).toLocaleString()}원</span>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gap: 6 }}>
              {students.map(s => {
                const reason = TICKET_REASONS.find(r => r.id === tkReason);
                const count = tkReason === "custom" ? tkCustomCount : (reason?.tickets || 0);
                const cashVal = count * TICKET_VALUE;
                const weekLogs = ticketLog.filter(l => l.studentId === s.id && l.week === week);
                const weekTotal = weekLogs.reduce((sum, l) => sum + l.tickets, 0);
                const weekNet = weekLogs.reduce((sum, l) => sum + (l.cashAmount || 0), 0);

                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e8ecf4" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 140 }}>
                      <span style={{ fontSize: 20 }}>{s.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>
                          이번 주: {weekTotal > 0 ? `${weekTotal}장` : "-"}
                          {weekNet !== 0 ? ` (${weekNet > 0 ? "+" : ""}${weekNet.toLocaleString()}원)` : ""}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: "#d97706", fontWeight: 600, marginRight: 4 }}>{count}장</span>
                      <button onClick={() => giveTicket(s.id, tkReason, "cash")} style={{ padding: "6px 12px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, color: "#16a34a", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                        💰 가상화폐 (+{cashVal.toLocaleString()}원)
                      </button>
                      <button onClick={() => giveTicket(s.id, tkReason, "loss")} style={{ padding: "6px 12px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, color: "#dc2626", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                        💸 가상화폐 손실 (-{cashVal.toLocaleString()}원)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {ticketLog.length > 0 && (
            <Card>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>📋 행운권 환전 기록</h3>
              <div style={{ maxHeight: 300, overflow: "auto" }}>
                {ticketLog.slice(0, 30).map(l => {
                  const isCash = l.choice === "cash";
                  const isLoss = l.choice === "loss";
                  const badgeBg = isCash ? "#f0fdf4" : isLoss ? "#fef2f2" : "#faf5ff";
                  const badgeColor = isCash ? "#16a34a" : isLoss ? "#dc2626" : "#7c3aed";
                  const badgeText = isCash ? "💰 환전" : isLoss ? "💸 손실" : "🎫 실물";
                  return (
                    <div key={l.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderBottom: "1px solid #e8ecf4", fontSize: 12 }}>
                      <div>
                        <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: badgeBg, color: badgeColor, marginRight: 6 }}>
                          {badgeText}
                        </span>
                        <span style={{ color: "#1e293b" }}>{l.studentName}</span>
                        <span style={{ color: "#94a3b8", margin: "0 4px" }}>·</span>
                        <span style={{ color: "#4f46e5" }}>{l.emoji} {l.reason}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: 600 }}>{l.tickets}장</span>
                        {l.cashAmount ? <span style={{ color: l.cashAmount > 0 ? "#16a34a" : "#dc2626", marginLeft: 6 }}>{l.cashAmount > 0 ? "+" : ""}{l.cashAmount.toLocaleString()}원</span> : null}
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{l.date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {sub === "points" && (
        <Card>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>⭐ 선생님 포인트</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>수업 태도, 과제, 생활 평가 (최대 +300/-200)</p>
          <div style={{ display: "grid", gap: 6 }}>
            {students.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e8ecf4" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{s.emoji}</span>
                  <div><div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{s.name}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{s.company}</div></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => upPts(s.id, -100)} style={{ ...sb, color: "#dc2626" }}>-100</button>
                  <button onClick={() => upPts(s.id, -50)} style={{ ...sb, color: "#d97706" }}>-50</button>
                  <span style={{ fontWeight: 800, fontSize: 16, minWidth: 50, textAlign: "center", color: (s.tp || 0) >= 0 ? "#16a34a" : "#dc2626" }}>
                    {(s.tp || 0) >= 0 ? "+" : ""}{s.tp || 0}
                  </span>
                  <button onClick={() => upPts(s.id, 50)} style={{ ...sb, color: "#14b8a6" }}>+50</button>
                  <button onClick={() => upPts(s.id, 100)} style={{ ...sb, color: "#16a34a" }}>+100</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {sub === "mission" && (
        <Card>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>🎯 주간 미션</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>S(+500) / A(+300) / B(+100) / 미완수(-100)</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={nm} onChange={e => setNm(e.target.value)} placeholder="미션 입력" style={{ ...si, flex: 1 }} />
            <button onClick={() => setMission(nm)} style={{ padding: "10px 20px", background: "linear-gradient(135deg, #6366f1, #818cf8)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>설정</button>
          </div>
          <div style={{ background: "#fffbeb", borderRadius: 10, padding: 12, marginBottom: 16, border: "1px solid #fde68a" }}>
            <div style={{ fontSize: 12, color: "#d97706" }}>현재 미션</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{mission || "미설정"}</div>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {students.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e8ecf4" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>{s.emoji}</span><span style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{s.name}</span></div>
                <div style={{ display: "flex", gap: 4 }}>
                  {Object.keys(GRADES).map(g => (
                    <button key={g} onClick={() => setGrade(s.id, g)} style={{ padding: "6px 12px", background: s.mg === g ? (GRADES[g] > 0 ? "#f0fdf4" : "#fef2f2") : "#f8fafc", border: `1px solid ${s.mg === g ? (GRADES[g] > 0 ? "#86efac" : "#fca5a5") : "#e2e8f0"}`, borderRadius: 8, color: s.mg === g ? (GRADES[g] > 0 ? "#16a34a" : "#dc2626") : "#64748b", cursor: "pointer", fontSize: 12, fontWeight: s.mg === g ? 700 : 400 }}>{g}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {sub === "vote" && (
        <Card>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>🗳️ 친구 평가</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>상위 30%: +400 / 중위: +100 / 하위 30%: -100</p>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button onClick={resetVotes} style={{ padding: "6px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", cursor: "pointer", fontSize: 12 }}>초기화</button>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {[...students].sort((a, b) => (b.pv || 0) - (a.pv || 0)).map((s, i) => {
              const tot = students.reduce((sum, x) => sum + (x.pv || 0), 0);
              const pct = tot > 0 ? ((s.pv || 0) / tot * 100).toFixed(0) : 0;
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 10, position: "relative", overflow: "hidden", border: "1px solid #e8ecf4" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: "rgba(124,158,255,0.06)", transition: "width 0.3s" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", width: 20 }}>{i + 1}</span>
                    <span style={{ fontSize: 20 }}>{s.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{s.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
                    <span style={{ fontWeight: 800, fontSize: 16, color: "#4f46e5" }}>{s.pv || 0}표</span>
                    <button onClick={() => addVote(s.id)} style={{ padding: "6px 14px", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 8, color: "#4f46e5", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+1표</button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {sub === "event" && (
        <Card>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>⚡ 특별 이벤트</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>깜짝 호재/악재 → 선생님 포인트 반영</p>
          <input value={ed} onChange={e => setEd(e.target.value)} placeholder="이벤트 설명 (예: 청소 우수 보너스!)" style={{ ...si, marginBottom: 10 }} />
          <label style={ss}>대상 선택</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
            <button onClick={() => setEt(students.map(s => s.id))} style={{ padding: "4px 10px", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 6, color: "#4f46e5", cursor: "pointer", fontSize: 11 }}>전체</button>
            {students.map(s => (
              <button key={s.id} onClick={() => setEt(p => p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id])} style={{ padding: "4px 10px", background: et.includes(s.id) ? "#f0fdf4" : "#f8fafc", border: `1px solid ${et.includes(s.id) ? "#86efac" : "#e8ecf4"}`, borderRadius: 6, color: et.includes(s.id) ? "#16a34a" : "#64748b", cursor: "pointer", fontSize: 11 }}>{s.emoji} {s.name}</button>
            ))}
          </div>
          <label style={ss}>포인트</label>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[-200, -100, 100, 150, 200, 300].map(v => (
              <button key={v} onClick={() => setEa(v)} style={{ padding: "6px 12px", background: ea === v ? "#e0e7ff" : "#f8fafc", border: `1px solid ${ea === v ? "#a5b4fc" : "#e8ecf4"}`, borderRadius: 8, color: ea === v ? (v > 0 ? "#16a34a" : "#dc2626") : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: ea === v ? 700 : 400 }}>{v > 0 ? "+" : ""}{v}</button>
            ))}
          </div>
          <button onClick={fireEvt} style={{ width: "100%", padding: 14, background: "linear-gradient(135deg, #d97706, #f59e0b)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>⚡ 이벤트 발동!</button>
          {evts.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b" }}>히스토리</h4>
              {evts.slice(0, 10).map(e => (
                <div key={e.id} style={{ padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: 12, color: "#475569" }}>
                  <span style={{ color: e.amt > 0 ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{e.amt > 0 ? "+" : ""}{e.amt}</span> {e.desc} → {e.who}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {sub === "bulkCash" && (
        <Card>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>💵 일괄 현금 지급/차감</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>전체 학생에게 동일한 금액을 지급하거나 차감합니다.</p>

          {bulkCashMsg && (
            <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 14, background: bulkCashMsg.type === "give" ? "#f0fdf4" : "#fef2f2", border: `1px solid ${bulkCashMsg.type === "give" ? "#86efac" : "#fca5a5"}`, color: bulkCashMsg.type === "give" ? "#16a34a" : "#dc2626", fontSize: 13 }}>
              {bulkCashMsg.text}
            </div>
          )}

          <label style={ss}>금액</label>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {[100, 200, 500, 1000, 2000, 5000].map(v => (
              <button key={v} onClick={() => setBulkCashAmt(v)} style={{ padding: "8px 14px", background: bulkCashAmt === v ? "#e0e7ff" : "#f8fafc", border: `1px solid ${bulkCashAmt === v ? "#a5b4fc" : "#e8ecf4"}`, borderRadius: 8, color: bulkCashAmt === v ? "#4f46e5" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: bulkCashAmt === v ? 700 : 400 }}>{v.toLocaleString()}원</button>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={ss}>직접 입력</label>
            <input type="number" value={bulkCashAmt} onChange={e => setBulkCashAmt(Number(e.target.value))} style={{ ...si, maxWidth: 200 }} step={100} />
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button onClick={() => {
              if (!window.confirm(`전체 학생에게 ${bulkCashAmt.toLocaleString()}원을 지급합니까?`)) return;
              setStudents(students.map(s => ({ ...s, cash: s.cash + bulkCashAmt })));
              setBulkCashMsg({ type: "give", text: `전체 ${students.length}명에게 ${bulkCashAmt.toLocaleString()}원 지급 완료!` });
              setTimeout(() => setBulkCashMsg(null), 3000);
            }} style={{ flex: 1, padding: 14, background: "linear-gradient(135deg, #16a34a, #22c55e)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              💰 전체 지급 (+{bulkCashAmt.toLocaleString()}원)
            </button>
            <button onClick={() => {
              if (!window.confirm(`전체 학생에게서 ${bulkCashAmt.toLocaleString()}원을 차감합니까?`)) return;
              setStudents(students.map(s => ({ ...s, cash: Math.max(0, s.cash - bulkCashAmt) })));
              setBulkCashMsg({ type: "deduct", text: `전체 ${students.length}명에게서 ${bulkCashAmt.toLocaleString()}원 차감 완료!` });
              setTimeout(() => setBulkCashMsg(null), 3000);
            }} style={{ flex: 1, padding: 14, background: "linear-gradient(135deg, #dc2626, #ef4444)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              💸 전체 차감 (-{bulkCashAmt.toLocaleString()}원)
            </button>
          </div>

          <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b" }}>현재 학생별 보유 현금</h4>
          <div style={{ display: "grid", gap: 4 }}>
            {[...students].sort((a, b) => b.cash - a.cash).map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{s.emoji}</span>
                  <span style={{ fontSize: 13, color: "#1e293b" }}>{s.name}</span>
                </div>
                <span style={{ fontWeight: 700, color: "#b45309" }}>{s.cash.toLocaleString()}원</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {sub === "market" && (
        <Card>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>📊 시장 상황 조절</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>전체 주가를 비율로 올리거나 내립니다. 호황/불황 시뮬레이션에 사용하세요.</p>

          {marketMsg && (
            <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 14, background: marketMsg.up ? "#f0fdf4" : "#fef2f2", border: `1px solid ${marketMsg.up ? "#86efac" : "#fca5a5"}`, color: marketMsg.up ? "#16a34a" : "#dc2626", fontSize: 13 }}>
              {marketMsg.text}
            </div>
          )}

          <label style={ss}>변동 비율 (%)</label>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {[5, 10, 15, 20, 30, 50].map(v => (
              <button key={v} onClick={() => setMarketPct(v)} style={{ padding: "8px 14px", background: marketPct === v ? "#e0e7ff" : "#f8fafc", border: `1px solid ${marketPct === v ? "#a5b4fc" : "#e8ecf4"}`, borderRadius: 8, color: marketPct === v ? "#4f46e5" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: marketPct === v ? 700 : 400 }}>{v}%</button>
            ))}
          </div>

          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #e8ecf4" }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#7c3aed" }}>미리보기</h4>
            <div style={{ display: "grid", gap: 4 }}>
              {students.map(s => {
                const upPrice = Math.round(s.stockPrice * (1 + marketPct / 100));
                const downPrice = Math.max(100, Math.round(s.stockPrice * (1 - marketPct / 100)));
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", fontSize: 12 }}>
                    <span style={{ color: "#1e293b" }}>{s.emoji} {s.name} ({s.stockPrice.toLocaleString()}원)</span>
                    <div style={{ display: "flex", gap: 16 }}>
                      <span style={{ color: "#16a34a" }}>+{marketPct}% → {upPrice.toLocaleString()}원</span>
                      <span style={{ color: "#dc2626" }}>-{marketPct}% → {downPrice.toLocaleString()}원</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => {
              if (!window.confirm(`전체 주가를 ${marketPct}% 올립니까? (호황)`)) return;
              setStudents(students.map(s => {
                const np = Math.round(s.stockPrice * (1 + marketPct / 100));
                return { ...s, stockPrice: np, history: [...s.history, { week, price: np, label: `호황` }] };
              }));
              setMarketMsg({ up: true, text: `📈 호황! 전체 주가 ${marketPct}% 상승!` });
              setTimeout(() => setMarketMsg(null), 3000);
            }} style={{ flex: 1, padding: 14, background: "linear-gradient(135deg, #16a34a, #22c55e)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              📈 호황 (+{marketPct}%)
            </button>
            <button onClick={() => {
              if (!window.confirm(`전체 주가를 ${marketPct}% 내립니까? (불황)`)) return;
              setStudents(students.map(s => {
                const np = Math.max(100, Math.round(s.stockPrice * (1 - marketPct / 100)));
                return { ...s, stockPrice: np, history: [...s.history, { week, price: np, label: `불황` }] };
              }));
              setMarketMsg({ up: false, text: `📉 불황! 전체 주가 ${marketPct}% 하락!` });
              setTimeout(() => setMarketMsg(null), 3000);
            }} style={{ flex: 1, padding: 14, background: "linear-gradient(135deg, #dc2626, #ef4444)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              📉 불황 (-{marketPct}%)
            </button>
          </div>
        </Card>
      )}

      {sub === "activity" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>📋 학생 활동 현황</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>각 학생의 거래, 행운권, 투자 현황을 한눈에 확인합니다.</p>

            <div className="settle-preview" style={{ minWidth: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1.5fr 0.8fr 0.8fr 0.8fr 1fr" : "2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr", gap: 4, fontSize: 10, color: "#64748b", marginBottom: 6, padding: "0 8px", minWidth: isMobile ? 500 : "auto" }}>
                <span>학생</span>
                <span style={{ textAlign: "center" }}>거래 수</span>
                <span style={{ textAlign: "center" }}>행운권</span>
                <span style={{ textAlign: "center" }}>투자종목</span>
                {!isMobile && <span style={{ textAlign: "center" }}>투자자 수</span>}
                {!isMobile && <span style={{ textAlign: "center" }}>주가등락</span>}
                <span style={{ textAlign: "center" }}>총자산</span>
              </div>
              {[...students].sort((a, b) => {
                const aAsset = a.cash + portfolioVal(a.portfolio, students);
                const bAsset = b.cash + portfolioVal(b.portfolio, students);
                return bAsset - aAsset;
              }).map(s => {
                const myTrades = txs.filter(t => t.bid === s.id).length;
                const myTickets = ticketLog.filter(l => l.studentId === s.id).reduce((sum, l) => sum + l.tickets, 0);
                const investCount = s.portfolio.length;
                const investorCount = students.filter(st => st.id !== s.id && st.portfolio.some(p => p.cid === s.id)).length;
                const pv = portfolioVal(s.portfolio, students);
                const totalAsset = s.cash + pv;
                const startPrice = s.history[0]?.price || 1000;
                const growth = s.stockPrice - startPrice;
                const growthPct = startPrice > 0 ? ((growth / startPrice) * 100).toFixed(0) : 0;
                return (
                  <div key={s.id} style={{ display: "grid", gridTemplateColumns: isMobile ? "1.5fr 0.8fr 0.8fr 0.8fr 1fr" : "2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr", gap: 4, padding: "8px", borderBottom: "1px solid #f1f5f9", alignItems: "center", minWidth: isMobile ? 500 : "auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 18 }}>{s.emoji}</span>
                      <div>
                        <div style={{ fontSize: 12, color: "#1e293b", fontWeight: 600 }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{s.company}</div>
                      </div>
                    </div>
                    <span style={{ textAlign: "center", fontSize: 12, color: myTrades > 0 ? "#14b8a6" : "#94a3b8" }}>{myTrades}건</span>
                    <span style={{ textAlign: "center", fontSize: 12, color: myTickets > 0 ? "#d97706" : "#94a3b8" }}>{myTickets}장</span>
                    <span style={{ textAlign: "center", fontSize: 12, color: investCount > 0 ? "#7c3aed" : "#94a3b8" }}>{investCount}개</span>
                    {!isMobile && <span style={{ textAlign: "center", fontSize: 12, color: investorCount > 0 ? "#ec4899" : "#94a3b8" }}>{investorCount}명</span>}
                    {!isMobile && <span style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: growth >= 0 ? "#16a34a" : "#dc2626" }}>{growth >= 0 ? "+" : ""}{growthPct}%</span>}
                    <span style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#b45309" }}>{totalAsset.toLocaleString()}원</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
            <Card>
              <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#4f46e5" }}>🏆 주가 상승률 TOP</h4>
              {[...students].sort((a, b) => {
                const aGrowth = (a.stockPrice - (a.history[0]?.price || 1000)) / (a.history[0]?.price || 1000);
                const bGrowth = (b.stockPrice - (b.history[0]?.price || 1000)) / (b.history[0]?.price || 1000);
                return bGrowth - aGrowth;
              }).slice(0, 5).map((s, i) => {
                const startP = s.history[0]?.price || 1000;
                const growthPct = ((s.stockPrice - startP) / startP * 100).toFixed(1);
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", width: 18 }}>{i + 1}</span>
                      <span style={{ fontSize: 16 }}>{s.emoji}</span>
                      <span style={{ fontSize: 12, color: "#1e293b" }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: growthPct >= 0 ? "#16a34a" : "#dc2626" }}>{growthPct > 0 ? "+" : ""}{growthPct}%</span>
                  </div>
                );
              })}
            </Card>
            <Card>
              <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#4f46e5" }}>💰 총자산 TOP</h4>
              {[...students].sort((a, b) => {
                return (b.cash + portfolioVal(b.portfolio, students)) - (a.cash + portfolioVal(a.portfolio, students));
              }).slice(0, 5).map((s, i) => {
                const totalAsset = s.cash + portfolioVal(s.portfolio, students);
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", width: 18 }}>{i + 1}</span>
                      <span style={{ fontSize: 16 }}>{s.emoji}</span>
                      <span style={{ fontSize: 12, color: "#1e293b" }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#b45309" }}>{totalAsset.toLocaleString()}원</span>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      )}

      {sub === "manage" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", marginBottom: 16, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 10 : 0 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>👥 학생 관리</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { if (window.confirm("예시 데이터(8명)를 불러올까요?")) { loadSample(); window.alert("예시 데이터를 불러왔습니다!"); } }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, color: "#d97706", cursor: "pointer", fontSize: 12, fontWeight: 600 }}><Sparkles size={14} /> 예시 데이터</button>
              <button onClick={() => setShowBulk(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", background: "#faf5ff", border: "1px solid #d8b4fe", borderRadius: 8, color: "#7c3aed", cursor: "pointer", fontSize: 12, fontWeight: 600 }}><Users size={14} /> 일괄 등록</button>
              <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, color: "#16a34a", cursor: "pointer", fontSize: 12, fontWeight: 600 }}><Plus size={14} /> 개별 추가</button>
              <button onClick={resetAll} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", cursor: "pointer", fontSize: 12 }}><Trash2 size={14} /> 초기화</button>
            </div>
          </div>

          {showBulk && (
            <div style={{ background: "#faf5ff", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #e9d5ff" }}>
              <h4 style={{ margin: "0 0 4px", fontSize: 14, color: "#7c3aed" }}>📋 학생 일괄 등록</h4>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b" }}>학생 이름을 한 줄에 하나씩 입력하세요. 회사 이름과 슬로건은 자동 생성되며, 나중에 학생들이 정하면 수정할 수 있습니다.</p>
              <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} placeholder={"김도윤\n이서연\n박지호\n최유나\n정민재\n...\n\n(한 줄에 한 명씩)"} style={{ ...si, height: 180, resize: "vertical", fontFamily: "'Noto Sans KR', sans-serif", lineHeight: 1.8 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  {bulkText.trim() ? `${bulkText.trim().split("\n").filter(l => l.trim()).length}명 감지됨` : "이름을 입력하세요"}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setShowBulk(false); setBulkText(""); }} style={{ padding: "8px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#64748b", cursor: "pointer", fontSize: 13 }}>취소</button>
                  <button onClick={() => {
                    const names = bulkText.trim().split("\n").map(l => l.trim()).filter(l => l && l.length <= 20);
                    if (names.length === 0) return;
                    const emojis = ["🏢","💡","🔢","📚","⚽","🎨","🔬","💖","🌟","🎯","🚀","🎪","🌈","🎸","🏆","🌻","🐬","🦁","🎭","🍀","🔥","⭐","🎵","🌍","🦋","🎈","🏅","💎","🎮","🌺"];
                    const newStudents = names.map((name, i) => ({
                      id: Date.now() + i, name, company: `${name} 주식회사`, slogan: "열심히 하는 회사!",
                      emoji: emojis[i % emojis.length], stockPrice: DEFAULT_STOCK_PRICE,
                      history: [{ week: Math.max(0, week - 1), price: DEFAULT_STOCK_PRICE, label: "시작" }],
                      cash: DEFAULT_CASH, portfolio: [], tp: 0, mg: "", pv: 0, lastSalary: 0, lastBiz: 0,
                    }));
                    setStudents([...students, ...newStudents]);
                    setBulkText(""); setShowBulk(false);
                  }} style={{ padding: "8px 20px", background: "linear-gradient(135deg, #7c3aed, #8b5cf6)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                    일괄 등록하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAdd && (
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #e2e8f0" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#1e293b" }}>새 학생</h4>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: 8, marginBottom: 8, alignItems: "end" }}>
                <div><label style={ss}>이모지</label><EmojiPicker value={ne} onChange={setNe} size={40} /></div>
                <div><label style={ss}>이름</label><input value={nn} onChange={e => setNn(e.target.value)} maxLength={20} placeholder="홍길동" style={si} /></div>
                <div><label style={ss}>회사명</label><input value={nc} onChange={e => setNc(e.target.value)} maxLength={30} placeholder="미래 주식회사" style={si} /></div>
              </div>
              <label style={ss}>슬로건</label>
              <input value={ns} onChange={e => setNs(e.target.value)} maxLength={50} placeholder="우리 회사는 ○○을 잘합니다!" style={{ ...si, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setShowAdd(false)} style={{ padding: "8px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#64748b", cursor: "pointer", fontSize: 13 }}>취소</button>
                <button onClick={addS} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #6366f1, #818cf8)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>등록</button>
              </div>
            </div>
          )}

          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>💡 회사 이름과 슬로건은 클릭해서 바로 수정할 수 있습니다. 이모지도 변경 가능해요.</div>
          <div style={{ display: "grid", gap: 6 }}>
            {students.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e8ecf4" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                  <EmojiPicker value={s.emoji} onChange={v => setStudents(students.map(x => x.id === s.id ? { ...x, emoji: v } : x))} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{s.name}</span>
                      <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>
                      <input value={s.company} onChange={e => setStudents(students.map(x => x.id === s.id ? { ...x, company: e.target.value } : x))} maxLength={30} style={{ background: "transparent", border: "1px solid transparent", borderRadius: 4, color: "#4f46e5", fontSize: 13, fontWeight: 600, padding: "1px 4px", flex: 1, maxWidth: 200 }} onFocus={e => e.target.style.borderColor = "#a5b4fc"} onBlur={e => e.target.style.borderColor = "transparent"} />
                    </div>
                    <input value={s.slogan} onChange={e => setStudents(students.map(x => x.id === s.id ? { ...x, slogan: e.target.value } : x))} maxLength={50} style={{ background: "transparent", border: "1px solid transparent", borderRadius: 4, color: "#94a3b8", fontSize: 11, padding: "1px 4px", width: "100%", maxWidth: 300 }} onFocus={e => e.target.style.borderColor = "#a5b4fc"} onBlur={e => e.target.style.borderColor = "transparent"} placeholder="슬로건 입력..." />
                  </div>
                </div>
                <button onClick={() => { if (confirm(`${s.name} 삭제?`)) setStudents(students.filter(x => x.id !== s.id)); }} style={{ background: "#fef2f2", border: "1px solid #fef2f2", borderRadius: 6, color: "#dc2626", cursor: "pointer", padding: "4px 8px" }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {sub === "settle" && (
        <Card>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>📊 {week}주차 정산</h3>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>포인트 + 미션 + 투표 → 주가 반영 / CEO 급여 + 사업 수익 → 현금 지급</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1, background: "#fffbeb", borderRadius: 10, padding: "10px 14px", border: "1px solid #fde68a" }}>
              <div style={{ fontSize: 11, color: "#d97706", marginBottom: 2 }}>💰 CEO 급여</div>
              <div style={{ fontSize: 13, color: "#1e293b" }}>정산 후 주가의 <b>10%</b>를 현금으로 지급</div>
            </div>
            <div style={{ flex: 1, background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", border: "1px solid #f0fdf4" }}>
              <div style={{ fontSize: 11, color: "#16a34a", marginBottom: 2 }}>📦 사업 수익</div>
              <div style={{ fontSize: 13, color: "#1e293b" }}>미션 S: <b>300원</b> / A: <b>200원</b> / B: <b>100원</b></div>
            </div>
          </div>
          <div className="settle-preview" style={{ background: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid #e8ecf4", overflowX: "auto" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: 13, color: "#7c3aed" }}>정산 미리보기</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr", gap: 4, fontSize: 10, color: "#64748b", marginBottom: 6, padding: "0 8px", minWidth: isMobile ? 600 : "auto" }}>
              <span>학생</span><span style={{ textAlign: "center" }}>포인트</span><span style={{ textAlign: "center" }}>미션</span><span style={{ textAlign: "center" }}>투표</span><span style={{ textAlign: "center" }}>주가변동</span><span style={{ textAlign: "center" }}>급여</span><span style={{ textAlign: "center" }}>사업수익</span><span style={{ textAlign: "center" }}>현금수입</span>
            </div>
            {students.map(s => {
              const mb = GRADES[s.mg] || 0;
              const vs = [...students].sort((a, b) => (b.pv || 0) - (a.pv || 0));
              const rk = vs.findIndex(x => x.id === s.id);
              const n = students.length;
              let pb = 100;
              if (rk < Math.max(1, Math.floor(n * 0.3))) pb = 400;
              else if (rk >= n - Math.max(1, Math.floor(n * 0.3))) pb = -100;
              const tot = (s.tp || 0) + mb + pb;
              const newPrice = Math.max(100, s.stockPrice + tot);
              const salary = Math.round(newPrice * SALARY_RATE);
              const bizIncome = MISSION_CASH[s.mg] || 0;
              const cashTotal = salary + bizIncome;
              return (
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr", gap: 4, padding: "8px", borderBottom: "1px solid #f1f5f9", alignItems: "center", minWidth: isMobile ? 600 : "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span>{s.emoji}</span><span style={{ fontSize: 12, color: "#1e293b" }}>{s.name}</span></div>
                  <span style={{ textAlign: "center", fontSize: 11, color: (s.tp || 0) >= 0 ? "#16a34a" : "#dc2626" }}>{(s.tp || 0) >= 0 ? "+" : ""}{s.tp || 0}</span>
                  <span style={{ textAlign: "center", fontSize: 11, color: s.mg ? (mb >= 0 ? "#14b8a6" : "#dc2626") : "#94a3b8" }}>{s.mg || "-"}</span>
                  <span style={{ textAlign: "center", fontSize: 11, color: "#7c3aed" }}>{s.pv || 0}표</span>
                  <span style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: tot >= 0 ? "#16a34a" : "#dc2626" }}>{tot >= 0 ? "+" : ""}{tot}</span>
                  <span style={{ textAlign: "center", fontSize: 11, color: "#d97706" }}>+{salary}</span>
                  <span style={{ textAlign: "center", fontSize: 11, color: bizIncome > 0 ? "#16a34a" : "#94a3b8" }}>{bizIncome > 0 ? `+${bizIncome}` : "-"}</span>
                  <span style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#b45309" }}>+{cashTotal}원</span>
                </div>
              );
            })}
          </div>
          <button onClick={settle} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg, #7c3aed, #8b5cf6)", border: "none", borderRadius: 12, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", letterSpacing: 1 }}>🔔 {week}주차 정산 실행!</button>
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "#64748b" }}>⚠️ 정산 후 되돌릴 수 없습니다</div>
        </Card>
      )}

      {sub === "auction" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>🔨 과자 경매</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>학기말 주주총회 과자 경매! 학생들이 가상 화폐로 입찰합니다.</p>

            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #e8ecf4" }}>
              <h4 style={{ margin: "0 0 10px", fontSize: 13, color: "#7c3aed" }}>경매 물품 등록</h4>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div style={{ width: 60 }}>
                  <label style={ss}>이모지</label>
                  <input value={aucNewEmoji} onChange={e => setAucNewEmoji(e.target.value)} style={{ ...si, textAlign: "center", fontSize: 20, padding: 6 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={ss}>상품명</label>
                  <input value={aucNewName} onChange={e => setAucNewName(e.target.value)} placeholder="프링글스 대형" style={si} />
                </div>
                <div style={{ width: 100 }}>
                  <label style={ss}>시작가</label>
                  <input type="number" value={aucNewStart} onChange={e => setAucNewStart(Number(e.target.value))} style={si} step={100} />
                </div>
                <button onClick={() => {
                  if (!aucNewName) return;
                  setAucItems([...aucItems, { name: aucNewName, emoji: aucNewEmoji, startPrice: aucNewStart, sold: false }]);
                  setAucNewName(""); setAucNewEmoji("🍫"); setAucNewStart(500);
                }} style={{ padding: "10px 16px", background: "linear-gradient(135deg, #6366f1, #818cf8)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}>추가</button>
              </div>
            </div>

            {aucItems.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b" }}>등록된 물품 ({aucItems.filter(i => !i.sold).length}개 남음)</h4>
                <div style={{ display: "grid", gap: 6 }}>
                  {aucItems.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: item.sold ? "rgba(100,130,255,0.02)" : "#f1f5f9", borderRadius: 10, border: `1px solid ${item.sold ? "#f1f5f9" : "#e2e8f0"}`, opacity: item.sold ? 0.5 : 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 24 }}>{item.emoji}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>시작가: {item.startPrice.toLocaleString()}원{item.sold ? " · 낙찰 완료" : ""}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {!item.sold && !aucActive && (
                          <button onClick={() => setAucActive({ itemIdx: idx, currentBid: item.startPrice, bidderId: null, bidderName: "없음" })} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #d97706, #f59e0b)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>경매 시작!</button>
                        )}
                        {!item.sold && !aucActive && (
                          <button onClick={() => setAucItems(aucItems.filter((_, i) => i !== idx))} style={{ padding: "8px 10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", cursor: "pointer" }}><Trash2 size={14} /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {aucActive && (
            <Card style={{ marginBottom: 16, border: "2px solid #fbbf24", background: "linear-gradient(160deg, #fffbeb, #fef3c7)" }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#d97706", fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>🔨 경매 진행 중</div>
                <div style={{ fontSize: 48, marginBottom: 6 }}>{aucItems[aucActive.itemIdx]?.emoji}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{aucItems[aucActive.itemIdx]?.name}</div>
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 20, justifyContent: "center" }}>
                <div style={{ background: "#fffbeb", borderRadius: 12, padding: "14px 24px", textAlign: "center", border: "1px solid #fde68a" }}>
                  <div style={{ fontSize: 11, color: "#d97706" }}>현재 입찰가</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#b45309" }}>{aucActive.currentBid.toLocaleString()}원</div>
                </div>
                <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "14px 24px", textAlign: "center", border: "1px solid #f0fdf4" }}>
                  <div style={{ fontSize: 11, color: "#16a34a" }}>최고 입찰자</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: aucActive.bidderId ? "#16a34a" : "#94a3b8" }}>{aucActive.bidderName}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6, marginBottom: 16 }}>
                {students.map(s => {
                  const nextBid = aucActive.currentBid + 100;
                  const canBid = s.cash >= nextBid;
                  const isHighest = s.id === aucActive.bidderId;
                  return (
                    <button key={s.id} disabled={!canBid || isHighest} onClick={() => {
                      setAucActive({ ...aucActive, currentBid: aucActive.currentBid + 100, bidderId: s.id, bidderName: s.name });
                    }} style={{ padding: "8px 10px", background: isHighest ? "#f0fdf4" : canBid ? "#eef2ff" : "rgba(100,130,255,0.02)", border: `1px solid ${isHighest ? "#86efac" : canBid ? "#e2e8f0" : "#f1f5f9"}`, borderRadius: 8, color: isHighest ? "#16a34a" : canBid ? "#1e293b" : "#cbd5e1", cursor: canBid && !isHighest ? "pointer" : "default", fontSize: 12, opacity: canBid ? 1 : 0.4, textAlign: "left" }}>
                      <div style={{ fontWeight: 600 }}>{s.emoji} {s.name}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>💰{s.cash.toLocaleString()}</div>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => {
                  if (!aucActive.bidderId) return;
                  const winner = students.find(s => s.id === aucActive.bidderId);
                  if (!winner || winner.cash < aucActive.currentBid) { alert("잔액 부족!"); return; }
                  setStudents(students.map(s => s.id === aucActive.bidderId ? { ...s, cash: s.cash - aucActive.currentBid } : s));
                  const updItems = [...aucItems]; updItems[aucActive.itemIdx] = { ...updItems[aucActive.itemIdx], sold: true };
                  setAucItems(updItems);
                  setAucHistory([{ item: aucItems[aucActive.itemIdx].name, emoji: aucItems[aucActive.itemIdx].emoji, winner: aucActive.bidderName, price: aucActive.currentBid, date: new Date().toLocaleString("ko-KR") }, ...aucHistory]);
                  setAucActive(null);
                }} disabled={!aucActive.bidderId} style={{ flex: 1, padding: 14, background: aucActive.bidderId ? "linear-gradient(135deg, #dc2626, #ef4444)" : "#f8fafc", border: "none", borderRadius: 10, color: "#fff", fontSize: 16, fontWeight: 800, cursor: aucActive.bidderId ? "pointer" : "default", opacity: aucActive.bidderId ? 1 : 0.4 }}>
                  🔨 낙찰! ({aucActive.currentBid.toLocaleString()}원)
                </button>
                <button onClick={() => setAucActive(null)} style={{ padding: "14px 20px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 10, color: "#64748b", cursor: "pointer", fontSize: 13 }}>취소</button>
              </div>
            </Card>
          )}

          {aucHistory.length > 0 && (
            <Card>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>🏆 경매 결과</h3>
              {aucHistory.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid #e8ecf4", fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{h.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>{h.item}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{h.date}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "#b45309" }}>{h.price.toLocaleString()}원</div>
                    <div style={{ fontSize: 11, color: "#16a34a" }}>🏆 {h.winner}</div>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {sub === "report" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>🖨️ 주간 보고서 출력</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>학생 개인별 주간 보고서를 인쇄용으로 생성합니다. A4 용지에 2명씩 출력됩니다.</p>
            <button onClick={() => setShowReport(true)} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg, #6366f1, #818cf8)", border: "none", borderRadius: 12, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Printer size={20} /> 전체 학생 보고서 미리보기 / 인쇄
            </button>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {students.map(s => {
              const h = s.history;
              const prev = h.length > 1 ? h[h.length - 2].price : h[0].price;
              const ch = s.stockPrice - prev;
              const pv = portfolioVal(s.portfolio, students);
              const rank = [...students].sort((a, b) => b.stockPrice - a.stockPrice).findIndex(x => x.id === s.id) + 1;
              return (
                <Card key={s.id} style={{ padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 24 }}>{s.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{s.company}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>CEO {s.name} · {rank}위</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
                    <div style={{ color: "#64748b" }}>주가</div>
                    <div style={{ textAlign: "right", fontWeight: 700, color: ch >= 0 ? "#16a34a" : "#dc2626" }}>{s.stockPrice.toLocaleString()}원 ({ch >= 0 ? "+" : ""}{ch})</div>
                    <div style={{ color: "#64748b" }}>현금</div>
                    <div style={{ textAlign: "right", fontWeight: 600 }}>{s.cash.toLocaleString()}원</div>
                    <div style={{ color: "#64748b" }}>총자산</div>
                    <div style={{ textAlign: "right", fontWeight: 600, color: "#7c3aed" }}>{(s.cash + pv).toLocaleString()}원</div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {showReport && <ReportOverlay onClose={() => setShowReport(false)} />}
    </div>
  );
}
