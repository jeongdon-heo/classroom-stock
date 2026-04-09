export default function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{ background: "linear-gradient(160deg, rgba(25,35,70,0.8), rgba(20,28,55,0.9))", border: "1px solid rgba(120,140,255,0.1)", borderRadius: 14, padding: 18, cursor: onClick ? "pointer" : "default", transition: "all 0.25s", ...style }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = "rgba(120,160,255,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.borderColor = "rgba(120,140,255,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}}>
      {children}
    </div>
  );
}
