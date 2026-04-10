import { X } from "lucide-react";

export default function Modal({ onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, maxWidth: 560, width: "100%", maxHeight: "85vh", overflow: "auto", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "#f1f5f9", border: "none", color: "#64748b", cursor: "pointer", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
        {children}
      </div>
    </div>
  );
}
