import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { BarChart3, ShoppingCart, Trophy, Settings, BookOpen, Gift, Receipt, Wallet } from "lucide-react";
import { batchGetDocs, saveDoc } from "./firebase";
import { AppContext } from "./context/AppContext";
import { SAMPLE_STUDENTS, DEFAULT_STOCK_PRICE, DEFAULT_CASH, GRADES, SALARY_RATE, DIVIDEND_RATE, MISSION_CASH, MAX_SHARES } from "./constants";
import { uid } from "./utils";
import useIsMobile from "./hooks/useIsMobile";
import Modal from "./components/Modal";

const Dashboard = lazy(() => import("./components/Dashboard"));
const Trade = lazy(() => import("./components/Trade"));
const Ranking = lazy(() => import("./components/Ranking"));
const Manual = lazy(() => import("./components/Manual"));
const Rewards = lazy(() => import("./components/Rewards"));
const Settlement = lazy(() => import("./components/Settlement"));
const Admin = lazy(() => import("./components/Admin"));
const Detail = lazy(() => import("./components/Detail"));
const StudentLogin = lazy(() => import("./components/StudentLogin"));
const MyAssets = lazy(() => import("./components/MyAssets"));

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
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
  const [preSettleSnap, setPreSettleSnap] = useState(null);
  const [myId, setMyIdState] = useState(() => {
    const v = localStorage.getItem("myStudentId");
    return v ? Number(v) : null;
  });
  const setMyId = useCallback((id) => {
    if (id === null || id === undefined) {
      localStorage.removeItem("myStudentId");
      setMyIdState(null);
    } else {
      localStorage.setItem("myStudentId", String(id));
      setMyIdState(Number(id));
    }
  }, []);

  const savingRef = useRef(0);
  const lastSaveAt = useRef(0);

  const save = useCallback(async (s, t, w, m, e, tl) => {
    savingRef.current++;
    try {
      const ops = [
        saveDoc("students", { data: JSON.stringify(s) }),
        saveDoc("txs", { data: JSON.stringify(t) }),
        saveDoc("meta", { w, m: m || "" }),
        saveDoc("evts", { data: JSON.stringify(e) }),
      ];
      if (tl !== undefined) ops.push(saveDoc("tickets", { data: JSON.stringify(tl) }));
      await Promise.all(ops);
      lastSaveAt.current = Date.now();
    } catch (err) { console.error("Firestore save error:", err); }
    finally { savingRef.current--; }
  }, []);

  function applyDocs(stu, tx, meta, evt, tkt, snap) {
    if (stu?.data) {
      setStudents(JSON.parse(stu.data));
      setTxs(tx?.data ? JSON.parse(tx.data) : []);
      if (meta) { setWeek(meta.w || 1); setMission(meta.m || ""); }
      setEvts(evt?.data ? JSON.parse(evt.data) : []);
      setTicketLog(tkt?.data ? JSON.parse(tkt.data) : []);
      setPreSettleSnap(snap?.data ? JSON.parse(snap.data) : null);
      return true;
    }
    return false;
  }

  useEffect(() => {
    (async () => {
      try {
        const docs = await batchGetDocs(["students", "txs", "meta", "evts", "tickets", "snapshot"]);
        if (!applyDocs(...docs)) resetLocal();
      } catch (err) {
        console.error("Firestore load error:", err);
        setLoadError(err.message || String(err));
      }
      setLoading(false);
    })();
  }, []);

  function resetLocal() {
    setStudents([]); setTxs([]); setWeek(1); setMission(""); setEvts([]); setTicketLog([]); setPreSettleSnap(null);
  }

  function loadSample() {
    const init = SAMPLE_STUDENTS.map(s => ({
      ...s, stockPrice: DEFAULT_STOCK_PRICE,
      history: [{ week: 0, price: DEFAULT_STOCK_PRICE, label: "시작" }],
      cash: DEFAULT_CASH, portfolio: [],
      tp: 0, mg: "", pv: 0, lastSalary: 0, lastBiz: 0, lastDividend: 0,
    }));
    setStudents(init); setTxs([]); setWeek(1); setMission("독서록 3편 작성하기"); setEvts([]); setTicketLog([]);
    save(init, [], 1, "독서록 3편 작성하기", [], []);
  }

  const persist = useCallback((s, t, w, m, e) => {
    setStudents(s); setTxs(t); setWeek(w); setMission(m); setEvts(e);
    save(s, t, w, m, e);
  }, [save]);

  const saveTickets = useCallback(async (tl) => {
    setTicketLog(tl);
    savingRef.current++;
    try {
      await saveDoc("tickets", { data: JSON.stringify(tl) });
      lastSaveAt.current = Date.now();
    } catch (err) { console.error("Ticket save error:", err); }
    finally { savingRef.current--; }
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

  async function saveSnapshot(snap) {
    setPreSettleSnap(snap);
    savingRef.current++;
    try {
      await saveDoc("snapshot", { data: snap ? JSON.stringify(snap) : "" });
      lastSaveAt.current = Date.now();
    } catch (err) { console.error("Snapshot save error:", err); }
    finally { savingRef.current--; }
  }

  function settle() {
    const snap = { students, txs, week, mission, evts, savedAt: new Date().toLocaleString("ko-KR") };
    saveSnapshot(snap);

    const n = students.length;
    const totalVotes = students.reduce((sum, s) => sum + (s.pv || 0), 0);
    const sorted = [...students].sort((a, b) => (b.pv || 0) - (a.pv || 0));
    const t30 = Math.max(1, Math.floor(n * 0.3));
    const b30 = Math.max(1, Math.floor(n * 0.3));

    const priceMap = new Map();
    for (const s of students) {
      const rank = sorted.findIndex(x => x.id === s.id);
      let pb = 100;
      if (totalVotes > 0) {
        if (rank < t30) pb = 400;
        else if (rank >= n - b30) pb = -100;
      }
      const mb = GRADES[s.mg] || 0;
      const total = (s.tp || 0) + mb + pb;
      priceMap.set(s.id, Math.max(100, s.stockPrice + total));
    }

    const up = students.map(s => {
      const np = priceMap.get(s.id);
      const salary = Math.round(np * SALARY_RATE);
      const bizIncome = MISSION_CASH[s.mg] || 0;
      const divDetails = s.portfolio.map(p => {
        const holdPrice = priceMap.get(p.cid) || 0;
        const perShare = Math.round(holdPrice * DIVIDEND_RATE);
        return { cid: p.cid, sh: p.sh, perShare, amount: perShare * p.sh };
      }).filter(d => d.amount > 0);
      const dividend = divDetails.reduce((sum, d) => sum + d.amount, 0);
      const newCash = s.cash + salary + bizIncome + dividend;
      return {
        ...s,
        stockPrice: np,
        cash: newCash,
        history: [...s.history, { week, price: np, label: `${week}주` }],
        tp: 0, mg: "", pv: 0,
        lastSalary: salary,
        lastBiz: bizIncome,
        lastDividend: dividend,
        lastDividendDetails: divDetails,
        lastSettleWeek: week,
      };
    });
    persist(up, txs, week + 1, "", evts);
  }

  function undoSettle() {
    if (!preSettleSnap) return false;
    const { students: s, txs: t, week: w, mission: m, evts: e } = preSettleSnap;
    persist(s, t, w, m, e);
    saveSnapshot(null);
    return true;
  }

  function resetAll() {
    if (!window.confirm("모든 데이터를 초기화합니까?")) return;
    try {
      resetLocal();
      save([], [], 1, "", [], []);
      saveDoc("snapshot", { data: "" }).catch(err => console.error("Snapshot reset error:", err));
      window.alert("초기화가 완료되었습니다!");
    } catch (err) { window.alert("초기화 오류: " + err.message); }
  }

  const isMobile = useIsMobile();
  const isAdmin = new URLSearchParams(window.location.search).has("admin");
  const me = myId != null ? students.find(s => s.id === myId) : null;

  useEffect(() => {
    if (myId != null && students.length > 0 && !students.find(s => s.id === myId)) {
      setMyId(null);
    }
  }, [students, myId, setMyId]);

  useEffect(() => {
    if (loading || loadError) return;
    const id = setInterval(async () => {
      if (savingRef.current > 0) return;
      if (Date.now() - lastSaveAt.current < 3000) return;
      try {
        const docs = await batchGetDocs(["students", "txs", "meta", "evts", "tickets", "snapshot"]);
        applyDocs(...docs);
      } catch (err) { console.debug("Poll error:", err.message); }
    }, 20000);
    return () => clearInterval(id);
  }, [loading, loadError]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0f4ff", color: "#1e293b", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 16 }}>📈</div><div style={{ fontSize: 18, color: "#6366f1", fontWeight: 600 }}>로딩중...</div></div>
    </div>
  );

  if (loadError) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0f4ff", color: "#1e293b", fontFamily: "'Noto Sans KR', sans-serif", padding: 20 }}>
      <div style={{ textAlign: "center", maxWidth: 440, background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#dc2626", marginBottom: 8 }}>데이터를 불러올 수 없어요</div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14, lineHeight: 1.5 }}>
          네트워크 연결을 확인해주세요. 서버에 접속하지 못한 상태에서 앱을 사용하면 다른 기기의 데이터를 잃을 수 있어 일단 멈춰둡니다.
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8", background: "#f8fafc", borderRadius: 8, padding: 10, marginBottom: 16, wordBreak: "break-all", textAlign: "left" }}>
          {loadError}
        </div>
        <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          다시 시도
        </button>
      </div>
    </div>
  );

  const tabs = [
    { id: "dashboard", label: "대시보드", icon: <BarChart3 size={18} /> },
    { id: "trade", label: "거래소", icon: <ShoppingCart size={18} /> },
    ...(!isAdmin ? [{ id: "myassets", label: "내 자산", icon: <Wallet size={18} /> }] : []),
    { id: "settlement", label: "정산결과", icon: <Receipt size={18} /> },
    { id: "ranking", label: "순위표", icon: <Trophy size={18} /> },
    { id: "manual", label: "매뉴얼", icon: <BookOpen size={18} /> },
    { id: "rewards", label: "주주총회", icon: <Gift size={18} /> },
    ...(isAdmin ? [{ id: "admin", label: "관리자", icon: <Settings size={18} /> }] : []),
  ];

  const ctx = {
    students, setStudents: s => persist(s, txs, week, mission, evts),
    txs, week, mission, setMission: m => persist(students, txs, week, m, evts),
    evts, setEvts: e => persist(students, txs, week, mission, e),
    persist, portfolioVal, doTrade, settle, undoSettle, preSettleSnap, resetAll, loadSample,
    showAdd, setShowAdd, showReport, setShowReport,
    ticketLog, saveTickets, selStudent, setSelStudent,
    isMobile, myId, setMyId, isAdmin,
  };

  return (
    <AppContext.Provider value={ctx}>
    <div style={{ minHeight: "100vh", background: "#f0f4ff", color: "#1e293b", fontFamily: "'Noto Sans KR', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&family=Black+Han+Sans&display=swap" rel="stylesheet" />

      <header style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)", borderBottom: "1px solid #e2e8f0", padding: isMobile ? "10px 14px" : "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(99,102,241,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
          <div style={{ fontSize: isMobile ? 24 : 28 }}>🏢</div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 17 : 20, fontFamily: "'Black Han Sans', sans-serif", color: "#ffffff", letterSpacing: 1 }}>4-2 주식회사</h1>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>{week}주차 · {students.length}명</div>
          </div>
        </div>
        {!isAdmin && me ? (
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", fontSize: isMobile ? 11 : 12, color: "#ffffff", maxWidth: isMobile ? 150 : 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {me.emoji} {me.name}
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", fontSize: isMobile ? 11 : 12, color: "#ffffff", maxWidth: isMobile ? 150 : 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            📋 {mission || "미션 미설정"}
          </div>
        )}
      </header>

      {/* 데스크톱 상단 탭 */}
      <nav className="desktop-nav" style={{ display: "flex", gap: 2, padding: "10px 20px 0", background: "#ffffff", borderBottom: "1px solid #e8ecf4", overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: tab === t.id ? "#f0f0ff" : "transparent", border: "none", borderBottom: tab === t.id ? "2px solid #6366f1" : "2px solid transparent", color: tab === t.id ? "#6366f1" : "#94a3b8", cursor: "pointer", fontSize: 14, fontWeight: tab === t.id ? 600 : 400, borderRadius: "8px 8px 0 0", transition: "all 0.2s", whiteSpace: "nowrap" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      <main className="app-main" style={{ padding: isMobile ? "14px" : "20px", maxWidth: 1100, margin: "0 auto" }}>
        <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#6366f1", fontSize: 14 }}>불러오는 중...</div>}>
          {tab === "dashboard" && <Dashboard />}
          {tab === "trade" && <Trade />}
          {tab === "myassets" && !isAdmin && <MyAssets />}
          {tab === "settlement" && <Settlement />}
          {tab === "ranking" && <Ranking />}
          {tab === "manual" && <Manual />}
          {tab === "rewards" && <Rewards />}
          {tab === "admin" && isAdmin && <Admin />}
        </Suspense>
      </main>

      {/* 모바일 하단 탭바 */}
      <nav className="mobile-bottom-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.95)", borderTop: "1px solid #e8ecf4", backdropFilter: "blur(20px)", zIndex: 100, padding: "6px 0 env(safe-area-inset-bottom, 6px)", boxShadow: "0 -2px 8px rgba(0,0,0,0.05)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 0", background: "none", border: "none", color: tab === t.id ? "#6366f1" : "#94a3b8", cursor: "pointer", fontSize: 10, fontWeight: tab === t.id ? 700 : 400, transition: "color 0.2s" }}>
            <span style={{ transform: tab === t.id ? "scale(1.15)" : "scale(1)", transition: "transform 0.2s" }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {selStudent && <Modal onClose={() => setSelStudent(null)}><Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#6366f1" }}>불러오는 중...</div>}><Detail s={students.find(x => x.id === selStudent)} /></Suspense></Modal>}

      {!isAdmin && myId == null && students.length > 0 && (
        <Suspense fallback={null}>
          <StudentLogin students={students} onSelect={setMyId} />
        </Suspense>
      )}
    </div>
    </AppContext.Provider>
  );
}
