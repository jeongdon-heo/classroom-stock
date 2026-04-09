import { X } from "lucide-react";

export default function Modal({ onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(160deg, #161d35, #1a2240)", border: "1px solid rgba(120,140,255,0.15)", borderRadius: 16, padding: 24, maxWidth: 560, width: "100%", maxHeight: "85vh", overflow: "auto", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.08)", border: "none", color: "#aaa", cursor: "pointer", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
        {children}
      </div>
    </div>
  );
}
