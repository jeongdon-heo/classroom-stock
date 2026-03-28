import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Users, Award, Settings, BarChart3, ArrowUpRight, ArrowDownRight, ShoppingCart, DollarSign, Star, Zap, Trophy, Plus, Minus, ChevronRight, X, Check, AlertTriangle, Sparkles, Building2, PiggyBank, Megaphone, Vote, Target, Gift, RefreshCw, Trash2, Edit3, Save, Crown, Medal, GraduationCap, Printer, FileText } from "lucide-react";

const SAMPLE_STUDENTS = [
  { id: 1, name: "김도윤", company: "깔끔 주식회사", slogan: "교실 정리의 달인!", emoji: "🧹" },
  { id: 2, name: "이서연", company: "아이디어 랩", slogan: "창의력이 폭발하는 회사", emoji: "💡" },
  { id: 3, name: "박지호", company: "수학왕 컴퍼니", slogan: "문제 해결의 천재들", emoji: "🔢" },
  { id: 4, name: "최유나", company: "책벌레 기업", slogan: "독서로 세상을 바꾸자!", emoji: "📚" },
  { id: 5, name: "정민재", company: "스포츠 히어로즈", slogan: "운동으로 건강한 회사", emoji: "⚽" },
  { id: 6, name: "한수빈", company: "예술의 전당", slogan: "미술과 음악의 천국", emoji: "🎨" },
  { id: 7, name: "오태양", company: "과학 탐험대", slogan: "실험하고 발견하는 회사", emoji: "🔬" },
  { id: 8, name: "윤하은", company: "친절 주식회사", slogan: "따뜻한 말 한마디의 힘", emoji: "💖" },
];

const DEFAULT_STOCK_PRICE = 1000;
const DEFAULT_CASH = 10000;
const MAX_SHARES = 3;
const GRADES = { S: 500, A: 300, B: 100, "미완수": -100 };
const SALARY_RATE = 0.1; // CEO 급여: 주가의 10%
const MISSION_CASH = { S: 300, A: 200, B: 100, "미완수": 0 }; // 사업 수익: 미션 등급별 현금
const TICKET_VALUE = 100; // 행운권 1장 = 100원
const TICKET_REASONS = [
  { id: "morning", label: "아침활동", tickets: 1, emoji: "🌅" },
  { id: "reading", label: "독서록", tickets: 2, emoji: "📖" },
  { id: "mission1", label: "돌발미션 (쉬움)", tickets: 1, emoji: "⭐" },
  { id: "mission2", label: "돌발미션 (보통)", tickets: 2, emoji: "⭐⭐" },
  { id: "mission3", label: "돌발미션 (어려움)", tickets: 3, emoji: "⭐⭐⭐" },
  { id: "mission4", label: "돌발미션 (최고난도)", tickets: 5, emoji: "🌟" },
  { id: "custom", label: "기타 (직접 입력)", tickets: 0, emoji: "🎫" },
];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

