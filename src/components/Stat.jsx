import Card from "./Card";

export default function Stat({ icon, label, value, color }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ color, background: color + "18", borderRadius: 8, padding: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
        <span style={{ fontSize: 11, color: "#6b7280" }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>{value}</div>
    </Card>
  );
}
