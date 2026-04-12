import { ExternalLink } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Manual() {
  const { isMobile } = useApp();
  const height = isMobile ? "calc(100vh - 220px)" : "calc(100vh - 200px)";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#4f46e5" }}>📖 학생용 매뉴얼</h3>
        <a href="/student-manual.html" target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#f0f0ff", border: "1px solid #c7d2fe", borderRadius: 8, color: "#6366f1", fontSize: 12, fontWeight: 500, textDecoration: "none" }}>
          <ExternalLink size={14} /> 새 창으로 열기
        </a>
      </div>
      <iframe src="/student-manual.html" title="학생용 매뉴얼"
        style={{ width: "100%", height, border: "1px solid #e8ecf4", borderRadius: 14, background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }} />
    </div>
  );
}