export default function App() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [txs, setTxs] = useState([]);
  const [week, setWeek] = useState(1);
  const [mission, setMission] = useState("독서록 3편 작성하기");
  const [evts, setEvts] = useState([]);
  const [selStudent, setSelStudent] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [ticketLog, setTicketLog] = useState([]);

  const save = useCallback((s, t, w, m, e, tl) => {
    try {
      localStorage.setItem("s42-students", JSON.stringify(s));
      localStorage.setItem("s42-txs", JSON.stringify(t));
      localStorage.setItem("s42-meta", JSON.stringify({ w, m }));
      localStorage.setItem("s42-evts", JSON.stringify(e));
      if (tl !== undefined) localStorage.setItem("s42-tickets", JSON.stringify(tl));
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    try {
      const r = localStorage.getItem("s42-students");
      if (r) {
        setStudents(JSON.parse(r));
        const t = localStorage.getItem("s42-txs");
        setTxs(t ? JSON.parse(t) : []);
        const m = localStorage.getItem("s42-meta");
        if (m) { const d = JSON.parse(m); setWeek(d.w || 1); setMission(d.m || ""); }
        const e = localStorage.getItem("s42-evts");
        setEvts(e ? JSON.parse(e) : []);
        const tl = localStorage.getItem("s42-tickets");
        setTicketLog(tl ? JSON.parse(tl) : []);
      } else { initSample(); }
    } catch { initSample(); }
    setLoading(false);
  }, []);

  function initSample() {
    const init = SAMPLE_STUDENTS.map(s => ({
      ...s, stockPrice: DEFAULT_STOCK_PRICE,
      history: [{ week: 0, price: DEFAULT_STOCK_PRICE, label: "시작" }],
      cash: DEFAULT_CASH, portfolio: [],
      tp: 0, mg: "", pv: 0,
    }));
    setStudents(init);
    setTxs([]);
    setWeek(1);
    setMission("독서록 3편 작성하기");
    setEvts([]);
    setTicketLog([]);
    save(init, [], 1, "독서록 3편 작성하기", [], []);
  }

  const persist = useCallback((s, t, w, m, e) => {
    setStudents(s); setTxs(t); setWeek(w); setMission(m); setEvts(e);
    save(s, t, w, m, e);
  }, [save]);

  const saveTickets = useCallback((tl) => {
    setTicketLog(tl);
    try { localStorage.setItem("s42-tickets", JSON.stringify(tl)); } catch {}
  }, []);

  function portfolioVal(port, studs) {
    return port.reduce((sum, p) => { const c = studs.find(x => x.id === p.cid); return sum + (c ? c.stockPrice * p.sh : 0); }, 0);
  }

  function doTrade(bid, cid, type, sh) {
    const b = students.find(s => s.id === bid);
    const c = students.find(s => s.id === cid);
    if (!b || !c || bid === cid) return false;
    const price = c.stockPrice;
    const cost = price * sh;
    const ex = b.portfolio.find(p => p.cid === cid);

    if (type === "buy") {
      if (b.cash < cost) return false;
      if ((ex?.sh || 0) + sh > MAX_SHARES) return false;
      const up = students.map(s => {
        if (s.id !== bid) return s;
        const np = [...s.portfolio];
        const i = np.findIndex(p => p.cid === cid);
        if (i >= 0) { const o = np[i]; np[i] = { ...o, sh: o.sh + sh, ap: Math.round((o.ap * o.sh + price * sh) / (o.sh + sh)) }; }
        else np.push({ cid, sh, ap: price });
        return { ...s, cash: s.cash - cost, portfolio: np };
      });
      const tx = { id: uid(), date: new Date().toLocaleString("ko-KR"), wk: week, bid, cid, type: "buy", sh, price, bn: b.name, cn: c.company };
      persist(up, [tx, ...txs], week, mission, evts);
      return true;
    } else {
      if (!ex || ex.sh < sh) return false;
      const up = students.map(s => {
        if (s.id !== bid) return s;
        const np = s.portfolio.map(p => p.cid === cid ? { ...p, sh: p.sh - sh } : p).filter(p => p.sh > 0);
        return { ...s, cash: s.cash + cost, portfolio: np };
      });
      const tx = { id: uid(), date: new Date().toLocaleString("ko-KR"), wk: week, bid, cid, type: "sell", sh, price, bn: b.name, cn: c.company };
      persist(up, [tx, ...txs], week, mission, evts);
      return true;
    }
  }

  function settle() {
    const n = students.length;
    const sorted = [...students].sort((a, b) => (b.pv || 0) - (a.pv || 0));
    const t30 = Math.max(1, Math.floor(n * 0.3));
    const b30 = Math.max(1, Math.floor(n * 0.3));
    const up = students.map(s => {
      const rank = sorted.findIndex(x => x.id === s.id);
      let pb = 100;
      if (rank < t30) pb = 400;
      else if (rank >= n - b30) pb = -100;
      const mb = GRADES[s.mg] || 0;
      const total = (s.tp || 0) + mb + pb;
      const np = Math.max(100, s.stockPrice + total);
      // CEO 수익: 급여(새 주가의 10%) + 사업 수익(미션 등급별)
      const salary = Math.round(np * SALARY_RATE);
      const bizIncome = MISSION_CASH[s.mg] || 0;
      const newCash = s.cash + salary + bizIncome;
      return { ...s, stockPrice: np, cash: newCash, history: [...s.history, { week, price: np, label: `${week}주` }], tp: 0, mg: "", pv: 0, lastSalary: salary, lastBiz: bizIncome };
    });
    persist(up, txs, week + 1, "", evts);
  }

  function resetAll() {
    if (!confirm("모든 데이터를 초기화합니까?")) return;
    initSample();
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a0e1a", color: "#f0f0f0", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 16 }}>📈</div><div style={{ fontSize: 18, opacity: 0.8 }}>로딩중...</div></div>
    </div>
  );

  const tabs = [
    { id: "dashboard", label: "대시보드", icon: <BarChart3 size={18} /> },
    { id: "trade", label: "거래소", icon: <ShoppingCart size={18} /> },
    { id: "ranking", label: "순위표", icon: <Trophy size={18} /> },
    { id: "admin", label: "관리자", icon: <Settings size={18} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0e1a 0%, #121832 50%, #0d1525 100%)", color: "#e8eaf6", fontFamily: "'Noto Sans KR', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&family=Black+Han+Sans&display=swap" rel="stylesheet" />

      <header style={{ background: "linear-gradient(90deg, rgba(30,60,180,0.3), rgba(120,40,200,0.2), rgba(30,60,180,0.3))", borderBottom: "1px solid rgba(120,140,255,0.15)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 28 }}>🏢</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontFamily: "'Black Han Sans', sans-serif", background: "linear-gradient(90deg, #7c9eff, #b388ff, #82b1ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 1 }}>4-2 주식회사</h1>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 1 }}>{week}주차 · {students.length}명</div>
          </div>
        </div>
        <div style={{ background: "rgba(100,255,150,0.08)", border: "1px solid rgba(100,255,150,0.15)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#80ffaa", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          📋 {mission || "미션 미설정"}
        </div>
      </header>

      <nav style={{ display: "flex", gap: 2, padding: "10px 20px 0", borderBottom: "1px solid rgba(120,140,255,0.08)", overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: tab === t.id ? "rgba(100,130,255,0.15)" : "transparent", border: "none", borderBottom: tab === t.id ? "2px solid #7c9eff" : "2px solid transparent", color: tab === t.id ? "#9cb8ff" : "rgba(200,210,240,0.5)", cursor: "pointer", fontSize: 14, fontWeight: tab === t.id ? 600 : 400, borderRadius: "8px 8px 0 0", transition: "all 0.2s", whiteSpace: "nowrap" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      <main style={{ padding: "20px", maxWidth: 1100, margin: "0 auto" }}>
        {tab === "dashboard" && <Dashboard students={students} txs={txs} week={week} onSel={setSelStudent} portfolioVal={portfolioVal} />}
        {tab === "trade" && <Trade students={students} doTrade={doTrade} txs={txs} />}
        {tab === "ranking" && <Ranking students={students} portfolioVal={portfolioVal} />}
        {tab === "admin" && <Admin students={students} setStudents={s => persist(s, txs, week, mission, evts)} week={week} mission={mission} setMission={m => persist(students, txs, week, m, evts)} evts={evts} setEvts={e => persist(students, txs, week, mission, e)} settle={settle} resetAll={resetAll} showAdd={showAdd} setShowAdd={setShowAdd} persist={persist} txs={txs} showReport={showReport} setShowReport={setShowReport} portfolioVal={portfolioVal} ticketLog={ticketLog} saveTickets={saveTickets} />}
      </main>

      {selStudent && <Modal onClose={() => setSelStudent(null)}><Detail s={students.find(x => x.id === selStudent)} students={students} txs={txs} portfolioVal={portfolioVal} /></Modal>}
    </div>
  );
}

function Modal({ onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(160deg, #161d35, #1a2240)", border: "1px solid rgba(120,140,255,0.15)", borderRadius: 16, padding: 24, maxWidth: 560, width: "100%", maxHeight: "85vh", overflow: "auto", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.08)", border: "none", color: "#aaa", cursor: "pointer", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
        {children}
      </div>
    </div>
  );
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{ background: "linear-gradient(160deg, rgba(25,35,70,0.8), rgba(20,28,55,0.9))", border: "1px solid rgba(120,140,255,0.1)", borderRadius: 14, padding: 18, cursor: onClick ? "pointer" : "default", transition: "all 0.25s", ...style }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = "rgba(120,160,255,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.borderColor = "rgba(120,140,255,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}}>
      {children}
    </div>
  );
}

function Stat({ icon, label, value, color }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ color }}>{icon}</div>
        <span style={{ fontSize: 11, color: "#778" }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
    </Card>
  );
}

// ─── DASHBOARD ───
function Dashboard({ students, txs, week, onSel, portfolioVal }) {
  const sorted = [...students].sort((a, b) => b.stockPrice - a.stockPrice);
  const avg = Math.round(students.reduce((s, x) => s + x.stockPrice, 0) / (students.length || 1));
  const colors = ["#7c9eff", "#b388ff", "#80cbc4", "#ffab40", "#ff8a80", "#a5d6a7", "#f48fb1", "#81d4fa", "#ffe082", "#ce93d8"];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        <Stat icon={<Building2 size={18} />} label="상장 기업" value={`${students.length}개`} color="#7c9eff" />
        <Stat icon={<BarChart3 size={18} />} label="평균 주가" value={`${avg.toLocaleString()}원`} color="#b388ff" />
        <Stat icon={<TrendingUp size={18} />} label="총 거래" value={`${txs.length}건`} color="#80cbc4" />
        <Stat icon={<Zap size={18} />} label="현재 주차" value={`${week}주차`} color="#ffab40" />
      </div>

      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>📈 전체 주가 추이</h3>
        <div style={{ height: 200 }}>
          <ResponsiveContainer>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,140,255,0.08)" />
              <XAxis dataKey="label" type="category" allowDuplicatedCategory={false} tick={{ fill: "#666", fontSize: 11 }} />
              <YAxis tick={{ fill: "#666", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1a2240", border: "1px solid rgba(120,140,255,0.2)", borderRadius: 8, color: "#ddd", fontSize: 12 }} />
              {students.map((s, i) => (
                <Line key={s.id} data={s.history} dataKey="price" name={s.company} stroke={colors[i % colors.length]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>🏢 전체 종목</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
        {sorted.map((s, i) => {
          const h = s.history;
          const prev = h.length > 1 ? h[h.length - 2].price : h[0].price;
          const ch = s.stockPrice - prev;
          const pct = prev > 0 ? ((ch / prev) * 100).toFixed(1) : 0;
          const up = ch >= 0;
          return (
            <Card key={s.id} onClick={() => onSel(s.id)} style={{ position: "relative", overflow: "hidden" }}>
              {i < 3 && <div style={{ position: "absolute", top: 8, right: 10, fontSize: 10, background: i === 0 ? "rgba(255,215,0,0.15)" : "rgba(180,180,180,0.1)", color: i === 0 ? "#ffd700" : "#aaa", padding: "2px 8px", borderRadius: 10 }}>{["👑1위","🥈2위","🥉3위"][i]}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 28 }}>{s.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#e0e6ff" }}>{s.company}</div>
                  <div style={{ fontSize: 11, color: "#667" }}>CEO {s.name}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{s.stockPrice.toLocaleString()}</span>
                <span style={{ fontSize: 12, color: "#778" }}>원</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: up ? "#4cdf8b" : "#ff6b7a", display: "flex", alignItems: "center", gap: 2 }}>
                  {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {up ? "+" : ""}{ch} ({pct}%)
                </span>
              </div>
              <div style={{ height: 40 }}>
                <ResponsiveContainer>
                  <AreaChart data={h.slice(-8)}>
                    <defs><linearGradient id={`g${s.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={up ? "#4cdf8b" : "#ff6b7a"} stopOpacity={0.3} /><stop offset="100%" stopColor={up ? "#4cdf8b" : "#ff6b7a"} stopOpacity={0} /></linearGradient></defs>
                    <Area dataKey="price" stroke={up ? "#4cdf8b" : "#ff6b7a"} fill={`url(#g${s.id})`} strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── DETAIL ───
function Detail({ s, students, txs, portfolioVal }) {
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

// ─── TRADE ───
const ss = { display: "block", fontSize: 12, color: "#778", marginBottom: 4, marginTop: 10 };
const si = { width: "100%", padding: "10px 12px", background: "rgba(100,130,255,0.05)", border: "1px solid rgba(120,140,255,0.15)", borderRadius: 10, color: "#e0e6ff", fontSize: 13, outline: "none", boxSizing: "border-box" };

function Trade({ students, doTrade, txs }) {
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
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
        <div style={{ maxHeight: 450, overflow: "auto" }}>
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

const qb = { background: "rgba(100,130,255,0.1)", border: "1px solid rgba(120,140,255,0.2)", borderRadius: 8, color: "#9cb8ff", cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" };

// ─── RANKING ───
function Ranking({ students, portfolioVal }) {
  const [mode, setMode] = useState("stock");
  const getVal = (s) => mode === "stock" ? s.stockPrice : s.cash + portfolioVal(s.portfolio, students);
  const sorted = [...students].sort((a, b) => getVal(b) - getVal(a));
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["stock", "📈 주가 순위"], ["assets", "💰 총자산 순위"]].map(([m, l]) => (
          <button key={m} onClick={() => setMode(m)} style={{ padding: "10px 20px", background: mode === m ? "rgba(100,130,255,0.15)" : "rgba(100,130,255,0.04)", border: `1px solid ${mode === m ? "rgba(120,160,255,0.3)" : "rgba(120,140,255,0.1)"}`, borderRadius: 10, color: mode === m ? "#9cb8ff" : "#778", cursor: "pointer", fontSize: 14, fontWeight: mode === m ? 600 : 400 }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 12, marginBottom: 24, alignItems: "end" }}>
        {[sorted[1], sorted[0], sorted[2]].map((s, i) => {
          if (!s) return <div key={i} />;
          const rk = i === 1 ? 0 : i === 0 ? 1 : 2;
          const hs = [130, 170, 110];
          return (
            <Card key={s.id} style={{ textAlign: "center", minHeight: hs[i], display: "flex", flexDirection: "column", justifyContent: "center", background: rk === 0 ? "linear-gradient(160deg, rgba(255,215,0,0.08), rgba(255,180,0,0.04))" : undefined, borderColor: rk === 0 ? "rgba(255,215,0,0.2)" : undefined }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>{medals[rk]}</div>
              <div style={{ fontSize: 30, marginBottom: 6 }}>{s.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#e0e6ff" }}>{s.company}</div>
              <div style={{ fontSize: 11, color: "#778", marginBottom: 8 }}>{s.name}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: rk === 0 ? "#ffd740" : "#9cb8ff" }}>{getVal(s).toLocaleString()}원</div>
            </Card>
          );
        })}
      </div>

      {sorted.slice(3).map((s, i) => (
        <Card key={s.id} style={{ marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#556", width: 26 }}>{i + 4}</span>
            <span style={{ fontSize: 22 }}>{s.emoji}</span>
            <div><div style={{ fontWeight: 600, fontSize: 13, color: "#ccd" }}>{s.company}</div><div style={{ fontSize: 11, color: "#556" }}>{s.name}</div></div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{getVal(s).toLocaleString()}원</div>
        </Card>
      ))}

      <Card style={{ marginTop: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>📊 비교 차트</h3>
        <div style={{ height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={sorted.map(s => ({ name: s.name, value: getVal(s) }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,140,255,0.08)" />
              <XAxis type="number" tick={{ fill: "#666", fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#aab", fontSize: 12 }} width={48} />
              <Tooltip contentStyle={{ background: "#1a2240", border: "1px solid rgba(120,140,255,0.2)", borderRadius: 8, color: "#ddd", fontSize: 12 }} />
              <Bar dataKey="value" fill="#7c9eff" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

// ─── ADMIN ───
const sb = { padding: "4px 10px", background: "rgba(100,130,255,0.06)", border: "1px solid rgba(120,140,255,0.1)", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 };

function Admin({ students, setStudents, week, mission, setMission, evts, setEvts, settle, resetAll, showAdd, setShowAdd, persist, txs, showReport, setShowReport, portfolioVal, ticketLog, saveTickets }) {
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
  // 경매
  const [aucItems, setAucItems] = useState([]);
  const [aucActive, setAucActive] = useState(null); // { itemIdx, currentBid, bidderId, bidderName }
  const [aucHistory, setAucHistory] = useState([]);
  const [aucNewName, setAucNewName] = useState("");
  const [aucNewEmoji, setAucNewEmoji] = useState("🍫");
  const [aucNewStart, setAucNewStart] = useState(500);

  const giveTicket = (studentId, reasonId, choice) => {
    const reason = TICKET_REASONS.find(r => r.id === reasonId);
    if (!reason) return;
    const count = reasonId === "custom" ? tkCustomCount : reason.tickets;
    const cashAmount = count * TICKET_VALUE;
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    if (choice === "cash") {
      setStudents(students.map(s => s.id === studentId ? { ...s, cash: s.cash + cashAmount } : s));
    }
    // 실물 선택 시 현금 변동 없음 (실물 행운권 지급)

    const log = {
      id: uid(),
      studentId,
      studentName: student.name,
      reason: reason.label,
      emoji: reason.emoji,
      tickets: count,
      choice, // "cash" or "physical"
      cashAmount: choice === "cash" ? cashAmount : 0,
      week,
      date: new Date().toLocaleString("ko-KR"),
    };
    saveTickets([log, ...ticketLog]);
    setTkMsg({ name: student.name, tickets: count, choice, cash: cashAmount });
    setTimeout(() => setTkMsg(null), 3000);
  };

  const addS = () => {
    if (!nn || !nc) return;
    setStudents([...students, { id: Date.now(), name: nn, company: nc, slogan: ns || "열심히!", emoji: ne, stockPrice: 1000, history: [{ week: Math.max(0, week - 1), price: 1000, label: "시작" }], cash: 10000, portfolio: [], tp: 0, mg: "", pv: 0 }]);
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
    { id: "ticket", label: "행운권", icon: <Gift size={15} /> },
    { id: "points", label: "포인트", icon: <Star size={15} /> },
    { id: "mission", label: "미션", icon: <Target size={15} /> },
    { id: "vote", label: "투표", icon: <Vote size={15} /> },
    { id: "event", label: "이벤트", icon: <Zap size={15} /> },
    { id: "manage", label: "학생관리", icon: <Users size={15} /> },
    { id: "settle", label: "정산", icon: <RefreshCw size={15} /> },
    { id: "auction", label: "🔨경매", icon: <Award size={15} /> },
    { id: "report", label: "보고서", icon: <Printer size={15} /> },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {subs.map(t => (
          <button key={t.id} onClick={() => setSub(t.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", background: sub === t.id ? "rgba(100,130,255,0.15)" : "rgba(100,130,255,0.03)", border: `1px solid ${sub === t.id ? "rgba(120,160,255,0.3)" : "rgba(120,140,255,0.08)"}`, borderRadius: 10, color: sub === t.id ? "#9cb8ff" : "#667", cursor: "pointer", fontSize: 13, fontWeight: sub === t.id ? 600 : 400 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {sub === "ticket" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>🎫 행운권 지급</h3>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#667" }}>학생이 실물 행운권 또는 가상 화폐(1장 = {TICKET_VALUE}원) 중 선택합니다.</p>

            {tkMsg && (
              <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 14, background: tkMsg.choice === "cash" ? "rgba(76,223,139,0.1)" : "rgba(179,136,255,0.1)", border: `1px solid ${tkMsg.choice === "cash" ? "rgba(76,223,139,0.3)" : "rgba(179,136,255,0.3)"}`, color: tkMsg.choice === "cash" ? "#4cdf8b" : "#b388ff", fontSize: 13 }}>
                ✅ {tkMsg.name}에게 행운권 {tkMsg.tickets}장 → {tkMsg.choice === "cash" ? `가상 화폐 +${tkMsg.cash.toLocaleString()}원 전환 완료!` : "실물 행운권 지급 완료!"}
              </div>
            )}

            {/* 사유 선택 */}
            <label style={ss}>지급 사유</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {TICKET_REASONS.map(r => (
                <button key={r.id} onClick={() => setTkReason(r.id)} style={{ padding: "8px 14px", background: tkReason === r.id ? "rgba(255,171,64,0.15)" : "rgba(100,130,255,0.04)", border: `1px solid ${tkReason === r.id ? "rgba(255,171,64,0.4)" : "rgba(120,140,255,0.08)"}`, borderRadius: 10, color: tkReason === r.id ? "#ffab40" : "#778", cursor: "pointer", fontSize: 12, fontWeight: tkReason === r.id ? 700 : 400 }}>
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
                  <span style={{ fontSize: 12, color: "#778" }}>장 = {(tkCustomCount * TICKET_VALUE).toLocaleString()}원</span>
                </div>
              </div>
            )}

            {/* 학생 목록 - 각 학생에 실물/가상화폐 버튼 */}
            <div style={{ display: "grid", gap: 6 }}>
              {students.map(s => {
                const reason = TICKET_REASONS.find(r => r.id === tkReason);
                const count = tkReason === "custom" ? tkCustomCount : (reason?.tickets || 0);
                const cashVal = count * TICKET_VALUE;
                // 이번 주 이 학생의 행운권 내역
                const weekLogs = ticketLog.filter(l => l.studentId === s.id && l.week === week);
                const weekTotal = weekLogs.reduce((sum, l) => sum + l.tickets, 0);
                const weekCash = weekLogs.filter(l => l.choice === "cash").reduce((sum, l) => sum + l.cashAmount, 0);
                const weekPhysical = weekLogs.filter(l => l.choice === "physical").reduce((sum, l) => sum + l.tickets, 0);

                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(100,130,255,0.04)", borderRadius: 10, border: "1px solid rgba(120,140,255,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 140 }}>
                      <span style={{ fontSize: 20 }}>{s.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#ccd" }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: "#556" }}>
                          이번 주: {weekTotal > 0 ? `${weekTotal}장` : "-"}
                          {weekCash > 0 ? ` (💰${weekCash.toLocaleString()})` : ""}
                          {weekPhysical > 0 ? ` (🎫${weekPhysical}장)` : ""}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: "#ffab40", fontWeight: 600, marginRight: 4 }}>{count}장</span>
                      <button onClick={() => giveTicket(s.id, tkReason, "cash")} style={{ padding: "6px 12px", background: "rgba(76,223,139,0.1)", border: "1px solid rgba(76,223,139,0.25)", borderRadius: 8, color: "#4cdf8b", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                        💰 가상화폐 (+{cashVal.toLocaleString()}원)
                      </button>
                      <button onClick={() => giveTicket(s.id, tkReason, "physical")} style={{ padding: "6px 12px", background: "rgba(179,136,255,0.1)", border: "1px solid rgba(179,136,255,0.25)", borderRadius: 8, color: "#b388ff", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                        🎫 실물 행운권
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 행운권 기록 */}
          {ticketLog.length > 0 && (
            <Card>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>📋 행운권 지급 기록</h3>
              <div style={{ maxHeight: 300, overflow: "auto" }}>
                {ticketLog.slice(0, 30).map(l => (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderBottom: "1px solid rgba(120,140,255,0.06)", fontSize: 12 }}>
                    <div>
                      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: l.choice === "cash" ? "rgba(76,223,139,0.1)" : "rgba(179,136,255,0.1)", color: l.choice === "cash" ? "#4cdf8b" : "#b388ff", marginRight: 6 }}>
                        {l.choice === "cash" ? "💰 가상화폐" : "🎫 실물"}
                      </span>
                      <span style={{ color: "#ccd" }}>{l.studentName}</span>
                      <span style={{ color: "#556", margin: "0 4px" }}>·</span>
                      <span style={{ color: "#9cb8ff" }}>{l.emoji} {l.reason}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 600 }}>{l.tickets}장</span>
                      {l.choice === "cash" && <span style={{ color: "#4cdf8b", marginLeft: 6 }}>+{l.cashAmount.toLocaleString()}원</span>}
                      <div style={{ fontSize: 10, color: "#556" }}>{l.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {sub === "points" && (
        <Card>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>⭐ 선생님 포인트</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#667" }}>수업 태도, 과제, 생활 평가 (최대 +300/-200)</p>
          <div style={{ display: "grid", gap: 6 }}>
            {students.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(100,130,255,0.04)", borderRadius: 10, border: "1px solid rgba(120,140,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{s.emoji}</span>
                  <div><div style={{ fontWeight: 600, fontSize: 13, color: "#ccd" }}>{s.name}</div><div style={{ fontSize: 11, color: "#556" }}>{s.company}</div></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => upPts(s.id, -100)} style={{ ...sb, color: "#ff6b7a" }}>-100</button>
                  <button onClick={() => upPts(s.id, -50)} style={{ ...sb, color: "#ffab40" }}>-50</button>
                  <span style={{ fontWeight: 800, fontSize: 16, minWidth: 50, textAlign: "center", color: (s.tp || 0) >= 0 ? "#4cdf8b" : "#ff6b7a" }}>
                    {(s.tp || 0) >= 0 ? "+" : ""}{s.tp || 0}
                  </span>
                  <button onClick={() => upPts(s.id, 50)} style={{ ...sb, color: "#80cbc4" }}>+50</button>
                  <button onClick={() => upPts(s.id, 100)} style={{ ...sb, color: "#4cdf8b" }}>+100</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {sub === "mission" && (
        <Card>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>🎯 주간 미션</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#667" }}>S(+500) / A(+300) / B(+100) / 미완수(-100)</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={nm} onChange={e => setNm(e.target.value)} placeholder="미션 입력" style={{ ...si, flex: 1 }} />
            <button onClick={() => setMission(nm)} style={{ padding: "10px 20px", background: "linear-gradient(135deg, #1565c0, #1976d2)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>설정</button>
          </div>
          <div style={{ background: "rgba(255,171,64,0.08)", borderRadius: 10, padding: 12, marginBottom: 16, border: "1px solid rgba(255,171,64,0.15)" }}>
            <div style={{ fontSize: 12, color: "#ffab40" }}>현재 미션</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{mission || "미설정"}</div>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {students.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(100,130,255,0.04)", borderRadius: 10, border: "1px solid rgba(120,140,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>{s.emoji}</span><span style={{ fontWeight: 600, fontSize: 13, color: "#ccd" }}>{s.name}</span></div>
                <div style={{ display: "flex", gap: 4 }}>
                  {Object.keys(GRADES).map(g => (
                    <button key={g} onClick={() => setGrade(s.id, g)} style={{ padding: "6px 12px", background: s.mg === g ? (GRADES[g] > 0 ? "rgba(76,223,139,0.15)" : "rgba(255,107,122,0.15)") : "rgba(100,130,255,0.05)", border: `1px solid ${s.mg === g ? (GRADES[g] > 0 ? "rgba(76,223,139,0.3)" : "rgba(255,107,122,0.3)") : "rgba(120,140,255,0.1)"}`, borderRadius: 8, color: s.mg === g ? (GRADES[g] > 0 ? "#4cdf8b" : "#ff6b7a") : "#778", cursor: "pointer", fontSize: 12, fontWeight: s.mg === g ? 700 : 400 }}>{g}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {sub === "vote" && (
        <Card>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>🗳️ 친구 평가</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#667" }}>상위 30%: +400 / 중위: +100 / 하위 30%: -100</p>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button onClick={resetVotes} style={{ padding: "6px 14px", background: "rgba(255,107,122,0.1)", border: "1px solid rgba(255,107,122,0.2)", borderRadius: 8, color: "#ff6b7a", cursor: "pointer", fontSize: 12 }}>초기화</button>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {[...students].sort((a, b) => (b.pv || 0) - (a.pv || 0)).map((s, i) => {
              const tot = students.reduce((sum, x) => sum + (x.pv || 0), 0);
              const pct = tot > 0 ? ((s.pv || 0) / tot * 100).toFixed(0) : 0;
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(100,130,255,0.04)", borderRadius: 10, position: "relative", overflow: "hidden", border: "1px solid rgba(120,140,255,0.06)" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: "rgba(124,158,255,0.06)", transition: "width 0.3s" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#556", width: 20 }}>{i + 1}</span>
                    <span style={{ fontSize: 20 }}>{s.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "#ccd" }}>{s.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
                    <span style={{ fontWeight: 800, fontSize: 16, color: "#9cb8ff" }}>{s.pv || 0}표</span>
                    <button onClick={() => addVote(s.id)} style={{ padding: "6px 14px", background: "rgba(100,130,255,0.1)", border: "1px solid rgba(120,160,255,0.2)", borderRadius: 8, color: "#9cb8ff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+1표</button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {sub === "event" && (
        <Card>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>⚡ 특별 이벤트</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#667" }}>깜짝 호재/악재 → 선생님 포인트 반영</p>
          <input value={ed} onChange={e => setEd(e.target.value)} placeholder="이벤트 설명 (예: 청소 우수 보너스!)" style={{ ...si, marginBottom: 10 }} />
          <label style={ss}>대상 선택</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
            <button onClick={() => setEt(students.map(s => s.id))} style={{ padding: "4px 10px", background: "rgba(100,130,255,0.1)", border: "1px solid rgba(120,160,255,0.2)", borderRadius: 6, color: "#9cb8ff", cursor: "pointer", fontSize: 11 }}>전체</button>
            {students.map(s => (
              <button key={s.id} onClick={() => setEt(p => p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id])} style={{ padding: "4px 10px", background: et.includes(s.id) ? "rgba(76,223,139,0.12)" : "rgba(100,130,255,0.04)", border: `1px solid ${et.includes(s.id) ? "rgba(76,223,139,0.3)" : "rgba(120,140,255,0.08)"}`, borderRadius: 6, color: et.includes(s.id) ? "#4cdf8b" : "#778", cursor: "pointer", fontSize: 11 }}>{s.emoji} {s.name}</button>
            ))}
          </div>
          <label style={ss}>포인트</label>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[-200, -100, 100, 150, 200, 300].map(v => (
              <button key={v} onClick={() => setEa(v)} style={{ padding: "6px 12px", background: ea === v ? "rgba(100,130,255,0.15)" : "rgba(100,130,255,0.04)", border: `1px solid ${ea === v ? "rgba(120,160,255,0.3)" : "rgba(120,140,255,0.08)"}`, borderRadius: 8, color: ea === v ? (v > 0 ? "#4cdf8b" : "#ff6b7a") : "#778", cursor: "pointer", fontSize: 13, fontWeight: ea === v ? 700 : 400 }}>{v > 0 ? "+" : ""}{v}</button>
            ))}
          </div>
          <button onClick={fireEvt} style={{ width: "100%", padding: 14, background: "linear-gradient(135deg, #f57c00, #ff9800)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>⚡ 이벤트 발동!</button>
          {evts.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#778" }}>히스토리</h4>
              {evts.slice(0, 10).map(e => (
                <div key={e.id} style={{ padding: "6px 0", borderBottom: "1px solid rgba(120,140,255,0.05)", fontSize: 12, color: "#aab" }}>
                  <span style={{ color: e.amt > 0 ? "#4cdf8b" : "#ff6b7a", fontWeight: 600 }}>{e.amt > 0 ? "+" : ""}{e.amt}</span> {e.desc} → {e.who}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {sub === "manage" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>👥 학생 관리</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowBulk(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", background: "rgba(179,136,255,0.1)", border: "1px solid rgba(179,136,255,0.2)", borderRadius: 8, color: "#b388ff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}><Users size={14} /> 일괄 등록</button>
              <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", background: "rgba(76,223,139,0.1)", border: "1px solid rgba(76,223,139,0.2)", borderRadius: 8, color: "#4cdf8b", cursor: "pointer", fontSize: 12, fontWeight: 600 }}><Plus size={14} /> 개별 추가</button>
              <button onClick={resetAll} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", background: "rgba(255,107,122,0.1)", border: "1px solid rgba(255,107,122,0.2)", borderRadius: 8, color: "#ff6b7a", cursor: "pointer", fontSize: 12 }}><Trash2 size={14} /> 초기화</button>
            </div>
          </div>

          {/* 일괄 등록 */}
          {showBulk && (
            <div style={{ background: "rgba(179,136,255,0.05)", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid rgba(179,136,255,0.15)" }}>
              <h4 style={{ margin: "0 0 4px", fontSize: 14, color: "#b388ff" }}>📋 학생 일괄 등록</h4>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#667" }}>학생 이름을 한 줄에 하나씩 입력하세요. 회사 이름과 슬로건은 자동 생성되며, 나중에 학생들이 정하면 수정할 수 있습니다.</p>
              <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} placeholder={"김도윤\n이서연\n박지호\n최유나\n정민재\n...\n\n(한 줄에 한 명씩)"} style={{ ...si, height: 180, resize: "vertical", fontFamily: "'Noto Sans KR', sans-serif", lineHeight: 1.8 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <span style={{ fontSize: 12, color: "#778" }}>
                  {bulkText.trim() ? `${bulkText.trim().split("\n").filter(l => l.trim()).length}명 감지됨` : "이름을 입력하세요"}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setShowBulk(false); setBulkText(""); }} style={{ padding: "8px 16px", background: "rgba(100,130,255,0.05)", border: "1px solid rgba(120,140,255,0.1)", borderRadius: 8, color: "#778", cursor: "pointer", fontSize: 13 }}>취소</button>
                  <button onClick={() => {
                    const names = bulkText.trim().split("\n").map(l => l.trim()).filter(l => l);
                    if (names.length === 0) return;
                    const emojis = ["🏢","💡","🔢","📚","⚽","🎨","🔬","💖","🌟","🎯","🚀","🎪","🌈","🎸","🏆","🌻","🐬","🦁","🎭","🍀","🔥","⭐","🎵","🌍","🦋","🎈","🏅","💎","🎮","🌺"];
                    const newStudents = names.map((name, i) => ({
                      id: Date.now() + i, name, company: `${name} 주식회사`, slogan: "열심히 하는 회사!",
                      emoji: emojis[i % emojis.length], stockPrice: DEFAULT_STOCK_PRICE,
                      history: [{ week: Math.max(0, week - 1), price: DEFAULT_STOCK_PRICE, label: "시작" }],
                      cash: DEFAULT_CASH, portfolio: [], tp: 0, mg: "", pv: 0,
                    }));
                    setStudents([...students, ...newStudents]);
                    setBulkText(""); setShowBulk(false);
                  }} style={{ padding: "8px 20px", background: "linear-gradient(135deg, #6a1b9a, #8e24aa)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                    일괄 등록하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 개별 추가 */}
          {showAdd && (
            <div style={{ background: "rgba(100,130,255,0.05)", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid rgba(120,140,255,0.1)" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#e0e6ff" }}>새 학생</h4>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div><label style={ss}>이모지</label><input value={ne} onChange={e => setNe(e.target.value)} style={{ ...si, textAlign: "center", fontSize: 20, padding: 6 }} /></div>
                <div><label style={ss}>이름</label><input value={nn} onChange={e => setNn(e.target.value)} placeholder="홍길동" style={si} /></div>
                <div><label style={ss}>회사명</label><input value={nc} onChange={e => setNc(e.target.value)} placeholder="미래 주식회사" style={si} /></div>
              </div>
              <label style={ss}>슬로건</label>
              <input value={ns} onChange={e => setNs(e.target.value)} placeholder="우리 회사는 ○○을 잘합니다!" style={{ ...si, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setShowAdd(false)} style={{ padding: "8px 16px", background: "rgba(100,130,255,0.05)", border: "1px solid rgba(120,140,255,0.1)", borderRadius: 8, color: "#778", cursor: "pointer", fontSize: 13 }}>취소</button>
                <button onClick={addS} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #1565c0, #1976d2)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>등록</button>
              </div>
            </div>
          )}

          {/* 학생 목록 - 인라인 편집 */}
          <div style={{ fontSize: 12, color: "#556", marginBottom: 8 }}>💡 회사 이름과 슬로건은 클릭해서 바로 수정할 수 있습니다. 이모지도 변경 가능해요.</div>
          <div style={{ display: "grid", gap: 6 }}>
            {students.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(100,130,255,0.04)", borderRadius: 10, border: "1px solid rgba(120,140,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                  <input value={s.emoji} onChange={e => setStudents(students.map(x => x.id === s.id ? { ...x, emoji: e.target.value } : x))} style={{ width: 36, fontSize: 20, background: "transparent", border: "1px solid transparent", borderRadius: 6, textAlign: "center", cursor: "pointer", padding: 2, color: "#fff" }} onFocus={e => e.target.style.borderColor = "rgba(120,160,255,0.3)"} onBlur={e => e.target.style.borderColor = "transparent"} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: "#ccd" }}>{s.name}</span>
                      <span style={{ color: "#556", fontSize: 12 }}>—</span>
                      <input value={s.company} onChange={e => setStudents(students.map(x => x.id === s.id ? { ...x, company: e.target.value } : x))} style={{ background: "transparent", border: "1px solid transparent", borderRadius: 4, color: "#9cb8ff", fontSize: 13, fontWeight: 600, padding: "1px 4px", flex: 1, maxWidth: 200 }} onFocus={e => e.target.style.borderColor = "rgba(120,160,255,0.3)"} onBlur={e => e.target.style.borderColor = "transparent"} />
                    </div>
                    <input value={s.slogan} onChange={e => setStudents(students.map(x => x.id === s.id ? { ...x, slogan: e.target.value } : x))} style={{ background: "transparent", border: "1px solid transparent", borderRadius: 4, color: "#556", fontSize: 11, padding: "1px 4px", width: "100%", maxWidth: 300 }} onFocus={e => e.target.style.borderColor = "rgba(120,160,255,0.3)"} onBlur={e => e.target.style.borderColor = "transparent"} placeholder="슬로건 입력..." />
                  </div>
                </div>
                <button onClick={() => { if (confirm(`${s.name} 삭제?`)) setStudents(students.filter(x => x.id !== s.id)); }} style={{ background: "rgba(255,107,122,0.1)", border: "1px solid rgba(255,107,122,0.15)", borderRadius: 6, color: "#ff6b7a", cursor: "pointer", padding: "4px 8px" }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {sub === "settle" && (
        <Card>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>📊 {week}주차 정산</h3>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#667" }}>포인트 + 미션 + 투표 → 주가 반영 / CEO 급여 + 사업 수익 → 현금 지급</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1, background: "rgba(255,171,64,0.08)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(255,171,64,0.15)" }}>
              <div style={{ fontSize: 11, color: "#ffab40", marginBottom: 2 }}>💰 CEO 급여</div>
              <div style={{ fontSize: 13, color: "#e0e6ff" }}>정산 후 주가의 <b>10%</b>를 현금으로 지급</div>
            </div>
            <div style={{ flex: 1, background: "rgba(76,223,139,0.06)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(76,223,139,0.12)" }}>
              <div style={{ fontSize: 11, color: "#4cdf8b", marginBottom: 2 }}>📦 사업 수익</div>
              <div style={{ fontSize: 13, color: "#e0e6ff" }}>미션 S: <b>300원</b> / A: <b>200원</b> / B: <b>100원</b></div>
            </div>
          </div>
          <div style={{ background: "rgba(100,130,255,0.04)", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid rgba(120,140,255,0.08)" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: 13, color: "#b388ff" }}>정산 미리보기</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr", gap: 4, fontSize: 10, color: "#778", marginBottom: 6, padding: "0 8px" }}>
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
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr", gap: 4, padding: "8px", borderBottom: "1px solid rgba(120,140,255,0.04)", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span>{s.emoji}</span><span style={{ fontSize: 12, color: "#ccd" }}>{s.name}</span></div>
                  <span style={{ textAlign: "center", fontSize: 11, color: (s.tp || 0) >= 0 ? "#4cdf8b" : "#ff6b7a" }}>{(s.tp || 0) >= 0 ? "+" : ""}{s.tp || 0}</span>
                  <span style={{ textAlign: "center", fontSize: 11, color: s.mg ? (mb >= 0 ? "#80cbc4" : "#ff6b7a") : "#556" }}>{s.mg || "-"}</span>
                  <span style={{ textAlign: "center", fontSize: 11, color: "#b388ff" }}>{s.pv || 0}표</span>
                  <span style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: tot >= 0 ? "#4cdf8b" : "#ff6b7a" }}>{tot >= 0 ? "+" : ""}{tot}</span>
                  <span style={{ textAlign: "center", fontSize: 11, color: "#ffab40" }}>+{salary}</span>
                  <span style={{ textAlign: "center", fontSize: 11, color: bizIncome > 0 ? "#4cdf8b" : "#556" }}>{bizIncome > 0 ? `+${bizIncome}` : "-"}</span>
                  <span style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#ffd740" }}>+{cashTotal}원</span>
                </div>
              );
            })}
          </div>
          <button onClick={settle} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg, #6a1b9a, #8e24aa)", border: "none", borderRadius: 12, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", letterSpacing: 1 }}>🔔 {week}주차 정산 실행!</button>
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "#667" }}>⚠️ 정산 후 되돌릴 수 없습니다</div>
        </Card>
      )}

      {sub === "auction" && (
        <div>
          {/* 경매 물품 등록 */}
          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>🔨 과자 경매</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#667" }}>학기말 주주총회 과자 경매! 학생들이 가상 화폐로 입찰합니다.</p>

            {/* 물품 추가 */}
            <div style={{ background: "rgba(100,130,255,0.04)", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid rgba(120,140,255,0.08)" }}>
              <h4 style={{ margin: "0 0 10px", fontSize: 13, color: "#b388ff" }}>경매 물품 등록</h4>
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
                }} style={{ padding: "10px 16px", background: "linear-gradient(135deg, #1565c0, #1976d2)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}>추가</button>
              </div>
            </div>

            {/* 등록된 물품 목록 */}
            {aucItems.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#778" }}>등록된 물품 ({aucItems.filter(i => !i.sold).length}개 남음)</h4>
                <div style={{ display: "grid", gap: 6 }}>
                  {aucItems.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: item.sold ? "rgba(100,130,255,0.02)" : "rgba(100,130,255,0.06)", borderRadius: 10, border: `1px solid ${item.sold ? "rgba(120,140,255,0.04)" : "rgba(120,140,255,0.1)"}`, opacity: item.sold ? 0.5 : 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 24 }}>{item.emoji}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#ccd" }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: "#556" }}>시작가: {item.startPrice.toLocaleString()}원{item.sold ? " · 낙찰 완료" : ""}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {!item.sold && !aucActive && (
                          <button onClick={() => setAucActive({ itemIdx: idx, currentBid: item.startPrice, bidderId: null, bidderName: "없음" })} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #f57c00, #ff9800)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>경매 시작!</button>
                        )}
                        {!item.sold && !aucActive && (
                          <button onClick={() => setAucItems(aucItems.filter((_, i) => i !== idx))} style={{ padding: "8px 10px", background: "rgba(255,107,122,0.1)", border: "1px solid rgba(255,107,122,0.2)", borderRadius: 8, color: "#ff6b7a", cursor: "pointer" }}><Trash2 size={14} /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* 진행 중인 경매 */}
          {aucActive && (
            <Card style={{ marginBottom: 16, border: "2px solid rgba(255,171,64,0.4)", background: "linear-gradient(160deg, rgba(40,30,20,0.9), rgba(30,25,50,0.9))" }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#ffab40", fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>🔨 경매 진행 중</div>
                <div style={{ fontSize: 48, marginBottom: 6 }}>{aucItems[aucActive.itemIdx]?.emoji}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{aucItems[aucActive.itemIdx]?.name}</div>
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 20, justifyContent: "center" }}>
                <div style={{ background: "rgba(255,171,64,0.1)", borderRadius: 12, padding: "14px 24px", textAlign: "center", border: "1px solid rgba(255,171,64,0.2)" }}>
                  <div style={{ fontSize: 11, color: "#ffab40" }}>현재 입찰가</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#ffd740" }}>{aucActive.currentBid.toLocaleString()}원</div>
                </div>
                <div style={{ background: "rgba(76,223,139,0.08)", borderRadius: 12, padding: "14px 24px", textAlign: "center", border: "1px solid rgba(76,223,139,0.15)" }}>
                  <div style={{ fontSize: 11, color: "#4cdf8b" }}>최고 입찰자</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: aucActive.bidderId ? "#4cdf8b" : "#556" }}>{aucActive.bidderName}</div>
                </div>
              </div>

              {/* 입찰 버튼 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6, marginBottom: 16 }}>
                {students.map(s => {
                  const nextBid = aucActive.currentBid + 100;
                  const canBid = s.cash >= nextBid;
                  const isHighest = s.id === aucActive.bidderId;
                  return (
                    <button key={s.id} disabled={!canBid || isHighest} onClick={() => {
                      setAucActive({ ...aucActive, currentBid: aucActive.currentBid + 100, bidderId: s.id, bidderName: s.name });
                    }} style={{ padding: "8px 10px", background: isHighest ? "rgba(76,223,139,0.15)" : canBid ? "rgba(100,130,255,0.08)" : "rgba(100,130,255,0.02)", border: `1px solid ${isHighest ? "rgba(76,223,139,0.3)" : canBid ? "rgba(120,140,255,0.15)" : "rgba(120,140,255,0.05)"}`, borderRadius: 8, color: isHighest ? "#4cdf8b" : canBid ? "#ccd" : "#445", cursor: canBid && !isHighest ? "pointer" : "default", fontSize: 12, opacity: canBid ? 1 : 0.4, textAlign: "left" }}>
                      <div style={{ fontWeight: 600 }}>{s.emoji} {s.name}</div>
                      <div style={{ fontSize: 10, color: "#778" }}>💰{s.cash.toLocaleString()}</div>
                    </button>
                  );
                })}
              </div>

              {/* +100 수동 올리기 / 낙찰 / 취소 */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => {
                  if (!aucActive.bidderId) return;
                  // 낙찰: 최고입찰자 현금 차감, 물품 sold 처리
                  const winner = students.find(s => s.id === aucActive.bidderId);
                  if (!winner || winner.cash < aucActive.currentBid) { alert("잔액 부족!"); return; }
                  setStudents(students.map(s => s.id === aucActive.bidderId ? { ...s, cash: s.cash - aucActive.currentBid } : s));
                  const updItems = [...aucItems]; updItems[aucActive.itemIdx] = { ...updItems[aucActive.itemIdx], sold: true };
                  setAucItems(updItems);
                  setAucHistory([{ item: aucItems[aucActive.itemIdx].name, emoji: aucItems[aucActive.itemIdx].emoji, winner: aucActive.bidderName, price: aucActive.currentBid, date: new Date().toLocaleString("ko-KR") }, ...aucHistory]);
                  setAucActive(null);
                }} disabled={!aucActive.bidderId} style={{ flex: 1, padding: 14, background: aucActive.bidderId ? "linear-gradient(135deg, #c62828, #e53935)" : "rgba(100,130,255,0.05)", border: "none", borderRadius: 10, color: "#fff", fontSize: 16, fontWeight: 800, cursor: aucActive.bidderId ? "pointer" : "default", opacity: aucActive.bidderId ? 1 : 0.4 }}>
                  🔨 낙찰! ({aucActive.currentBid.toLocaleString()}원)
                </button>
                <button onClick={() => setAucActive(null)} style={{ padding: "14px 20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "#aaa", cursor: "pointer", fontSize: 13 }}>취소</button>
              </div>
            </Card>
          )}

          {/* 경매 결과 */}
          {aucHistory.length > 0 && (
            <Card>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>🏆 경매 결과</h3>
              {aucHistory.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid rgba(120,140,255,0.06)", fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{h.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "#ccd" }}>{h.item}</div>
                      <div style={{ fontSize: 10, color: "#556" }}>{h.date}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "#ffd740" }}>{h.price.toLocaleString()}원</div>
                    <div style={{ fontSize: 11, color: "#4cdf8b" }}>🏆 {h.winner}</div>
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
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#9cb8ff" }}>🖨️ 주간 보고서 출력</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#667" }}>학생 개인별 주간 보고서를 인쇄용으로 생성합니다. A4 용지에 2명씩 출력됩니다.</p>
            <button onClick={() => setShowReport(true)} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg, #1565c0, #1976d2)", border: "none", borderRadius: 12, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Printer size={20} /> 전체 학생 보고서 미리보기 / 인쇄
            </button>
          </Card>

          {/* 미리보기 카드 */}
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
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#e0e6ff" }}>{s.company}</div>
                      <div style={{ fontSize: 11, color: "#667" }}>CEO {s.name} · {rank}위</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
                    <div style={{ color: "#778" }}>주가</div>
                    <div style={{ textAlign: "right", fontWeight: 700, color: ch >= 0 ? "#4cdf8b" : "#ff6b7a" }}>{s.stockPrice.toLocaleString()}원 ({ch >= 0 ? "+" : ""}{ch})</div>
                    <div style={{ color: "#778" }}>현금</div>
                    <div style={{ textAlign: "right", fontWeight: 600 }}>{s.cash.toLocaleString()}원</div>
                    <div style={{ color: "#778" }}>총자산</div>
                    <div style={{ textAlign: "right", fontWeight: 600, color: "#b388ff" }}>{(s.cash + pv).toLocaleString()}원</div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 보고서 인쇄 오버레이 */}
      {showReport && <ReportOverlay students={students} week={week} portfolioVal={portfolioVal} txs={txs} onClose={() => setShowReport(false)} />}
    </div>
  );
}

// ─── REPORT OVERLAY ───
function ReportOverlay({ students, week, portfolioVal, txs, onClose }) {
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

              {/* ── 헤더 ── */}
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

              {/* ── 순위 뱃지 줄 ── */}
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

              {/* ── 메인 2열 ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, flex: 1 }}>

                {/* 왼쪽 열 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* 주가 카드 */}
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

                  {/* 자산 테이블 */}
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr><th style={thS}>항목</th><th style={{ ...thS, textAlign: "right" }}>금액</th></tr></thead>
                    <tbody>
                      <tr><td style={tdS}>💵 보유 현금</td><td style={{ ...tdS, textAlign: "right", fontWeight: 700 }}>{s.cash.toLocaleString()}원</td></tr>
                      <tr><td style={tdS}>📊 보유 주식 가치</td><td style={{ ...tdS, textAlign: "right", fontWeight: 700 }}>{pv.toLocaleString()}원</td></tr>
                      <tr style={{ background: "#f0f5ff" }}><td style={{ ...tdS, fontWeight: 800, color: "#1a237e", fontSize: 15 }}>💰 총 자산</td><td style={{ ...tdS, textAlign: "right", fontWeight: 900, color: "#1a237e", fontSize: 18 }}>{totalAssets.toLocaleString()}원</td></tr>
                    </tbody>
                  </table>

                  {/* CEO 수익 */}
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

                {/* 오른쪽 열 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* 주가 추이 차트 */}
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

                  {/* 보유 주식 */}
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

                  {/* 최근 거래 내역 */}
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

              {/* ── 하단: 소감 영역 ── */}
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
