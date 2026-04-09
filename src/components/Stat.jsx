import Card from "./Card";

export default function Stat({ icon, label, value, color }) {
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
