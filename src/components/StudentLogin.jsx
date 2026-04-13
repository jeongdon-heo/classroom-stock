export default function StudentLogin({ students, onSelect }) {
  const sorted = [...students].sort((a, b) => a.name.localeCompare(b.name, "ko"));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#ffffff", borderRadius: 20, maxWidth: 520, width: "100%", maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "22px 22px 14px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#ffffff", borderRadius: "20px 20px 0 0" }}>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Black Han Sans', sans-serif", letterSpacing: 1 }}>👋 누구세요?</div>
          <div style={{ fontSize: 12, marginTop: 4, color: "rgba(255,255,255,0.85)" }}>본인 이름을 선택하면 거래할 때 투자자가 자동으로 내 계정으로 고정됩니다.</div>
        </div>
        <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
          {sorted.map(s => (
            <button key={s.id} onClick={() => onSelect(s.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, cursor: "pointer", transition: "all 0.15s", textAlign: "left" }} onMouseEnter={e => { e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.borderColor = "#a5b4fc"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
              <span style={{ fontSize: 26 }}>{s.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.company}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
