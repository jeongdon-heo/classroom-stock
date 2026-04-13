import { useState, useRef, useEffect } from "react";
import { EMOJI_PALETTE } from "../constants";

export default function EmojiPicker({ value, onChange, size = 40 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: size, height: size, fontSize: size * 0.55, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
        title="이모지 선택">
        {value || "🏢"}
      </button>
      {open && (
        <div style={{ position: "absolute", top: size + 6, left: 0, zIndex: 20, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, width: 240 }}>
          {EMOJI_PALETTE.map(em => (
            <button key={em} type="button" onClick={() => { onChange(em); setOpen(false); }}
              style={{ fontSize: 20, width: 34, height: 34, background: em === value ? "#f0f0ff" : "transparent", border: em === value ? "1px solid #a5b4fc" : "1px solid transparent", borderRadius: 6, cursor: "pointer", padding: 0 }}>
              {em}
            </button>
          ))}
          <input value={value} onChange={e => onChange(e.target.value)} maxLength={4}
            placeholder="직접 입력"
            style={{ gridColumn: "1 / -1", marginTop: 4, padding: "6px 8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, textAlign: "center", outline: "none" }} />
        </div>
      )}
    </div>
  );
}
