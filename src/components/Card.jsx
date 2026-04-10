export default function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{ background: "#ffffff", border: "1px solid #e8ecf4", borderRadius: 14, padding: 18, cursor: onClick ? "pointer" : "default", transition: "all 0.25s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", ...style }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = "#a5b4fc"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.1)"; }}}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.borderColor = "#e8ecf4"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}}>
      {children}
    </div>
  );
}
