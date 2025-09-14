import { Card } from "./ui";

export default function Settings() {
  return (
    <div style={{display:"grid", gap:16}}>
      <Card title="Paramètres">
        <div style={{color:"#6b7280"}}>À compléter si besoin (SMTP, identité visuelle, etc.).</div>
      </Card>
    </div>
  );
}
